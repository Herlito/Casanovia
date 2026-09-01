import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

if 'RegularPolygon' not in content:
    content = content.replace('Rect, Transformer, Circle, Line', 'Rect, Transformer, Circle, Line, RegularPolygon')
    content = content.replace('Rect, Transformer, Circle', 'Rect, Transformer, Circle, Line, RegularPolygon')

shape_render_orig = r"""if \(el\.type === 'svg-shape'\) \{
                  return \(
                    <Rect
                      key=\{el\.id\}
                      \{\.\.\.commonProps\}
                      fill=\{el\.style\.isDefaultStyle \? document\.theme\.palette\.primary : \(el\.style\.fill \|\| '#cccccc'\)\}
                    />
                  \);
                \}"""

shape_render_new = """if (el.type === 'svg-shape') {
                  const fill = el.style.isDefaultStyle ? document.theme.palette.primary : (el.style.fill || '#cccccc');
                  const stroke = el.style.stroke || undefined;
                  const strokeWidth = el.style.strokeWidth || 0;
                  const cornerRadius = el.style.borderRadius || 0;
                  const w = el.transform.width;
                  const h = el.transform.height;
                  
                  if (el.style.variant === 'line') {
                    return <Line key={el.id} {...commonProps} points={[0, h/2, w, h/2]} stroke={fill} strokeWidth={strokeWidth || 4} />;
                  } else if (el.style.variant === 'circle') {
                    return <Circle key={el.id} {...commonProps} x={w/2} y={h/2} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else if (el.style.variant === 'triangle') {
                    return <RegularPolygon key={el.id} {...commonProps} x={w/2} y={h/2} sides={3} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else if (el.style.variant === 'pentagon') {
                    return <RegularPolygon key={el.id} {...commonProps} x={w/2} y={h/2} sides={5} radius={Math.min(w, h)/2} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
                  } else {
                    return (
                      <Rect
                        key={el.id}
                        {...commonProps}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        cornerRadius={cornerRadius}
                      />
                    );
                  }
                }"""

content = re.sub(shape_render_orig, shape_render_new, content)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
