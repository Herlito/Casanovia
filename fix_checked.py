import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('checked={selectedElement.content.showSeconds}', 'checked={selectedElement.content.showSeconds || false}')

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
