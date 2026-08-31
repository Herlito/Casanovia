import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

if 'RegularPolygon' not in content:
    content = content.replace('Circle,', 'Circle, RegularPolygon,')

audio_component = """
const CanvasAudioPlayer = ({ el, commonProps }: { el: CanvasElement, commonProps: any }) => {
  const bgColor = el.style.backgroundColor || '#EBEBEB';
  const textColor = el.style.color || '#2D3748';
  const radius = el.style.borderRadius ?? 24;
  return (
    <Group {...commonProps}>
      <Rect
        width={commonProps.width}
        height={commonProps.height}
        fill={bgColor}
        cornerRadius={radius}
        shadowColor="#d1d1d1"
        shadowBlur={12}
        shadowOffsetX={6}
        shadowOffsetY={6}
        shadowOpacity={1}
      />
      {/* Play Button Background */}
      <Circle
        x={commonProps.height / 2}
        y={commonProps.height / 2}
        radius={(commonProps.height / 2) - 8}
        fill={textColor}
      />
      {/* Play Triangle */}
      <RegularPolygon
        x={commonProps.height / 2 + 2}
        y={commonProps.height / 2}
        sides={3}
        radius={(commonProps.height / 2) - 16}
        fill={bgColor}
        rotation={90}
      />
      <Text
        x={commonProps.height}
        y={0}
        width={commonProps.width - commonProps.height}
        height={commonProps.height}
        text={el.content.title || "Audio"}
        fill={textColor}
        fontSize={14}
        fontFamily="sans-serif"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
};
"""

# Insert CanvasAudioPlayer before CanvasStage component
content = content.replace("export const CanvasStage = ({", audio_component + "\n\nexport const CanvasStage = ({")

# Insert in render loop
render_block = """
                if (el.type === 'interactive-button') {
                  return (
                    <CanvasInteractiveButton
                      key={el.id}
                      el={el}
                      commonProps={commonProps}
                    />
                  );
                }
                
                if (el.type === 'audio-player') {
                  return <CanvasAudioPlayer key={el.id} el={el} commonProps={commonProps} />;
                }
"""

content = re.sub(r'if \(el\.type === \'interactive-button\'\) \{[\s\S]*?<\/CanvasInteractiveButton>\s*\);\s*\}', render_block, content)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)

