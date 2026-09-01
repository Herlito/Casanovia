import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_render = """                if (el.type === 'svg-shape') {
                  const fill = el.style.fill || '#cccccc';
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
                    return <Rect key={el.id} {...commonProps} fill={fill} stroke={stroke} strokeWidth={strokeWidth} cornerRadius={cornerRadius} />;
                  }
                }"""

new_render = """                if (el.type === 'svg-shape') {
                  const fill = el.style.fill || '#cccccc';
                  const stroke = el.style.stroke || undefined;
                  const strokeWidth = el.style.strokeWidth || 0;
                  const cornerRadius = el.style.borderRadius || 0;
                  const w = el.transform.width;
                  const h = el.transform.height;
                  
                  const isGradient = el.style.gradientEnabled;
                  let gradientProps: any = {};
                  if (isGradient) {
                      const colors = el.style.gradientColors || ['#ff0000', '#0000ff'];
                      const stops = el.style.gradientStops || [0, 1];
                      let colorStops: any[] = [];
                      stops.forEach((stop, idx) => {
                          colorStops.push(stop);
                          colorStops.push(colors[idx] || colors[0]);
                      });
                      
                      if (el.style.gradientType === 'radial') {
                          gradientProps = {
                              fillRadialGradientStartPoint: { x: w/2, y: h/2 },
                              fillRadialGradientStartRadius: 0,
                              fillRadialGradientEndPoint: { x: w/2, y: h/2 },
                              fillRadialGradientEndRadius: Math.max(w, h) / 2,
                              fillRadialGradientColorStops: colorStops,
                          };
                      } else {
                          gradientProps = {
                              fillLinearGradientStartPoint: { x: 0, y: 0 },
                              fillLinearGradientEndPoint: { x: w, y: h },
                              fillLinearGradientColorStops: colorStops,
                          };
                      }
                  }

                  const shapeProps = {
                      ...commonProps,
                      stroke,
                      strokeWidth,
                      ...(isGradient ? gradientProps : { fill })
                  };
                  
                  if (el.style.variant === 'line') {
                    return <Line key={el.id} {...shapeProps} points={[0, h/2, w, h/2]} />;
                  } else if (el.style.variant === 'circle') {
                    return <Circle key={el.id} {...shapeProps} x={w/2} y={h/2} radius={Math.min(w, h)/2} />;
                  } else if (el.style.variant === 'triangle') {
                    return <RegularPolygon key={el.id} {...shapeProps} x={w/2} y={h/2} sides={3} radius={Math.min(w, h)/2} />;
                  } else if (el.style.variant === 'pentagon') {
                    return <RegularPolygon key={el.id} {...shapeProps} x={w/2} y={h/2} sides={5} radius={Math.min(w, h)/2} />;
                  } else {
                    return <Rect key={el.id} {...shapeProps} cornerRadius={cornerRadius} />;
                  }
                }"""

content = content.replace(old_render, new_render)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
