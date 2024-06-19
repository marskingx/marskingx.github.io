from selenium import webdriver
from bs4 import BeautifulSoup
import time

# 初始化瀏覽器
driver = webdriver.Chrome()  # 確保已安裝 Chrome 瀏覽器和相應的 ChromeDriver

# 設定目標網址
base_url = 'https://www.yungshiu.com/store.php?city_id={}'

# 縣市 ID 和名稱對應表
cities = {
    7: '台北市',
    8: '基隆市',
    9: '新北市',
    10: '連江縣',
    11: '宜蘭縣',
    12: '新竹市',
    13: '新竹縣',
    14: '桃園市',
    15: '苗栗縣',
    16: '台中市',
    17: '彰化縣',
    18: '南投縣',
    19: '嘉義市',
    20: '嘉義縣',
    21: '雲林縣',
    22: '台南市',
    23: '高雄市',
    24: '澎湖縣',
    25: '金門縣',
    26: '屏東縣',
    27: '台東縣',
    28: '花蓮縣'
}

# 爬取每個縣市的店鋪信息
for city_id, city_name in cities.items():
    url = base_url.format(city_id)
    driver.get(url)

    # 等待幾秒鐘讓頁面完全加載
    time.sleep(5)

    # 獲取網頁的 HTML
    html = driver.page_source

    # 使用 BeautifulSoup 解析 HTML
    soup = BeautifulSoup(html, 'html.parser')

    # 找到所有的店鋪信息（根據實際情況調整選擇器）
    stores = soup.find_all('h4', class_='name')

    # 如果該城市有店鋪，則打印城市名稱
    if stores:
        print(city_name)

    # 提取所需數據
    for store in stores:
        name = store.find('a').get('title')
        print(f'{name}')

    # 添加分隔符
    if stores:
        print('')

# 關閉瀏覽器
driver.quit()
