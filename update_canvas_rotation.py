import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

# Add canvasRotation to Props
content = content.replace("canvasHeight: number;", "canvasHeight: number;\n  canvasRotation?: number;")

# Add to destructuring
content = content.replace("  draggedGuest,\n  onSeatClick\n}) => {", "  draggedGuest,\n  onSeatClick,\n  canvasRotation = 0\n}) => {")

# Modify screenToWorld
screenToWorld_new = """  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      
      let x = clientX - rect.width / 2;
      let y = clientY - rect.height / 2;
      const rad = -canvasRotation * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;

      return {
        x: (x - pan.x) / zoom,
        y: (y - pan.y) / zoom,
      };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );"""
content = re.sub(r'const screenToWorld = useCallback\(\s*\(\s*screenX: number, screenY: number\s*\) => \{\s*const rect = canvasRef\.current\?\.getBoundingClientRect\(\);\s*if \(\!rect\) return \{ x: 0, y: 0 \};\s*const clientX = screenX - rect\.left;\s*const clientY = screenY - rect\.top;\s*return \{\s*x: \(clientX - pan\.x\) / zoom,\s*y: \(clientY - pan\.y\) / zoom,\s*\};\s*\},\s*\[pan\.x, pan\.y, zoom\]\s*\);', screenToWorld_new, content)

# Modify worldToScreen
worldToScreen_new = """  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      
      let x = worldX * zoom + pan.x;
      let y = worldY * zoom + pan.y;
      
      x -= rect.width / 2;
      y -= rect.height / 2;
      const rad = canvasRotation * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;
      
      return { x, y };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );"""
content = re.sub(r'const worldToScreen = useCallback\(\s*\(\s*worldX: number, worldY: number\s*\) => \{\s*return \{\s*x: worldX \* zoom \+ pan\.x,\s*y: worldY \* zoom \+ pan\.y,\s*\};\s*\},\s*\[pan\.x, pan\.y, zoom\]\s*\);', worldToScreen_new, content)

# Modify pan logic in handleMouseMove
pan_logic = """        const dx = e.clientX - lastPanPos.current.x;
        const dy = e.clientY - lastPanPos.current.y;
        const rad = -canvasRotation * Math.PI / 180;
        const pdx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const pdy = dx * Math.sin(rad) + dy * Math.cos(rad);
        setPan((p) => ({
          x: p.x + pdx,
          y: p.y + pdy,
        }));"""
content = re.sub(r'setPan\(\(p\) => \(\{\s*x: p\.x \+ e\.clientX - lastPanPos\.current\.x,\s*y: p\.y \+ e\.clientY - lastPanPos\.current\.y,\s*\}\)\);', pan_logic, content)

# Modify context rendering
ctx_render = """    // Apply World Transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(canvasRotation * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);
    ctx.translate(pan.x, pan.y);"""
content = content.replace("    // Apply World Transformations\n    ctx.save();\n    ctx.translate(pan.x, pan.y);", ctx_render)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
