import sys
import re
from datetime import datetime

def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def write_file(file_path, content):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def standardize_date_format(date_str):
    try:
        return datetime.strptime(date_str, "%Y/%m/%d").strftime("%Y-%m-%d")
    except ValueError:
        return date_str

def format_image_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y%m%d")
    except ValueError:
        return date_str.replace("-", "")

def fix_yaml(content):
    # 解析原始內容
    title_match = re.search(r'^# (.*)', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else ""

    description_match = re.search(r'description: (.*)', content)
    description = description_match.group(1).strip() if description_match else ""

    author_match = re.search(r'authors: (.*)', content)
    author = author_match.group(1).strip() if author_match else "懶大"

    date_match = re.search(r'date: (\d{4}/\d{2}/\d{2})', content)
    date = standardize_date_format(date_match.group(1).strip()) if date_match else ""

    image = f"/images/blog/{format_image_date(date)}.png"

    categories_match = re.search(r'categories: (.*)', content)
    categories = f"[{categories_match.group(1).strip()}]" if categories_match else ""

    tags_match = re.search(r'tags: (.*)', content)
    tags = f"[{tags_match.group(1).strip().replace(' ', '').replace(',', ',')}]" if tags_match else ""

    keywords_match = re.search(r'keywords: (.*)', content)
    keywords = keywords_match.group(1).strip() if keywords_match else ""

    draft = "false"

    slug_match = re.search(r'slug: (.*)', content)
    slug = slug_match.group(1).strip() if slug_match else ""
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug).lower()

    release_match = re.search(r'release: (.*)', content)
    release_date = release_match.group(1).strip() if release_match else ""

    # 構建新的 YAML 區段
    new_yaml = (
        f"---\n"
        f"title: {title}\n"
        f"description: {description}\n"
        f"author: {author}\n"
        f"release: {release_date}\n"
        f"date: {date}\n"
        f"image: {image}\n"
        f"categories: {categories}\n"
        f"tags: {tags}\n"
        f"keywords: {keywords}\n"
        f"draft: {draft}\n"
        f"slug: {slug}\n"
        f"---"
    )

    # 替換原有 YAML 區段，保留正文
    content_without_yaml = re.sub(r'^---.*?---', '', content, flags=re.DOTALL).strip()

    return f"{new_yaml}\n\n{content_without_yaml}"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python financial_tool_reindex.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    content = read_file(file_path)
    updated_content = fix_yaml(content)
    write_file(file_path, updated_content)
    print(f"已處理文件: {file_path}")
