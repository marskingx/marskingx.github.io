#!/usr/bin/env python3
"""
JSON Schema 驗證器
使用 Schema.org 的 JSON Schema 來驗證結構化資料
"""

import json
import jsonschema
from pathlib import Path
from bs4 import BeautifulSoup
import argparse

# 麵包屑的 JSON Schema
BREADCRUMB_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "@context": {"const": "https://schema.org"},
        "@type": {"const": "BreadcrumbList"},
        "itemListElement": {
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "object",
                "properties": {
                    "@type": {"const": "ListItem"},
                    "position": {"type": "integer", "minimum": 1},
                    "name": {"type": "string", "minLength": 1},
                    "item": {"type": "string", "format": "uri"}
                },
                "required": ["@type", "position", "name"],
                "additionalProperties": False
            }
        }
    },
    "required": ["@context", "@type", "itemListElement"],
    "additionalProperties": False
}

# BlogPosting 的 JSON Schema
BLOG_POSTING_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
        "@context": {"const": "https://schema.org"},
        "@type": {"const": "BlogPosting"},
        "mainEntityOfPage": {
            "type": "object",
            "properties": {
                "@type": {"const": "WebPage"},
                "@id": {"type": "string", "format": "uri"}
            },
            "required": ["@type", "@id"]
        },
        "headline": {"type": "string", "minLength": 1},
        "description": {"type": "string"},
        "image": {"type": "string", "format": "uri"},
        "datePublished": {"type": "string", "format": "date-time"},
        "dateModified": {"type": "string", "format": "date-time"},
        "author": {
            "type": "object",
            "properties": {
                "@type": {"const": "Person"},
                "name": {"type": "string", "minLength": 1},
                "url": {"type": "string", "format": "uri"}
            },
            "required": ["@type", "name"]
        },
        "publisher": {
            "type": "object",
            "properties": {
                "@type": {"const": "Organization"},
                "name": {"type": "string", "minLength": 1},
                "logo": {
                    "type": "object",
                    "properties": {
                        "@type": {"const": "ImageObject"},
                        "url": {"type": "string", "format": "uri"}
                    },
                    "required": ["@type", "url"]
                }
            },
            "required": ["@type", "name", "logo"]
        },
        "articleSection": {"type": "string"},
        "keywords": {"type": "string"},
        "wordCount": {"type": "integer", "minimum": 0}
    },
    "required": ["@context", "@type", "headline", "datePublished", "author", "publisher"],
    "additionalProperties": True
}

class SchemaValidator:
    def __init__(self):
        self.schemas = {
            "BreadcrumbList": BREADCRUMB_SCHEMA,
            "BlogPosting": BLOG_POSTING_SCHEMA
        }
    
    def extract_json_ld(self, html_content: str) -> list:
        """從 HTML 中提取 JSON-LD 資料"""
        soup = BeautifulSoup(html_content, 'html.parser')
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        
        json_ld_data = []
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                json_ld_data.append(data)
            except json.JSONDecodeError as e:
                print(f"❌ JSON 解析錯誤: {e}")
        
        return json_ld_data
    
    def validate_data(self, data: dict, file_path: str = "") -> bool:
        """驗證單個 JSON-LD 資料"""
        data_type = data.get('@type')
        if not data_type:
            print(f"⚠️  {file_path}: 缺少 @type 欄位")
            return False
        
        if data_type not in self.schemas:
            print(f"ℹ️  {file_path}: 跳過未知類型 {data_type}")
            return True
        
        schema = self.schemas[data_type]
        
        try:
            jsonschema.validate(data, schema)
            print(f"✅ {file_path}: {data_type} 通過 Schema 驗證")
            return True
        except jsonschema.ValidationError as e:
            print(f"❌ {file_path}: {data_type} Schema 驗證失敗")
            print(f"   錯誤: {e.message}")
            print(f"   路徑: {' -> '.join(str(p) for p in e.path)}")
            return False
        except Exception as e:
            print(f"❌ {file_path}: 驗證過程發生錯誤: {e}")
            return False
    
    def validate_file(self, file_path: Path) -> bool:
        """驗證檔案中的所有結構化資料"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except Exception as e:
            print(f"❌ 無法讀取檔案 {file_path}: {e}")
            return False
        
        json_ld_data = self.extract_json_ld(html_content)
        
        if not json_ld_data:
            print(f"ℹ️  {file_path}: 沒有找到結構化資料")
            return True
        
        all_valid = True
        for data in json_ld_data:
            if not self.validate_data(data, str(file_path)):
                all_valid = False
        
        return all_valid

def main():
    parser = argparse.ArgumentParser(description='使用 JSON Schema 驗證結構化資料')
    parser.add_argument('--file', help='要驗證的 HTML 檔案')
    parser.add_argument('--dir', default='public', help='要驗證的目錄 (預設: public)')
    
    args = parser.parse_args()
    
    validator = SchemaValidator()
    
    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"❌ 檔案不存在: {file_path}")
            return 1
        
        print(f"🔍 驗證檔案: {file_path}")
        is_valid = validator.validate_file(file_path)
        return 0 if is_valid else 1
    else:
        public_dir = Path(args.dir)
        if not public_dir.exists():
            print(f"❌ 目錄不存在: {public_dir}")
            return 1
        
        html_files = list(public_dir.rglob("*.html"))
        print(f"🔍 找到 {len(html_files)} 個 HTML 檔案")
        
        all_valid = True
        for file_path in html_files:
            if not validator.validate_file(file_path):
                all_valid = False
        
        if all_valid:
            print("\n🎉 所有檔案都通過 Schema 驗證！")
        else:
            print("\n❌ 部分檔案驗證失敗")
        
        return 0 if all_valid else 1

if __name__ == "__main__":
    exit(main())