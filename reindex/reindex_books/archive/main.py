import reindex_books
from reindex.reindex_books.archive import books_url
import momo_url
import reindex_reading_list
from selenium import webdriver


def main():
    # 提取書名並獲取最新的 Markdown 文件
    book_titles, latest_md_file = reindex_books.main()

    if not book_titles:
        print("No book titles found.")
        return

    if not latest_md_file:
        print("No markdown files found.")
        return

    # 啟動 WebDriver
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    links = []

    for book_title in book_titles:
        # 在 books.com.tw 上搜尋書籍
        books_url.search_book_on_books(driver, book_title)
        books_product_url = books_url.select_and_recommend_product(driver)
        if books_product_url:
            links.append((books_product_url, 'books'))

    # 在 momo.com.tw 上搜尋書籍
    for book_title in book_titles:
        momo_product_url = momo_url.search_book_on_momo(driver, book_title)
        if momo_product_url:
            converted_url = momo_url.convert_momo_url(momo_product_url)
            if converted_url:
                links.append((converted_url, 'momo'))

    driver.quit()

    # 將所有連結寫入最新的 Markdown 文件
    reindex_books.process_md_file(latest_md_file, links)

    # 更新閱讀列表
    reading_list_file = r'G:\marskingx.github.io\content\page\reading_list\index.md'
    content = reindex_books.read_file(latest_md_file)
    title, description, date, slug = reindex_books.extract_book_info(content)

    if title and description and date and slug:
        reindex_reading_list.update_reading_list(reading_list_file, title, description, date, slug)
        print(f"Updated reading list with book: {title}")
    else:
        print("Failed to extract book information.")


if __name__ == "__main__":
    main()
