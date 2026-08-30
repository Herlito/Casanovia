import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# 1. Hide the second Close modal button on mobile
text = text.replace(
    'className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"',
    'className="hidden md:flex p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"'
)

# 2. Add the missing closing div before ERROR NOTICE
text = text.replace(
    '{/* 2. ERROR NOTICE / PDF ERROR BANNER */}',
    '</div>\n      {/* 2. ERROR NOTICE / PDF ERROR BANNER */}'
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
