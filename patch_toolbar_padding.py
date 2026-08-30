import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    text = f.read()

# Tab buttons
text = text.replace('py-1.5 px-2 rounded-lg', 'py-1.5 px-0.5 sm:px-2 rounded-lg')

# Table label
text = text.replace('px-2 py-0.5 rounded-full', 'px-1 sm:px-2 py-0.5 rounded-full')

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(text)
