import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Add audio-player rendering
audio_render = """
                if (el.type === 'audio-player') {
                  const bgColor = el.style.backgroundColor || 'rgba(255,255,255,0.8)';
                  const iconColor = el.style.color || '#000000';
                  const w = el.transform.width;
                  const h = el.transform.height;
                  const radius = Math.min(w, h) / 2;
                  
                  return (
                    <Group key={el.id} {...commonProps}>
                      <Circle x={w/2} y={h/2} radius={radius} fill={bgColor} shadowColor="black" shadowBlur={5} shadowOpacity={0.2} shadowOffsetY={2} />
                      {/* Play icon */}
                      <Line x={w/2 - radius/4} y={h/2 - radius/3} points={[0, 0, 0, radius*2/3, radius*2/3, radius/3]} fill={iconColor} closed={true} />
                    </Group>
                  );
                }
"""

if "el.type === 'audio-player'" not in content:
    content = content.replace("if (el.type === 'svg-shape') {", audio_render + "\n                if (el.type === 'svg-shape') {")
    with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
        f.write(content)
