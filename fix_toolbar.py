with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

text = text.replace('<button className="flex items-centerore/useEditorStore\';', '')

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
