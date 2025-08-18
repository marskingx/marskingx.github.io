#!/usr/bin/env python3
"""
Fixes the description length of markdown files.
"""

import os
import re
import sys
from pathlib import Path
import yaml

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    content_dir = Path("content/blog")
    short_title_files = []

    for md_file in content_dir.rglob("*.md"):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            continue

        front_matter_str = match.group(1)
        front_matter = yaml.safe_load(front_matter_str)

        if not isinstance(front_matter, dict):
            continue

        title = front_matter.get('title', '')
        if len(title) < 30:
            short_title_files.append(str(md_file))

        description = front_matter.get('description')
        if not description or len(description) < 120 or len(description) > 160:
            # Generate new description
            post_content = content[match.end():].strip()
            new_description = post_content[:200].strip().replace('\n', ' ')
            front_matter['description'] = new_description

            # Update the file
            new_front_matter_str = yaml.dump(front_matter, allow_unicode=True)
            new_content = f"---\n{new_front_matter_str}---\n{post_content}"
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

    if short_title_files:
        print("--- Files with short titles ---")
        for f in short_title_files:
            print(f)

if __name__ == "__main__":
    main()
