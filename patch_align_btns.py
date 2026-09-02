import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'(`p-1.5 rounded \$\{)', r'`text-gray-900 p-1.5 rounded ${', content)
content = re.sub(r'className="p-1.5 rounded hover:bg-gray-200"', r'className="text-gray-900 p-1.5 rounded hover:bg-gray-200"', content)
# Check for Italic
content = re.sub(r'className={`p-1.5 rounded \${selectedElement.style.fontStyle', r'className={`text-gray-900 p-1.5 rounded ${selectedElement.style.fontStyle', content)
with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
