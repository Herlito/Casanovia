import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    text = f.read()

# Add editing state
state_to_add = """  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const [editingTextPos, setEditingTextPos] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0, fontSize: 16, fontFamily: '' });
"""
text = text.replace("  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });", state_to_add)

# Update checkDeselect
deselect_patch = """  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'background-rect';
    if (clickedOnEmpty) {
      selectElements([]);
      if (editingTextId) handleFinishEditing();
    }
  };

  const handleFinishEditing = () => {
    if (editingTextId) {
      updateElement(editingTextId, { content: { text: editingTextValue } });
      setEditingTextId(null);
    }
  };"""
text = text.replace("  const checkDeselect = (e: any) => {\n    const clickedOnEmpty = e.target === e.target.getStage() || e.target.id() === 'background-rect';\n    if (clickedOnEmpty) {\n      selectElements([]);\n    }\n  };", deselect_patch)

# Update text rendering
text_render = """                if (el.type === 'text') {
                  const resolvedText = getResolvedText(el);
                  const isEditing = editingTextId === el.id;
                  let displayValue = resolvedText;
                  if (el.style.textTransform === 'uppercase') displayValue = displayValue.toUpperCase();
                  if (el.style.textTransform === 'lowercase') displayValue = displayValue.toLowerCase();
                  if (el.style.textTransform === 'capitalize') displayValue = displayValue.replace(/\b\w/g, l => l.toUpperCase());
                  
                  return (
                    <Text
                      key={el.id}
                      {...commonProps}
                      visible={!isEditing && el.visible}
                      text={displayValue}
                      fontSize={el.style.fontSize || 24}
                      fill={el.style.fill || el.style.color || '#000'}
                      fontFamily={el.style.fontFamily || 'Arial'}
                      fontStyle={`${el.style.fontStyle || 'normal'} ${el.style.fontWeight || 'normal'}`.trim()}
                      align={el.style.align || 'left'}
                      letterSpacing={el.style.letterSpacing || 0}
                      lineHeight={el.style.lineHeight || 1.2}
                      opacity={el.style.opacity ?? 1}
                      shadowColor={el.style.shadow?.enabled ? el.style.shadow.color : undefined}
                      shadowBlur={el.style.shadow?.enabled ? el.style.shadow.blur : 0}
                      shadowOffsetX={el.style.shadow?.enabled ? el.style.shadow.offsetX : 0}
                      shadowOffsetY={el.style.shadow?.enabled ? el.style.shadow.offsetY : 0}
                      stroke={el.style.strokeEnabled ? el.style.stroke : undefined}
                      strokeWidth={el.style.strokeEnabled ? el.style.strokeWidth : 0}
                      onDblClick={(e) => {
                         if (!el.dataBinding) {
                           const textNode = e.target;
                           const absPos = textNode.getAbsolutePosition();
                           setEditingTextPos({
                             x: absPos.x,
                             y: absPos.y,
                             width: textNode.width() * textNode.scaleX(),
                             height: textNode.height() * textNode.scaleY(),
                             rotation: textNode.rotation(),
                             fontSize: (el.style.fontSize || 24) * textNode.scaleY(),
                             fontFamily: el.style.fontFamily || 'Arial'
                           });
                           setEditingTextValue(el.content.text || '');
                           setEditingTextId(el.id);
                         }
                      }}
                    />
                  );
                }"""

text = re.sub(r"                if \(el\.type === 'text'\) \{.*?return null;\n              \}\)", text_render + "\n                if (el.type === 'svg-shape') {\n                  return (\n                    <Rect\n                      key={el.id}\n                      {...commonProps}\n                      fill={el.style.fill || '#cccccc'}\n                    />\n                  );\n                }\n                return null;\n              })", text, flags=re.DOTALL)

# Add textarea
textarea_html = """          </Stage>
          {editingTextId && (
            <textarea
              value={editingTextValue}
              onChange={(e) => setEditingTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleFinishEditing();
              }}
              onBlur={handleFinishEditing}
              autoFocus
              style={{
                position: 'absolute',
                top: editingTextPos.y + 'px',
                left: editingTextPos.x + 'px',
                width: editingTextPos.width + 'px',
                height: editingTextPos.height + 20 + 'px',
                fontSize: editingTextPos.fontSize + 'px',
                fontFamily: `"${editingTextPos.fontFamily}", sans-serif`,
                border: '1px solid #8B3A4A',
                padding: '0px',
                margin: '0px',
                overflow: 'hidden',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                lineHeight: 'normal',
                transform: `rotate(${editingTextPos.rotation}deg)`,
                transformOrigin: 'left top',
                color: '#2D2A26',
                zIndex: 100
              }}
            />
          )}
        </div>"""
text = text.replace("          </Stage>\n        </div>", textarea_html)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(text)
