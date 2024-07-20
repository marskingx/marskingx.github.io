# processors/base_processor.py

import logging

class BaseProcessor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = None

    def process(self):
        raise NotImplementedError("Each processor must implement the process method.")

    def write_file(self, content):
        with open(self.file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        logging.info(f"成功寫入文件: {self.file_path}")
