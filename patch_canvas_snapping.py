import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Add state for guidelines
if 'const [guidelines, setGuidelines]' not in content:
    content = content.replace(
        'const [stageSize, setStageSize] = useState({ width: 0, height: 0 });',
        'const [stageSize, setStageSize] = useState({ width: 0, height: 0 });\n  const [guidelines, setGuidelines] = useState<{points: number[], stroke: string}[]>([]);'
    )

# Add name="element" and snapping to commonProps
regex_common = re.compile(r'(const commonProps = \{)(.*?)(onClick: \(\) => selectElements)', re.DOTALL)
def repl_common(m):
    return m.group(1) + m.group(2) + """name: "element",
                  onDragMove: (e: any) => {
                    const node = e.target;
                    const stage = node.getStage();
                    const lines = [];
                    const threshold = 10;
                    const box = node.getClientRect();
                    const absPos = node.absolutePosition();
                    
                    const others = stage.find('.element').filter((el: any) => el !== node);
                    
                    let snappedX = false;
                    let snappedY = false;
                    
                    others.forEach((other: any) => {
                      const oBox = other.getClientRect();
                      
                      // Horizontal Center
                      if (!snappedX && Math.abs((box.x + box.width / 2) - (oBox.x + oBox.width / 2)) < threshold) {
                        node.x(node.x() + ((oBox.x + oBox.width / 2) - (box.x + box.width / 2)));
                        lines.push({ points: [oBox.x + oBox.width / 2, 0, oBox.x + oBox.width / 2, stage.height()], stroke: '#3b82f6' });
                        snappedX = true;
                      }
                      // Left Edge
                      if (!snappedX && Math.abs(box.x - oBox.x) < threshold) {
                        node.x(node.x() + (oBox.x - box.x));
                        lines.push({ points: [oBox.x, 0, oBox.x, stage.height()], stroke: '#10b981' });
                        snappedX = true;
                      }
                      // Right Edge
                      if (!snappedX && Math.abs((box.x + box.width) - (oBox.x + oBox.width)) < threshold) {
                        node.x(node.x() + ((oBox.x + oBox.width) - (box.x + box.width)));
                        lines.push({ points: [oBox.x + oBox.width, 0, oBox.x + oBox.width, stage.height()], stroke: '#10b981' });
                        snappedX = true;
                      }
                      
                      // Vertical Center
                      if (!snappedY && Math.abs((box.y + box.height / 2) - (oBox.y + oBox.height / 2)) < threshold) {
                        node.y(node.y() + ((oBox.y + oBox.height / 2) - (box.y + box.height / 2)));
                        lines.push({ points: [0, oBox.y + oBox.height / 2, stage.width(), oBox.y + oBox.height / 2], stroke: '#3b82f6' });
                        snappedY = true;
                      }
                      // Top Edge
                      if (!snappedY && Math.abs(box.y - oBox.y) < threshold) {
                        node.y(node.y() + (oBox.y - box.y));
                        lines.push({ points: [0, oBox.y, stage.width(), oBox.y], stroke: '#10b981' });
                        snappedY = true;
                      }
                      // Bottom Edge
                      if (!snappedY && Math.abs((box.y + box.height) - (oBox.y + oBox.height)) < threshold) {
                        node.y(node.y() + ((oBox.y + oBox.height) - (box.y + box.height)));
                        lines.push({ points: [0, oBox.y + oBox.height, stage.width(), oBox.y + oBox.height], stroke: '#10b981' });
                        snappedY = true;
                      }
                    });
                    
                    setGuidelines(lines);
                  },
                  """ + m.group(3)

content = regex_common.sub(repl_common, content)

# Clear guidelines on drag end
content = content.replace(
    'onDragEnd: (e: any) => {',
    'onDragEnd: (e: any) => {\n                    setGuidelines([]);'
)

# Render guidelines in Layer
from_render = '<Layer>'
to_render = """<Layer>
            {guidelines.map((line, i) => (
              <import_line_placeholder key={`guide-${i}`} points={line.points} stroke={line.stroke} strokeWidth={1} dash={[4, 4]} />
            ))}"""

content = content.replace(from_render, to_render)
content = content.replace('<import_line_placeholder', '<Line')

# Import Line if not there
if 'Line' not in content[:200]:
    content = content.replace('Rect, Transformer, Circle', 'Rect, Transformer, Circle, Line')

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
