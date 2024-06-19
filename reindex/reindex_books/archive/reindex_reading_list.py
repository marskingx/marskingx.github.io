import os
import re
from datetime import datetime


def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        raise


def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"File {file_path} has been updated successfully.")
    except Exception as e:
        print(f"Error writing file {file_path}: {e}")
        raise


def get_latest_md_file(directory):
    try:
        latest_folder = max([os.path.join(directory, d) for d in os.listdir(directory)], key=os.path.getmtime)
        latest_md_file = max([os.path.join(latest_folder, f) for f in os.listdir(latest_folder) if f.endswith('.md')],
                             key=os.path.getmtime)
        return latest_md_file
    except Exception as e:
        print(f"Error finding latest markdown file in directory {directory}: {e}")
        raise


def extract_info_from_md(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            title = re.search(r'^title:\s*(.+)$', content, re.MULTILINE).group(1)
            description = re.search(r'^description:\s*(.+)$', content, re.MULTILINE).group(1)
            date = re.search(r'^date:\s*(.+)$', content, re.MULTILINE).group(1)
            slug = re.search(r'^slug:\s*(.+)$', content, re.MULTILINE).group(1).replace(' ', '-')
            books_url = re.search(r'\[!\[.*\]\(books\.jpg\)\]\((.*?)\)', content).group(1)
            momo_url = re.search(r'\[!\[.*\]\(momobooks\.jpg\)\]\((.*?)\)', content).group(1)
        return title, description, date, slug, books_url, momo_url
    except Exception as e:
        print(f"Error extracting information from markdown file {file_path}: {e}")
        raise


def sanitize_title(title):
    match = re.search(r'《(.*?)》', title)
    return match.group(1) if match else title


def find_existing_image_number(content, sanitized_title):
    match_table = re.search(r'\[!\[%s\]\(img_(\d+)\.png\)' % re.escape(sanitized_title), content)
    match_links = re.search(r'- title: .*%s.*\n.*image: img_(\d+)\.png' % re.escape(sanitized_title), content)

    if match_table:
        return int(match_table.group(1))
    elif match_links:
        return int(match_links.group(1))
    return None


def check_duplicate_entry(content, title, description, date):
    sanitized_title = sanitize_title(title)
    sanitized_title_with_brackets = f'《{sanitized_title}》'
    new_description = f"{date} | {description}"

    links = parse_links_section(content)
    for link in links:
        if link[0] == sanitized_title_with_brackets and link[1] == new_description:
            return True
    return False


def update_table_section(content, title, description, date, slug, books_url, momo_url, image_number):
    try:
        lines = content.split('\n')
        sanitized_title = sanitize_title(title)
        sanitized_title_with_brackets = f'《{sanitized_title}》'

        table_start = None
        table_end = None
        for i, line in enumerate(lines):
            if line.startswith('| 閱讀書單 | 購書連結🌐<br/>推薦評等⭐|'):
                table_start = i
            if table_start is not None and line.startswith('|-|-|'):
                table_end = i + 1
                break

        if table_start is not None and table_end is not None:
            table_lines = lines[table_start:table_end]
            new_table_row = f'| [![{sanitized_title_with_brackets}](img_{image_number}.png)]({momo_url}) | ⭐⭐⭐<br/> [![books_buy.jpg](books_buy.jpg)]({books_url})<br/> [![momobooks_buy.jpg](momobooks_buy.jpg)]({momo_url}) |'
            table_lines.append(new_table_row)
            updated_content = '\n'.join(lines[:table_start] + table_lines + lines[table_end:])
            print("Table section updated successfully.")
        else:
            print("No table section found in the file.")
            updated_content = content

        return updated_content
    except Exception as e:
        print(f"Error updating table section: {e}")
        raise


def update_reading_list(content, title, description, date, slug, image_number):
    try:
        links = parse_links_section(content)
        sanitized_title = sanitize_title(title)
        sanitized_title_with_brackets = f'《{sanitized_title}》'

        new_entry = {
            "title": sanitized_title_with_brackets,
            "description": f"{date} | {description}",
            "website": f"https://lazytoberich.com.tw/p/{slug}/",
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
    except Exception as e:
        print(f"Error updating reading list: {e}")
        raise


def parse_links_section(content):
    links_match = re.search(r'links:\s*(\n\s*-\s*title:.*?)(?=\nmenu:)', content, re.DOTALL)
    if links_match:
        links_yaml = links_match.group(1)
        links = re.findall(r'-\s*title:\s*(.*?)\n\s*description:\s*(.*?)\n\s*website:\s*(.*?)\n\s*image:\s*(.*?)\n', links_yaml, re.DOTALL)
        return links
    return []


def main():
    try:
        post_directory = r'G:\marskingx.github.io\content\post'
        reading_list_file = r'/content/page/reading_list/index.md'

        latest_md_file = get_latest_md_file(post_directory)
        title, description, date, slug, books_url, momo_url = extract_info_from_md(latest_md_file)

        content = read_file(reading_list_file)

        # 檢查是否存在重複條目
        if check_duplicate_entry(content, title, description, date):
            print("Duplicate entry found. Skipping update.")
            return

        sanitized_title = sanitize_title(title)

        # 查找是否已存在相同書名的圖片編號
        existing_image_number = find_existing_image_number(content, sanitized_title)
        if existing_image_number is not None:
            image_number = existing_image_number
        else:
            images = re.findall(r'img_(\d+)\.png', content)
            if images:
                image_number = max(map(int, images)) + 1
            else:
                image_number = 1

        updated_content = update_table_section(content, title, description, date, slug, books_url, momo_url, image_number)
        updated_content = update_reading_list(updated_content, title, description, date, slug, image_number)
        write_file(reading_list_file, updated_content)
    except Exception as e:
        print(f"Error in main function: {e}")
        raise


if __name__ == "__main__":
    main()
