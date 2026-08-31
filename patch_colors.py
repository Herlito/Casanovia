import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# For text:
content = content.replace(
    "fill={el.style.fill || el.style.color || '#000'}",
    "fill={el.style.isDefaultStyle ? document.theme.palette.primary : (el.style.fill || el.style.color || '#000')}"
)

# For countdown:
content = content.replace(
    "themePrimaryColor={document.theme.palette.primary}",
    "themePrimaryColor={document.theme.palette.primary}\n                      isDefaultStyle={el.style.isDefaultStyle}"
)

# For svg-shape (image):
# wait, how is svg-shape rendered? It's under 'image' usually.
