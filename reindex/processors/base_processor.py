import logging
import re
import yaml

class BaseProcessor:
    """提供通用功能的基礎處理器，包含檔案讀寫、YAML 前言解析。"""

    def __init__(self, file_path, config):
        """
        初始化基礎處理器。

        Args:
            file_path (str): 要處理的 Markdown 檔案路徑。
            config (dict): 從 config.yaml 載入的設定檔。
        """
        self.file_path = file_path
        self.config = config
        self.raw_content = None
        self.front_matter = {}
        self.main_content = ""

        self._load_and_parse_file()

    def _load_and_parse_file(self):
        """讀取並解析檔案，將其分為 YAML 前言和主要內容。"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                self.raw_content = file.read()

            # 使用正則表達式分離 YAML 前言和主要內容
            match = re.search(r'^---\s*\n(.*?)\n---\s*\n(.*)', self.raw_content, re.DOTALL | re.MULTILINE)

            if match:
                yaml_content, self.main_content = match.groups()
                try:
                    self.front_matter = yaml.safe_load(yaml_content) or {}
                    logging.info(f"成功解析文件 {self.file_path} 的 YAML 前言。")
                except yaml.YAMLError as e:
                    logging.error(f"解析 {self.file_path} 的 YAML 時出錯: {e}")
                    # 即使 YAML 解析失敗，也保留主要內容
                    self.main_content = self.raw_content
            else:
                logging.warning(f"在 {self.file_path} 中未找到 YAML 前言，將整個文件視為主要內容。")
                self.main_content = self.raw_content

        except Exception as e:
            logging.error(f"讀取或解析文件 {self.file_path} 時發生錯誤: {e}")

    def process(self):
        """處理檔案的抽象方法，應由子類別實現。"""
        raise NotImplementedError("每個處理器都必須實現 process 方法。")

    def write_file(self):
        """將更新後的前言和內容寫回檔案。"""
        try:
            # 將 Python dict 轉換回 YAML 字串
            # allow_unicode=True 確保中文字元能正確顯示
            updated_yaml = yaml.dump(self.front_matter, allow_unicode=True, sort_keys=False)

            # 組合新的文件內容
            updated_content = f"---\n{updated_yaml}---\n{self.main_content}"

            with open(self.file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            logging.info(f"文件 {self.file_path} 已成功更新。")

        except Exception as e:
            logging.error(f"寫入文件 {self.file_path} 時發生錯誤: {e}")
