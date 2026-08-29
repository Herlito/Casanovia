import os
import re

def replace_in_file(filepath, pattern, replacement, flags=0):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f:
        text = f.read()
    new_text = re.sub(pattern, replacement, text, flags=flags)
    with open(filepath, 'w') as f:
        f.write(new_text)

# 1. WeddingCraftEditor.tsx
replace_in_file(
    'src/WeddingCraft/components/WeddingCraftEditor.tsx',
    r'<div className="fixed inset-0 z-\[9999\] bg-gray-50 flex flex-col wc-editor-root font-sans">\s*<Toolbar />\s*<div className="flex-1 flex overflow-hidden">',
    '<div className="fixed inset-0 z-[9999] bg-[#f2f2f7] flex flex-col wc-editor-root font-sans">\n      <Toolbar />\n      <div className="flex-1 flex overflow-hidden p-3 gap-3">'
)

# 2. Toolbar.tsx
replace_in_file(
    'src/WeddingCraft/components/Toolbar.tsx',
    r'<div className="h-14 bg-white border-b border-\[#E8DCCF\] flex items-center justify-between px-4 wc-toolbar z-10 relative shadow-sm">',
    '<div className="m-3 mb-0 h-14 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex items-center justify-between px-4 wc-toolbar z-10 relative shadow-sm">'
)

# 3. LayersPanel.tsx
replace_in_file(
    'src/WeddingCraft/components/LayersPanel.tsx',
    r'<div className="w-64 bg-white border-r border-\[#E8DCCF\] flex flex-col wc-layers-panel z-10 shadow-sm">',
    '<div className="w-64 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex flex-col wc-layers-panel z-10 shadow-sm overflow-hidden">'
)

# 4. RightSidebar.tsx
replace_in_file(
    'src/WeddingCraft/components/RightSidebar.tsx',
    r'<div className="w-72 bg-white border-l border-\[#E8DCCF\] flex flex-col wc-properties-panel z-10 shadow-sm">',
    '<div className="w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex flex-col wc-properties-panel z-10 shadow-sm overflow-hidden">'
)

print("iOS Patch applied")
