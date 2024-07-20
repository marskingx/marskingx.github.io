import re
import logging
from datetime import datetime
from base_processor import BaseProcessor
from search_books_url import get_books_promotion_link
from search_momobooks_url import get_momo_promotion_link

class BooksReviewProcessor(BaseProcessor):
    def __init__(self, file_path, reading_list_path):
        super().__init__(file_path)
        self.reading_list_path = reading_list_path

    def process(self):
        try:
            logging.info(f"開始處理書評: {self.file_path}")

            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.content = file.read()

            self.content = self.fix_yaml(self.content)
            logging.debug("成功更新 YAML 內容")

            self.write_file(self.content)
            logging.debug("成功寫入更新後的內容到文件")

            book_title = self.extract_book_title()
            if book_title:
                logging.info(f"提取到書名: {book_title}")
                promotion_links = self.get_promotion_links(book_title)
                if promotion_links:
                    logging.info(f"獲取到的推廣鏈接: {promotion_links}")
                    return promotion_links
                else:
                    logging.warning("未能獲取任何推廣鏈接")
            else:
                logging.warning("未能提取到書名")
        except Exception as e:
            logging.error(f"處理書評時發生錯誤: {e}", exc_info=True)
        return None

    def fix_yaml(self, content):
        title_match = re.search(r'^# (.*)', content, re.MULTILINE)
        title = title_match.group(1).strip() if title_match else "未命名"

        description_match = re.search(r'description: (.*)', content)
        description = description_match.group(1).strip() if description_match else "這是一個預設的描述。"

        author_match = re.search(r'authors: (.*)', content)
        author = author_match.group(1).strip() if author_match else "懶大"

        release_match = re.search(r'release: (.*)', content, re.IGNORECASE)
        release_date = release_match.group(1).strip() if release_match else datetime.now().strftime("%Y-%m-%d")

        date_match = re.search(r'date: (\d{4}/\d{2}/\d{2})', content)
        date = self.standardize_date_format(date_match.group(1).strip()) if date_match else datetime.now().strftime("%Y-%m-%d")

        image = f"/images/blog/{self.format_image_date(date)}.png"

        categories_match = re.search(r'categories: (.*)', content)
        categories = f"[{categories_match.group(1).strip()}]" if categories_match else "[讀書心得]"

        tags_match = re.search(r'tags: (.*)', content)
        tags = f"[{tags_match.group(1).strip().replace(' ', '').replace(',', ',')}]" if tags_match else "[]"

        keywords_match = re.search(r'keywords: (.*)', content)
        keywords = keywords_match.group(1).strip() if keywords_match else ""

        draft = "false"

        slug_match = re.search(r'slug: (.*)', content)
        slug = slug_match.group(1).strip() if slug_match else self.generate_slug(title)

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

        content_without_yaml = re.sub(r'^---.*?---', '', content, flags=re.DOTALL).strip()

        return f"{new_yaml}\n\n{content_without_yaml}"

    def extract_book_title(self):
        match = re.search(r'《([^》]+)》', self.content)
        if match:
            title = match.group(1)
            logging.info(f"成功提取書名: {title}")
            return title
        logging.warning("無法從內容中提取書名")
        return None

    def get_promotion_links(self, book_title):
        books_url = momo_url = None

        try:
            logging.info("開始獲取博客來推廣鏈接")
            books_title, books_url = get_books_promotion_link(book_title)
            logging.info(f"博客來: 標題 = {books_title}, URL = {books_url}")
        except Exception as e:
            logging.error(f"獲取博客來推廣鏈接時發生錯誤: {e}", exc_info=True)

        try:
            logging.info("開始獲取 MOMO 推廣鏈接")
            momo_title, momo_url = get_momo_promotion_link(book_title)
            logging.info(f"MOMO: 標題 = {momo_title}, URL = {momo_url}")
        except Exception as e:
            logging.error(f"獲取 MOMO 推廣鏈接時發生錯誤: {e}", exc_info=True)

        if books_url or momo_url:
            return f"Books: {books_url}, Momo: {momo_url}"
        return None

    def generate_slug(self, title):
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug).strip('-')
        return slug

    def standardize_date_format(self, date_str):
        return datetime.strptime(date_str, "%Y/%m/%d").strftime("%Y-%m-%d")

    def format_image_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y%m%d")

# 示例用法
if __name__ == "__main__":
    processor = BooksReviewProcessor("test_file.md", "reading_list.yaml")
    processor.process()
