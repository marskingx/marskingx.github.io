import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from datetime import datetime
import asyncio
from playwright.async_api import async_playwright

# 設置日誌文件
logging.basicConfig(filename='search_book_errors.log', level=logging.ERROR)


def initialize_driver():
  """初始化 Selenium WebDriver"""
  options = webdriver.ChromeOptions()
  driver = webdriver.Chrome(options=options)
  print("初始化 WebDriver 完成")
  return driver


def close_ads(driver):
  """關閉廣告橫幅"""
  try:
    close_ad_button = WebDriverWait(driver, 10).until(
      EC.element_to_be_clickable((By.ID, "close_top_banner"))
    )
    close_ad_button.click()
    print("廣告橫幅已關閉")
  except TimeoutException:
    print("未找到廣告橫幅或廣告橫幅已經關閉")


def search_book(driver, keyword, site):
  """在指定網站上搜尋書籍並返回搜尋結果的 URL"""
  try:
    if site == "books":
      print("打開博客來網站")
      driver.get("https://www.books.com.tw/")
      close_ads(driver)
      search_for_books(driver, keyword)
      results = get_search_results(driver, site, ".mod2 .table-td")

      if not results:
        print("未找到任何結果")
        return None, None

      filtered_results = []
      for index, result in enumerate(results):
        if process_result(result, index, site):
          filtered_results.append(result)

      if not filtered_results:
        print("未找到有效的搜尋結果")
        return None, None

      if len(filtered_results) == 1:
        choice = 0
        print("自動選擇唯一結果")
      else:
        while True:
          try:
            choice = int(input("請輸入您要選擇的商品編號: ")) - 1
            if 0 <= choice < len(filtered_results):
              break
            else:
              print("無效的編號，請重新輸入")
          except ValueError:
            print("請輸入數字編號")

      selected_result = filtered_results[choice]
      selected_title, product_url = get_selected_result_url(selected_result, site)

      print(f"選擇的商品名稱: {selected_title}")
      print(f"生成的商品 URL: {product_url}")
      return selected_title, product_url

  except (TimeoutException, NoSuchElementException, WebDriverException) as e:
    error_message = f"Error searching book on {site}: {e}"
    print(error_message)
    logging.error(error_message)
    return None, None


def search_for_books(driver, keyword):
  """搜尋博客來網站的書籍"""
  try:
    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "key")))
    search_input = driver.find_element(By.ID, "key")
    print(f"輸入關鍵字: {keyword}")
    search_input.send_keys(keyword)
    search_button = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CLASS_NAME, "search_btn")))
    driver.execute_script("arguments[0].click();", search_button)
  except TimeoutException as e:
    error_message = f"Timeout while searching for books: {e}"
    print(error_message)
    logging.error(error_message)


def get_search_results(driver, site, selector):
  """獲取搜尋結果"""
  try:
    WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
    results = driver.find_elements(By.CSS_SELECTOR, selector)[:6]
    print(f"找到 {len(results)} 個結果")
    return results
  except TimeoutException as e:
    error_message = f"Timeout while getting search results on {site}: {e}"
    print(error_message)
    logging.error(error_message)
    return []
  except NoSuchElementException as e:
    error_message = f"Error finding search results on {site}: {e}"
    print(error_message)
    logging.error(error_message)
    return []


def process_result(result, index, site):
  """處理搜尋結果，顯示資訊供使用者選擇"""
  try:
    outer_html = result.get_attribute('outerHTML')
    if any(skip_word in outer_html for skip_word in ["試閱", "putAjaxCart", "putAjaxNextBuy"]):
      return False

    if site == "books":
      title_element = result.find_element(By.CSS_SELECTOR, "h4 a")
      title = title_element.text if title_element else "No title"
      item_id = result.get_attribute("id").split('-')[-1]
      if "No title" in title or not item_id:
        return False

    print(f"{index + 1}: {title}")
    return True

  except (NoSuchElementException, TimeoutException) as e:
    error_message = f"Error finding element in result {index + 1}: {e}"
    print(error_message)
    logging.error(error_message)
    return False


def get_selected_result_url(selected_result, site):
  """獲取選擇的結果 URL"""
  title, product_url = None, None  # 初始化變數

  try:
    if site == "books":
      selected_title_element = selected_result.find_element(By.CSS_SELECTOR, "h4 a")
      title = selected_title_element.text if selected_title_element else "No title"
      item_id = selected_result.get_attribute("id").split('-')[-1]
      base_url = f"https://www.books.com.tw/exep/assp.php/shamangels/products/{item_id}"
      current_date = datetime.now().strftime('%Y%m')
      additional_params = f"utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-{current_date}"
      product_url = convert_url(base_url, additional_params)

    return title, product_url
  except (NoSuchElementException, TimeoutException) as e:
    error_message = f"Error getting selected result URL: {e}"
    print(error_message)
    logging.error(error_message)
    return None, None


def convert_url(base_url, additional_params):
  """將附加參數添加到基本 URL"""
  if "?" in base_url:
    return f"{base_url}&{additional_params}"
  else:
    return f"{base_url}?{additional_params}"


async def search_momo_books(keyword):
  """在 MOMO 購物網站上搜尋書籍並返回搜尋結果的 URL"""
  async with async_playwright() as p:
    browser = await p.chromium.launch(headless=False)
    page = await browser.new_page()
    await page.goto('https://www.momoshop.com.tw/main/Main.jsp')

    await page.fill('#keyword', keyword)
    await page.click('.inputbtn')

    # 增加等待時間，確保網頁加載完成
    await page.wait_for_selector('li', timeout=60000)

    results = await page.query_selector_all('li')

    if not results:
      print("未找到任何結果")
      await browser.close()
      return None, None

    filtered_results = []
    for index, result in enumerate(results[:6]):
      title_element = await result.query_selector('p.prdName')
      link_element = await result.query_selector('a.goodsUrl')

      if title_element and link_element:
        title = await title_element.inner_text()
        link = await link_element.get_attribute('href')
        link = f"https://www.momoshop.com.tw{link}"
        print(f"{index + 1}: {title}")
        filtered_results.append((title, link))

    if not filtered_results:
      print("未找到有效的搜尋結果")
      await browser.close()
      return None, None

    if len(filtered_results) == 1:
      choice = 0
      print("自動選擇唯一結果")
    else:
      while True:
        try:
          choice = int(input("請輸入您要選擇的商品編號: ")) - 1
          if 0 <= choice < len(filtered_results):
            break
          else:
            print("無效的編號，請重新輸入")
        except ValueError:
          print("請輸入數字編號")

    selected_title, product_url = filtered_results[choice]
    print(f"選擇的商品名稱: {selected_title}")
    print(f"生成的商品 URL: {product_url}")

    await browser.close()
    return selected_title, product_url


def get_books_promotion_link(keyword):
  driver = initialize_driver()
  title, url = search_book(driver, keyword, "books")
  driver.quit()
  return title, url


def get_momo_promotion_link(keyword):
  return asyncio.run(search_momo_books(keyword))


# 示例用法
if __name__ == "__main__":
  books_title, books_url = get_books_promotion_link("平衡心態")
  momo_title, momo_url = get_momo_promotion_link("平衡心態")
  print(f"Books: {books_title}, URL: {books_url}")
  print(f"Momo: {momo_title}, URL: {momo_url}")
