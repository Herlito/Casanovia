import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace('value={canvasConfig.width}', 'value={canvasConfig.width || 0}')
content = content.replace('value={canvasConfig.height}', 'value={canvasConfig.height || 0}')
content = content.replace('value={canvasConfig.backgroundColor}', "value={canvasConfig.backgroundColor || '#ffffff'}")

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
