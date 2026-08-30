import re

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    text = f.read()

# Replace main container width
text = text.replace(
    'className="w-full sm:w-80 bg-[#FAF8F5]',
    'className="w-[60vw] max-w-[280px] sm:max-w-none sm:w-80 bg-[#FAF8F5]'
)

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(text)
