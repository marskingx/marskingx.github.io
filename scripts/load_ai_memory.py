import os

# Construct the absolute path to the project root
project_root = os.path.dirname(os.path.abspath(__file__))
# Navigate up to the project root from the scripts directory
project_root = os.path.abspath(os.path.join(project_root, os.pardir))

memory_file_path = os.path.join(project_root, '.ai-memory', 'project-memory.md')

try:
    with open(memory_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        print(content)
except FileNotFoundError:
    print(f"Error: Memory file not found at {memory_file_path}")
except Exception as e:
    print(f"An error occurred: {e}")
