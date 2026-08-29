import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# 1. Compact Header & Padding
text = text.replace(
    'className="p-3 border-b border-[#E8DCCF] bg-[#FAF8F5]"', 
    'className="p-3 border-b border-gray-200/50 bg-white/50 backdrop-blur-md sticky top-0 z-10"'
)

text = text.replace(
    'className="p-4 space-y-5"',
    'className="p-3 space-y-4"'
)

# 2. Compact text/label styles
# Replace: className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5"
text = re.sub(
    r'className="block text-\[10px\] font-bold text-\[#8C8276\] uppercase tracking-wider mb-1\.5"',
    r'className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1"',
    text
)

# Replace: text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]
text = re.sub(
    r'text-xs p-2 border border-\[#D9CEBF\] rounded bg-\[#FAF8F5\]',
    r'text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all',
    text
)

# Replace: w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer
text = re.sub(
    r'w-full h-8 p-1 border border-\[#D9CEBF\] rounded bg-\[#FAF8F5\] cursor-pointer',
    r'w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer',
    text
)

# 3. Compact flex containers
# e.g., grid grid-cols-2 gap-2 -> gap-1.5
text = text.replace('grid-cols-2 gap-2', 'grid-cols-2 gap-1.5')

# 4. Compact the "Propiedades del Objeto" label
text = text.replace(
    '<h3 className="text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">',
    '<h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">'
)
text = text.replace('text-[#8B3A4A]', 'text-gray-800')

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
