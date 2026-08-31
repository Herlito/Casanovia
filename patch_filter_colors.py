import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# Fix "Todos" button colors
content = content.replace(
    "'bg-[#2D2A26] text-[#2D3748] border-[#2D2A26]'",
    "'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] border-transparent font-bold'"
)

# Fix role buttons colors (when selected)
content = content.replace(
    "'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent font-semibold'",
    "'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] border-transparent font-bold'"
)

# And fix "Todos" unchecked state to match the others if needed, but it's fine for now.

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

