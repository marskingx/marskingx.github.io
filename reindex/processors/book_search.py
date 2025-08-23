# book_search.py

import logging
from datetime import datetime
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# 配置日誌
log_filename = f'book_search_errors_{datetime.now().strftime("%Y%m%d")}.log'
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

def search_books_com_tw(driver, keyword):
    try:
        driver.get("https://www.books.com.tw/")
        close_ads(driver)
        search_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "key"))
        )
        search_input.clear()
        search_input.send_keys(keyword)
        search_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "search_btn"))
        )
        search_button.click()
        time.sleep(5)
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".table-td"))
        )
        book_items = driver.find_elements(By.CSS_SELECTOR, ".table-td")
        if not book_items:
            logging.warning("未找到任何書籍")
            return []
        current_date = datetime.now().strftime("%Y%m")
        books = []
        for i, book in enumerate(book_items[:2], 1):
            try:
                product_id = book.get_attribute('id').split('-')[-1]
                title_element = book.find_element(By.CSS_SELECTOR, "h4 a")
                title = title_element.text
                price_element = book.find_element(By.CSS_SELECTOR, "ul.price li b:last-child")
                price = price_element.text
                url = f"https://www.books.com.tw/products/{product_id}?utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-{current_date}"
                books.append({"index": i, "title": title, "url": url, "price": price, "product_id": product_id})
                logging.debug(f"找到書籍 {i}: {title}, 價格: {price}, 商品代碼: {product_id}")
            except Exception as e:
                logging.error(f"處理第 {i} 本書時發生錯誤: {e}")
        return books
    except Exception as e:
        logging.error(f"搜索書籍時發生錯誤: {e}")
        return []

def search_momo_books(driver, keyword):
    try:
        logging.debug(f"開始搜索關鍵字: {keyword}")
        url = f"https://www.momoshop.com.tw/search/searchShop.jsp?keyword={keyword}&searchType=1&curPage=1&showType=chessboardType"
        driver.get(url)
        WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[gcode]")))
        products = driver.find_elements(By.CSS_SELECTOR, "li[gcode]")
        if not products:
            logging.warning("未找到任何書籍")
            return []
        books = []
        for i, product in enumerate(products[:2], 1):
            try:
                gcode = product.get_attribute('gcode')
                title_element = product.find_element(By.CSS_SELECTOR, ".prdName")
                title = title_element.text.strip()
                product_url = f"https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code={gcode}&memid=6000021729&cid=apuad&oid=1&osm=league"
                books.append({"index": i, "title": title, "url": product_url})
                logging.debug(f"找到書籍 {i}: {title}")
            except Exception as e:
                logging.error(f"處理第 {i} 本書時發生錯誤: {e}")
        return books
    except Exception as e:
        logging.error(f"搜索 MOMO 書籍時發生錯誤: {e}")
        return []

def get_books_promotion_link(keyword):
    driver = initialize_driver()
    try:
        books = search_books_com_tw(driver, keyword)
        if books:
            first_book = books[0]
            return first_book['title'], first_book['url']
        return None, None
    except Exception as e:
        logging.error(f"獲取博客來書籍促銷連結時發生錯誤: {e}")
        return None, None
    finally:
        driver.quit()

def get_momo_promotion_link(keyword):
    driver = initialize_driver()
    try:
        books = search_momo_books(driver, keyword)
        if books:
            first_book = books[0]
            return first_book['title'], first_book['url']
        return None, None
    except Exception as e:
        logging.error(f"獲取 MOMO 書籍促銷連結時發生錯誤: {e}")
        return None, None
    finally:
        logging.debug("正在關閉瀏覽器")
        driver.quit()
        logging.debug("瀏覽器已關閉")
