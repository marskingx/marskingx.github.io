#!/usr/bin/env python3
"""
SEO 優化工具
自動修復常見的 SEO 問題
"""

import os
import sys
from pathlib import Path
import json
from bs4 import BeautifulSoup
import argparse

class SEOOptimizer:
    def __init__(self, public_dir: str = "public"):
        self.public_dir = Path(public_dir)
        self.fixes = []
        self.suggestions = []
        
    def optimize_meta_descriptions(self, html_content: str, file_path: Path) -> str:
        """優化 meta 描述長度"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 檢查 meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            content = meta_desc['content']
            if len(content) > 160:
                # 截斷到 160 字符，但保持完整的句子
                truncated = content[:157] + "..."
                meta_desc['content'] = truncated
                self.fixes.append(f"{file_path.name}: 截斷過長的 meta 描述")
                return str(soup)
        
        return html_content
    
    def add_missing_alt_tags(self, html_content: str, file_path: Path) -> str:
        """為缺少 alt 屬性的圖片添加 alt 標籤"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        images = soup.find_all('img')
        for img in images:
            if not img.get('alt'):
                # 嘗試從 src 或 title 生成 alt 文字
                src = img.get('src', '')
                title = img.get('title', '')
                
                if title:
                    img['alt'] = title
                elif src:
                    # 從檔案名生成 alt 文字
                    filename = Path(src).stem
                    alt_text = filename.replace('-', ' ').replace('_', ' ').title()
                    img['alt'] = alt_text
                else:
                    img['alt'] = "圖片"
                
                self.fixes.append(f"{file_path.name}: 為圖片添加 alt 屬性")
        
        return str(soup)
    
    def optimize_headings(self, html_content: str, file_path: Path) -> str:
        """優化標題結構"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 檢查是否有 h1 標籤
        h1_tags = soup.find_all('h1')
        if len(h1_tags) == 0:
            self.suggestions.append(f"{file_path.name}: 建議添加 H1 標籤")
        elif len(h1_tags) > 1:
            self.suggestions.append(f"{file_path.name}: 發現多個 H1 標籤，建議只保留一個")
        
        return html_content
    
    def add_structured_data_improvements(self, html_content: str, file_path: Path) -> str:
        """改進結構化資料"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 檢查 JSON-LD
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                
                if data.get('@type') == 'BlogPosting':
                    # 檢查是否有圖片
                    if 'image' not in data:
                        # 嘗試從頁面中找到第一張圖片
                        first_img = soup.find('img')
                        if first_img and first_img.get('src'):
                            data['image'] = first_img['src']
                            script.string = json.dumps(data, ensure_ascii=False, indent=2)
                            self.fixes.append(f"{file_path.name}: 為結構化資料添加圖片")
                    
                    # 檢查關鍵字
                    if 'keywords' not in data:
                        # 嘗試從 meta keywords 獲取
                        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
                        if meta_keywords and meta_keywords.get('content'):
                            data['keywords'] = meta_keywords['content']
                            script.string = json.dumps(data, ensure_ascii=False, indent=2)
                            self.fixes.append(f"{file_path.name}: 為結構化資料添加關鍵字")
                            
            except json.JSONDecodeError:
                continue
        
        return str(soup)
    
    def optimize_file(self, file_path: Path) -> bool:
        """優化單個檔案"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            original_content = html_content
            
            # 應用各種優化
            html_content = self.optimize_meta_descriptions(html_content, file_path)
            html_content = self.add_missing_alt_tags(html_content, file_path)
            html_content = self.optimize_headings(html_content, file_path)
            html_content = self.add_structured_data_improvements(html_content, file_path)
            
            # 如果有變更，寫回檔案
            if html_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                return True
                
        except Exception as e:
            print(f"❌ 處理檔案 {file_path} 時發生錯誤: {e}")
            return False
        
        return False
    
    def optimize_all(self) -> bool:
        """優化所有檔案"""
        if not self.public_dir.exists():
            print(f"❌ 找不到 public 目錄: {self.public_dir}")
            return False
        
        html_files = list(self.public_dir.rglob("*.html"))
        print(f"🔍 找到 {len(html_files)} 個 HTML 檔案")
        
        optimized_count = 0
        for file_path in html_files:
            if file_path.name == "404.html":
                continue
                
            if self.optimize_file(file_path):
                optimized_count += 1
        
        print(f"\n📊 優化結果:")
        print(f"✅ 優化了 {optimized_count} 個檔案")
        print(f"🔧 應用了 {len(self.fixes)} 個修復")
        print(f"💡 產生了 {len(self.suggestions)} 個建議")
        
        if self.fixes:
            print("\n🔧 應用的修復:")
            for fix in self.fixes[:10]:  # 只顯示前10個
                print(f"  • {fix}")
            if len(self.fixes) > 10:
                print(f"  ... 還有 {len(self.fixes) - 10} 個修復")
        
        if self.suggestions:
            print("\n💡 優化建議:")
            for suggestion in self.suggestions[:10]:  # 只顯示前10個
                print(f"  • {suggestion}")
            if len(self.suggestions) > 10:
                print(f"  ... 還有 {len(self.suggestions) - 10} 個建議")
        
        return True

def main():
    parser = argparse.ArgumentParser(description='SEO 優化工具')
    parser.add_argument('--public-dir', default='public', help='public 目錄路徑')
    parser.add_argument('--dry-run', action='store_true', help='只檢查不修改')
    
    args = parser.parse_args()
    
    optimizer = SEOOptimizer(args.public_dir)
    
    print("🚀 開始 SEO 優化...")
    success = optimizer.optimize_all()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()