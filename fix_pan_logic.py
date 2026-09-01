import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

pan_logic_old = """      setPan({
        x: clientX - dragStartPos.x,
        y: clientY - dragStartPos.y,
      });"""

content = re.sub(r'const dx = e\.clientX - lastPanPos\.current\.x;\s*const dy = e\.clientY - lastPanPos\.current\.y;\s*const rad = -canvasRotation \* Math\.PI / 180;\s*const pdx = dx \* Math\.cos\(rad\) - dy \* Math\.sin\(rad\);\s*const pdy = dx \* Math\.sin\(rad\) \+ dy \* Math\.cos\(rad\);\s*setPan\(\(p\) => \(\{\s*x: p\.x \+ pdx,\s*y: p\.y \+ pdy,\s*\}\)\);', pan_logic_old, content)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
