import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'draggable: !el.locked,',
    'draggable: !el.locked,\n                  opacity: el.style.opacity ?? 1,'
)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)

