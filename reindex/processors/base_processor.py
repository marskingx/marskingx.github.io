# processors/base_processor.py

import logging

class BaseProcessor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = None

    def process(self):
        raise NotImplementedError("Each processor must implement the process method.")

    def write_file(self, content):
        try:
            with open(self.file_path, 'w', encoding='utf-8') as file:
                file.write(content)
        except Exception as e:
            logging.error(f"寫入文件時發生錯誤: {e}")
