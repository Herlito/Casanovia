import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    content = f.read()

old_logic = """  const handleRectSeatsChange = (longSides: number, heads: number) => {
    if (!selectedElement) return;
    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
    const totalCount = longSides * 2 + actualHeadsCount;"""

new_logic = """  const handleRectSeatsChange = (longSides: number, heads: number) => {
    if (!selectedElement) return;
    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
    const actualLongCount = longSides < 0 ? Math.abs(longSides) : longSides * 2;
    const totalCount = actualLongCount + actualHeadsCount;"""

content = content.replace(old_logic, new_logic)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(content)
