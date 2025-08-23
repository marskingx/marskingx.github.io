file_path = "D:\\marskingx-worktrees\\gemini-dev\\themes\\hugoplate\\layouts\\blog\\single.html"

old_block_start_marker = "        {{/* Create a scratchpad for the schema */}}"
old_block_end_marker = "        {{ partial \"breadcrumb-jsonld.html\" . }}"

new_block_content = """        {{ partial \"structured-data/article.html\" . }}
        {{ partial \"breadcrumb-jsonld.html\" . }}"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start and end of the block to replace
start_index = content.find(old_block_start_marker)
end_index = content.find(old_block_end_marker, start_index)

if start_index != -1 and end_index != -1:
    # Adjust end_index to include the end marker line
    end_index += len(old_block_end_marker)

    # Extract the old block content
    old_block_content = content[start_index:end_index]

    # Perform the replacement
    modified_content = content.replace(old_block_content, new_block_content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(modified_content)
    print(f"Successfully replaced content in {file_path}")
else:
    print(f"Markers not found in {file_path}. No changes made.")
