import logging
from datetime import datetime
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# 設置日誌
log_filename = f'search_momo_book_errors_{datetime.now().strftime("%Y%m%d")}.log'
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


def search_momo_books(driver, keyword):
  try:
    logging.debug(f"開始搜索關鍵字: {keyword}")
    url = f"https://www.momoshop.com.tw/search/searchShop.jsp?keyword={keyword}&searchType=1&curPage=1&showType=chessboardType"
    driver.get(url)

    # 等待搜索結果加載
    WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, "li[gcode]")))

    # 獲取所有商品項目
    products = driver.find_elements(By.CSS_SELECTOR, "li[gcode]")

    if not products:
      logging.warning("未找到任何書籍")
      return None, None

    # 獲取第一個商品的信息
    first_product = products[0]
    gcode = first_product.get_attribute('gcode')
    title_element = first_product.find_element(By.CSS_SELECTOR, ".prdName")
    title = title_element.text.strip()

    # 構建商品URL
    product_url = f"https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code={gcode}"

    logging.debug(f"找到書籍: {title}")
    logging.debug(f"商品URL: {product_url}")
    return title, product_url
  except Exception as e:
    logging.error(f"搜索 MOMO 書籍時發生錯誤: {e}")
    return None, None


def get_momo_promotion_link(keyword):
  driver = initialize_driver()
  try:
    return search_momo_books(driver, keyword)
  except Exception as e:
    logging.error(f"獲取書籍促銷連結時發生錯誤: {e}")
    return None, None
  finally:
    driver.quit()


# 示例用法
if __name__ == "__main__":
  keyword = "平衡心態"
  logging.info(f"開始搜索關鍵字: {keyword}")
  momo_title, momo_url = get_momo_promotion_link(keyword)
  if momo_title and momo_url:
    logging.info(f"Momo: {momo_title}, URL: {momo_url}")
    print(f"找到商品: {momo_title}")
    print(f"URL: {momo_url}")
  else:
    logging.warning("未能找到書籍資訊")
    print("未找到符合的商品")
