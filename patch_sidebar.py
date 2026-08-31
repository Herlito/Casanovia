import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    content = f.read()

# Replace main background
content = re.sub(
    r'min-h-screen bg-\[\#F0F0F3\][^\"]*|min-h-screen bg-\[\#F7F3EE\][^\"]*', 
    'min-h-screen bg-[#EBEBEB] text-gray-800 flex flex-col', 
    content
)

# Replace header
content = re.sub(
    r'<header className=\{isNeumorphic \? "bg-\[\#F0F0F3\].*? : "bg-\[\#6B2D38\].*?\}',
    '<header className="bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sticky top-16 sm:top-20 z-30"',
    content
)

# Fix Wedding Selector Dropdown Button (top bar)
content = re.sub(
    r'<button\s+onClick=\{.*?\}.*?className="flex items-center space-x-2\.5 bg-\[\#54212C\]\/60 border border-\[\#8B3A4A\]\/40 rounded-2xl px-3\.5 py-1\.5 hover:bg-\[\#54212C\] transition-colors cursor-pointer w-full text-left"',
    '<button onClick={() => setWeddingDropdownOpen(!weddingDropdownOpen)} className="flex items-center space-x-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl px-3.5 py-1.5 transition-all cursor-pointer w-full text-left border-none"',
    content
)
# Need to make sure I don't break logic.
