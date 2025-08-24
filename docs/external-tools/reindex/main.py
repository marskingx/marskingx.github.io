import logging
import re
from pathlib import Path
from datetime import datetime
import yaml

from processors import (
    BooksReviewProcessor,
    PodcastProcessor,
    LifeShareProcessor,
    FinancialToolProcessor,
    FinancialMindsetProcessor
)

# 設置日誌
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename=f'process_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
    filemode='w'
)
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logging.getLogger('').addHandler(console)

def load_config(config_path='config.yaml'):
    """從指定的路徑載入 YAML 設定檔"""
    try:
        with open(config_path, 'r', encoding='utf-8') as file:
            config = yaml.safe_load(file)
            logging.info(f"成功從 {config_path} 載入設定")
            return config
    except FileNotFoundError:
        logging.error(f"設定檔 '{config_path}' 不存在。")
        return None
    except yaml.YAMLError as e:
        logging.error(f"解析設定檔 '{config_path}' 時發生錯誤: {e}")
        return None

def get_processor(category):
    processors = {
        'Podcast節目': PodcastProcessor,
        '財務工具與金融商品': FinancialToolProcessor,
        '財務規劃與心態': FinancialMindsetProcessor,
        '職涯與生活': LifeShareProcessor,
        '閱讀心得': BooksReviewProcessor
    }
    return processors.get(category)

def get_file_category(file_path):
    """讀取 Markdown 檔案並從其 YAML 前言中解析出 category。"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        # 使用正則表達式找出 YAML 前言區塊
        match = re.search(r'^---\s*$(.*?)^---\s*$', content, re.MULTILINE | re.DOTALL)
        if not match:
            logging.warning(f"在文件 {file_path} 中未找到 YAML 前言")
            return None

        yaml_content = match.group(1)
        try:
            # 使用 PyYAML 解析前言內容
            front_matter = yaml.safe_load(yaml_content)
            if front_matter and 'categories' in front_matter:
                # 確保 categories 是列表形式
                categories = front_matter['categories']
                if isinstance(categories, list) and categories:
                    category = categories[0]
                    logging.info(f"從文件 {file_path} 中提取到類別: {category}")
                    return category
            logging.warning(f"在文件 {file_path} 的 YAML 前言中未找到有效的 'categories' 欄位")
            return None
        except yaml.YAMLError as e:
            logging.error(f"解析文件 {file_path} 的 YAML 時發生錯誤: {e}")
            return None

    except Exception as e:
        logging.error(f"讀取或處理文件 {file_path} 時發生錯誤: {e}")
        return None

def list_recent_md_files(directory_path, limit=10):
    try:
        md_files = sorted(
            Path(directory_path).glob('**/*.md'),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        return md_files[:limit]
    except Exception as e:
        logging.error(f"列出最近的 Markdown 文件時出錯: {e}")
        return []

def main():
    try:
        logging.debug(f"當前工作目錄: {Path.cwd()}")

        config = load_config()
        if config is None:
            logging.error("無法載入設定，程式結束")
            return

        directory_path = config['file_paths']['blog_directory']

        if not Path(directory_path).exists():
            try:
                Path(directory_path).mkdir(parents=True, exist_ok=True)
                logging.info(f"已自動建立目錄: {directory_path}")
            except Exception as e:
                logging.error(f"目錄不存在且自動建立失敗: {directory_path}, 錯誤: {e}")
                return

        recent_files = list_recent_md_files(directory_path)

        if not recent_files:
            logging.error(f"在 {directory_path} 中沒有找到 Markdown 文件")
            return

        for i, file_path in enumerate(recent_files, start=1):
            logging.info(f"{i}. {file_path}")

        while True:
            try:
                choice = int(input("請選擇要處理的文件 (1-10)：")) - 1
                if 0 <= choice < len(recent_files):
                    selected_file = recent_files[choice]
                    break
                else:
                    logging.error("無效的選擇，請重試。")
            except ValueError:
                logging.error("請輸入一個有效的數字。")

        category = get_file_category(str(selected_file))
        if category:
            processor_class = get_processor(category)
            if processor_class:
                # 將整個 config 傳遞給處理器
                processor = processor_class(str(selected_file), config)
                processor.process()  # 所有處理器都使用統一的 process 方法
            else:
                logging.error(f"沒有對應的處理器用於類別: {category}")
        else:
            logging.error(f"無法確定文件類型: {selected_file}")

    except FileNotFoundError as e:
        logging.error(f"找不到檔案或目錄: {str(e)}")
    except Exception as e:
        logging.error(f"執行時發生錯誤: {str(e)}")


if __name__ == "__main__":
    main()
