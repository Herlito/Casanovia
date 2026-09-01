import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_commonProps = """                    onDragEnd: handleDragEnd,
                    onTransformEnd: (e: any) => {"""

new_commonProps = """                    onDragEnd: handleDragEnd,
                    onTransform: (e: any) => {
                        if (el.type === 'text') {
                            const node = e.target;
                            node.setAttrs({
                                width: Math.max(5, node.width() * node.scaleX()),
                                scaleX: 1,
                                scaleY: 1
                            });
                        }
                    },
                    onTransformEnd: (e: any) => {"""

content = content.replace(old_commonProps, new_commonProps)

old_text_render_1 = """                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                fontSize={el.style.fontSize || 24}"""

new_text_render_1 = """                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                height={undefined}
                                fontSize={el.style.fontSize || 24}"""

content = content.replace(old_text_render_1, new_text_render_1)

old_text_render_2 = """                            key={el.id}
                            {...commonProps}
                            text={el.content.text}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}"""

new_text_render_2 = """                            key={el.id}
                            {...commonProps}
                            height={undefined}
                            text={el.content.text}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}"""

content = content.replace(old_text_render_2, new_text_render_2)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
