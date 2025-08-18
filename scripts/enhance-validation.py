#!/usr/bin/env python3
"""
增強版結構化資料驗證工具
新增更多驗證規則和優化建議
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
from datetime import datetime

class EnhancedValidator:
    def __init__(self, public_dir: str = "public"):
        self.public_dir = Path(public_dir)
        self.errors = []
        self.warnings = []
        self.suggestions = []
        self.success_count = 0
        
    def validate_seo_optimization(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證 SEO 優化相關的結構化資料"""
        relative_path = file_path.relative_to(self.public_dir)
        is_valid = True
        
        if data.get('@type') == 'BlogPosting':
            # 檢查標題長度
            headline = data.get('headline', '')
            if len(headline) > 60:
                self.warnings.append(f"{relative_path}: 標題過長 ({len(headline)} 字符)，建議控制在60字符內")
            elif len(headline) < 30:
                self.warnings.append(f"{relative_path}: 標題過短 ({len(headline)} 字符)，建議至少30字符")
            
            # 檢查描述長度
            description = data.get('description', '')
            if description:
                if len(description) > 160:
                    self.warnings.append(f"{relative_path}: 描述過長 ({len(description)} 字符)，建議控制在160字符內")
                elif len(description) < 120:
                    self.warnings.append(f"{relative_path}: 描述過短 ({len(description)} 字符)，建議至少120字符")
            else:
                self.errors.append(f"{relative_path}: 缺少描述 (description)")
                is_valid = False
            
            # 檢查圖片
            if 'image' not in data:
                self.warnings.append(f"{relative_path}: 建議添加特色圖片以提升 SEO")
            
            # 檢查關鍵字
            keywords = data.get('keywords', '')
            if not keywords:
                self.suggestions.append(f"{relative_path}: 建議添加關鍵字 (keywords) 以提升 SEO")
            
            # 檢查文章長度
            word_count = data.get('wordCount', 0)
            if word_count < 300:
                self.warnings.append(f"{relative_path}: 文章字數較少 ({word_count} 字)，建議至少300字")
        
        return is_valid
    
    def validate_performance_optimization(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證效能優化相關的結構化資料"""
        relative_path = file_path.relative_to(self.public_dir)
        
        # 檢查圖片 URL
        if 'image' in data:
            image_url = data['image']
            if isinstance(image_url, str):
                if not image_url.startswith('https://'):
                    self.warnings.append(f"{relative_path}: 圖片 URL 建議使用 HTTPS")
                
                # 檢查圖片格式
                if not any(image_url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                    self.warnings.append(f"{relative_path}: 圖片格式建議使用 .jpg, .png 或 .webp")
        
        return True
    
    def validate_accessibility(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證無障礙相關的結構化資料"""
        relative_path = file_path.relative_to(self.public_dir)
        
        if data.get('@type') == 'BlogPosting':
            # 檢查作者資訊的完整性
            author = data.get('author')
            if author and isinstance(author, dict):
                if 'url' not in author:
                    self.suggestions.append(f"{relative_path}: 建議為作者添加個人頁面 URL")
        
        return True
    
    def validate_social_media_optimization(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證社群媒體優化"""
        relative_path = file_path.relative_to(self.public_dir)
        
        if data.get('@type') == 'BlogPosting':
            # 檢查是否適合社群分享
            if 'image' in data and 'headline' in data and 'description' in data:
                self.success_count += 1
                print(f"✅ {relative_path}: 適合社群媒體分享")
            else:
                self.suggestions.append(f"{relative_path}: 建議完善圖片、標題、描述以提升社群分享效果")
        
        return True
    
    def validate_date_consistency(self, data: Dict[Any, Any], file_path: Path) -> bool:
        """驗證日期一致性"""
        relative_path = file_path.relative_to(self.public_dir)
        is_valid = True
        
        if data.get('@type') == 'BlogPosting':
            published = data.get('datePublished')
            modified = data.get('dateModified')
            
            if published and modified:
                try:
                    pub_date = datetime.fromisoformat(published.replace('Z', '+00:00'))
                    mod_date = datetime.fromisoformat(modified.replace('Z', '+00:00'))
                    
                    if mod_date < pub_date:
                        self.errors.append(f"{relative_path}: 修改日期不能早於發布日期")
                        is_valid = False
                        
                    # 檢查日期是否在未來
                    now = datetime.now(pub_date.tzinfo)
                    if pub_date > now:
                        self.warnings.append(f"{relative_path}: 發布日期在未來")
                        
                except Exception as e:
                    self.errors.append(f"{relative_path}: 日期格式錯誤 - {e}")
                    is_valid = False
        
        return is_valid
    
    def generate_optimization_report(self):
        """生成優化報告"""
        report = []
        report.append("# 結構化資料優化報告")
        report.append(f"生成時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # 統計資訊
        report.append("## 📊 統計資訊")
        report.append(f"- ✅ 成功驗證: {self.success_count} 個")
        report.append(f"- ❌ 錯誤: {len(self.errors)} 個")
        report.append(f"- ⚠️ 警告: {len(self.warnings)} 個")
        report.append(f"- 💡 建議: {len(self.suggestions)} 個")
        report.append("")
        
        # 錯誤詳情
        if self.errors:
            report.append("## ❌ 錯誤詳情")
            for error in self.errors:
                report.append(f"- {error}")
            report.append("")
        
        # 警告詳情
        if self.warnings:
            report.append("## ⚠️ 警告詳情")
            for warning in self.warnings:
                report.append(f"- {warning}")
            report.append("")
        
        # 優化建議
        if self.suggestions:
            report.append("## 💡 優化建議")
            for suggestion in self.suggestions:
                report.append(f"- {suggestion}")
            report.append("")
        
        # 最佳實踐
        report.append("## 🎯 最佳實踐建議")
        report.append("1. **SEO 優化**:")
        report.append("   - 標題控制在 30-60 字符")
        report.append("   - 描述控制在 120-160 字符")
        report.append("   - 添加相關關鍵字")
        report.append("")
        report.append("2. **效能優化**:")
        report.append("   - 使用 HTTPS 圖片 URL")
        report.append("   - 優先使用 WebP 格式圖片")
        report.append("   - 壓縮圖片大小")
        report.append("")
        report.append("3. **社群分享**:")
        report.append("   - 確保每篇文章都有特色圖片")
        report.append("   - 撰寫吸引人的標題和描述")
        report.append("   - 添加作者資訊")
        
        # 儲存報告
        report_path = Path("scripts/optimization-report.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(report))
        
        print(f"📝 優化報告已儲存至: {report_path}")
    
    def validate_file_enhanced(self, file_path: Path) -> bool:
        """增強版檔案驗證"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except Exception as e:
            self.errors.append(f"無法讀取檔案 {file_path}: {e}")
            return False
        
        # 提取結構化資料
        soup = BeautifulSoup(html_content, 'html.parser')
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        
        if not json_ld_scripts:
            return True  # 沒有結構化資料，跳過
        
        file_valid = True
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                
                # 執行各種驗證
                if not self.validate_seo_optimization(data, file_path):
                    file_valid = False
                if not self.validate_performance_optimization(data, file_path):
                    file_valid = False
                if not self.validate_accessibility(data, file_path):
                    file_valid = False
                if not self.validate_social_media_optimization(data, file_path):
                    file_valid = False
                if not self.validate_date_consistency(data, file_path):
                    file_valid = False
                    
            except json.JSONDecodeError as e:
                self.errors.append(f"JSON 解析錯誤 {file_path}: {e}")
                file_valid = False
        
        return file_valid
    
    def validate_all_enhanced(self) -> bool:
        """增強版全檔案驗證"""
        if not self.public_dir.exists():
            print(f"❌ 找不到 public 目錄: {self.public_dir}")
            return False
        
        html_files = []
        for file_path in self.public_dir.rglob("*.html"):
            if file_path.name != "404.html":
                html_files.append(file_path)
        
        print(f"🔍 找到 {len(html_files)} 個 HTML 檔案")
        print("🚀 開始增強版驗證...")
        
        all_valid = True
        for file_path in html_files:
            if not self.validate_file_enhanced(file_path):
                all_valid = False
        
        return all_valid

def main():
    parser = argparse.ArgumentParser(description='增強版結構化資料驗證工具')
    parser.add_argument('--public-dir', default='public', help='public 目錄路徑')
    parser.add_argument('--generate-report', action='store_true', help='生成優化報告')
    
    args = parser.parse_args()
    
    validator = EnhancedValidator(args.public_dir)
    
    print("🚀 開始增強版結構化資料驗證...")
    is_valid = validator.validate_all_enhanced()
    
    # 印出結果
    print("\n" + "="*60)
    print("📊 增強版驗證結果")
    print("="*60)
    print(f"✅ 成功驗證: {validator.success_count} 個")
    print(f"❌ 錯誤: {len(validator.errors)} 個")
    print(f"⚠️ 警告: {len(validator.warnings)} 個")
    print(f"💡 建議: {len(validator.suggestions)} 個")
    
    if args.generate_report:
        validator.generate_optimization_report()
    
    sys.exit(0 if is_valid else 1)

if __name__ == "__main__":
    main()