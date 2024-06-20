from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def initialize_driver():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
    return driver


def search_book(driver, keyword, site):
    try:
        if site == "books":
            driver.get("https://www.books.com.tw/")
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "search_key")))
            search_input = driver.find_element(By.ID, "search_key")
            search_input.send_keys(keyword)
            search_button = driver.find_element(By.CLASS_NAME, "search_btn")
            search_button.click()
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".mod .item")))
            results = driver.find_elements(By.CSS_SELECTOR, ".mod .item")[:6]
        elif site == "momo":
            driver.get("https://www.momoshop.com.tw/main/Main.jsp")
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "search-area")))
            search_input = driver.find_element(By.ID, "keyword")
            search_input.send_keys(keyword)
            search_button = driver.find_element(By.CLASS_NAME, "inputbtn")
            search_button.click()
            WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.goodsUrl")))
            results = driver.find_elements(By.CSS_SELECTOR, "a.goodsUrl")
        else:
            return None

        for index, result in enumerate(results):
            if site == "books":
                title = result.find_element(By.CSS_SELECTOR, "h4 a").get_attribute("title")
                item_id = result.get_attribute("id").split('-')[-1]
                print(f"{index + 1}: {title} (ID: {item_id})")
            elif site == "momo":
                title = result.find_element(By.XPATH, "./ancestor::li//h3[@class='prdName']").text
                print(f"{index + 1}: {title}")

        choice = int(input("請輸入你要選擇的商品編號: ")) - 1
        selected_result = results[choice]

        if site == "books":
            item_id = selected_result.get_attribute("id").split('-')[-1]
            base_url = f"https://www.books.com.tw/exep/assp.php/shamangels/products/{item_id}"
            additional_params = "utm_source=shamangels&utm_medium=ap-books&utm_content=recommend&utm_campaign=ap-202406"
            product_url = convert_url(base_url, additional_params)
        elif site == "momo":
            base_url = selected_result.get_attribute('href')
            additional_params = "memid=6000021729&cid=apuad&oid=1&osm=league"
            product_url = convert_url(base_url, additional_params)
        return product_url
    except Exception as e:
        print(f"Error searching book on {site}: {e}")
        return None


def convert_url(base_url, additional_params):
    if "?" in base_url:
        return f"{base_url}&{additional_params}"
    else:
        return f"{base_url}?{additional_params}"


def main():
    driver = initialize_driver()

    keyword = input("請輸入要搜尋的書名：")
    books_url = search_book(driver, keyword, "books")
    if books_url:
        print(f"Books 轉換後 URL: {books_url}")

    momo_url = search_book(driver, keyword, "momo")
    if momo_url:
        print(f"Momo 轉換後 URL: {momo_url}")

    driver.quit()


if __name__ == "__main__":
    main()
