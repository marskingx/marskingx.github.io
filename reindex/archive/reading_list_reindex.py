import os
import re
from datetime import datetime


class ReadingListUpdater:
  """
  這個類用於更新閱讀清單文件。
  它從最新的 Markdown 文件中提取信息，並更新閱讀清單文件中的相關內容。
  """

  def __init__(self, latest_md_file, reading_list_file):
    """
    初始化 ReadingListUpdater 類。

    :param latest_md_file: 最新的 Markdown 文件路徑
    :param reading_list_file: 閱讀清單文件路徑
    """
    self.latest_md_file = latest_md_file
    self.reading_list_file = reading_list_file

  def read_file(self, file_path):
    """
    讀取指定路徑的文件內容。

    :param file_path: 要讀取的文件路徑
    :return: 文件內容
    :raises FileNotFoundError: 如果文件不存在
    """
    try:
      with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()
    except FileNotFoundError:
      raise FileNotFoundError(f"找不到文件：{file_path}")

  def write_file(self, file_path, content):
    """
    將內容寫入指定路徑的文件。

    :param file_path: 要寫入的文件路徑
    :param content: 要寫入的內容
    """
    with open(file_path, 'w', encoding='utf-8') as file:
      file.write(content)

  def extract_info_from_md(self):
    """
    從最新的 Markdown 文件中提取信息。

    :return: 包含提取信息的字典
    :raises ValueError: 如果缺少必要的字段
    :raises FileNotFoundError: 如果文件不存在
    """
    try:
      with open(self.latest_md_file, 'r', encoding='utf-8') as file:
        content = file.read()
        # 使用正則表達式提取 title, description, date, slug
        matches = re.finditer(
          r'^(title|description|date|slug):\s*(.+)$',
          content,
          re.MULTILINE
        )
        info = {m.group(1): m.group(2) for m in matches}
        info['slug'] = info['slug'].replace(' ', '-')
        # 提取 books 和 momo 的 URL
        info['books_url'] = re.search(r'\[!\[.*]\(books\.png\)\]\((.*?)\)', content).group(1)
        info['momo_url'] = re.search(r'\[!\[.*]\(momobooks\.png\)\]\((.*?)\)', content).group(1)
        return info
    except (KeyError, AttributeError) as e:
      raise ValueError(f"Markdown 文件中缺少必要字段：{e}")
    except FileNotFoundError:
      raise FileNotFoundError(f"找不到文件：{self.latest_md_file}")

  def get_image_number(self, content):
    """
    從內容中獲取最大的圖片編號。

    :param content: 要搜索的內容
    :return: 最大圖片編號加 1，如果沒有找到則返回 1
    """
    images = re.findall(r'img_(\d+)\.png', content)
    return max(map(int, images)) + 1 if images else 1

  def sanitize_title(self, title):
    """
    淨化標題，提取書名中的主要部分。

    :param title: 原始標題
    :return: 淨化後的標題
    """
    match = re.search(r'《(.*?)》', title)
    return match.group(1) if match else title

  def parse_links_section(self, content):
    """
    解析內容中的連結部分。

    :param content: 要解析的內容
    :return: 包含連結信息的列表
    """
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
    """
    檢查閱讀清單中是否存在重複條目。

    :param links: 現有的連結列表
    :param title: 新條目的標題
    :param description: 新條目的描述
    :param date: 新條目的日期
    :param slug: 新條目的 slug
    :return: 如果存在重複則返回 True，否則返回 False
    """
    sanitized_title_with_brackets = f'《{self.sanitize_title(title)}》'
    new_description = f"{date} | {description}"
    for link in links:
      if link[0] == sanitized_title_with_brackets and link[1] == new_description and link[
        2] == f"/p/{slug}/":
        return True  # 找到相同條目
    return False

  def add_reading_list_entry(self, content, title, description, date, slug, image_number, links):
    """
    向閱讀清單中添加新條目。

    :param content: 原始內容
    :param title: 新條目的標題
    :param description: 新條目的描述
    :param date: 新條目的日期
    :param slug: 新條目的 slug
    :param image_number: 圖片編號
    :param links: 現有的連結列表
    :return: 更新後的內容
    """
    sanitized_title_with_brackets = f'《{self.sanitize_title(title)}》'
    new_entry = {
      "title": sanitized_title_with_brackets,
      "description": f"{date} | {description}",
      "website": f"/p/{slug}/",
      "image": f"img_{image_number}.png"
    }
    links.append((new_entry["title"], new_entry["description"], new_entry["website"], new_entry["image"]))
    # 按日期降序排序
    links.sort(key=lambda x: datetime.strptime(x[1].split(' | ')[0], '%Y-%m-%d'), reverse=True)

    # 生成更新後的 YAML 格式的連結部分
    updated_links_yaml = "\n\n".join([
      f"- title: {link[0]}\n  description: {link[1]}\n  website: {link[2]}\n  image: {link[3]}"
      for link in links
    ])

    # 使用正則表達式更新內容中的連結部分
    updated_content = re.sub(
      r'(links:\s*\n)(.*?)(?=\nmenu:)', rf'\1{updated_links_yaml}\n', content, flags=re.DOTALL
    )
    return updated_content

  def check_duplicate_table_section(self, table_lines, title, momo_url, books_url):
    """
    檢查表格中是否已存在相同條目，若不一致則更新，並返回原有圖片編號。

    :param table_lines: 表格的行列表
    :param title: 新條目的標題
    :param momo_url: momo 的 URL
    :param books_url: books 的 URL
    :return: 是否存在重複和圖片編號的元組
    """
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
    """
    添加新的表格條目。

    :param content: 原始內容
    :param title: 新條目的標題
    :param momo_url: momo 的 URL
    :param books_url: books 的 URL
    :param image_number: 圖片編號
    :return: 更新後的內容
    :raises ValueError: 如果找不到表格部分
    """
    lines = content.split('\n')
    table_start_index = next((i for i, line in enumerate(lines) if line.startswith('| 閱讀書單 |')), None)
    table_end_index = next((i for i, line in enumerate(lines) if line.startswith('##### 聯盟行銷聲明')), None)
    if table_start_index is None or table_end_index is None:
      raise ValueError("在 reading_list.md 中找不到表格部分")

    table_lines = lines[table_start_index:table_end_index]
    new_table_row = f'| [![《{self.sanitize_title(title)}》](img_{image_number}.png)]({momo_url}) | <br/>✅推薦評等<br/>⭐⭐⭐<br/><br/> [![books_buy.jpg](books_buy.jpg)]({books_url})<br/> [![momobooks_buy.jpg](momobooks_buy.jpg)]({momo_url}) |'
    table_lines.insert(2, new_table_row)
    updated_lines = lines[:table_start_index] + table_lines + lines[table_end_index:]
    return '\n'.join(updated_lines)

  def update(self):
    """
    更新 reading_list.md 文件。
    這是整個更新過程的主要方法。
    """
    try:
      # 從最新的 Markdown 文件提取信息
      info = self.extract_info_from_md()
      # 讀取閱讀清單文件內容
      content = self.read_file(self.reading_list_file)
      # 解析連結部分
      links = self.parse_links_section(content)

      # 檢查並添加新的閱讀清單條目
      if not self.check_duplicate_reading_list_entry(links, info['title'], info['description'], info['date'],
                                                     info['slug']):
        image_number = self.get_image_number(content)
        content = self.add_reading_list_entry(content, info['title'], info['description'], info['date'], info['slug'],
                                              image_number, links)

      # 處理表格部分
      lines = content.split('\n')
      table_start_index = next((i for i, line in enumerate(lines) if line.startswith('| 閱讀書單 |')), None)
      table_end_index = next((i for i, line in enumerate(lines) if line.startswith('##### 聯盟行銷聲明')), None)
      is_duplicate, existing_image_number = self.check_duplicate_table_section(
        lines[table_start_index:table_end_index], info['title'], info['momo_url'], info['books_url']
      )

      # 如果不是重複條目，添加新的表格條目
      if not is_duplicate:
        image_number = existing_image_number if existing_image_number else image_number
        content = self.add_table_section_entry(content, info['title'], info['momo_url'], info['books_url'],
                                               image_number)

      # 將更新後的內容寫入文件
      self.write_file(self.reading_list_file, content)
      print(f"閱讀清單 '{self.reading_list_file}' 已成功更新。")
    except Exception as e:
      print(f"更新閱讀清單時發生錯誤：{e}")

# 使用示例（已註釋掉）
# if __name__ == "__main__":
#     updater = ReadingListUpdater(
#         r"G:\marskingx.github.io\content\post\2023-10-28【嗑書】想學會怎麼進步，就要學會進步的方法《商業書10倍高效》\index.md",
#         r"G:\marskingx.github.io\content\page\reading_list\index.md")
#     updater.update()
