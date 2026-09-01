import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

content = content.replace("const newEl = { ...el, id: Date.now().toString() + Math.random(), transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };", 
                          "const { id, ...elWithoutId } = el;\n                  const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };")

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
