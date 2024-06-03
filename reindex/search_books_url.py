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

        for index, result in enumerate(results):
            process_result(result, index, site)

        choice = 0  # 假設選擇第一個結果
        selected_result = results[choice]
        selected_title, product_url = get_selected_result_url(selected_result, site)

        print(f"選擇的商品名稱: {selected_title}")
        print(f"最終生成的商品 URL: {product_url}")
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
        print(f"找到搜尋欄位，輸入關鍵字: {keyword}")
        search_input.send_keys(keyword)
        search_button = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CLASS_NAME, "search_btn")))
        print("點擊搜尋按鈕")
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
        print(f"找到搜尋欄位，輸入關鍵字: {keyword}")
        search_input.send_keys(keyword)
        search_button = driver.find_element(By.CLASS_NAME, "inputbtn")
        print("點擊搜尋按鈕")
        search_button.click()
    except TimeoutException as e:
        error_message = f"Timeout while searching for momo: {e}"
        print(error_message)
        logging.error(error_message)


def get_search_results(driver, site, selector):
    """獲取搜尋結果"""
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
        results = driver.find_elements(By.CSS_SELECTOR, selector)[:6]
        print(f"找到 {len(results)} 個搜尋結果")
        return results
    except TimeoutException as e:
        error_message = f"Timeout while getting search results on {site}: {e}"
        print(error_message)
        logging.error(error_message)
        return []


def process_result(result, index, site):
    """處理搜尋結果"""
    try:
        if site == "books":
            WebDriverWait(result, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h4 a")))
            title_element = result.find_element(By.CSS_SELECTOR, "h4 a")
            if title_element:
                title = title_element.text
                item_id = result.get_attribute("id").split('-')[-1]
                print(f"{index + 1}: {title} (ID: {item_id})")
            else:
                log_missing_element(result, index, "h4 a")
        elif site == "momo":
            WebDriverWait(result, 10).until(
                EC.presence_of_element_located((By.XPATH, "./ancestor::li//h3[@class='prdName']")))
            title_element = result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']")
            if title_element:
                title = title_element.text
                print(f"{index + 1}: {title}")
            else:
                log_missing_element(result, index, "prdName")
    except (NoSuchElementException, TimeoutException) as e:
        error_message = f"Error finding element in result {index + 1}: {e}\nHTML Content: {result.get_attribute('outerHTML')}"
        print(error_message)
        logging.error(error_message)


def log_missing_element(result, index, element_name):
    """記錄缺失的元素"""
    print(f"No {element_name} element found in result {index + 1}")
    logging.error(f"No {element_name} element found in result {index + 1}\nHTML Content: {result.get_attribute('outerHTML')}")


def get_selected_result_url(selected_result, site):
    """獲取選擇的結果 URL"""
    try:
        if site == "books":
            WebDriverWait(selected_result, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h4 a")))
            selected_title_element = selected_result.find_element(By.CSS_SELECTOR, "h4 a")
            if selected_title_element:
                selected_title = selected_title_element.text
                item_id = selected_result.get_attribute("id").split('-')[-1]
                base_url = f"https://www.books.com.tw/exep/assp.php/shamangels/products/{item_id}"
                current_date = datetime.now().strftime('%Y%m')
                additional_params = f"utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-{current_date}"
                product_url = convert_url(base_url, additional_params)
            else:
                log_missing_element(selected_result, "selected", "h4 a")
                return None, None
        elif site == "momo":
            WebDriverWait(selected_result, 10).until(
                EC.presence_of_element_located((By.XPATH, "./ancestor::li//h3[@class='prdName']")))
            selected_title_element = selected_result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']")
            if selected_title_element:
                selected_title = selected_title_element.text
                base_url = selected_result.get_attribute('href')
                additional_params = "memid=6000021729&cid=apuad&oid=1&osm=league"
                product_url = convert_url(base_url, additional_params)
            else:
                log_missing_element(selected_result, "selected", "prdName")
                return None, None
        return selected_title, product_url
    except (NoSuchElementException, TimeoutException) as e:
        error_message = f"Error getting selected result URL: {e}\nHTML Content: {selected_result.get_attribute('outerHTML')}"
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
if __name__ == "__main__":
    books_title, books_url = get_books_promotion_link("普通人的財富自由之道")
    momo_title, momo_url = get_momo_promotion_link("普通人的財富自由之道")
    print(f"Books Title: {books_title}, Books URL: {books_url}")
    print(f"Momo Title: {momo_title}, Momo URL: {momo_url}")
