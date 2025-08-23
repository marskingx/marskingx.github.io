import re
import logging
from datetime import datetime
from .base_processor import BaseProcessor
from .book_search import get_books_promotion_link, get_momo_promotion_link
from .reading_list_processor import update_reading_list

class BooksReviewProcessor(BaseProcessor):
    """專門處理書評文章，自動更新 YAML、獲取推廣連結並更新閱讀列表。"""

    def __init__(self, file_path, config):
        """初始化書評處理器。"""
        super().__init__(file_path, config)
        self.reading_list_path = self.config.get('file_paths', {}).get('reading_list')

    def _generate_slug(self, title):
        """根據標題產生一個對 SEO 友好的 slug。"""
        # 移除特殊標記並轉為小寫
        slug = re.sub(r'[【】《》]', ' ', title).lower()
        # 移除非字母數字字元，並用連字號替換空格
        slug = re.sub(r'[^\w\s-]', '', slug).strip()
        slug = re.sub(r'[\s]+', '-', slug)
        return slug

    def _update_front_matter(self):
        """更新 YAML 前言區塊的內容。"""
        # 確保 title 存在
        if 'title' not in self.front_matter:
            logging.warning(f"文件 {self.file_path} 的 YAML 中缺少 'title'，無法處理。")
            return False

        title = self.front_matter['title']

        # 設定預設值
        defaults = self.config.get('default_values', {})
        self.front_matter.setdefault('author', defaults.get('author', '懶大'))
        self.front_matter.setdefault('draft', defaults.get('draft', False))

        # 標準化日期並產生圖片路徑
        if 'date' in self.front_matter:
            try:
                date_obj = datetime.strptime(str(self.front_matter['date']), "%Y-%m-%d")
                self.front_matter['image'] = f"/images/blog/{date_obj.strftime('%Y%m%d')}.png"
            except (ValueError, TypeError):
                logging.warning(f"無法解析日期: {self.front_matter['date']}，使用預設圖片路徑。")

        # 產生 slug
        if 'slug' not in self.front_matter or not self.front_matter['slug']:
            self.front_matter['slug'] = self._generate_slug(title)

        logging.info("YAML 前言更新完成。")
        return True

    def _extract_book_title(self):
        """從文章標題中提取書名。"""
        title = self.front_matter.get('title', '')
        match = re.search(r'《([^》]+)》', title)
        if match:
            book_title = match.group(1)
            logging.info(f"成功從標題提取書名: {book_title}")
            return book_title
        logging.warning(f"無法從標題 '{title}' 中提取書名。")
        return None

    def _get_promotion_links(self, book_title):
        """獲取書籍的博客來和 MOMO 推廣連結。"""
        books_url = get_books_promotion_link(book_title)[1]
        momo_url = get_momo_promotion_link(book_title)[1]
        return books_url, momo_url

    def _update_book_links_section(self, book_title, books_url, momo_url):
        """在主要內容中更新或新增購書連結區塊。"""
        if not books_url and not momo_url:
            logging.warning("沒有可用的推廣連結，跳過更新。")
            return

        # 產生新的連結區塊
        book_image_link = f'[![《{book_title}》](/images/blog/books.png)]({books_url})' if books_url else ''
        momo_image_link = f'[![《{book_title}》](/images/blog/momobooks.png)]({momo_url})' if momo_url else ''
        links_section = f"## 購書連結\n\n{book_image_link}\n\n{momo_image_link}"

        # 替換或附加到主要內容
        if "## 購書連結" in self.main_content:
            self.main_content = re.sub(r'## 購書連結.*', links_section, self.main_content, flags=re.DOTALL)
        else:
            self.main_content += f"\n\n{links_section}"
        logging.info("購書連結區塊已更新。")

    def process(self):
        """執行書評處理的完整流程。"""
        logging.info(f"開始處理書評文件: {self.file_path}")

        if not self._update_front_matter():
            return

        book_title = self._extract_book_title()
        if not book_title:
            return

        books_url, momo_url = self._get_promotion_links(book_title)
        self._update_book_links_section(book_title, books_url, momo_url)

        if self.reading_list_path:
            update_reading_list(
                reading_list_path=self.reading_list_path,
                book_title=book_title,
                books_url=books_url,
                momo_url=momo_url,
                rate=self.front_matter.get('rate', '⭐⭐⭐'),
                slug=self.front_matter.get('slug', ''),
                categories_links=""
            )

        # 將所有變更（前言和內容）寫回檔案
        self.write_file()
        logging.info(f"書評文件 {self.file_path} 處理完成。")
