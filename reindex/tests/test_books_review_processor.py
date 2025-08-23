# tests/test_books_review_processor.py

import pytest
import logging
from processors.books_review_processor import BooksReviewProcessor


def test_books_review_processor_update_yaml(mocker):
  # 创建一个BooksReviewProcessor实例
  processor = BooksReviewProcessor("test_file.md", "reading_list.yaml")

  # 模拟文件内容
  processor.content = """
    ---
    title: "原始標題"
    date: "2020/01/01"
    categories: ["原始類別"]
    ---
    這是一個測試文件。
    """

  # 模拟extract_title和generate_slug方法
  mocker.patch.object(processor, 'extract_title', return_value="測試書名")
  mocker.patch.object(processor, 'generate_slug', return_value="test-slug")

  updated_content = processor.update_yaml()

  # 验证YAML更新后的内容
  assert "title: 測試書名" in updated_content
  assert "slug: test-slug" in updated_content


def test_books_review_processor_extract_book_title(mocker):
  processor = BooksReviewProcessor("test_file.md", "reading_list.yaml")

  processor.content = """
    ---
    title: "測試書"
    ---
    這是關於《測試書》的書評。
    """

  book_title = processor.extract_book_title()
  assert book_title == "測試書"


def test_books_review_processor_get_promotion_links(mocker):
  processor = BooksReviewProcessor("test_file.md", "reading_list.yaml")

  mocker.patch('processors.books_review_processor.get_books_promotion_link',
               return_value=("測試書", "http://test_books_url"))
  mocker.patch('processors.books_review_processor.get_momo_promotion_link',
               return_value=("測試書", "http://test_momo_url"))

  promotion_links = processor.get_promotion_links("測試書")

  assert "Books: http://test_books_url" in promotion_links
  assert "Momo: http://test_momo_url" in promotion_links
