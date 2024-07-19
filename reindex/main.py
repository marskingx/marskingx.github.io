import os
import re
import sys
import subprocess
from datetime import datetime
import logging

# 設置日誌記錄
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                      logging.FileHandler("main_execution.log"),
                      logging.StreamHandler()
                    ])


def read_file(file_path):
  with open(file_path, 'r', encoding='utf-8') as file:
    return file.read()


def get_md_category(content):
  match = re.search(r'categories:\s*(\S+)', content)
  if match:
    return match.group(1).strip()
  return None


def run_script(category, file_path, reading_list_path):
  script_map = {
    'Podcast節目': 'podcast_reindex.py',
    '理財工具與金融商品': 'financial_tool_reindex.py',
    '財務規劃與心態': 'financial_mindset_reindex.py',
    '職涯與生活': 'life_share_reindex.py',
    '讀書心得': 'books_review_reindex.py'
  }

  script_name = script_map.get(category)
  if script_name:
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    if os.path.exists(script_path):
      try:
        logging.info(f"準備執行腳本: {script_path}")
        if category == '讀書心得':
          command = ['python', script_path, file_path, reading_list_path]
        else:
          command = ['python', script_path, file_path]

        logging.info(f"正在執行命令: {' '.join(command)}")
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')

        while True:
          output = process.stdout.readline()
          if output == '' and process.poll() is not None:
            break
          if output:
            logging.info(output.strip())

        stdout, stderr = process.communicate(timeout=300)  # 增加超時時間到5分鐘
        logging.info(f"命令執行完畢: {' '.join(command)}")
        logging.info(f"腳本輸出: {stdout}")
        if stderr:
          logging.error(f"腳本錯誤: {stderr}")
      except subprocess.TimeoutExpired:
        process.kill()
        stdout, stderr = process.communicate()
        logging.error(f"腳本執行超時: {' '.join(command)}")
        logging.error(f"超時後的輸出: {stdout}")
        logging.error(f"超時後的錯誤: {stderr}")
      except Exception as e:
        logging.error(f"腳本執行失敗: {e}")
    else:
      logging.error(f"腳本文件不存在: {script_path}")
  else:
    logging.error(f"未知的類型: {category}")


def process_md_file(file_path, reading_list_path):
  content = read_file(file_path)
  category = get_md_category(content)
  if category:
    logging.info(f"檔案類型為: {category}")
    run_script(category, file_path, reading_list_path)
  else:
    logging.error(f"無法判斷檔案類型: {file_path}")


def list_recent_md_files(directory_path):
  md_files = []
  for root, _, files in os.walk(directory_path):
    for file in files:
      if file.endswith(".md"):
        file_path = os.path.join(root, file)
        md_files.append((file_path, os.path.getmtime(file_path)))

  md_files.sort(key=lambda x: x[1], reverse=True)
  return md_files[:10]


if __name__ == "__main__":
  directory_path = r'D:\marskingx.github.io\content\blog'
  reading_list_path = r'D:\marskingx.github.io\content\pages\reading_list.md'

  logging.info(f"使用目錄路徑: {directory_path}")

  recent_files = list_recent_md_files(directory_path)
  if not recent_files:
    logging.error("沒有找到 Markdown 檔案。")
    sys.exit(1)

  logging.info("最近更新的 10 個 Markdown 檔案：")
  for i, (file_path, _) in enumerate(recent_files, start=1):
    logging.info(f"{i}. {file_path}")

  file_index = input("請選擇要處理的文件（1-10）：")
  try:
    file_index = int(file_index) - 1
    if 0 <= file_index < len(recent_files):
      selected_file = recent_files[file_index][0]
      logging.info(f"選擇的文件: {selected_file}")
      process_md_file(selected_file, reading_list_path)
    else:
      logging.error("選擇的索引超出範圍。")
  except ValueError:
    logging.error("無效的選擇。請輸入一個數字。")

  logging.info("主程序執行完成")
