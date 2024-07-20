import re
import logging
from datetime import datetime
from .base_processor import BaseProcessor
from scripts.search_books_url import get_books_promotion_link
from scripts.search_momobooks_url import get_momo_promotion_link
from .reading_list_processor import update_reading_list  # 确保导入该方法
import yaml

class BooksReviewProcessor(BaseProcessor):
    def __init__(self, file_path, reading_list_path):
        super().__init__(file_path)
        self.reading_list_path = reading_list_path

    def process(self):
        try:
            logging.info(f"開始處理書評: {self.file_path}")

            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.content = file.read()

            self.content = self.update_yaml()
            if self.content is None:
                logging.error("更新 YAML 失敗")
                return None
            logging.debug("成功更新 YAML 內容")

            self.write_file(self.content)
            logging.debug("成功寫入更新後的內容到文件")

            book_title = self.extract_book_title()
            if book_title:
                logging.info(f"提取到書名: {book_title}")
                books_title, books_url = get_books_promotion_link(book_title)
                momo_title, momo_url = get_momo_promotion_link(book_title)
                logging.info(f"Books: {books_title}, URL: {books_url}")
                logging.info(f"Momo: {momo_title}, URL: {momo_url}")

                if books_url or momo_url:
                    self.content = self.update_book_links(self.content, book_title, books_url, momo_url)
                    self.write_file(self.content)
                    rate_match = re.search(r'rate: (.*)', self.content)
                    rate = rate_match.group(1).strip() if rate_match else "⭐⭐⭐"
                    slug_match = re.search(r'slug: (.*)', self.content)
                    slug = slug_match.group(1).strip() if slug_match else book_title.replace(' ', '-').lower()
                    logging.info("更新閱讀列表")
                    update_reading_list(self.reading_list_path, book_title, books_url, momo_url, rate, slug)
                    logging.info("書評文件處理完成")
                    return f"Books: {books_url}, Momo: {momo_url}"

            logging.warning("無法取得聯盟行銷連結")
            return None
        except Exception as e:
            logging.error(f"處理書評文件時發生錯誤: {e}", exc_info=True)
            return None

    def standardize_date_format(self, date_str):
        return datetime.strptime(date_str, "%Y/%m/%d").strftime("%Y-%m-%d")

    def format_image_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y%m%d")

    def update_yaml(self):
        yaml_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
        yaml_match = yaml_pattern.search(self.content)
        content = yaml_match.group(1) if yaml_match else self.content

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
        categories = f"[{categories_match.group(1).strip()}]" if categories_match else "[閱讀心得]"

        tags_match = re.search(r'tags: (.*)', content)
        tags = f"[{tags_match.group(1).strip().replace(' ', '').replace(',', ',')}]" if tags_match else "[]"

        keywords_match = re.search(r'keywords: (.*)', content)
        keywords = keywords_match.group(1).strip() if keywords_match else ""

        draft_match = re.search(r'draft: (.*)', content)
        draft = draft_match.group(1).strip() if draft_match else "false"

        slug_match = re.search(r'slug: (.*)', content)
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

        content_without_yaml = re.sub(r'^---.*?---', '', self.content, flags=re.DOTALL).strip()

        return f"{new_yaml}\n\n{content_without_yaml}"

    def extract_title(self):
        filename = self.file_path.split('\\')[-1]
        title_match = re.search(r'《(.+?)》', filename)
        if title_match:
            return f"【書單】《{title_match.group(1)}》閱讀心得"
        return "未命名"

    def generate_slug(self, title):
        # 移除开头的【字符
        title = title.replace('【', '').replace('】', '-')
        # 转换为小写
        slug = title.lower()
        # 移除非字母和数字字符，但保留空格和连字符
        slug = re.sub(r'[^\w\s-]', '', slug)
        # 移除停止词
        stop_words = ['the', 'a', 'an', 'and', 'or', 'but']
        slug = ' '.join([word for word in slug.split() if word not in stop_words])
        # 用连字符替换空格和连续的连字符
        slug = re.sub(r'[\s]+', '-', slug).strip('-')
        return slug

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
            if books_title and books_url:
                logging.info(f"博客來: 標題 = {books_title}, URL = {books_url}")
            else:
                logging.warning("未能獲取博客來推廣鏈接")
        except Exception as e:
            logging.error(f"獲取博客來推廣鏈接時發生錯誤: {e}", exc_info=True)

        try:
            logging.info("開始獲取 MOMO 推廣鏈接")
            momo_title, momo_url = get_momo_promotion_link(book_title)
            if momo_title and momo_url:
                logging.info(f"MOMO: 標題 = {momo_title}, URL = {momo_url}")
            else:
                logging.warning("未能獲取 MOMO 推廣鏈接")
        except Exception as e:
            logging.error(f"獲取 MOMO 推廣鏈接時發生錯誤: {e}", exc_info=True)

        if books_url or momo_url:
            return f"Books: {books_url or '無'}, Momo: {momo_url or '無'}"
        return None

    def update_book_links(self, content, book_title, books_url, momo_url):
        logging.info("開始更新購書連結")
        book_image_link = f"[![《{book_title}》.png](/images/blog/books.png)\n]({books_url})"
        momo_image_link = f"[![《{book_title}》.png](/images/blog/momobooks.png)\n]({momo_url})"

        book_links_section = (
            f"## 購書連結\n\n"
            f"{book_image_link}\n\n"
            f"{momo_image_link}\n"
        )

        if "## 購書連結" in content:
            content = re.sub(r'## 購書連結.*', book_links_section, content, flags=re.DOTALL)
        else:
            content += f"\n\n{book_links_section}"

        logging.info("購書連結更新完成")
        return content

    def process_book_review(self):
        logging.info("開始處理書評文件")
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.content = file.read()

            self.content = self.update_yaml()
            self.write_file(self.content)

            book_title = self.extract_book_title()
            if book_title:
                logging.info(f"取得聯盟行銷連結，書名: {book_title}")
                books_title, books_url = get_books_promotion_link(book_title)
                momo_title, momo_url = get_momo_promotion_link(book_title)
                logging.info(f"Books: {books_title}, URL: {books_url}")
                logging.info(f"Momo: {momo_title}, URL: {momo_url}")

                if books_url or momo_url:
                    self.content = self.update_book_links(self.content, book_title, books_url, momo_url)
                    self.write_file(self.content)
                    rate_match = re.search(r'rate: (.*)', self.content)
                    rate = rate_match.group(1).strip() if rate_match else "⭐⭐⭐"
                    slug_match = re.search(r'slug: (.*)', self.content)
                    slug = slug_match.group(1).strip() if slug_match else book_title.replace(' ', '-').lower()
                    logging.info("更新閱讀列表")
                    update_reading_list(self.reading_list_path, book_title, books_url, momo_url, rate, slug)
                    logging.info("書評文件處理完成")
                    return f"Books: {books_url}, Momo: {momo_url}"

            logging.warning("無法取得聯盟行銷連結")
            return None
        except Exception as e:
            logging.error(f"處理書評文件時發生錯誤: {e}", exc_info=True)
            return None
