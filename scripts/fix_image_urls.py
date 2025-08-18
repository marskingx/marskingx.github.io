#!/usr/bin/env python3
"""
Fixes the image URLs in markdown files.
"""

import os
import re
import sys
from pathlib import Path

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    content_dir = Path("content/blog")

    for md_file in content_dir.rglob("*.md"):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = re.sub(r'image:\s*"http://', 'image: "https://', content)
        new_content = re.sub(r'image:\s*http://', 'image: https://', new_content)

        if new_content != content:
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

if __name__ == "__main__":
    main()
