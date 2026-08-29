with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("          </div>\n        {selectedElement.type === 'image' && (", "          </div>\n        </div>\n\n        {selectedElement.type === 'image' && (")

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
