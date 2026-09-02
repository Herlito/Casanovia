import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# For text Transformation buttons
content = re.sub(r'(`flex-1 text-xs py-1 \$\{)', r'`flex-1 text-xs py-1 text-gray-900 ${', content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
