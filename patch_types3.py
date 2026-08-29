import re

with open('src/WeddingCraft/types.ts', 'r') as f:
    text = f.read()

text = text.replace('theme: any; // Will be properly typed below, circumventing circular imports if they arise, or just use import', 'theme: any;\n  customThemes?: any[];')

with open('src/WeddingCraft/types.ts', 'w') as f:
    f.write(text)
