import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# Make sure all standard inputs, selects, textareas have text-gray-900
content = content.replace('w-full text-xs p-1.5', 'w-full text-xs p-1.5 text-gray-900')
content = content.replace('w-full text-sm p-2', 'w-full text-sm p-2 text-gray-900')

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)

