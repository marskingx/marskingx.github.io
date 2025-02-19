import yaml
import logging
import re
from pathlib import Path
from datetime import datetime

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


def load_config():
    try:
        # 不再嘗試讀取外部設定檔
        config = {
            'file_paths': {
                'blog_directory': 'content/blog',
                'reading_list': 'data/reading_list.yaml'
            }
        }
        logging.info("使用預設設定")
        return config
    except Exception as e:
        logging.error(f"設定載入錯誤: {str(e)}")
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
  try:
    with open(file_path, 'r', encoding='utf-8') as file:
      content = file.read()

    # 嘗試匹配 YAML 前置數據中的 categories
    yaml_match = re.search(r'---\s*\n(.*?)\n---', content, re.DOTALL)
    if yaml_match:
      yaml_content = yaml_match.group(1)
      category_match = re.search(r'categories:\s*\[(.*?)\]', yaml_content)
      if category_match:
        categories = category_match.group(1).strip().split(',')
        # 取第一個類別（如果有多個的話）
        category = categories[0].strip().strip('"\'')
        logging.info(f"從文件 {file_path} 中提取到類別: {category}")
        return category

    # 如果在 YAML 中沒有找到 categories，嘗試在整個文件內容中查找
    category_match = re.search(r'categories:\s*(\S+)', content)
    if category_match:
      category = category_match.group(1).strip().strip('[]"\'')
      logging.info(f"從文件 {file_path} 內容中提取到類別: {category}")
      return category

    logging.warning(f"在文件 {file_path} 中未找到 categories 欄位")

    # 如果仍然沒有找到類別，可以返回一個預設類別或 None
    logging.error(f"無法確定文件 {file_path} 的類別")
    return None

  except Exception as e:
    logging.error(f"讀取文件 {file_path} 時發生錯誤: {e}")
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
        config = load_config()
        if config is None:  # 檢查設定是否成功載入
            logging.error("無法載入設定，程式結束")
            return
            
        directory_path = config['file_paths']['blog_directory']
        reading_list_path = config['file_paths']['reading_list']
        
        # 檢查目錄是否存在
        if not Path(directory_path).exists():
            logging.error(f"目錄不存在: {directory_path}")
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
                processor = processor_class(str(selected_file), reading_list_path)
                if category == "讀書心得":
                    promotion_links = processor.process_book_review()
                else:
                    processor.process()
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
