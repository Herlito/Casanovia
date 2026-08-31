import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    content = f.read()

# Replace the root container
content = re.sub(
    r'className=\{isNeumorphic \? "min-h-screen bg-\[\#F0F0F3\].*?\}',
    'className="min-h-screen bg-[#EBEBEB] text-gray-800 flex flex-col"',
    content
)

# Replace the header
content = re.sub(
    r'<header className=\{isNeumorphic \? "bg-\[\#F0F0F3\].*?\}',
    '<header className="bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] sticky top-16 sm:top-20 z-30"',
    content
)

# Replace the couple initial container
content = re.sub(
    r'<div className=\{isNeumorphic \? "flex items-center space-x-2\.5 bg-\[\#F0F0F3\].*?\}',
    '<div className="flex items-center space-x-2.5 bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] rounded-2xl px-3.5 py-1.5 shrink-0 border-none"',
    content
)
content = re.sub(
    r'<div className=\{isNeumorphic \? "w-8 h-8 rounded-full bg-\[\#F0F0F3\].*?\}',
    '<div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] text-gray-800 flex items-center justify-center font-serif-display font-bold text-xs shrink-0"',
    content
)
content = re.sub(
    r'className=\{`font-serif-display font-bold text-sm sm:text-base tracking-wide truncate block max-w-\[160px\] sm:max-w-\[220px\] \$\{isNeumorphic \? "text-\[\#6D7587\]" : "text-white"\}\`\}',
    'className="font-serif-display font-bold text-sm sm:text-base tracking-wide truncate block max-w-[160px] sm:max-w-[220px] text-gray-700"',
    content
)

# Replace the Nav Tabs (Pestañas)
content = re.sub(
    r'isActive\s*\?\s*\(isNeumorphic \? \'bg-\[\#F0F0F3\].*?\) : \(isNeumorphic \? \'text-\[\#6D7587\].*?\)',
    'isActive ? \'bg-[#EBEBEB] text-gray-800 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold\' : \'text-gray-500 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff]\'',
    content
)

# Left Vertical Icon Navigation Rail
content = re.sub(
    r'<aside className=\{isNeumorphic \? "hidden md:flex flex-col items-center justify-between w-14 bg-\[\#F0F0F3\].*?\}',
    '<aside className="hidden md:flex flex-col items-center justify-between w-16 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-2.5 shrink-0 self-start sticky top-24 border-none"',
    content
)

# Left rail buttons
content = re.sub(
    r'isActive\s*\?\s*\(isNeumorphic \? \'bg-\[\#F0F0F3\] text-\[\#6D7587\] shadow-\[inset_3px_3px_6px_\#d1d9e6,inset_-3px_-3px_6px_\#ffffff\]\' : \'bg-\[\#8B3A4A\] text-white shadow-md ring-1 ring-white\/20\'\)\s*:\s*\(isNeumorphic \? \'text-\[\#8C8276\] hover:bg-\[\#F0F0F3\] hover:shadow-\[3px_3px_6px_\#d1d9e6,-3px_-3px_6px_\#ffffff\]\' : \'text-\[\#8C8276\] hover:bg-\[\#F7F3EE\]\'\)',
    'isActive ? \'bg-[#EBEBEB] text-gray-800 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl\' : \'text-gray-500 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] rounded-2xl\'',
    content
)

# Fix Wedding dropdown button
content = re.sub(
    r'<button\s*onClick=\{.*?\}.*?className="flex items-center space-x-2\.5 bg-\[\#54212C\]\/60 border border-\[\#8B3A4A\]\/40 rounded-2xl px-3\.5 py-1\.5 hover:bg-\[\#54212C\] transition-colors cursor-pointer w-full text-left"',
    '<button onClick={() => setWeddingDropdownOpen(!weddingDropdownOpen)} className="flex items-center space-x-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl px-3.5 py-1.5 transition-all cursor-pointer w-full text-left border-none"',
    content
)


with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(content)
