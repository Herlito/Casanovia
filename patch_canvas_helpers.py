import re

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'el: CanvasElement;\n  commonProps: any;\n}> = ({ el, commonProps }) => {',
    'el: CanvasElement;\n  commonProps: any;\n  theme?: any;\n}> = ({ el, commonProps, theme }) => {\n  const isDef = el.style.isDefaultStyle && theme;\n  const getCol = (defVal, propVal) => isDef ? defVal : propVal;'
)

content = content.replace(
    "fill={el.style.containerBackgroundColor || '#ffffff'}",
    "fill={getCol(theme?.palette.background, el.style.containerBackgroundColor || '#ffffff')}"
)
content = content.replace(
    "fill={el.style.titleColor || '#000'}",
    "fill={getCol(theme?.palette.primary, el.style.titleColor || '#000')}"
)
content = content.replace(
    "fill={el.style.numberColor || '#000'}",
    "fill={getCol(theme?.palette.primary, el.style.numberColor || '#000')}"
)
content = content.replace(
    "fill={el.style.labelColor || '#666'}",
    "fill={getCol(theme?.palette.text, el.style.labelColor || '#666')}"
)
content = content.replace(
    "fill={el.style.backgroundColor || '#fff'}",
    "fill={getCol(theme?.palette.background, el.style.backgroundColor || '#fff')}"
)

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'w') as f:
    f.write(content)


with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'el: CanvasElement;\n  commonProps: any;\n}> = ({ el, commonProps }) => {',
    'el: CanvasElement;\n  commonProps: any;\n  theme?: any;\n}> = ({ el, commonProps, theme }) => {\n  const isDef = el.style.isDefaultStyle && theme;\n  const getCol = (defVal, propVal) => isDef ? defVal : propVal;'
)
content = content.replace(
    "fill={el.style.backgroundColor || '#3b82f6'}",
    "fill={getCol(theme?.palette.primary, el.style.backgroundColor || '#3b82f6')}"
)
content = content.replace(
    "fill={el.style.color || '#ffffff'}",
    "fill={getCol(theme?.palette.background, el.style.color || '#ffffff')}"
)
content = content.replace(
    "stroke={el.style.borderColor || '#2563eb'}",
    "stroke={getCol(theme?.palette.primary, el.style.borderColor || '#2563eb')}"
)

with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'w') as f:
    f.write(content)

