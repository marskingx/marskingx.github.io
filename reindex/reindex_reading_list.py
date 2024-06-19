import os
import re
from datetime import datetime


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


# if __name__ == "__main__":
#     updater = ReadingListUpdater(
#         r"G:\marskingx.github.io\content\post\2023-10-28【嗑書】想學會怎麼進步，就要學會進步的方法《商業書10倍高效》\index.md",
#         r"G:\marskingx.github.io\content\page\reading_list\index.md")
#     updater.update()
