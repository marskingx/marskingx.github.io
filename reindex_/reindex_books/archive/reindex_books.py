import os
import re
from datetime import datetime

def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return ""

def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
    except Exception as e:
        print(f"Error writing file {file_path}: {e}")

def is_content_formatted(content):
    checks = [
        r'^---\ntitle: ',
        r'date: \d{4}-\d{2}-\d{2}',
        r'categories: \[.*\]',
        r'tags: \[.*\]',
        r'status: 已發佈',
        r'Slug: .*\n---'
    ]
    return all(re.search(check, content, re.MULTILINE) for check in checks)

def format_md_content(content):
    content = re.sub(r'^# (.*)', r'---\ntitle: \1', content, flags=re.MULTILINE)
    content = re.sub(r'date: (\d{4})/(\d{2})/(\d{2})', lambda m: f'date: {m.group(1)}-{m.group(2)}-{m.group(3)}', content)
    content = re.sub(r'categories: (.*)', r'categories: [\1]', content)
    content = re.sub(r'tags: (.*)', r'tags: [\1]', content)
    content = re.sub(r'status: 草稿', 'status: 已發佈', content)
    content = re.sub(r'(slug: .*)', r'\1\n---', content)
    content = re.sub(r'```jsx\n(.*?)\n```', r'\1', content, flags=re.DOTALL)
    content = re.sub(r'!\[(.*?)\]\([^\)]*/(.*?)\)', r'![\1](\2)', content)
    return content

def update_image_links(content, links):
    def replace_image_link(match):
        alt_text = match.group(1)
        image_path = match.group(2)

        # 檢查現有連結是否已經是 https 開頭
        if image_path.startswith("https://"):
            return match.group(0)

        # 根據圖片類型獲取相應的連結
        for book_url, image_type in links:
            if (image_type == 'books' and image_path in ['img.jpg', 'books.jpg']) or \
               (image_type == 'momo' and image_path == 'momobooks.jpg'):
                existing_link = re.search(r'\[!\[.*?\]\((img\.jpg|books\.jpg|momobooks\.jpg)\)\]\((.*?)\)', match.group(0))
                if existing_link:
                    existing_url = existing_link.group(2)
                    if book_url in existing_url:
                        return match.group(0)  # 如果 URL 已存在，保持不變
                    else:
                        new_url = existing_url + '&' + book_url if '?' not in existing_url else existing_url + '&' + \
                                                                                                book_url.split('?', 1)[1]
                        return f'[![{alt_text}]({image_path})]({new_url})'
                else:
                    return f'[![{alt_text}]({image_path})]({book_url})'

        return match.group(0)

    content = re.sub(r'!\[(.*?)\]\((img\.jpg|books\.jpg|momobooks\.jpg)\)', replace_image_link, content)
    return content

def process_md_file(file_path, links):
    content = read_file(file_path)
    if not content:
        return

    original_content = content

    # 檢查和格式化內容
    if not is_content_formatted(content):
        content = format_md_content(content)

    # 更新圖片連結
    updated_content = update_image_links(content, links)

    # 如果內容沒有發生變化，不進行寫入
    if updated_content != original_content:
        print(f"Updating file: {file_path}")
        write_file(file_path, updated_content)
        print("Changes saved.")
    else:
        print(f"No changes made to the file: {file_path}")

def get_latest_folders(directory, n=5):
    try:
        subfolders = [
            (f.path, os.path.getmtime(f.path))
            for f in os.scandir(directory) if f.is_dir() and '《' in f.name
        ]
        subfolders.sort(key=lambda x: x[1], reverse=True)
        return [folder for folder, _ in subfolders[:n]]
    except Exception as e:
        print(f"Error getting latest folders: {e}")
        return []

def get_md_files(folder):
    md_files = []
    try:
        for root, _, files in os.walk(folder):
            md_files.extend(os.path.join(root, file) for file in files if file.endswith(".md"))
    except Exception as e:
        print(f"Error getting markdown files: {e}")
    return md_files

def extract_book_titles(content):
    return re.findall(r'《(.*?)》', content)

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

    book_titles = extract_book_titles(read_file(latest_md_file))

    return book_titles, latest_md_file

def main():
    directory_path = r'G:\marskingx.github.io\content\post'

    if not os.path.exists(directory_path):
        print(f"Directory does not exist: {directory_path}")
        return [], None

    print(f"Using directory path: {directory_path}")
    return process_latest_md_files(directory_path)

if __name__ == "__main__":
    main()
