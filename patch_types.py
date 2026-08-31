import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "type: 'text' | 'image' | 'svg-shape' | 'countdown-widget' | 'decorative-element' | 'interactive-button';",
    "type: 'text' | 'image' | 'svg-shape' | 'countdown-widget' | 'decorative-element' | 'interactive-button' | 'audio-player';"
)

with open('src/WeddingCraft/types.ts', 'w') as f:
    f.write(content)

