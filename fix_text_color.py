import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_text = """                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={el.style.color || '#000000'}
                            align={el.style.align || 'left'}"""

new_text = """                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={el.style.fill || el.style.color || '#000000'}
                            align={el.style.align || 'left'}"""

content = content.replace(old_text, new_text)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
