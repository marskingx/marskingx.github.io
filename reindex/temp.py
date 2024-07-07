from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time
import csv

# 初始化 Chrome 瀏覽器
driver = webdriver.Chrome()

# 打開指定網址
driver.get("https://www.yungshiu.com/store.php?city_id=7&dist_id=&keywords=")

# 縣市選項值
cities = ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25",
          "26", "27", "28"]

data = []

for city in cities:
  # 選擇縣市
  select = Select(driver.find_element(By.ID, "cities"))
  select.select_by_value(city)

  # 點擊搜尋按鈕
  search_button = driver.find_element(By.CSS_SELECTOR, "div.send button")
  search_button.click()

  # 等待頁面加載
  time.sleep(3)

  # 解析當前頁面的HTML
  soup = BeautifulSoup(driver.page_source, 'html.parser')

  # 爬取資料
  stores = soup.select("div.item")

  for store in stores:
    name = store.select_one("h4.name a")
    manager = store.select_one("li:-soup-contains('負責人') span.box-hidden")
    address = store.select_one("li:-soup-contains('住址') a")
    phone = store.select_one("li:-soup-contains('電話') span.box-hidden a")
    fax = store.select_one("li:-soup-contains('傳真') span.box-hidden")

    data.append([
      name.text if name else '',
      manager.text if manager else '',
      address.text if address else '',
      phone.text if phone else '',
      fax.text if fax else ''
    ])

# 關閉瀏覽器
driver.quit()

# 將資料存成 CSV 檔案
with open('stores_data.csv', 'w', newline='', encoding='utf-8') as file:
  writer = csv.writer(file)
  writer.writerow(["店名", "負責人", "住址", "電話", "傳真"])
  writer.writerows(data)

print("資料已成功爬取並存成 CSV 檔案。")
