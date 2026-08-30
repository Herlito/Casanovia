import re

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    text = f.read()

text = text.replace('px-2 py-0.5 rounded-full', 'px-1 sm:px-2 py-0.5 rounded-full')

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(text)
