import re


def read_file(file_path):
  with open(file_path, 'r', encoding='utf-8') as file:
    return file.read()


def write_file(file_path, content):
  with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)


def update_reading_list(reading_list_path, book_title, books_url, momo_url, rate, slug):
  print(f"開始更新閱讀列表: {reading_list_path}")
  content = read_file(reading_list_path)

  # 移除重複的表頭
  content = re.sub(r'\|\s*閱讀書單\s*\|\s*推薦評等\s*\|\s*購書連結\s*\|\n\|-\|-*-\|-\|-*\|\n', '', content)

  # 新書籍的條目
  new_entry = (
    f"| [![《{book_title}》](/images/reading_list/img_18.png)](/blog/{slug}/) "
    f"| 《{book_title}》<br/>{rate} "
    f"| [![《{book_title}》](/images/reading_list/books_buy.jpg)]({books_url})"
    f"<br/> [![《{book_title}》](/images/reading_list/momobooks_buy.jpg)]({momo_url}) |\n"
  )

  # 將新書籍條目添加到現有內容的頂部
  content = (
    "## 推薦書單(依閱讀時間序)\n"
    "| 閱讀書單 | 推薦評等 | 購書連結 |\n"
    "|-|-|-|\n"
    + new_entry
    + content
  )

  write_file(reading_list_path, content)
  print("閱讀列表更新完成")


if __name__ == "__main__":
  import sys

  if len(sys.argv) != 6:
    print("Usage: python reading_list_updater.py <reading_list_path> <book_title> <books_url> <momo_url> <rate> <slug>")
    sys.exit(1)

  reading_list_path = sys.argv[1]
  book_title = sys.argv[2]
  books_url = sys.argv[3]
  momo_url = sys.argv[4]
  rate = sys.argv[5]
  slug = sys.argv[6]

  update_reading_list(reading_list_path, book_title, books_url, momo_url, rate, slug)
