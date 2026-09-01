import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

# Update context render order
ctx_render = """    // Apply World Transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.translate(width / 2, height / 2);
    ctx.rotate((canvasRotation || 0) * Math.PI / 180);
    ctx.translate(-width / 2, -height / 2);"""
# Need to find the exact block.
content = re.sub(r'// Apply World Transformations\s*ctx\.save\(\);\s*ctx\.translate\(width / 2, height / 2\);\s*ctx\.rotate\(canvasRotation \* Math\.PI / 180\);\s*ctx\.translate\(-width / 2, -height / 2\);\s*ctx\.translate\(pan\.x, pan\.y\);', ctx_render, content)
content = re.sub(r'// Apply World Transformations\s*ctx\.save\(\);\s*ctx\.translate\(pan\.x, pan\.y\);', ctx_render, content)

# Update screenToWorld
screenToWorld_new = """  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      
      let x = clientX - pan.x;
      let y = clientY - pan.y;
      
      x -= rect.width / 2;
      y -= rect.height / 2;
      const rad = -(canvasRotation || 0) * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;

      return {
        x: x / zoom,
        y: y / zoom,
      };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );"""
content = re.sub(r'const screenToWorld = useCallback\([\s\S]*?\[pan\.x, pan\.y, zoom, canvasRotation\]\s*\);', screenToWorld_new, content)
content = re.sub(r'const screenToWorld = useCallback\([\s\S]*?\[pan\.x, pan\.y, zoom\]\s*\);', screenToWorld_new, content)

# Update worldToScreen
worldToScreen_new = """  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      
      let x = worldX * zoom;
      let y = worldY * zoom;
      
      x -= rect.width / 2;
      y -= rect.height / 2;
      const rad = (canvasRotation || 0) * Math.PI / 180;
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      x = rx + rect.width / 2;
      y = ry + rect.height / 2;
      
      x += pan.x;
      y += pan.y;
      
      return { x, y };
    },
    [pan.x, pan.y, zoom, canvasRotation]
  );"""
content = re.sub(r'const worldToScreen = useCallback\([\s\S]*?\[pan\.x, pan\.y, zoom, canvasRotation\]\s*\);', worldToScreen_new, content)
content = re.sub(r'const worldToScreen = useCallback\([\s\S]*?\[pan\.x, pan\.y, zoom\]\s*\);', worldToScreen_new, content)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
