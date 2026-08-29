with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# I swallowed the </div> of the Color section
text = text.replace("          </div>        {selectedElement.type === 'image' && (", "          </div>\n        </div>\n        {selectedElement.type === 'image' && (")

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
