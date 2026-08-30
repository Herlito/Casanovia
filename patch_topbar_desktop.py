import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Fix the redundant flex class
text = text.replace(
    'className="flex lg:flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]"',
    'className="flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]"'
)

# Actually, to make it perfectly centered on desktop, I can adjust the flex properties:
# We can make the tools take up flex-1 and justify-between on desktop? No, justify-end is fine.
# We'll just leave it as justify-end for desktop, it's very clean.

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
