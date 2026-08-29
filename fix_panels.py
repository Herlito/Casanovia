import re

with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

pattern = r'<div className="\$\{isMobile.*?>'
replacement = '<div className={`flex flex-col h-full wc-layers shadow-sm overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none" : "w-64 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl"}`}>'

text = re.sub(pattern, replacement, text)

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)


with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

# I did:
# new_out_div2 = '<div className={`flex flex-col h-full wc-right-sidebar overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none m-0" : "w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-sm m-3 ml-0"}`}>'
# So that one might be fine!
