import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_text = """                    return (
                        <KonvaText
                            key={el.id}
                            {...commonProps}
                            height={undefined}
                            text={el.content.text}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={!el.style.gradientEnabled ? (el.style.fill || el.style.color || '#000000') : undefined}
                            align={el.style.align || 'left'}
                            {...getGradientProps(el.style, el.transform.width, el.style.fontSize || 24)}
                            onDblClick={() => setEditingTextId(el.id)}
                            onDblTap={() => setEditingTextId(el.id)}
                        />
                    );"""

new_text = """                    let transformedText = el.content.text || '';
                    if (el.style.textTransform === 'uppercase') transformedText = transformedText.toUpperCase();
                    else if (el.style.textTransform === 'lowercase') transformedText = transformedText.toLowerCase();
                    else if (el.style.textTransform === 'capitalize') transformedText = transformedText.replace(/\\b\\w/g, l => l.toUpperCase());
                    
                    const shadowProps = el.style.shadow?.enabled ? {
                        shadowColor: el.style.shadow.color || 'rgba(0,0,0,0.5)',
                        shadowBlur: el.style.shadow.blur || 5,
                        shadowOffsetX: el.style.shadow.offsetX || 2,
                        shadowOffsetY: el.style.shadow.offsetY || 2,
                        shadowOpacity: 1
                    } : {};

                    return (
                        <KonvaText
                            key={el.id}
                            {...commonProps}
                            height={undefined}
                            text={transformedText}
                            width={el.transform.width}
                            fontSize={el.style.fontSize || 24}
                            fontFamily={el.style.fontFamily || 'Arial'}
                            fill={!el.style.gradientEnabled ? (el.style.fill || el.style.color || '#000000') : undefined}
                            align={el.style.align || 'left'}
                            letterSpacing={el.style.letterSpacing || 0}
                            lineHeight={el.style.lineHeight || 1.2}
                            {...shadowProps}
                            {...getGradientProps(el.style, el.transform.width, el.style.fontSize || 24)}
                            onDblClick={() => setEditingTextId(el.id)}
                            onDblTap={() => setEditingTextId(el.id)}
                        />
                    );"""

content = content.replace(old_text, new_text)

# Also fix the editingTextId branch if it exists just in case
old_editing_text = """                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                height={undefined}
                                fontSize={el.style.fontSize || 24}
                                fontFamily={el.style.fontFamily || 'Arial'}
                                fill={el.style.fill || el.style.color || '#000000'}
                                align={el.style.align || 'left'}
                            />"""

new_editing_text = """                            <KonvaText
                                text={editingTextValue || el.content.text}
                                width={el.transform.width}
                                height={undefined}
                                fontSize={el.style.fontSize || 24}
                                fontFamily={el.style.fontFamily || 'Arial'}
                                fill={el.style.fill || el.style.color || '#000000'}
                                align={el.style.align || 'left'}
                                letterSpacing={el.style.letterSpacing || 0}
                                lineHeight={el.style.lineHeight || 1.2}
                            />"""
content = content.replace(old_editing_text, new_editing_text)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
