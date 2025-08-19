#!/usr/bin/env python3
"""
結構化資料驗證工具
用於本地驗證 Hugo 網站的結構化資料是否符合 Google 標準
"""

import json
import re
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
import argparse
from typing import List, Dict, Any

class StructuredDataValidator:
    def __init__(self, public_dir: str = "public"):
        self.public_dir = Path(public_dir)
        self.errors = []
        self.warnings = []
        self.success_count = 0
        
    def find_html_files(self) -> List[Path]:
        """找到所有 HTML 檔案"""
        html_files = []
        for file_path in self.public_dir.rglob("*.html"):
            if file_path.name != "404.html":  # 跳過 404 頁面
                html_files.append(file_path)
        return html_files
    
    def extract_json_ld(self, html_content: str) -> List[Dict[Any, Any]]:
        """從 HTML 中提取 JSON-LD 結構化資料"""
        soup = BeautifulSoup(html_content, 'html.parser')
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        
        json_ld_data = []
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                json_ld_data.append(data)
            except json.JSONDecodeError as e:
                self.errors.append(f"JSON 解析錯誤: {e}")
        
        return json_ld_data
    
    def validate_breadcrumb(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證麵包屑結構化資料"""
        if data.get('@type') != 'BreadcrumbList':
            return True  # 不是麵包屑，跳過
        
        is_valid = True
        relative_path = file_path.relative_to(self.public_dir)
        
        # 檢查必要欄位
        if '@context' not in data:
            self.errors.append(f"{relative_path}: 麵包屑缺少 @context")
            is_valid = False
        
        if 'itemListElement' not in data:
            self.errors.append(f"{relative_path}: 麵包屑缺少 itemListElement")
            is_valid = False
            return is_valid
        
        items = data['itemListElement']
        if not isinstance(items, list) or len(items) == 0:
            self.errors.append(f"{relative_path}: itemListElement 必須是非空陣列")
            is_valid = False
            return is_valid
        
        # 檢查每個項目
        for i, item in enumerate(items):
            if '@type' not in item or item['@type'] != 'ListItem':
                self.errors.append(f"{relative_path}: 項目 {i+1} 缺少正確的 @type")
                is_valid = False
            
            if 'position' not in item:
                self.errors.append(f"{relative_path}: 項目 {i+1} 缺少 position")
                is_valid = False
            elif item['position'] != i + 1:
                self.errors.append(f"{relative_path}: 項目 {i+1} position 不正確，應為 {i+1}")
                is_valid = False
            
            if 'name' not in item:
                self.errors.append(f"{relative_path}: 項目 {i+1} 缺少 name")
                is_valid = False
            
            # 最後一個項目可能沒有 item（當前頁面）
            if i < len(items) - 1 and 'item' not in item:
                self.errors.append(f"{relative_path}: 項目 {i+1} 缺少 item")
                is_valid = False
        
        if is_valid:
            print(f"✅ {relative_path}: 麵包屑結構化資料正確")
            self.success_count += 1
        
        return is_valid
    
    def validate_blog_posting(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證部落格文章結構化資料"""
        if data.get('@type') != 'BlogPosting':
            return True  # 不是部落格文章，跳過
        
        is_valid = True
        relative_path = file_path.relative_to(self.public_dir)
        
        required_fields = ['@context', 'headline', 'datePublished', 'author', 'publisher']
        for field in required_fields:
            if field not in data:
                self.errors.append(f"{relative_path}: BlogPosting 缺少 {field}")
                is_valid = False
        
        # 檢查 author 結構
        if 'author' in data:
            author = data['author']
            if not isinstance(author, dict) or '@type' not in author or author['@type'] != 'Person':
                self.errors.append(f"{relative_path}: author 必須是 Person 類型")
                is_valid = False
            elif 'name' not in author:
                self.errors.append(f"{relative_path}: author 缺少 name")
                is_valid = False
        
        # 檢查 publisher 結構
        if 'publisher' in data:
            publisher = data['publisher']
            if not isinstance(publisher, dict) or '@type' not in publisher or publisher['@type'] != 'Organization':
                self.errors.append(f"{relative_path}: publisher 必須是 Organization 類型")
                is_valid = False
            elif 'name' not in publisher:
                self.errors.append(f"{relative_path}: publisher 缺少 name")
                is_valid = False
        
        if is_valid:
            print(f"✅ {relative_path}: BlogPosting 結構化資料正確")
            self.success_count += 1
        
        return is_valid
    
    def validate_review(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證評論結構化資料"""
        # 檢查是否包含 review 欄位
        if 'review' not in data:
            return True  # 沒有評論，跳過
        
        is_valid = True
        relative_path = file_path.relative_to(self.public_dir)
        review = data['review']
        
        if not isinstance(review, dict) or '@type' not in review or review['@type'] != 'Review':
            self.errors.append(f"{relative_path}: review 必須是 Review 類型")
            is_valid = False
            return is_valid
        
        # 檢查必要欄位
        if 'itemReviewed' not in review:
            self.errors.append(f"{relative_path}: review 缺少 itemReviewed")
            is_valid = False
        
        if 'reviewRating' not in review:
            self.errors.append(f"{relative_path}: review 缺少 reviewRating")
            is_valid = False
        else:
            rating = review['reviewRating']
            if 'ratingValue' not in rating or 'bestRating' not in rating:
                self.errors.append(f"{relative_path}: reviewRating 缺少必要欄位")
                is_valid = False
        
        if is_valid:
            print(f"✅ {relative_path}: Review 結構化資料正確")
            self.success_count += 1
        
        return is_valid
    
    def validate_file(self, file_path: Path) -> bool:
        """驗證單個檔案的結構化資料"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except Exception as e:
            self.errors.append(f"無法讀取檔案 {file_path}: {e}")
            return False
        
        json_ld_data = self.extract_json_ld(html_content)
        
        if not json_ld_data:
            return True  # 沒有結構化資料，跳過
        
        file_valid = True
        for data in json_ld_data:
            if not self.validate_breadcrumb(data, file_path):
                file_valid = False
            if not self.validate_blog_posting(data, file_path):
                file_valid = False
            if not self.validate_review(data, file_path):
                file_valid = False
        
        return file_valid
    
    def validate_all(self) -> bool:
        """驗證所有檔案"""
        if not self.public_dir.exists():
            print(f"❌ 找不到 public 目錄: {self.public_dir}")
            return False
        
        html_files = self.find_html_files()
        print(f"🔍 找到 {len(html_files)} 個 HTML 檔案")
        
        all_valid = True
        for file_path in html_files:
            if not self.validate_file(file_path):
                all_valid = False
        
        return all_valid
    
    def print_summary(self):
        """印出驗證結果摘要"""
        print("\n" + "="*60)
        print("📊 驗證結果摘要")
        print("="*60)
        print(f"✅ 成功驗證: {self.success_count} 個結構化資料")
        print(f"❌ 錯誤數量: {len(self.errors)}")
        print(f"⚠️  警告數量: {len(self.warnings)}")
        
        if self.errors:
            print("\n❌ 錯誤詳情:")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print("\n⚠️  警告詳情:")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        if not self.errors and not self.warnings:
            print("\n🎉 所有結構化資料都通過驗證！")

def main():
    parser = argparse.ArgumentParser(description='驗證 Hugo 網站的結構化資料')
    parser.add_argument('--public-dir', default='public', help='public 目錄路徑 (預設: public)')
    parser.add_argument('--file', help='驗證特定檔案')
    
    args = parser.parse_args()
    
    validator = StructuredDataValidator(args.public_dir)
    
    if args.file:
        # 驗證特定檔案
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"❌ 檔案不存在: {file_path}")
            sys.exit(1)
        
        print(f"🔍 驗證檔案: {file_path}")
        is_valid = validator.validate_file(file_path)
        validator.print_summary()
        sys.exit(0 if is_valid else 1)
    else:
        # 驗證所有檔案
        print("🚀 開始驗證結構化資料...")
        is_valid = validator.validate_all()
        validator.print_summary()
        sys.exit(0 if is_valid else 1)

if __name__ == "__main__":
    main()