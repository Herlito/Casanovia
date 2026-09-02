import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_common_props = """                const commonProps = {
                    id: el.id,
                    name: "wc-element",
                    x: el.transform.x,
                    y: el.transform.y,"""

new_common_props = """                const commonProps = {
                    id: el.id,
                    name: "wc-element",
                    opacity: el.style.opacity ?? 1,
                    x: el.transform.x,
                    y: el.transform.y,"""

content = content.replace(old_common_props, new_common_props)

old_svg_fill = """                  const fill = el.style.fill || '#cccccc';
                  const stroke = el.style.stroke || (el.style.strokeWidth > 0 ? '#000000' : undefined);"""

new_svg_fill = """                  const isDef = el.style.isDefaultStyle && document.theme;
                  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
                  const fill = getCol(document.theme?.palette.primary, el.style.fill || '#cccccc');
                  const stroke = getCol(document.theme?.palette.text, el.style.stroke || (el.style.strokeWidth > 0 ? '#000000' : undefined));"""

content = content.replace(old_svg_fill, new_svg_fill)

old_audio_fill = """                if (el.type === 'audio-player') {
                  const bgColor = el.style.backgroundColor || 'rgba(255,255,255,0.8)';
                  const iconColor = el.style.color || '#000000';"""

new_audio_fill = """                if (el.type === 'audio-player') {
                  const isDef = el.style.isDefaultStyle && document.theme;
                  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
                  const bgColor = getCol(document.theme?.palette.background, el.style.backgroundColor || 'rgba(255,255,255,0.8)');
                  const iconColor = getCol(document.theme?.palette.primary, el.style.color || '#000000');"""

content = content.replace(old_audio_fill, new_audio_fill)

old_text_fill_1 = """                                fill={!el.style.gradientEnabled ? (el.style.fill || el.style.color || '#000000') : undefined}"""
new_text_fill_1 = """                                fill={!el.style.gradientEnabled ? (el.style.isDefaultStyle && document.theme ? document.theme.palette.text : (el.style.fill || el.style.color || '#000000')) : undefined}"""
content = content.replace(old_text_fill_1, new_text_fill_1)


with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)


with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'r') as f:
    content = f.read()

old_btn_rect = """        fill={isOutline ? 'transparent' : (!el.style.gradientEnabled ? (el.style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(el.style, el.transform.width, el.transform.height))}
        stroke={el.style.backgroundColor || '#000'}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={el.style.borderRadius || 8}
      />
      <KonvaText
        text={el.content.text || 'Botón'}
        width={el.transform.width}
        height={el.transform.height}
        align="center"
        verticalAlign="middle"
        fontSize={el.style.fontSize || 16}
        fontFamily={el.style.fontFamily || 'Arial'}
        fill={isOutline ? (el.style.backgroundColor || '#000') : (el.style.color || '#fff')}"""

new_btn_rect = """        fill={isOutline ? 'transparent' : (!el.style.gradientEnabled ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(el.style, el.transform.width, el.transform.height))}
        stroke={getCol(theme?.palette.primary, el.style.backgroundColor || '#000')}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={el.style.borderRadius || 8}
      />
      <KonvaText
        text={el.content.text || 'Botón'}
        width={el.transform.width}
        height={el.transform.height}
        align="center"
        verticalAlign="middle"
        fontSize={el.style.fontSize || 16}
        fontFamily={el.style.fontFamily || 'Arial'}
        fill={isOutline ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : getCol(theme?.palette.background, el.style.color || '#fff')}"""

content = content.replace(old_btn_rect, new_btn_rect)

with open('src/WeddingCraft/components/CanvasInteractiveButton.tsx', 'w') as f:
    f.write(content)
