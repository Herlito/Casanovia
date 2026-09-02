import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Fix CanvasCountdown wrapping
old_countdown = """                if (el.type === 'countdown-widget') {
                    return (
                        <Group key={el.id} {...commonProps}>
                            <CanvasCountdown el={el} commonProps={commonProps} />
                        </Group>
                    );
                }"""

new_countdown = """                if (el.type === 'countdown-widget') {
                    return (
                        <CanvasCountdown key={el.id} el={el} commonProps={commonProps} />
                    );
                }"""

content = content.replace(old_countdown, new_countdown)

# Fix SVG shape stroke defaulting
old_stroke = """                  const stroke = el.style.stroke || undefined;"""
new_stroke = """                  const stroke = el.style.stroke || (el.style.strokeWidth > 0 ? '#000000' : undefined);"""
content = content.replace(old_stroke, new_stroke)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
