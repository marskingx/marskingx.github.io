import os
import re
from datetime import datetime

def process_md_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # 原始內容
    print(f"Original content of {file_path}:\n{content}\n")

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

    # 處理後的內容
    print(f"Processed content of {file_path}:\n{content}\n")

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_latest_md_files(directory):
    # 獲取目錄下的所有資料夾
    subfolders = [f.path for f in os.scandir(directory) if f.is_dir()]
    if not subfolders:
        print("No subfolders found.")
        return

    # 找到最新的資料夾
    latest_folder = max(subfolders, key=os.path.getmtime)
    print(f"Latest folder found: {latest_folder}")

    # 獲取最新資料夾下的所有 .md 文件
    md_files = []
    for root, _, files in os.walk(latest_folder):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                md_files.append(file_path)

    # 打印出所有 .md 文件，並請求確認
    if not md_files:
        print("No markdown files found in the latest folder.")
        return

    print("The following markdown files are available:")
    for index, file_path in enumerate(md_files, start=1):
        print(f"{index}. {file_path}")

    while True:
        selection = input(f"Please select the file to process (1-{len(md_files)}): ")
        if selection.isdigit() and 1 <= int(selection) <= len(md_files):
            selected_file = md_files[int(selection) - 1]
            break
        else:
            print("Invalid selection. Please try again.")

    confirmation = input(f"Do you want to proceed with processing the file: {selected_file}? (Y/N): ")
    if confirmation.lower() != 'Y':
        print("Operation cancelled.")
        return

    # 處理選擇的 .md 文件
    print(f"Processing file: {selected_file}")
    process_md_file(selected_file)

# 指定根目錄路徑
directory_path = r'G:\marskingx.github.io\content\post'
process_latest_md_files(directory_path)
