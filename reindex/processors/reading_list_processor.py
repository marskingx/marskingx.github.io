import re

def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def write_file(file_path, content):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def update_reading_list(reading_list_path, book_title, books_url, momo_url, rate, slug, categories_links):
    print(f"開始更新閱讀列表: {reading_list_path}")
    content = read_file(reading_list_path)

    # 查找和保留現有的 YAML 頭
    yaml_pattern = re.compile(r'---\s*\n(.*?)\n---\s*\n', re.DOTALL)
    yaml_match = yaml_pattern.search(content)
    if yaml_match:
        yaml_content = yaml_match.group(0)
        content = content.replace(yaml_content, '').strip()
    else:
        yaml_content = ''

    # 查找最大的圖片編號
    img_numbers = re.findall(r'img_(\d+)', content)
    max_img_number = max([int(num) for num in img_numbers]) if img_numbers else 0
    new_img_number = max_img_number + 1

    # 新書籍的條目
    new_entry = (
        f"| [![《{book_title}》](/images/reading_list/img_{new_img_number}.png)](/blog/{slug}/) "
        f"|{categories_links}<br>《{book_title}》<br/>{rate} "
        f"| [![《{book_title}》](/images/reading_list/books_buy.jpg)]({books_url})"
        f"<br/> [![《{book_title}》](/images/reading_list/momobooks_buy.jpg)]({momo_url}) |\n"
    )

    # 查找並更新推薦書單部分
    table_pattern = re.compile(r'(## 推薦書單\(依閱讀時間序\)\n\| 閱讀書單 \| 推薦評等 \| 購書連結 \|\n\|-+\|-+\|-+\|\n)(.*)', re.DOTALL)
    table_match = table_pattern.search(content)
    if table_match:
        content = content.replace(table_match.group(0), table_match.group(1) + new_entry + table_match.group(2).strip())
    else:
        content = (
            f"{yaml_content}\n"
            "## 推薦書單(依閱讀時間序)\n"
            "| 閱讀書單 | 推薦評等 | 購書連結 |\n"
            "|-|-|-|\n"
            + new_entry
            + content
        )

    write_file(reading_list_path, content)
    print("閱讀列表更新完成")

# 以下是用於獨立測試的主函數
if __name__ == "__main__":
    import sys

    if len(sys.argv) != 8:
        print("Usage: python reading_list_updater.py <reading_list_path> <book_title> <books_url> <momo_url> <rate> <slug> <categories_links>")
        sys.exit(1)

    reading_list_path = sys.argv[1]
    book_title = sys.argv[2]
    books_url = sys.argv[3]
    momo_url = sys.argv[4]
    rate = sys.argv[5]
    slug = sys.argv[6]
    categories_links = sys.argv[7]

    update_reading_list(reading_list_path, book_title, books_url, momo_url, rate, slug, categories_links)
