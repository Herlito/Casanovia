import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Fix id in addElement
content = content.replace("id: Date.now().toString(),\n                type: 'image',", "type: 'image',")

# Fix textAlign
content = content.replace("align={el.style.textAlign || 'left'}", "align={el.style.align || 'left'}")

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
