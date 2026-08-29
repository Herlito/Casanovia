import re

with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

text = re.sub(
    r'<div className="w-64 bg-white border-r border-\[#E8DCCF\] flex flex-col h-full wc-layers">',
    r'<div className="w-64 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl flex flex-col h-full wc-layers shadow-sm overflow-hidden">',
    text
)
text = text.replace('bg-[#FAF8F5]', 'bg-white/50 sticky top-0 z-10')
text = text.replace('border-b border-[#E8DCCF]', 'border-b border-gray-200/50')

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)

with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

text = re.sub(
    r'<div className="w-72 bg-white border-l border-\[#E8DCCF\] flex flex-col h-full wc-properties">',
    r'<div className="w-72 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl flex flex-col h-full wc-properties shadow-sm overflow-hidden">',
    text
)
# Make the tabs look iOS-like
text = re.sub(
    r'<div className="flex border-b border-\[#E8DCCF\] bg-white shrink-0">',
    r'<div className="flex border-b border-gray-200/50 bg-white/50 backdrop-blur-xl shrink-0 p-1 gap-1">',
    text
)
text = re.sub(
    r'className={`flex-1 py-2\.5 text-xs font-semibold transition-colors \$\{',
    r'className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${',
    text
)
text = re.sub(
    r"activeTab === 'properties' \? 'border-b-2 border-\[#8B3A4A\] text-\[#8B3A4A\]' : 'text-\[#8C8276\] hover:bg-\[#FAF8F5\]'",
    r"activeTab === 'properties' ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100/50'",
    text
)
text = re.sub(
    r"activeTab === 'themes' \? 'border-b-2 border-\[#8B3A4A\] text-\[#8B3A4A\]' : 'text-\[#8C8276\] hover:bg-\[#FAF8F5\]'",
    r"activeTab === 'themes' ? 'bg-white shadow-sm text-gray-800 border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100/50'",
    text
)

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(text)

