import re

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'r') as f:
    text = f.read()

# Make it look more clean/iOS
text = re.sub(
    r'w-full text-xs p-2 border border-\[#D9CEBF\] rounded bg-\[#FAF8F5\]',
    r'w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white transition-all',
    text
)
text = re.sub(
    r'w-full h-8 cursor-pointer rounded',
    r'w-full h-7 p-0.5 border border-gray-200 cursor-pointer rounded bg-gray-50/50',
    text
)

text = re.sub(
    r'block text-\[10px\] font-bold text-\[#8C8276\] uppercase tracking-wider mb-1\.5',
    r'block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1',
    text
)

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'w') as f:
    f.write(text)
