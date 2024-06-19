import difflib
import os
import re
from datetime import datetime
from search_books_url import get_books_promotion_link, get_momo_promotion_link
from googletrans import Translator

# 設置 Google Cloud 認證環境變量
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"G:\key\mdbs-ocr.json"


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
    translator = Translator()

    content = re.sub(r'^# (.*)', r'---\ntitle: \1', content, flags=re.MULTILINE)
    content = re.sub(r'date: (\d{4})/(\d{2})/(\d{2})', lambda m: f'date: {m.group(1)}-{m.group(2)}-{m.group(3)}',
                     content)

    # 確保 categories 欄位只被一對方括號包裝
    content = re.sub(r'categories: \[\[(.*?)\]\]', r'categories: [\1]', content)
    content = re.sub(r'categories: (?!\[)(.*?)(?<!\])$', r'categories: [\1]', content, flags=re.MULTILINE)

    # 確保 tags 欄位只被一對方括號包裝
    content = re.sub(r'tags: \[\[(.*?)\]\]', r'tags: [\1]', content)
    content = re.sub(r'tags: (?!\[)(.*?)(?<!\])$', r'tags: [\1]', content, flags=re.MULTILINE)

    content = re.sub(r'status: 草稿', 'status: 已發佈', content)
    content = re.sub(r'```jsx\n(.*?)\n```', r'\1', content, flags=re.DOTALL)

    # 提取 title 並翻譯
    title_match = re.search(r'title: (.*)', content)
    if title_match:
        original_title = title_match.group(1)
        translated_title = translator.translate(original_title, src='zh-tw', dest='en').text
        print(f"Translated title: {translated_title}")

        # 生成 slug 並符合 Hugo 格式
        slug = re.sub(r'[^\w\s-]', '', translated_title)  # 移除特殊字符
        slug = re.sub(r'[-\s]+', '-', slug).strip('-_')  # 將空格和下劃線替換為連字符
        slug = slug.lower()  # 轉換為小寫

        # 打印格式化前的 slug
        slug_match = re.search(r'slug: (.*)', content)
        if slug_match:
            original_slug = slug_match.group(1)
            print(f"Original slug: {original_slug}")

        # 更新 Slug
        content = re.sub(r'slug: (.*)', f'slug: {slug}\n---', content)  # 注意 slug 加上引號

        # 打印格式化後的 Slug
        updated_slug_match = re.search(r'slug: (.*)', content)
        if updated_slug_match:
            updated_slug = updated_slug_match.group(1)
            print(f"Updated slug: {updated_slug}")
        # 修正博客來和 momo 的圖片連結
        content = re.sub(r'!\[books\.png]\(.*?\)', r'![books.png](books.png)', content)
        content = re.sub(r'!\[momobooks\.png]\(.*?\)', r'![momobooks.png](momobooks.png)', content)

    print(f"Formatted content: {content[:200]}...")  # 打印前200字符以供檢查
    return content


def check_update_link(content, link_name, link_image, book_title, link_url):
    """更新特定書商的購買連結。"""
    # 構建連結的正則表達式
    link_pattern = re.compile(rf'\[!\[{re.escape(link_name)}《{re.escape(book_title)}》\]\({re.escape(link_image)}\)\]\({re.escape(link_url)}\)')

    # 檢查連結是否存在
    if not link_pattern.search(content):
        # 如果連結不存在，則替換預設的圖片連結
        content = re.sub(rf'!\[{re.escape(link_image)}]\({re.escape(link_image)}\)',
                         f'[![{link_name}《{book_title}》]({link_image})]({link_url})', content)
        print(f"{link_name} link updated: {link_url}")
    else:
        print(f"{link_name} link already exists.")

    return content

def update_links(content, books_title, books_url, momo_url):
    """更新博客來和 momo 的購買連結。"""
    content = check_update_link(content, "books.png", "books.png", books_title, books_url)
    content = check_update_link(content, "momobooks.png", "momobooks.png", books_title, momo_url)
    print(f"Updated content with promotion links.")
    return content


def get_latest_folders(directory, n=20):
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
    # 嘗試從格式化前的文件中提取書名
    title_match = re.search(r'^# 【嗑書】《(.*?)》', content, re.MULTILINE)
    if title_match:
        titles = [title_match.group(1)]
        print(f"Extracted book titles from original format: {titles}")
        return titles

    # 嘗試從 YAML 頭部中的 title 字段中提取書名
    title_match = re.search(r'title: .*?《(.*?)》', content)
    if title_match:
        titles = [title_match.group(1)]
        print(f"Extracted book titles from YAML title: {titles}")
        return titles

    print("No book titles found.")
    return []


def process_latest_md_files(directory):
    if not os.path.exists(directory):
        print(f"Directory does not exist: {directory}")
        return [], None, None

    latest_folders = get_latest_folders(directory)
    if not latest_folders:
        print("No valid subfolders found.")
        return [], None, None

    # 顯示找到的資料夾並讓用戶選擇
    print("請選擇一個資料夾:")
    for idx, folder in enumerate(latest_folders):
        print(f"{idx + 1}: {folder}")

    choice = input("輸入選擇的資料夾號碼：")
    try:
        choice = int(choice) - 1
        if choice < 0 or choice >= len(latest_folders):
            raise ValueError
    except ValueError:
        print("無效的選擇，退出。")
        return [], None, None

    selected_folder = latest_folders[choice]
    print(f"選擇的資料夾: {selected_folder}")

    md_files = get_md_files(selected_folder)
    latest_md_file = md_files[0] if md_files else None
    if not latest_md_file:
        print("No markdown files found in the selected folder.")
        return [], None, None

    content = read_file(latest_md_file)
    original_book_titles = extract_book_titles(content)

    # 檢查並格式化內容
    formatted_content = format_md_content(content)

    # 在寫入之前檢查原來的文件是不是符合即將寫入的格式
    if content != formatted_content:
        write_file(latest_md_file, formatted_content)  # 這裡寫回格式化後的內容
        print("文件已更新。")
        updated_content = read_file(latest_md_file)
        updated_book_titles = extract_book_titles(updated_content)
    else:
        print("文件已經是格式化的。不做任何更改。")
        updated_book_titles = original_book_titles

    return original_book_titles, updated_book_titles, latest_md_file, selected_folder


class ReadingListUpdater:
    def __init__(self, latest_md_file, reading_list_file):
        self.latest_md_file = latest_md_file
        self.reading_list_file = reading_list_file

    def read_file(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {file_path}")

    def write_file(self, file_path, content):
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)

    # --- 提取資訊 ---
    def extract_info_from_md(self):
        try:
            with open(self.latest_md_file, 'r', encoding='utf-8') as file:
                content = file.read()
                matches = re.finditer(
                    r'^(title|description|date|slug):\s*(.+)$',
                    content,
                    re.MULTILINE
                )
                info = {m.group(1): m.group(2) for m in matches}
                info['slug'] = info['slug'].replace(' ', '-')
                info['books_url'] = re.search(r'\[!\[.*]\(books\.png\)\]\((.*?)\)', content).group(1)
                info['momo_url'] = re.search(r'\[!\[.*]\(momobooks\.png\)\]\((.*?)\)', content).group(1)
                return info
        except (KeyError, AttributeError) as e:
            raise ValueError(f"Missing required field in markdown file: {e}")
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.latest_md_file}")

    def get_image_number(self, content):
        images = re.findall(r'img_(\d+)\.png', content)
        return max(map(int, images)) + 1 if images else 1

    def sanitize_title(self, title):
        match = re.search(r'《(.*?)》', title)
        return match.group(1) if match else title

    # --- 處理閱讀清單 ---
    def parse_links_section(self, content):
        links_match = re.search(r'links:\s*(\n\s*-\s*title:.*?)(?=\nmenu:)', content, re.DOTALL)
        if links_match:
            links_yaml = links_match.group(1)
            links = [tuple(m.groups()) for m in re.finditer(
                r'- title: (.*?)\n  description: (.*?)\n  website: (.*?)\n  image: (.*?)\n',
                links_yaml, re.DOTALL
            )]
            return links
        return []

    def check_duplicate_reading_list_entry(self, links, title, description, date, slug):
        sanitized_title_with_brackets = f'《{self.sanitize_title(title)}》'
        new_description = f"{date} | {description}"
        for link in links:
            if link[0] == sanitized_title_with_brackets and link[1] == new_description and link[
                2] == f"/p/{slug}/":
                return True  # 找到相同條目
        return False

    def add_reading_list_entry(self, content, title, description, date, slug, image_number, links):
        sanitized_title_with_brackets = f'《{self.sanitize_title(title)}》'
        new_entry = {
            "title": sanitized_title_with_brackets,
            "description": f"{date} | {description}",
            "website": f"/p/{slug}/",
            "image": f"img_{image_number}.png"
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
        return updated_content

    # --- 處理表格區塊 ---
    def check_duplicate_table_section(self, table_lines, title, momo_url, books_url):
        """檢查表格中是否已存在相同條目，若不一致則更新，並返回原有圖片編號。"""
        sanitized_title_with_brackets = f'《{self.sanitize_title(title)}》'
        for i, line in enumerate(table_lines):
            if sanitized_title_with_brackets in line:
                existing_image_match = re.search(r'img_(\d+)\.png', line)
                existing_image_number = existing_image_match.group(1) if existing_image_match else None

                if not existing_image_match or f'[![{sanitized_title_with_brackets}](img_{existing_image_number}.png)]({momo_url})' not in line:
                    new_table_row = f'| [![{sanitized_title_with_brackets}](img_{existing_image_number}.png)]({momo_url}) | <br/>✅推薦評等<br/>⭐⭐⭐<br/><br/> [![books_buy.jpg](books_buy.jpg)]({books_url})<br/> [![momobooks_buy.jpg](momobooks_buy.jpg)]({momo_url}) |'
                    table_lines[i] = new_table_row

                return True, existing_image_number

        return False, None

    def add_table_section_entry(self, content, title, momo_url, books_url, image_number):
        """添加新的表格條目。"""
        lines = content.split('\n')
        table_start_index = next((i for i, line in enumerate(lines) if line.startswith('| 閱讀書單 |')), None)
        table_end_index = next((i for i, line in enumerate(lines) if line.startswith('##### 聯盟行銷聲明')), None)
        if table_start_index is None or table_end_index is None:
            raise ValueError("Table section not found in reading_list.md")

        table_lines = lines[table_start_index:table_end_index]
        new_table_row = f'| [![《{self.sanitize_title(title)}》](img_{image_number}.png)]({momo_url}) | <br/>✅推薦評等<br/>⭐⭐⭐<br/><br/> [![books_buy.jpg](books_buy.jpg)]({books_url})<br/> [![momobooks_buy.jpg](momobooks_buy.jpg)]({momo_url}) |'
        table_lines.insert(2, new_table_row)
        updated_lines = lines[:table_start_index] + table_lines + lines[table_end_index:]
        return '\n'.join(updated_lines)


    def update(self):
        """更新 reading_list.md 檔案。"""
        try:
            info = self.extract_info_from_md()
            content = self.read_file(self.reading_list_file)
            links = self.parse_links_section(content)

            if not self.check_duplicate_reading_list_entry(links, info['title'], info['description'], info['date'], info['slug']):
                image_number = self.get_image_number(content)
                content = self.add_reading_list_entry(content, info['title'], info['description'], info['date'], info['slug'], image_number, links)

            lines = content.split('\n')
            table_start_index = next((i for i, line in enumerate(lines) if line.startswith('| 閱讀書單 |')), None)
            table_end_index = next((i for i, line in enumerate(lines) if line.startswith('##### 聯盟行銷聲明')), None)
            is_duplicate, existing_image_number = self.check_duplicate_table_section(
                lines[table_start_index:table_end_index], info['title'], info['momo_url'], info['books_url']
            )

            if not is_duplicate:
                image_number = existing_image_number if existing_image_number else image_number
                content = self.add_table_section_entry(content, info['title'], info['momo_url'], info['books_url'], image_number)

            self.write_file(self.reading_list_file, content)
            print(f"Reading list '{self.reading_list_file}' updated successfully.")
        except Exception as e:
            print(f"Error updating reading list: {e}")

import os

import os
import shutil

def rename_images(directory, target_name, new_name):
    """
    在指定目錄中搜尋特定名稱的圖片，並將它們重新命名。

    參數：
        directory (str): 要搜尋的目錄路徑。
        target_name (str): 要搜尋的圖片名稱 (不包含副檔名)。
        new_name (str): 新的圖片名稱 (不包含副檔名)。
    """
    for filename in os.listdir(directory):
        if filename.startswith(target_name) and filename.endswith((".png", ".jpg", ".jpeg", ".gif")):
            old_path = os.path.join(directory, filename)
            new_filename = f"{new_name}{os.path.splitext(filename)[1]}"
            new_path = os.path.join(directory, new_filename)

            # 檢查新檔案是否存在，如果存在則覆蓋
            if os.path.exists(new_path):
                os.remove(new_path)
                print(f"Removed existing file '{new_filename}'")

            shutil.copy2(old_path, new_path)  # 使用 shutil.copy2 保留檔案 metadata
            print(f"Renamed '{filename}' to '{new_filename}'")




# --- main 函式 ---
def main(directory_path, reading_list_file):
    print(f"Using directory path: {directory_path}")

    # 選擇並處理最新的 Markdown 文件
    original_book_titles, updated_book_titles, latest_md_file, selected_folder = process_latest_md_files(directory_path)
    original_reading_list_content = read_file(reading_list_file)

    if not updated_book_titles:
        print("No book titles found, exiting.")
        return

    book_title = updated_book_titles[0]
    selected_books_title, books_url = get_books_promotion_link(book_title)
    _, momo_url = get_momo_promotion_link(book_title)

    if books_url and momo_url:
        content = read_file(latest_md_file)
        updated_content = update_links(content, selected_books_title, books_url, momo_url)
        if content != updated_content:
            write_file(latest_md_file, updated_content)
            print(f"Updated file with promotion links: {latest_md_file}")
        else:
            print("No changes in promotion links.")

        # 在這裡調用 rename_images 函式
        target_name = "img"  # 要搜尋的圖片名稱
        new_name = "cover"  # 要設定的新名稱
        rename_images(selected_folder, target_name, new_name)

        # 使用 ReadingListUpdater 來更新 reading_list.md
        updater = ReadingListUpdater(latest_md_file, reading_list_file)
        updater.update()

    else:
        print("Failed to retrieve promotion links.")

    print("Process completed successfully.")


if __name__ == "__main__":
    directory_path = r'G:\marskingx.github.io\content\post'  # 存放 Markdown 文件的目錄
    reading_list_file = r'G:\marskingx.github.io\content\page\reading_list\index.md'  # 閱讀清單文件
    main(directory_path, reading_list_file)
