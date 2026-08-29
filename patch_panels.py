import re

# 1. Update LayersPanel
with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace('export const LayersPanel: React.FC = () => {', 'export const LayersPanel: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {')
text = text.replace('w-64 bg-white/80', '${isMobile ? "w-full bg-transparent" : "w-64 bg-white/80"}')
text = text.replace('border border-gray-200/50 rounded-2xl', '${isMobile ? "border-none rounded-none" : "border border-gray-200/50 rounded-2xl"}')
# Wait, let's just do a simple replacement for the outermost div className.
out_div_pattern = r'<div className="w-64 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl flex flex-col h-full wc-layers shadow-sm overflow-hidden">'
new_out_div = '<div className={`flex flex-col h-full wc-layers overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none" : "w-64 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-sm"}`}>'
text = text.replace(out_div_pattern, new_out_div)

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)

# 2. Update RightSidebar
with open('src/WeddingCraft/components/RightSidebar.tsx', 'r') as f:
    text = f.read()

text = text.replace('export const RightSidebar: React.FC = () => {', 'export const RightSidebar: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {')
out_div_pattern2 = r'<div className="w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex flex-col h-full wc-right-sidebar shadow-sm overflow-hidden m-3 ml-0">'
new_out_div2 = '<div className={`flex flex-col h-full wc-right-sidebar overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none m-0" : "w-80 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-sm m-3 ml-0"}`}>'
text = text.replace(out_div_pattern2, new_out_div2)

with open('src/WeddingCraft/components/RightSidebar.tsx', 'w') as f:
    f.write(text)
