import os
import re
import yaml


def format_slug(slug):
  # 轉換為小寫
  slug = slug.lower()
  # 替換特殊字符為連字符
  slug = re.sub(r'[^a-z0-9]+', '-', slug)
  # 移除開頭和結尾的連字符
  slug = slug.strip('-')
  return slug


def process_file(file_path, preview=True):
  with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()

  # 尋找 YAML 前言
  yaml_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
  if yaml_match:
    yaml_content = yaml_match.group(1)
    try:
      # 解析 YAML
      data = yaml.safe_load(yaml_content)
      if 'slug' in data:
        old_slug = data['slug']
        new_slug = format_slug(old_slug)
        if old_slug != new_slug:
          if preview:
            return file_path, old_slug, new_slug
          else:
            # 更新 slug
            data['slug'] = new_slug
            # 將更新後的 YAML 轉換回字符串
            new_yaml = yaml.dump(data, allow_unicode=True)
            # 替換原始內容中的 YAML
            new_content = re.sub(r'^---\s*\n.*?\n---\s*\n', f'---\n{new_yaml}---\n', content, flags=re.DOTALL)

            # 寫回文件
            with open(file_path, 'w', encoding='utf-8') as file:
              file.write(new_content)
            print(f"Updated {file_path}: {old_slug} -> {new_slug}")
      else:
        print(f"No slug found in {file_path}")
    except yaml.YAMLError as e:
      print(f"Error parsing YAML in {file_path}: {e}")
  else:
    print(f"No YAML front matter found in {file_path}")

  return None


def main():
  directory = r'D:\marskingx.github.io\content\blog'
  files_to_update = []

  # 預覽步驟
  for filename in os.listdir(directory):
    if filename.endswith('.md'):
      file_path = os.path.join(directory, filename)
      result = process_file(file_path, preview=True)
      if result:
        files_to_update.append(result)

  # 顯示需要更新的文件
  if files_to_update:
    print("以下文件需要更新:")
    for file_path, old_slug, new_slug in files_to_update:
      print(f"{file_path}:")
      print(f"  Old slug: {old_slug}")
      print(f"  New slug: {new_slug}")
      print()

    # 詢問用戶是否執行更新
    user_input = input("是否執行更新？(y/n): ").strip().lower()
    if user_input == 'y':
      # 執行更新
      for file_path, _, _ in files_to_update:
        process_file(file_path, preview=False)
      print("更新完成。")
    else:
      print("取消更新。")
  else:
    print("沒有文件需要更新。")


if __name__ == "__main__":
  main()
