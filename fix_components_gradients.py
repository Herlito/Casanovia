import re

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'r') as f:
    content = f.read()

# Add getGradientProps import
if "getGradientProps" not in content:
    content = content.replace("import { CanvasElement } from '../types';", "import { CanvasElement } from '../types';\nimport { getGradientProps } from './CanvasStage';")

# Apply gradient to the Background Rect
old_bg = """        <Rect
          width={el.transform.width}
          height={el.transform.height}
          fill={getCol(theme?.palette.background, el.style.backgroundColor || '#ffffff')}"""

new_bg = """        <Rect
          width={el.transform.width}
          height={el.transform.height}
          fill={!el.style.gradientEnabled ? getCol(theme?.palette.background, el.style.backgroundColor || '#ffffff') : undefined}
          {...getGradientProps(el.style, el.transform.width, el.transform.height)}"""

content = content.replace(old_bg, new_bg)

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'w') as f:
    f.write(content)


with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'r') as f:
    content = f.read()

if "getGradientProps" not in content:
    content = content.replace("import { CanvasElement } from '../types';", "import { CanvasElement } from '../types';\nimport { getGradientProps } from './CanvasStage';")

old_button_bg = """      <Rect
        width={el.transform.width}
        height={el.transform.height}
        fill={isOutline ? 'transparent' : (el.style.backgroundColor || '#000')}"""

new_button_bg = """      <Rect
        width={el.transform.width}
        height={el.transform.height}
        fill={isOutline ? 'transparent' : (!el.style.gradientEnabled ? (el.style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(el.style, el.transform.width, el.transform.height))}"""

content = content.replace(old_button_bg, new_button_bg)

with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'w') as f:
    f.write(content)
