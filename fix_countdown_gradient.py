import re

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'r') as f:
    content = f.read()

old_rect_card = """              {el.style.variant === 'cards' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={getCol(theme?.palette.background, el.style.backgroundColor || '#fff')}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={8}
                />
              )}"""

new_rect_card = """              {el.style.variant === 'cards' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={!el.style.gradientEnabled ? getCol(theme?.palette.background, el.style.backgroundColor || '#fff') : undefined}
                  {...getGradientProps(el.style, itemWidth, innerHeight)}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={8}
                />
              )}"""

content = content.replace(old_rect_card, new_rect_card)

old_rect_circle = """              {el.style.variant === 'circles' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={getCol(theme?.palette.background, el.style.backgroundColor || '#fff')}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={Math.min(itemWidth, innerHeight) / 2}
                />
              )}"""

new_rect_circle = """              {el.style.variant === 'circles' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={!el.style.gradientEnabled ? getCol(theme?.palette.background, el.style.backgroundColor || '#fff') : undefined}
                  {...getGradientProps(el.style, itemWidth, innerHeight)}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={Math.min(itemWidth, innerHeight) / 2}
                />
              )}"""

content = content.replace(old_rect_circle, new_rect_circle)

with open('src/WeddingCraft/components/CanvasCountdown.tsx', 'w') as f:
    f.write(content)
