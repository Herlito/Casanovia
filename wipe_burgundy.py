import os
import re

maroon_hexes = ['#8B3A4A', '#6B2D38', '#7D3442', '#54212C', '#6E2937']

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        original_content = content

    for hx in maroon_hexes:
        # replace any remaining exact matches in brackets with dark gray, except if it was meant to be a background. 
        # But we already did backgrounds. So whatever is left is text, stroke, fill, border etc.
        content = content.replace(f'[{hx}]', '[#2D3748]')
        content = content.replace(f'{hx}', '#2D3748')
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts') or file.endswith('.css'):
            process_file(os.path.join(root, file))

