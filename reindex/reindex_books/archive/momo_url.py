from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def initialize_driver():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    return driver

def search_book_on_momo(driver, keyword):
    try:
        # 前往 momo 搜尋頁面
        driver.get("https://www.momoshop.com.tw/main/Main.jsp")

        # 等待搜尋欄位出現並輸入書名
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "search-area")))
        search_input = driver.find_element(By.ID, "keyword")
        search_input.send_keys(keyword)

        # 點擊搜尋按鈕
        search_button = driver.find_element(By.CLASS_NAME, "inputbtn")
        search_button.click()

        # 等待搜尋結果
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.goodsUrl")))

        # 提供搜尋結果並選擇
        results = driver.find_elements(By.CSS_SELECTOR, "a.goodsUrl")
        for index, result in enumerate(results):
            title = result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']").text
            print(f"{index + 1}: {title}")

        choice = int(input("請輸入你要選擇的商品編號: ")) - 1
        selected_result = results[choice]

        product_url = selected_result.get_attribute('href')
        return product_url
    except Exception as e:
        print(f"Error in search_book_on_momo: {e}")
        return None

def convert_momo_url(original_url):
    if original_url is None:
        return None
    additional_params = "memid=6000021729&cid=apuad&oid=1&osm=league"
    if "?" in original_url:
        return f"{original_url}&{additional_params}"
    else:
        return f"{original_url}?{additional_params}"

if __name__ == "__main__":
    driver = initialize_driver()
    keyword = input("請輸入要搜尋的書名：")
    product_url = search_book_on_momo(driver, keyword)
    if product_url:
        converted_url = convert_momo_url(product_url)
        print(f"原始 URL: {product_url}")
        print(f"轉換後 URL: {converted_url}")
    driver.quit()
