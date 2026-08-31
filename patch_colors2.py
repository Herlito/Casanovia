import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# svg-shape
content = content.replace(
    "fill={el.style.fill || '#cccccc'}",
    "fill={el.style.isDefaultStyle ? document.theme.palette.primary : (el.style.fill || '#cccccc')}"
)

# audio-player
content = content.replace(
    "const bgColor = el.style.backgroundColor || '#EBEBEB';",
    "const bgColor = el.style.isDefaultStyle ? document.theme.palette.primary : (el.style.backgroundColor || '#EBEBEB');"
)
content = content.replace(
    "const textColor = el.style.color || '#2D3748';",
    "const textColor = el.style.isDefaultStyle ? document.theme.palette.background : (el.style.color || '#2D3748');"
)

# countdown-widget and interactive-button
content = content.replace(
    "<CanvasCountdown",
    "<CanvasCountdown theme={document.theme}"
)
content = content.replace(
    "<CanvasInteractiveButton",
    "<CanvasInteractiveButton theme={document.theme}"
)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)

