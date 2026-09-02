import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# For text Transformation buttons
content = re.sub(r'className="([^"]*flex-1 text-xs py-1[^"]*)"', r'className="\1 text-gray-900"', content)

# For Espaciado Letras / Altura de línea range inputs? 
# They look fine, but wait, the text next to sizes `-` and `+` need text-gray-900
content = re.sub(r'className="px-2 py-1 bg-gray-100 rounded"', r'className="px-2 py-1 bg-gray-100 rounded text-gray-900"', content)

# Check textarea
content = re.sub(r'className="w-full text-xs p-2 border border-\[#D9CEBF\] rounded-lg bg-\[#FAF8F5\] resize-none"', r'className="w-full text-xs p-2 border border-[#D9CEBF] rounded-lg bg-[#FAF8F5] resize-none text-gray-900"', content)

# Check hex input
content = re.sub(r'className="flex-1 text-xs p-1.5 border border-\[#D9CEBF\] rounded uppercase font-mono"', r'className="flex-1 text-xs p-1.5 border border-[#D9CEBF] rounded uppercase font-mono text-gray-900"', content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
