import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        original_content = content

    # 1. Backgrounds
    content = re.sub(r'bg-gradient-to-r from-\[\#6B2D38\] via-\[\#7D3442\] to-\[\#8B3A4A\]', 'bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]', content)
    
    # Generic burgundy replacements
    content = content.replace('bg-[#8B3A4A]', 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]')
    content = content.replace('bg-[#6B2D38]', 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]')
    content = content.replace('bg-[#54212C]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#7D3442]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#6E2937]', 'bg-[#EBEBEB]')
    content = content.replace('hover:bg-[#6E2937]', 'hover:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]')
    content = content.replace('hover:bg-[#8B3A4A]', 'hover:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]')
    content = content.replace('active:bg-[#6E2937]', 'active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]')
    
    # Text colors
    content = content.replace('text-[#8B3A4A]', 'text-[#2D3748]')
    content = content.replace('text-white', 'text-[#2D3748]')
    content = content.replace('text-[#F7E7CE]', 'text-[#4A5568]')
    content = content.replace('text-stone-200', 'text-[#4A5568]')
    content = content.replace('text-stone-100', 'text-[#4A5568]')
    
    # White / Off-white backgrounds -> EBEBEB
    # Need to be careful with 'bg-white' to not replace it inside words, so use regex with boundaries or standard classes
    content = re.sub(r'\bbg-white\b', 'bg-[#EBEBEB]', content)
    content = content.replace('bg-[#FDFBF7]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#F7F3EE]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#FAF7F2]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#F9F8F6]', 'bg-[#EBEBEB]')
    content = content.replace('bg-[#F0F0F3]', 'bg-[#EBEBEB]')
    
    # Neumorphic card replacements from previous setups
    content = content.replace('shadow-sm', 'shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]')
    content = content.replace('shadow-md', 'shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]')
    content = content.replace('shadow-lg', 'shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]')
    
    # Borders
    content = re.sub(r'border-\[\#E8DCCF\]', 'border-transparent', content)
    content = re.sub(r'border-\[\#EDE5DA\]', 'border-transparent', content)
    content = re.sub(r'border-\[\#8B3A4A\](\/[0-9]+)?', 'border-transparent', content)
    content = re.sub(r'border-white(\/[0-9]+)?', 'border-transparent', content)

    # Specific fixes
    content = content.replace('fill-[#8B3A4A]', 'fill-[#2D3748]')
    content = content.replace('shadow-[#8B3A4A]', 'shadow-[#d1d1d1]')
    content = content.replace('ring-[#8B3A4A]', 'ring-[#d1d1d1]')
    
    # Clean up double text classes if any resulted from replacements
    content = re.sub(r'text-\[\#2D3748\]\s+text-\[\#2D3748\]', 'text-[#2D3748]', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

