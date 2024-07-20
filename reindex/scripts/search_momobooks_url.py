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
  format='%(asctime)s - %(levellevelname)s - %(message)s',
  datefmt='%Y-%m-%d %H:%M:%S',
  encoding='utf-8'
)

def initialize_driver():
  options = webdriver.ChromeOptions()
  options.add_argument('--headless')
  options.add_argument('--disable-gpu')
  options.add.argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add.argument(
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
      return []

    # 处理搜索结果
    books = []
    for i, product in enumerate(products[:5], 1):  # 只處理前5個結果
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

def get_momo_promotion_link(keyword):
  driver = initialize_driver()
  try:
    return search_momo_books(driver, keyword)
  except Exception as e:
    logging.error(f"獲取書籍促銷連結時發生錯誤: {e}")
    return []
  finally:
    logging.debug("正在關閉瀏覽器")
    driver.quit()
    logging.debug("瀏覽器已關閉")

def display_books(books):
  for book in books:
    print(f"{book['index']}. {book['title']}")
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
  keyword = "平衡心態"
  logging.info(f"開始搜索關鍵字: {keyword}")
  books = get_momo_promotion_link(keyword)
  if books:
    print(f"找到 {len(books)} 本相關書籍:")
    display_books(books)
    selected_book = get_user_choice(books)
    if selected_book:
      logging.info(
        f"選擇的書籍: {selected_book['title']}, URL: {selected_book['url']}")
      print(f"您選擇的書籍是: {selected_book['title']}")
      print(f"URL: {selected_book['url']}")
    else:
      print("已略過選擇。")
      logging.info("用戶選擇略過書籍選擇。")
  else:
    logging.warning("未能找到書籍資訊")
    print("未找到符合的商品")
