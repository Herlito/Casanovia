import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'(`text-xs px-2 py-1 rounded border \$\{)', r'`text-xs px-2 py-1 rounded border text-gray-900 ${', content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
