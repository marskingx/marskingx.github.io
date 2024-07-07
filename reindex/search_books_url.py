import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from datetime import datetime

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
        # 嘗試找到並點擊廣告關閉按鈕
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
        elif site == "momo":
            print("打開 MOMO 購物網站")
            driver.get("https://www.momoshop.com.tw/main/Main.jsp")
            search_for_momo(driver, keyword)
            results = get_search_results(driver, site, "a.goodsUrl")
        else:
            print("未知的網站")
            return None, None

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

        if len(filtered_results) == 1:  # 只有一個結果時
            choice = 0  # 自動選擇第一個 (也是唯一一個) 結果
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


def search_for_momo(driver, keyword):
    """搜尋 MOMO 購物網站的書籍"""
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "search-area")))
        search_input = driver.find_element(By.ID, "keyword")
        print(f"輸入關鍵字: {keyword}")
        search_input.send_keys(keyword)
        search_button = driver.find_element(By.CLASS_NAME, "inputbtn")
        driver.execute_script("arguments[0].click();", search_button)
    except TimeoutException as e:
        error_message = f"Timeout while searching for momo: {e}"
        print(error_message)
        logging.error(error_message)


def get_search_results(driver, site, selector):
    """獲取搜尋結果"""
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        results = driver.find_elements(By.CSS_SELECTOR, selector)[:6]
        print(f"找到 {len(results)} 個結果")
        return results
    except TimeoutException as e:
        error_message = f"Timeout while getting search results on {site}: {e}"
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
        elif site == "momo":
            title_element = result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']")
            title = title_element.text if title_element else "No title"
            if "No title" in title:
                return False

        print(f"{index + 1}: {title}")  # 顯示編號與書名
        return True  # 所有結果都視為有效，讓使用者選擇

    except (NoSuchElementException, TimeoutException) as e:
        error_message = f"Error finding element in result {index + 1}: {e}"
        print(error_message)
        logging.error(error_message)
        return False


def get_selected_result_url(selected_result, site):
    """獲取選擇的結果 URL"""
    try:
        if site == "books":
            selected_title_element = selected_result.find_element(By.CSS_SELECTOR, "h4 a")
            selected_title = selected_title_element.text if selected_title_element else "No title"
            item_id = selected_result.get_attribute("id").split('-')[-1]
            base_url = f"https://www.books.com.tw/exep/assp.php/shamangels/products/{item_id}"
            current_date = datetime.now().strftime('%Y%m')
            additional_params = f"utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-{current_date}"
            product_url = convert_url(base_url, additional_params)
        elif site == "momo":
            selected_title_element = selected_result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']")
            selected_title = selected_title_element.text if selected_title_element else "No title"
            base_url = selected_result.get_attribute('href')
            additional_params = "memid=6000021729&cid=apuad&oid=1&osm=league"
            product_url = convert_url(base_url, additional_params)
        return selected_title, product_url
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


def get_books_promotion_link(keyword):
    driver = initialize_driver()
    title, url = search_book(driver, keyword, "books")
    driver.quit()
    return title, url


def get_momo_promotion_link(keyword):
    driver = initialize_driver()
    title, url = search_book(driver, keyword, "momo")
    driver.quit()
    return title, url


# 示例用法
# if __name__ == "__main__":
#     books_title, books_url = get_books_promotion_link("普通人的財富自由之道")
#     momo_title, momo_url = get_momo_promotion_link("普通人的財富自由之道")
#     print(f"Books: {books_title}, URL: {books_url}")
#     print(f"Momo: {momo_title}, URL: {momo_url}")
