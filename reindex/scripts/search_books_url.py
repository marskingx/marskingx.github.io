import logging
from datetime import datetime
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# 配置日誌
log_filename = f'search_book_errors_{datetime.now().strftime("%Y%m%d")}.log'
logging.basicConfig(
    filename=log_filename,
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    encoding='utf-8'
)

def initialize_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(30)
    logging.debug("初始化 WebDriver 完成")
    return driver

def close_ads(driver):
    try:
        close_ad_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "close_top_banner"))
        )
        close_ad_button.click()
        logging.debug("廣告橫幅已關閉")
    except TimeoutException:
        logging.debug("未找到廣告橫幅或廣告橫幅已經關閉")

def search_for_books(driver, keyword):
    try:
        search_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "key"))
        )
        search_input.clear()
        search_input.send_keys(keyword)

        search_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "search_btn"))
        )
        search_button.click()

        # 等待搜索結果加載
        time.sleep(5)

        # 等待搜索結果出現
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".table-td"))
        )

        # 獲取所有搜索結果
        book_items = driver.find_elements(By.CSS_SELECTOR, ".table-td")

        if not book_items:
            logging.warning("未找到任何書籍")
            return []

        # 动态生成当前日期的 yyyymm
        current_date = datetime.now().strftime("%Y%m")

        books = []
        for i, book in enumerate(book_items[:5], 1):  # 只處理前5個結果
            try:
                # 獲取商品代碼
                product_id = book.get_attribute('id').split('-')[-1]

                title_element = book.find_element(By.CSS_SELECTOR, "h4 a")
                title = title_element.text

                price_element = book.find_element(By.CSS_SELECTOR, "ul.price li b:last-child")
                price = price_element.text

                # 構建完整的 URL
                url = f"https://www.books.com.tw/products/{product_id}?utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-{current_date}"

                books.append({"index": i, "title": title, "url": url, "price": price, "product_id": product_id})
                logging.debug(f"找到書籍 {i}: {title}, 價格: {price}, 商品代碼: {product_id}")
            except Exception as e:
                logging.error(f"處理第 {i} 本書時發生錯誤: {e}")

        return books
    except Exception as e:
        logging.error(f"搜索書籍時發生錯誤: {e}")
        return []

def get_books_promotion_link(keyword):
    driver = initialize_driver()
    try:
        driver.get("https://www.books.com.tw/")
        close_ads(driver)
        books = search_for_books(driver, keyword)
        return books
    except Exception as e:
        logging.error(f"獲取書籍促銷連結時發生錯誤: {e}")
        return []
    finally:
        logging.debug("正在關閉瀏覽器")
        driver.quit()
        logging.debug("瀏覽器已關閉")

def display_books(books):
    for book in books:
        print(f"{book['index']}. {book['title']} - 價格: {book['price']}")
    print(f"{len(books) + 1}. 略過")

def get_user_choice(books):
    while True:
        try:
            choice = int(input("請選擇一本書 (輸入編號): "))
            if 1 <= choice <= len(books):
                return books[choice - 1]
            elif choice == len(books) + 1:
                return None
            else:
                print("無效的選擇，請重新輸入。")
        except ValueError:
            print("請輸入有效的數字。")

# 示例用法
if __name__ == "__main__":
    keyword = "給孩子的商業啟蒙"
    logging.info(f"開始搜索關鍵字: {keyword}")
    books = get_books_promotion_link(keyword)
    if books:
        print(f"找到 {len(books)} 本相關書籍:")
        display_books(books)
        selected_book = get_user_choice(books)
        if selected_book:
            logging.info(
                f"選擇的書籍: {selected_book['title']}, URL: {selected_book['url']}, 價格: {selected_book['price']}, 商品代碼: {selected_book['product_id']}")
            print(f"您選擇的書籍是: {selected_book['title']}")
            print(f"URL: {selected_book['url']}")
            print(f"價格: {selected_book['price']}")
            print(f"商品代碼: {selected_book['product_id']}")
        else:
            print("已略過選擇。")
            logging.info("用戶選擇略過書籍選擇。")
    else:
        logging.warning("未能找到書籍資訊")
        print("抱歉，未找到相關書籍。")
    logging.info("搜索完成")
