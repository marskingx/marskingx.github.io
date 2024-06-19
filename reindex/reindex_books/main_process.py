import os
import re
from datetime import datetime
from search_books_url import get_books_promotion_link, get_momo_promotion_link
from reindex_reading_list import update_reading_list_index

def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            print(f"Read file: {file_path}")
            return content
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return ""

def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
            print(f"Written to file: {file_path}")
    except Exception as e:
        print(f"Error writing file {file_path}: {e}")

def format_md_content(content):
    original_content = content
    content = re.sub(r'^# (.*)', r'---\ntitle: \1', content, flags=re.MULTILINE)
    content = re.sub(r'date: (\d{4})/(\d{2})/(\d{2})', lambda m: f'date: {m.group(1)}-{m.group(2)}-{m.group(3)}', content)
    content = re.sub(r'categories: (.*)', r'categories: [\1]', content)
    content = re.sub(r'tags: (.*)', r'tags: [\1]', content)
    content = re.sub(r'status: 草稿', 'status: 已發佈', content)
    content = re.sub(r'(slug: .*)', r'\1\n---', content)
    content = re.sub(r'```jsx\n(.*?)\n```', r'\1', content, flags=re.DOTALL)
    content = re.sub(r'!\[(.*?)\]\([^\)]*/(.*?)\)', r'![\1](\2)', content)

    print(f"Original content: {original_content[:200]}...")  # 打印前200字符以供檢查
    print(f"Formatted content: {content[:200]}...")  # 打印前200字符以供檢查
    return content

def update_links(content, books_url, momo_url):
    content = re.sub(r'!\[博客來買書\]\(books\.jpg\)', f'![博客來買書]({books_url})', content)
    content = re.sub(r'!\[momo買書\]\(momobooks\.jpg\)', f'![momo買書]({momo_url})', content)
    print(f"Updated content with promotion links.")
    return content

def get_latest_folders(directory, n=5):
    try:
        subfolders = [
            (f.path, os.path.getmtime(f.path))
            for f in os.scandir(directory) if f.is_dir() and '《' in f.name
        ]
        subfolders.sort(key=lambda x: x[1], reverse=True)
        latest_folders = [folder for folder, _ in subfolders[:n]]
        print(f"Latest folders: {latest_folders}")
        return latest_folders
    except Exception as e:
        print(f"Error getting latest folders: {e}")
        return []

def get_md_files(folder):
    md_files = []
    try:
        for root, _, files in os.walk(folder):
            md_files.extend(os.path.join(root, file) for file in files if file.endswith(".md"))
        print(f"Markdown files in folder '{folder}': {md_files}")
    except Exception as e:
        print(f"Error getting markdown files: {e}")
    return md_files

def extract_book_titles(content):
    titles = list(set(re.findall(r'《(.*?)》', content)))
    print(f"Extracted book titles: {titles}")
    return titles

def process_latest_md_files(directory):
    if not os.path.exists(directory):
        print(f"Directory does not exist: {directory}")
        return [], None

    latest_folders = get_latest_folders(directory)
    latest_folder = latest_folders[0] if latest_folders else None
    if not latest_folder:
        print("No valid subfolders found.")
        return [], None

    print(f"Latest folder selected: {latest_folder}")

    md_files = get_md_files(latest_folder)
    latest_md_file = md_files[0] if md_files else None
    if not latest_md_file:
        print("No markdown files found in the latest folder.")
        return [], None

    content = read_file(latest_md_file)
    book_titles = extract_book_titles(content)

    # 格式化內容並寫回文件
    formatted_content = format_md_content(content)
    if content != formatted_content:
        write_file(latest_md_file, formatted_content)
    else:
        print("Content is already formatted. No changes made.")

    return book_titles, latest_md_file, latest_folder

def main(directory_path, reading_list_file):
    print(f"Using directory path: {directory_path}")
    book_titles, latest_md_file, latest_folder = process_latest_md_files(directory_path)
    print(f"Book titles: {book_titles}")
    print(f"Latest markdown file: {latest_md_file}")

    if not book_titles:
        print("No book titles found, exiting.")
        return

    book_title = book_titles[0]
    selected_books_title, books_url = get_books_promotion_link(book_title)
    selected_momo_title, momo_url = get_momo_promotion_link(book_title)

    if books_url and momo_url:
        content = read_file(latest_md_file)
        updated_content = update_links(content, books_url, momo_url)
        write_file(latest_md_file, updated_content)

        # 更新reading_list資料夾內的index.md
        update_reading_list_index(latest_md_file, reading_list_file)
    else:
        print("Failed to retrieve promotion links.")


if __name__ == "__main__":
    directory_path = r'G:\marskingx.github.io\content\post'
    reading_list_file = r'G:\marskingx.github.io\content\page\reading_list\index.md'
    main(directory_path, reading_list_file)
