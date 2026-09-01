import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

# We want to remove everything inside <div className="flex items-center space-x-2"> ... </div> up to the {selectedElementIds.length === 1 && ( ... )} block.
# Let's use regex to find this div.
start_idx = content.find('<div className="flex items-center space-x-2">')
end_idx = content.find('{selectedElementIds.length === 1 && (')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx:]

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)
