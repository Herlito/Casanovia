import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace("  draggedGuest,\n  onSeatClick,\n}) => {", "  draggedGuest,\n  onSeatClick,\n  canvasRotation = 0\n}) => {")

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
