import os
import yaml
import glob

# --- Configuration ---
content_dir = 'content/blog'
# --- End Configuration ---

def check_files():
    report = {
        "reviews_missing_rate": [],
        "missing_tags": [],
        "empty_tags": []
    }
    
    # Use glob to find all markdown files
    md_files = glob.glob(os.path.join(content_dir, '**/*.md'), recursive=True)
    
    for file_path in md_files:
        if os.path.basename(file_path) == '_index.md':
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            parts = content.split('---')
            if len(parts) < 3:
                continue
                
            front_matter_str = parts[1]
            if not front_matter_str.strip():
                continue

            front_matter = yaml.safe_load(front_matter_str)
            
            if not front_matter:
                continue

            # 1. Check for "閱讀心得" or "嗑書" without "rate"
            categories = front_matter.get('categories', [])
            if isinstance(categories, list):
                is_review = any(cat in ['閱讀心得', '嗑書'] for cat in categories)
                if is_review and 'rate' not in front_matter:
                    report['reviews_missing_rate'].append(file_path)
            
            # 2. Check for missing "tags"
            if 'tags' not in front_matter:
                report['missing_tags'].append(file_path)
            # 3. Check for empty "tags"
            elif front_matter.get('tags') is None or len(front_matter.get('tags')) == 0:
                report['empty_tags'].append(file_path)


        except (yaml.YAMLError, IOError, UnicodeDecodeError) as e:
            print(f"Error processing file {file_path}: {e}")
            
    return report

if __name__ == '__main__':
    validation_report = check_files()
    
    if validation_report['reviews_missing_rate']:
        print("--- 閱讀心得/嗑書 (missing 'rate') ---")
        for p in validation_report['reviews_missing_rate']:
            print(p)
    
    if validation_report['missing_tags']:
        print("\n--- Articles missing 'tags' key ---")
        for p in validation_report['missing_tags']:
            print(p)

    if validation_report['empty_tags']:
        print("\n--- Articles with empty 'tags' list ---")
        for p in validation_report['empty_tags']:
            print(p)

    if not any(validation_report.values()):
        print("No issues found regarding missing 'rate' or 'tags'வுகளை.")
