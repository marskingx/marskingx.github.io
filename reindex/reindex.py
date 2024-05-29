import os
import re
from datetime import datetime

def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def write_file(file_path, content):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def is_content_formatted(content):
    # 檢查標題是否已經包含 `---\ntitle: ` 標記
    if not re.search(r'^---\ntitle: ', content, re.MULTILINE):
        return False
    # 檢查日期格式是否為 `YYYY-MM-DD`
    if not re.search(r'date: \d{4}-\d{2}-\d{2}', content):
        return False
    # 檢查 `categories` 和 `tags` 是否已經在 `[]` 中
    if not re.search(r'categories: \[.*\]', content):
        return False
    if not re.search(r'tags: \[.*\]', content):
        return False
    # 檢查 `status` 是否已經是 `已發佈`
    if 'status: 已發佈' not in content:
        return False
    # 檢查 `Slug` 是否在其後包含 `---`
    if not re.search(r'Slug: .*\n---', content):
        return False
    return True

def process_md_content(content):
    if is_content_formatted(content):
        print("Content is already formatted. Skipping processing.")
        return content

    # 加入 ---
    content = re.sub(r'^# (.*)', r'---\ntitle: \1', content, flags=re.MULTILINE)
    # 日期格式轉換
    content = re.sub(r'date: (\d{4})/(\d{2})/(\d{2})', lambda m: f'date: {m.group(1)}-{m.group(2)}-{m.group(3)}', content)
    # categories 和 tags 格式轉換
    content = re.sub(r'categories: (.*)', r'categories: [\1]', content)
    content = re.sub(r'tags: (.*)', r'tags: [\1]', content)
    # status 改為已發佈
    content = re.sub(r'status: 草稿', 'status: 已發佈', content)
    # Slug 內容之後換行並加入 ---
    content = re.sub(r'(Slug: .*)', r'\1\n---', content)
    # 移除所有特定代碼塊標記並保留內容
    content = re.sub(r'```jsx\n(.*?)\n```', r'\1', content, flags=re.DOTALL)
    # 修正圖片路徑
    content = re.sub(r'!\[(.*?)\]\([^\)]*/(.*?)\)', r'![\1](\2)', content)
    return content

def process_md_file(file_path):
    content = read_file(file_path)
    print(f"Original content of {file_path}:\n{content}\n")
    processed_content = process_md_content(content)
    if processed_content != content:
        print(f"Processed content of {file_path}:\n{processed_content}\n")
        write_file(file_path, processed_content)
    else:
        print("No changes made to the content.")

def get_latest_folders(directory):
    subfolders = [
        (f.path, datetime.strptime(os.path.basename(f.path)[:10], '%Y-%m-%d'))
        for f in os.scandir(directory) if f.is_dir() and re.match(r'^\d{4}-\d{2}-\d{2}', os.path.basename(f.path))
    ]
    subfolders.sort(key=lambda x: x[1], reverse=True)
    return [folder for folder, date in subfolders if date == subfolders[0][1]]

def select_folder(folders):
    if len(folders) > 1:
        print("Multiple folders found with the latest date:")
        for index, folder in enumerate(folders, start=1):
            print(f"{index}. {folder}")
        while True:
            selection = input(f"Please select the folder to process (1-{len(folders)}): ")
            if selection.isdigit() and 1 <= int(selection) <= len(folders):
                return folders[int(selection) - 1]
            else:
                print("Invalid selection. Please try again.")
    else:
        return folders[0]

def get_md_files(folder):
    md_files = []
    for root, _, files in os.walk(folder):
        md_files.extend(os.path.join(root, file) for file in files if file.endswith(".md"))
    return md_files

def process_latest_md_files(directory):
    if not os.path.exists(directory):
        print(f"Directory does not exist: {directory}")
        return

    latest_folders = get_latest_folders(directory)
    if not latest_folders:
        print("No valid subfolders found.")
        return

    latest_folder = select_folder(latest_folders)
    print(f"Latest folder selected: {latest_folder}")

    md_files = get_md_files(latest_folder)
    if not md_files:
        print("No markdown files found in the latest folder.")
        return

    if len(md_files) == 1:
        selected_md_file = md_files[0]
        confirmation = input(f"Do you want to proceed with processing the file: {selected_md_file}? (yes/no): ")
    else:
        selected_md_file = select_md_file(md_files)
        confirmation = input(f"Do you want to proceed with processing the file: {selected_md_file}? (yes/no): ")

    if confirmation.lower() != 'yes':
        print("Operation cancelled.")
        return

    print(f"Processing file: {selected_md_file}")
    process_md_file(selected_md_file)

if __name__ == "__main__":
    current_directory = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_directory, '..'))
    directory_path = os.path.join(project_root, 'content', 'post')

    print(f"Using directory path: {directory_path}")
    process_latest_md_files(directory_path)