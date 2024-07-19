import logging
import sys
import re
from datetime import datetime
from search_books_url import get_books_promotion_link
from search_momobooks_url import get_momo_promotion_link

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


def read_file(file_path):
  with open(file_path, 'r', encoding='utf-8') as file:
    return file.read()


def write_file(file_path, content):
  with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)


def standardize_date_format(date_str):
  try:
    return datetime.strptime(date_str, "%Y/%m/%d").strftime("%Y-%m-%d")
  except ValueError:
    return date_str


def format_image_date(date_str):
  try:
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y%m%d")
  except ValueError:
    return date_str.replace("-", "")


def update_yaml(content):
  title_match = re.search(r'^# (.*)', content, re.MULTILINE)
  title = title_match.group(1).strip() if title_match else ""

  description_match = re.search(r'description: (.*)', content)
  description = description_match.group(1).strip() if description_match else ""

  author_match = re.search(r'authors: (.*)', content)
  author = author_match.group(1).strip() if author_match else "懶大"

  release_match = re.search(r'release: (.*)', content)
  release_date = release_match.group(1).strip() if release_match else ""

  date_match = re.search(r'date: (\d{4}/\d{2}/\d{2})', content)
  date = standardize_date_format(date_match.group(1).strip()) if date_match else ""

  image = f"/images/blog/{format_image_date(date)}.png"

  categories_match = re.search(r'categories: (.*)', content)
  categories = f"[{categories_match.group(1).strip()}]" if categories_match else ""

  tags_match = re.search(r'tags: (.*)', content)
  tags = f"[{tags_match.group(1).strip().replace(' ', '').replace(',', ',')}]" if tags_match else ""

  keywords_match = re.search(r'keywords: (.*)', content)
  keywords = keywords_match.group(1).strip() if keywords_match else ""

  draft = "false"

  slug_match = re.search(r'slug: (.*)', content)
  slug = slug_match.group(1).strip() if slug_match else ""
  slug = re.sub(r'[^\w\s-]', '', slug)
  slug = re.sub(r'\s+', '-', slug).lower()

  rate_match = re.search(r'rate: (.*)', content)
  rate = rate_match.group(1).strip() if rate_match else ""

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
    f"rate: {rate}\n"
    f"---"
  )

  content_without_yaml = re.sub(r'^---.*?---', '', content, flags=re.DOTALL).strip()

  return f"{new_yaml}\n\n{content_without_yaml}"


def extract_book_title(content):
  match = re.search(r'《([^》]+)》', content)
  if match:
    title = match.group(1)
    logging.info(f"成功提取書名: {title}")
    return title
  logging.warning("無法從內容中提取書名")
  return None

def process_book_review(file_path, reading_list_path):
  try:
    logging.info(f"開始處理書評: {file_path}")
    content = read_file(file_path)
    logging.info("成功讀取文件內容")

    content = update_yaml(content)
    logging.info("成功更新 YAML 內容")

    write_file(file_path, content)
    logging.info("成功寫入更新後的內容到文件")

    book_title = extract_book_title(content)
    if book_title:
      logging.info(f"提取到書名: {book_title}")

      try:
        logging.info("開始獲取博客來推廣鏈接")
        books_title, books_url = get_books_promotion_link(book_title)
        logging.info(f"博客來: 標題 = {books_title}, URL = {books_url}")
      except Exception as e:
        logging.error(f"獲取博客來推廣鏈接時發生錯誤: {e}")
        books_title, books_url = None, None

      try:
        logging.info("開始獲取 MOMO 推廣鏈接")
        momo_title, momo_url = get_momo_promotion_link(book_title)
        logging.info(f"MOMO: 標題 = {momo_title}, URL = {momo_url}")
      except Exception as e:
        logging.error(f"獲取 MOMO 推廣鏈接時發生錯誤: {e}")
        momo_title, momo_url = None, None

      if books_url or momo_url:
        promotion_links = f"Books: {books_url}, Momo: {momo_url}"
        logging.info(f"獲取到的推廣鏈接: {promotion_links}")
        return promotion_links
      else:
        logging.warning("未能獲取任何推廣鏈接")
    else:
      logging.warning("未能提取到書名")
  except Exception as e:
    logging.error(f"處理書評時發生錯誤: {e}")
  return None


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python books_review_reindex.py <file_path> <reading_list_path>")
        logging.error("參數數量不正確")
        sys.exit(1)

    file_path = sys.argv[1]
    reading_list_path = sys.argv[2]
    logging.debug(f"接收到的參數 - file_path: {file_path}, reading_list_path: {reading_list_path}")

    promotion_links = process_book_review(file_path, reading_list_path)
    if promotion_links:
        print(f"取得聯盟行銷連結: {promotion_links}")
        logging.debug(f"成功獲取推廣鏈接: {promotion_links}")
    else:
        print("無法取得聯盟行銷連結。")
        logging.debug("未能獲取推廣鏈接")
