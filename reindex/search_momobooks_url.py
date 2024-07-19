import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# 設置日誌文件
logging.basicConfig(filename='search_book_errors.log', level=logging.DEBUG)

def initialize_driver():
    """初始化 Selenium WebDriver"""
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 如果你希望背景運行瀏覽器，移除這一行可以看到瀏覽器操作
    driver = webdriver.Chrome(options=options)
    logging.debug("初始化 WebDriver 完成")
    return driver

def search_momo_books(driver, keyword):
    """在 MOMO 購物網站上搜尋書籍並返回搜尋結果的 URL"""
    try:
        logging.debug("打開 MOMO 購物網站")
        url = f"https://www.momoshop.com.tw/search/searchShop.jsp?keyword={keyword}&searchType=1&curPage=1&showType=chessboardType&serviceCode=MT01&cateCode=&t=1720410921275&_isFuzzy=0"
        driver.get(url)

        # 等待網頁加載完成
        WebDriverWait(driver, 30).until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'goodsUrl')))

        products = driver.find_elements(By.CLASS_NAME, 'goodsUrl')

        if not products:
            logging.debug("未找到任何結果")
            return None, None

        filtered_results = []
        for index, product in enumerate(products[:6]):
            if process_result(product, index):
                filtered_results.append(product)

        if not filtered_results:
            logging.debug("未找到有效的搜尋結果")
            return None, None

        if len(filtered_results) == 1:
            choice = 0
            logging.debug("自動選擇唯一結果")
        else:
            while True:
                try:
                    choice = int(input("請輸入您要選擇的商品編號: ")) - 1
                    if 0 <= choice < len(filtered_results):
                        break
                    else:
                        logging.debug("無效的編號，請重新輸入")
                except ValueError:
                    logging.debug("請輸入數字編號")

        selected_result = filtered_results[choice]
        selected_title, product_url = get_selected_result_url(selected_result)

        logging.debug(f"選擇的商品名稱: {selected_title}")
        logging.debug(f"生成的商品 URL: {product_url}")
        return selected_title, product_url

    except (TimeoutException, NoSuchElementException, WebDriverException) as e:
        error_message = f"Error searching book on momoshop.com.tw: {e}"
        logging.error(error_message)
        return None, None

def process_result(result, index):
    """處理搜尋結果，顯示資訊供使用者選擇"""
    try:
        title_element = result.find_element(By.CLASS_NAME, 'prdName')
        title = title_element.get_attribute('title')
        link_element = result.find_element(By.TAG_NAME, 'a')
        link = link_element.get_attribute('href')

        logging.debug(f"{index + 1}: {title}")
        return True

    except (NoSuchElementException, TimeoutException) as e:
        error_message = f"Error finding element in result {index + 1}: {e}"
        logging.error(error_message)
        return False

def get_selected_result_url(selected_result):
    """獲取選擇的結果 URL"""
    title, product_url = None, None  # 初始化變數

    try:
        title_element = selected_result.find_element(By.CLASS_NAME, 'prdName')
        title = title_element.get_attribute('title')
        link_element = selected_result.find_element(By.TAG_NAME, 'a')
        link = link_element.get_attribute('href')

        # 添加必要的參數到URL
        if '?' in link:
            product_url = f"{link}&memid=6000021729&cid=apuad&oid=1&osm=league"
        else:
            product_url = f"{link}?memid=6000021729&cid=apuad&oid=1&osm=league"

        return title, product_url
    except (NoSuchElementException, TimeoutException) as e:
        error_message = f"Error getting selected result URL: {e}"
        logging.error(error_message)
        return None, None

def get_momo_promotion_link(keyword):
    driver = initialize_driver()
    title, url = search_momo_books(driver, keyword)
    driver.quit()
    return title, url

# 示例用法
if __name__ == "__main__":
    keyword = "平衡心態"
    momo_title, momo_url = get_momo_promotion_link(keyword)
    logging.debug(f"Momo: {momo_title}, URL: {momo_url}")
