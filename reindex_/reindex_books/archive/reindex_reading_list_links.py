import os
import re
from datetime import datetime

def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            print(f"成功讀取文件: {file_path}")
            return content
    except Exception as e:
        print(f"讀取文件時出錯 {file_path}: {e}")
        return ""

def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"文件已成功更新: {file_path}")
    except Exception as e:
        print(f"寫入文件時出錯 {file_path}: {e}")

def extract_book_info(content):
    print("從內容中提取書籍信息...")
    title_match = re.search(r'^title: (【嗑書】《[^》]+》)', content, re.MULTILINE)
    title = title_match.group(1) if title_match else None

    description_match = re.search(r'^description: (.+)', content, re.MULTILINE)
    description = description_match.group(1) if description_match else None

    date_match = re.search(r'^date: (\d{4}-\d{2}-\d{2})', content, re.MULTILINE)
    date = date_match.group(1) if date_match else None

    slug_match = re.search(r'^slug: (.+)', content, re.MULTILINE)
    slug = slug_match.group(1).replace(" ", "-").replace(",", "").replace(".", "").lower() if slug_match else None

    if title:
        print(f"提取的標題: {title}")
    else:
        print("未能提取標題")

    if date:
        print(f"提取的日期: {date}")
    else:
        print("未能提取日期")

    if description:
        print(f"提取的描述: {description}")
    else:
        print("未能提取描述")

    if slug:
        print(f"提取的Slug: {slug}")
    else:
        print("未能提取Slug")

    return title, description, date, slug

def parse_links_section(content):
    links_match = re.search(r'links:\s*(\n\s*-\s*title:.*?)(?=\nmenu:)', content, re.DOTALL)
    if links_match:
        links_yaml = links_match.group(1)
        links = re.findall(r'-\s*title:\s*(.*?)\n\s*description:\s*(.*?)\n\s*website:\s*(.*?)\n\s*image:\s*(.*?)\n', links_yaml, re.DOTALL)
        return links
    return []

def update_reading_list(reading_list_file, title, description, date, slug):
    content = read_file(reading_list_file)
    links = parse_links_section(content)

    max_image_number = max([int(num) for num in re.findall(r'img_(\d+)\.png', content)]) if content else 0
    new_image_number = max_image_number + 1

    # 去掉前綴“【嗑書】”並保留《》書名號，檢查是否存在後綴並去除
    if title.startswith('【嗑書】') and title.endswith('》'):
        original_title = title
        title = re.sub(r'^【嗑書】《', '《', title)  # 去掉前綴
        title = re.sub(r'》.*$', '》', title)  # 去掉後綴
        print(f"Original Title: {original_title}, Processed Title: {title}")

    new_entry = {
        "title": title,
        "description": f"{date} | {description}",
        "website": f"https://lazytoberich.com.tw/p/{slug}/",
        "image": f"img_{new_image_number}.png"
    }

    links.append((new_entry["title"], new_entry["description"], new_entry["website"], new_entry["image"]))
    links.sort(key=lambda x: datetime.strptime(x[1].split(' | ')[0], '%Y-%m-%d'), reverse=True)

    updated_links_yaml = "\n\n".join([
        f"- title: {link[0]}\n  description: {link[1]}\n  website: {link[2]}\n  image: {link[3]}"
        for link in links
    ])

    updated_content = re.sub(
        r'(links:\s*\n)(.*?)(?=\nmenu:)', rf'\1{updated_links_yaml}\n', content, flags=re.DOTALL
    )

    write_file(reading_list_file, updated_content)

def get_latest_folders(directory, n=1):
    subfolders = [
        (f.path, os.path.getmtime(f.path))
        for f in os.scandir(directory) if f.is_dir()
    ]
    subfolders.sort(key=lambda x: x[1], reverse=True)
    return [folder for folder, _ in subfolders[:n]]

def get_md_files(folder):
    md_files = []
    for root, _, files in os.walk(folder):
        md_files.extend(os.path.join(root, file) for file in files if file.endswith(".md"))
    return md_files

def process_latest_md_files(directory):
    if not os.path.exists(directory):
        print(f"Directory does not exist: {directory}")
        return None

    latest_folders = get_latest_folders(directory)
    latest_folder = latest_folders[0] if latest_folders else None
    if not latest_folder:
        print("No valid subfolders found.")
        return None

    print(f"Latest folder selected: {latest_folder}")

    md_files = get_md_files(latest_folder)
    latest_md_file = md_files[0] if md_files else None
    if not latest_md_file:
        print("No markdown files found in the latest folder.")
        return None

    return latest_md_file

def main():
    content_dir = r'G:\marskingx.github.io\content\post'
    reading_list_file = r'G:\marskingx.github.io\content\page\reading_list\index.md'

    latest_md_file = process_latest_md_files(content_dir)
    if not latest_md_file:
        return

    content = read_file(latest_md_file)
    title, description, date, slug = extract_book_info(content)

    if title and description and date and slug:
        update_reading_list(reading_list_file, title, description, date, slug)
        print(f"Updated reading list with book: {title}")
    else:
        print("Failed to extract book information.")

if __name__ == "__main__":
    main()
