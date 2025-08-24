# tests/test_podcast_processor.py

import pytest
import logging
from processors.podcast_processor import PodcastProcessor


def test_podcast_processor_update_yaml(mocker):
  processor = PodcastProcessor("test_file.md", "reading_list.yaml")

  processor.content = """
    ---
    title: "原始標題"
    date: "2020/01/01"
    categories: ["原始類別"]
    ---
    這是一個測試文件。
    """

  mocker.patch.object(processor, 'extract_title', return_value="測試播客")
  mocker.patch.object(processor, 'generate_slug', return_value="test-slug")

  updated_content = processor.update_yaml()

  assert "title: 測試播客" in updated_content
  assert "slug: test-slug" in updated_content


def test_podcast_processor_process(mocker):
  processor = PodcastProcessor("test_file.md", "reading_list.yaml")

  processor.content = """
    ---
    title: "測試播客"
    ---
    這是一個測試播客的內容。
    """

  mocker.patch.object(processor, 'update_yaml', return_value="updated content")
  mocker.patch.object(processor, 'write_file')

  processor.process()

  processor.write_file.assert_called_once_with("updated content")
