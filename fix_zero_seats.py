import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

old_long = "const longSeats = elem.seatsLongSide || Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3;"
new_long = "const longSeats = elem.seatsLongSide !== undefined ? elem.seatsLongSide : (Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3);"

content = content.replace(old_long, new_long)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
