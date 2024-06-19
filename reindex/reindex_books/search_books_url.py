from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


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
            print("等待搜尋欄位出現...")
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "key")))
            search_input = driver.find_element(By.ID, "key")
            print(f"找到搜尋欄位，輸入關鍵字: {keyword}")
            search_input.send_keys(keyword)
            search_button = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CLASS_NAME, "search_btn")))
            print("點擊搜尋按鈕")
            driver.execute_script("arguments[0].click();", search_button)
            print("等待搜尋結果出現...")
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".mod2 .table-td")))
            results = driver.find_elements(By.CSS_SELECTOR, ".mod2 .table-td")[:6]
            print(f"找到 {len(results)} 個搜尋結果")
        elif site == "momo":
            print("打開 MOMO 購物網站")
            driver.get("https://www.momoshop.com.tw/main/Main.jsp")
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "search-area")))
            search_input = driver.find_element(By.ID, "keyword")
            print(f"找到搜尋欄位，輸入關鍵字: {keyword}")
            search_input.send_keys(keyword)
            search_button = driver.find_element(By.CLASS_NAME, "inputbtn")
            print("點擊搜尋按鈕")
            search_button.click()
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.goodsUrl")))
            results = driver.find_elements(By.CSS_SELECTOR, "a.goodsUrl")
            print(f"找到 {len(results)} 個搜尋結果")
        else:
            print("未知的網站")
            return None

        for index, result in enumerate(results):
            if site == "books":
                title = result.find_element(By.CSS_SELECTOR, "h4 a").get_attribute("title")
                item_id = result.get_attribute("id").split('-')[-1]
                print(f"{index + 1}: {title} (ID: {item_id})")
            elif site == "momo":
                title = result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']").text
                print(f"{index + 1}: {title}")

        choice = 0  # 假設選擇第一個結果
        selected_result = results[choice]

        if site == "books":
            selected_title = selected_result.find_element(By.CSS_SELECTOR, "h4 a").get_attribute("title")
            item_id = selected_result.get_attribute("id").split('-')[-1]
            base_url = f"https://www.books.com.tw/exep/assp.php/shamangels/products/{item_id}"
            additional_params = "utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-202406"
            product_url = convert_url(base_url, additional_params)
        elif site == "momo":
            selected_title = selected_result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']").text
            base_url = selected_result.get_attribute('href')
            additional_params = "memid=6000021729&cid=apuad&oid=1&osm=league"
            product_url = convert_url(base_url, additional_params)

        print(f"選擇的商品名稱: {selected_title}")
        print(f"最終生成的商品 URL: {product_url}")
        return selected_title, product_url
    except Exception as e:
        print(f"Error searching book on {site}: {e}")
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
