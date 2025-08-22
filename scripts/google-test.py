#!/usr/bin/env python3
"""
Google 結構化資料測試工具
使用 Google 的 Rich Results Test API 來驗證結構化資料
"""

import requests
import json
import sys
import argparse
from pathlib import Path
from urllib.parse import urljoin
import time

class GoogleStructuredDataTester:
    def __init__(self):
        self.api_url = "https://searchconsole.googleapis.com/v1/urlTestingTools/richResults:run"
        
    def test_url(self, url: str) -> dict:
        """使用 Google Rich Results Test API 測試 URL"""
        payload = {
            "url": url,
            "requestScreenshot": False
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(self.api_url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API 請求失敗: {response.status_code}"}
        except Exception as e:
            return {"error": f"請求錯誤: {str(e)}"}
    
    def test_html_content(self, html_content: str) -> dict:
        """測試 HTML 內容的結構化資料"""
        # 注意：這個 API 可能需要認證，這裡提供基本框架
        payload = {
            "html": html_content,
            "requestScreenshot": False
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(self.api_url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API 請求失敗: {response.status_code}"}
        except Exception as e:
            return {"error": f"請求錯誤: {str(e)}"}

def main():
    parser = argparse.ArgumentParser(description='使用 Google API 測試結構化資料')
    parser.add_argument('--url', help='要測試的 URL')
    parser.add_argument('--file', help='要測試的本地 HTML 檔案')
    
    args = parser.parse_args()
    
    tester = GoogleStructuredDataTester()
    
    if args.url:
        print(f"🔍 測試 URL: {args.url}")
        result = tester.test_url(args.url)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    elif args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"❌ 檔案不存在: {file_path}")
            sys.exit(1)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        print(f"🔍 測試檔案: {file_path}")
        result = tester.test_html_content(html_content)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("❌ 請提供 --url 或 --file 參數")
        sys.exit(1)

if __name__ == "__main__":
    main()