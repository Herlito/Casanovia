import re

with open('src/components/private/TimelineModule.tsx', 'r') as f:
    content = f.read()

# 1. Remove Headers (Red box)
content = re.sub(
    r'\s*\{\/\* Main Headers \*\/\}[\s\S]*?\{\/\* Right Header Sub \*\/\}[\s\S]*?<\/div>\s*<\/div>',
    '',
    content
)

# 2. Adjust Padding and Remove Border-R (Blue boxes and Green mark)
content = content.replace(
    '<div className="py-4 pr-3 border-r border-black flex flex-col justify-start items-end">',
    '<div className="pt-3 pb-1 pr-3 border-r border-black flex flex-col justify-start items-end">'
)
content = content.replace(
    '<div className="py-4 pl-3 pr-12 flex flex-col justify-start items-start relative">',
    '<div className="pt-3 pb-1 pl-3 pr-12 flex flex-col justify-start items-start relative">'
)
content = content.replace(
    '<div className="py-2 pr-3 border-r border-black flex flex-col justify-start items-end">',
    '<div className="pt-0.5 pb-2 pr-3 flex flex-col justify-start items-end">'
)
content = content.replace(
    '<div className="py-2 pl-3 pr-2 flex flex-col justify-start items-start">',
    '<div className="pt-0.5 pb-2 pl-3 pr-2 flex flex-col justify-start items-start">'
)

with open('src/components/private/TimelineModule.tsx', 'w') as f:
    f.write(content)
