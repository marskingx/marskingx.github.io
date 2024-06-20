import os
import re
from datetime import datetime


# 此函數用於讀取文件，如果讀取過程中出錯，則將錯誤信息打印並重新拋出錯誤
def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"讀取文件 {file_path} 時出現錯誤: {e}")
        raise


# 此函數用於寫入文件，如果寫入過程中出錯，則將錯誤信息打印並重新拋出錯誤
def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"成功更新文件 {file_path}。")
    except Exception as e:
        print(f"寫入文件 {file_path} 時出現錯誤: {e}")
        raise


# 此函數用於獲取指定目錄下的最新的 Markdown 文件，如果獲取過程中出現錯誤，將錯誤信息打印並重新拋出錯誤
def get_latest_md_file(directory):
    try:
        latest_folder = max([os.path.join(directory, d) for d in os.listdir(directory)], key=os.path.getmtime)
        latest_md_file = max([os.path.join(latest_folder, f) for f in os.listdir(latest_folder) if f.endswith('.md')],
                             key=os.path.getmtime)
        return latest_md_file
    except Exception as e:
        print(f"在目錄 {directory} 中查找最新的 Markdown 文件時出現錯誤: {e}")
        raise


# 此函數用於從指定的 Markdown 文件中提取信息，如果提取過程中出現異常則將錯誤信息打印並重新拋出錯誤
def extract_info_from_md(file_path):
    try:
        content = read_file(file_path)
        title_match = re.search(r'^title:\s*(.+)$', content, re.MULTILINE)
        description_match = re.search(r'^description:\s*(.+)$', content, re.MULTILINE)
        date_match = re.search(r'^date:\s*(.+)$', content, re.MULTILINE)
        slug_match = re.search(r'^slug:\s*(.+)$', content, re.MULTILINE)
        books_url_match = re.search(r'\[!\[.*\]\(books\.jpg\)\]\((.*?)\)', content)
        momo_url_match = re.search(r'\[!\[.*\]\(momobooks\.jpg\)\]\((.*?)\)', content)

        if not title_match:
            raise ValueError("Missing title in markdown file")
        if not description_match:
            raise ValueError("Missing description in markdown file")
        if not date_match:
            raise ValueError("Missing date in markdown file")
        if not slug_match:
            raise ValueError("Missing slug in markdown file")
        if not books_url_match:
            raise ValueError("Missing books_url in markdown file")
        if not momo_url_match:
            raise ValueError("Missing momo_url in markdown file")

        title = title_match.group(1)
        description = description_match.group(1)
        date = date_match.group(1)
        slug = slug_match.group(1).replace(' ', '-')
        books_url = books_url_match.group(1)
        momo_url = momo_url_match.group(1)

        return title, description, date, slug, books_url, momo_url

    except Exception as e:
        print(f"提取書籍資訊失敗: {e}")
        return None, None, None, None, None, None



# 此函數用於處理書名中的特殊字符
def sanitize_title(title):
    match = re.search(r'《(.*?)》', title)
    return match.group(1) if match else title


# 此函數用於更新讀書列表文件中的表格部分
def update_table_section(content, title, description, date, slug, books_url, momo_url):
    try:
        lines = content.split('\n')
        sanitized_title = sanitize_title(title)

        table_start = None
        table_end = None
        # 搜尋並找到讀書表格的位置
        for i, line in enumerate(lines):
            if line.startswith('| 閱讀書單| 購書連結🌐<br/>推薦評等⭐|'):
                table_start = i
            if table_start is not None and line.startswith('|-|-|'):
                table_end = i + 1
                break

        if table_start is not None and table_end is not None:
            table_lines = lines[table_start:table_end]
            image_number = None
            # 在表格中尋找標題相同的書籍，並獲取圖片編號
            for line in table_lines:
                match = re.search(r'\[!\[([^\]]+)\]\(img_(\d+)\.png\)', line)
                if match and sanitize_title(match.group(1)) == sanitized_title:
                    image_number = int(match.group(2))
                    break

            # 如果沒有找到相同的書籍，則創建新的圖片編號
            if image_number is None:
                images = re.findall(r'img_(\d+)\.png', content)
                if images:
                    image_number = max(map(int, images)) + 1
                else:
                    image_number = 1

            sanitized_title_with_brackets = f'《{sanitized_title}》'
            new_table_row = f'| [![{sanitized_title_with_brackets}](img_{image_number}.png)]({momo_url}) | ⭐⭐⭐<br/> [![books_buy.jpg](books_buy.jpg)]({books_url})<br/> [![momobooks_buy.jpg](momobooks_buy.jpg)]({momo_url}) |'
            table_lines.append(new_table_row)
            updated_content = '\n'.join(lines[:table_start] + table_lines + lines[table_end:])
            print("成功更新了表格部分。\n")
        else:
            print("文件中沒有找到表格部分。\n")
            updated_content = content

        return updated_content
    except Exception as e:
        print(f"更新表格部分時出現錯誤: {e}")
        raise


# 執行主要功能
def main():
    try:
        # 定義文章和讀書表格的所在路徑
        post_directory = r'G:\marskingx.github.io\content\post'
        reading_list_file = r'G:\marskingx.github.io\content\page\reading_list\index.md'

        # 獲取最新的md文件路徑並從中提取信息
        latest_md_file = get_latest_md_file(post_directory)
        title, description, date, slug, books_url, momo_url = extract_info_from_md(latest_md_file)

        # 讀取讀書列表的文件內容
        content = read_file(reading_list_file)

        # 更新讀書列表文件的內容
        updated_content = update_table_section(content, title, description, date, slug, books_url, momo_url)
        # 將更新後的內容寫入讀書列表文件
        write_file(reading_list_file, updated_content)
    except Exception as e:
        print(f"執行主要功能時出現錯誤 : {e}")
        raise


# 若直接執行此腳本，則調用main函數
if __name__ == "__main__":
    main()
