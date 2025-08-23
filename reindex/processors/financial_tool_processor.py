import re
import logging
from datetime import datetime
from .base_processor import BaseProcessor  # 使用相对导入
import yaml


class FinancialToolProcessor(BaseProcessor):
  def __init__(self, file_path, reading_list_path):
    super().__init__(file_path)
    self.reading_list_path = reading_list_path
    self.content = None

  def process(self):
    try:
      logging.info(f"開始處理金融工具: {self.file_path}")

      self.read_file()
      if self.content is None:
        logging.error("無法讀取文件內容")
        return None

      updated_content = self.update_yaml()
      if updated_content:
        self.write_file(updated_content)
        logging.debug("成功寫入更新後的內容到文件")
      else:
        logging.error("更新 YAML 失敗，無法寫入文件")

    except Exception as e:
      logging.error(f"處理金融工具時發生錯誤: {e}", exc_info=True)
    return None

  def read_file(self):
    try:
      with open(self.file_path, 'r', encoding='utf-8') as file:
        self.content = file.read()
    except Exception as e:
      logging.error(f"讀取文件時發生錯誤: {e}")
      self.content = None

  def update_yaml(self):
    if self.content is None:
      logging.error("文件內容為空，無法更新 YAML")
      return None

    yaml_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
    yaml_match = yaml_pattern.search(self.content)
    if yaml_match:
      original_yaml = yaml_match.group(0)
      content_without_yaml = self.content[yaml_match.end():].strip()
    else:
      original_yaml = ''
      content_without_yaml = self.content

    title_match = re.search(r'^# (.*)', content_without_yaml, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "未命名"
    description_match = re.search(r'description: (.*)', content_without_yaml)
    description = description_match.group(1).strip() if description_match else "這是一個預設的描述。"
    author_match = re.search(r'authors: (.*)', content_without_yaml)
    author = author_match.group(1).strip() if author_match else "懶大"
    release_match = re.search(r'release: (.*)', content_without_yaml, re.IGNORECASE)
    release_date = release_match.group(1).strip() if release_match else datetime.now().strftime("%Y-%m-%d")
    date_match = re.search(r'date: (\d{4}/\d{2}/\d{2})', content_without_yaml)
    date = self.standardize_date_format(date_match.group(1).strip()) if date_match else datetime.now().strftime(
      "%Y-%m-%d")
    image = f"/images/blog/{self.format_image_date(date)}.png"
    categories_match = re.search(r'categories: (.*)', content_without_yaml)
    categories = f"[{categories_match.group(1).strip()}]" if categories_match else "[財務工具與金融商品]"
    tags_match = re.search(r'tags: (.*)', content_without_yaml)
    tags = f"[{tags_match.group(1).strip().replace(' ', '').replace(',', ',')}]" if tags_match else "[]"
    keywords_match = re.search(r'keywords: (.*)', content_without_yaml)
    keywords = keywords_match.group(1).strip() if keywords_match else ""
    draft_match = re.search(r'draft: (.*)', content_without_yaml)
    draft = draft_match.group(1).strip() if draft_match else "false"
    slug_match = re.search(r'slug: (.*)', content_without_yaml)
    if slug_match:
      slug = self.generate_slug(slug_match.group(1).strip())
    else:
      slug = self.generate_slug(title)

    new_yaml = (
      f"---\n"
      f"title: {title}\n"
      f"description: {description}\n"
      f"author: {author}\n"
      f"release: {release_date}\n"
      f"date: {date}\n"
      f"image: {image}\n"
      f"categories: {categories}\n"
      f"tags: {tags}\n"
      f"keywords: {keywords}\n"
      f"draft: {draft}\n"
      f"slug: {slug}\n"
      f"---"
    )

    return f"{new_yaml}\n\n{content_without_yaml}"

  def standardize_date_format(self, date_string):
    # Convert date from YYYY/MM/DD to YYYY-MM-DD
    return date_string.replace('/', '-')

  def format_image_date(self, date_string):
    # Convert date from YYYY-MM-DD to YYYYMMDD
    return date_string.replace('-', '')

  def generate_slug(self, title):
    # Convert title to lowercase and replace spaces with hyphens
    slug = title.lower().replace(' ', '-')
    # Remove any characters that are not alphanumeric or hyphens
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    # Remove any consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    return slug

  # 如果需要，可以添加其他特定於金融工具的方法
