import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# I will replace the svg-shape rendering to wrap in a Group.
old_svg_shape = """                  if (el.style.variant === 'line') {
                    return <Line key={el.id} {...shapeProps} points={[0, h/2, w, h/2]} />;
                  } else if (el.style.variant === 'circle') {
                    return <Circle key={el.id} {...shapeProps} x={w/2} y={h/2} radius={Math.min(w, h)/2} />;
                  } else if (el.style.variant === 'triangle') {
                    return <RegularPolygon key={el.id} {...shapeProps} x={w/2} y={h/2} sides={3} radius={Math.min(w, h)/2} />;
                  } else if (el.style.variant === 'pentagon') {
                    return <RegularPolygon key={el.id} {...shapeProps} x={w/2} y={h/2} sides={5} radius={Math.min(w, h)/2} />;
                  } else {
                    return <Rect key={el.id} {...shapeProps} cornerRadius={cornerRadius} />;
                  }"""

new_svg_shape = """                  const visualProps = { stroke, strokeWidth, ...(isGradient ? gradientProps : { fill }) };
                  let innerShape;
                  if (el.style.variant === 'line') {
                    innerShape = <Line points={[0, h/2, w, h/2]} {...visualProps} />;
                  } else if (el.style.variant === 'circle') {
                    innerShape = <Circle x={w/2} y={h/2} radius={Math.min(w, h)/2} {...visualProps} />;
                  } else if (el.style.variant === 'triangle') {
                    innerShape = <RegularPolygon x={w/2} y={h/2} sides={3} radius={Math.min(w, h)/2} {...visualProps} />;
                  } else if (el.style.variant === 'pentagon') {
                    innerShape = <RegularPolygon x={w/2} y={h/2} sides={5} radius={Math.min(w, h)/2} {...visualProps} />;
                  } else {
                    innerShape = <Rect width={w} height={h} cornerRadius={cornerRadius} {...visualProps} />;
                  }
                  
                  return (
                    <Group key={el.id} {...commonProps}>
                      {innerShape}
                    </Group>
                  );"""

content = content.replace(old_svg_shape, new_svg_shape)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
