import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    text = f.read()

text = text.replace('backgroundColor?: string;', 'backgroundColor?: string;\n  containerBackgroundColor?: string;\n  containerOpacity?: number;')

with open('src/WeddingCraft/types.ts', 'w') as f:
    f.write(text)
