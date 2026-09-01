import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    content = f.read()

old_btn = "{Math.abs(longSide)} a un lado"
new_btn = "{Math.abs(longSide)} (Solo frente)"

content = content.replace(old_btn, new_btn)

old_text = "selectedElement.seatsLongSide < 0 ? `${Math.abs(selectedElement.seatsLongSide)} (Un lado)` :"
new_text = "selectedElement.seatsLongSide < 0 ? `${Math.abs(selectedElement.seatsLongSide)} (Solo frente)` :"

content = content.replace(old_text, new_text)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(content)
