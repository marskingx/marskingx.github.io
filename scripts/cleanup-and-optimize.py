#!/usr/bin/env python3
"""
清理和優化工具
用於清理重複檔案、修復路徑問題，並優化結構化資料
"""

import os
import sys
import shutil
from pathlib import Path
from urllib.parse import unquote
import re
from bs4 import BeautifulSoup
import json

class CleanupOptimizer:
    def __init__(self, public_dir: str = "public"):
        self.public_dir = Path(public_dir)
        self.issues = []
        self.fixes = []
        
    def find_duplicate_files(self):
        """找到重複的檔案"""
        print("🔍 尋找重複檔案...")
        
        # 收集所有 HTML 檔案
        files_by_content = {}
        all_files = list(self.public_dir.rglob("*.html"))
        
        for file_path in all_files:
            # 跳過一些特殊檔案
            if file_path.name in ["404.html", "index.html"]:
                continue
                
            # 檢查檔案名稱是否有問題
            filename = file_path.name
            parent_dir = file_path.parent.name
            
            # 檢查是否有編碼問題的檔案名
            if any(char in filename for char in ['%', '\\', '//']):
                self.issues.append(f"檔案名稱有編碼問題: {file_path}")
                
            # 檢查是否有重複的檔案（相同內容但不同路徑）
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content_hash = hash(f.read())
                    
                if content_hash in files_by_content:
                    self.issues.append(f"重複檔案: {file_path} 與 {files_by_content[content_hash]}")
                else:
                    files_by_content[content_hash] = file_path
            except Exception as e:
                self.issues.append(f"無法讀取檔案 {file_path}: {e}")
    
    def find_missing_structured_data(self):
        """找到缺少結構化資料的部落格文章"""
        print("🔍 尋找缺少結構化資料的文章...")
        
        blog_dir = self.public_dir / "blog"
        if not blog_dir.exists():
            return
            
        missing_data_files = []
        
        for file_path in blog_dir.rglob("index.html"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # 檢查是否有結構化資料
                soup = BeautifulSoup(content, 'html.parser')
                json_ld_scripts = soup.find_all('script', type='application/ld+json')
                
                if not json_ld_scripts:
                    relative_path = file_path.relative_to(self.public_dir)
                    missing_data_files.append(relative_path)
                    
            except Exception as e:
                self.issues.append(f"無法檢查檔案 {file_path}: {e}")
        
        if missing_data_files:
            print(f"📊 找到 {len(missing_data_files)} 個缺少結構化資料的文章")
            for file_path in missing_data_files[:10]:  # 只顯示前10個
                print(f"  • {file_path}")
            if len(missing_data_files) > 10:
                print(f"  ... 還有 {len(missing_data_files) - 10} 個檔案")
    
    def analyze_url_patterns(self):
        """分析 URL 模式，找出問題"""
        print("🔍 分析 URL 模式...")
        
        blog_dirs = []
        for item in (self.public_dir / "blog").iterdir():
            if item.is_dir():
                blog_dirs.append(item.name)
        
        # 檢查是否有相似的目錄名稱
        similar_dirs = {}
        for dir_name in blog_dirs:
            # 移除特殊字符和編碼
            clean_name = re.sub(r'[-_\d]+$', '', dir_name)
            clean_name = re.sub(r'^[\d-]+', '', clean_name)
            
            if clean_name in similar_dirs:
                similar_dirs[clean_name].append(dir_name)
            else:
                similar_dirs[clean_name] = [dir_name]
        
        # 報告相似的目錄
        for clean_name, dirs in similar_dirs.items():
            if len(dirs) > 1:
                print(f"⚠️  相似的目錄: {dirs}")
    
    def generate_cleanup_script(self):
        """生成清理腳本"""
        script_content = """@echo off
echo 🧹 開始清理重複和問題檔案...

REM 這裡會列出建議的清理操作
REM 請手動檢查後執行

"""
        
        if self.issues:
            script_content += "REM 發現的問題:\n"
            for issue in self.issues[:20]:  # 限制數量
                script_content += f"REM {issue}\n"
        
        script_content += """
echo ✅ 清理完成！
pause
"""
        
        with open("scripts/cleanup-suggestions.bat", "w", encoding="utf-8") as f:
            f.write(script_content)
        
        print("📝 已生成清理建議腳本: scripts/cleanup-suggestions.bat")
    
    def run_analysis(self):
        """執行完整分析"""
        print("🚀 開始分析和優化...")
        
        if not self.public_dir.exists():
            print(f"❌ 找不到 public 目錄: {self.public_dir}")
            return False
        
        self.find_duplicate_files()
        self.find_missing_structured_data()
        self.analyze_url_patterns()
        
        print("\n" + "="*60)
        print("📊 分析結果")
        print("="*60)
        print(f"發現問題: {len(self.issues)}")
        
        if self.issues:
            print("\n問題詳情:")
            for issue in self.issues[:10]:  # 只顯示前10個
                print(f"  • {issue}")
            if len(self.issues) > 10:
                print(f"  ... 還有 {len(self.issues) - 10} 個問題")
        
        self.generate_cleanup_script()
        return True

def main():
    optimizer = CleanupOptimizer()
    optimizer.run_analysis()

if __name__ == "__main__":
    main()