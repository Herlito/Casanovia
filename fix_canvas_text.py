import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { CanvasText } from './CanvasText';\n", "")

text_render_orig = """                if (el.type === 'text') {
                  return (
                    <CanvasText
                      key={el.id}
                      element={el}
                      commonProps={commonProps}
                      isEditing={editingTextId === el.id}
                      onDoubleClick={() => setEditingTextId(el.id)}
                    />
                  );
                }"""

text_render_new = """                if (el.type === 'text') {
                    if (editingTextId === el.id) {
                      return (
                        <Group key={el.id} {...commonProps}>
                            {/* In-place HTML Input for editing would typically go here or be overlaid. We will just show normal text in the canvas and let the properties panel handle edits for now, or just a simple Text node. */}
                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                fontSize={el.style.fontSize || 24}
                                fontFamily={el.style.fontFamily || 'Arial'}
                                fill={el.style.color || '#000000'}
                                align={el.style.textAlign || 'left'}
                            />
                        </Group>
                      );
                    }

                    return (
                        <KonvaText
                            key={el.id}
                            {...commonProps}
                            text={el.content.text}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={el.style.color || '#000000'}
                            align={el.style.textAlign || 'left'}
                            onDblClick={() => setEditingTextId(el.id)}
                            onDblTap={() => setEditingTextId(el.id)}
                        />
                    );
                }"""

content = content.replace(text_render_orig, text_render_new)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
