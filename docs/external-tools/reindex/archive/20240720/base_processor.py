import re
from datetime import datetime

class BaseProcessor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = self.read_file()

    def read_file(self):
        with open(self.file_path, 'r', encoding='utf-8') as file:
            return file.read()

    def write_file(self, content):
        with open(self.file_path, 'w', encoding='utf-8') as file:
            file.write(content)

    def standardize_date_format(self, date_str):
        try:
            return datetime.strptime(date_str, "%Y/%m/%d").strftime("%Y-%m-%d")
        except ValueError:
            return date_str

    def format_image_date(self, date_str):
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y%m%d")
        except ValueError:
            return date_str.replace("-", "")

    def extract_yaml_field(self, field_name):
        pattern = rf'{field_name}:\s*(.*)'
        match = re.search(pattern, self.content)
        return match.group(1).strip() if match else ""

    def process(self):
        raise NotImplementedError("Subclasses must implement this method")
