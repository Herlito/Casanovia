import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# I will add console.log to handleDragEnd
old_drag_end = """  const handleDragEnd = (e: any) => {
    setGuidelines([]);
    const id = e.target.id();
    updateElement(id, {
      transform: {
        ...elements.find(el => el.id === id)?.transform,
        x: e.target.x(),
        y: e.target.y()
      }
    });
  };"""

new_drag_end = """  const handleDragEnd = (e: any) => {
    setGuidelines([]);
    const id = e.target.id();
    console.log("Drag End! Target X:", e.target.x(), "Target Y:", e.target.y());
    updateElement(id, {
      transform: {
        ...elements.find(el => el.id === id)?.transform,
        x: e.target.x(),
        y: e.target.y()
      }
    });
  };"""

content = content.replace(old_drag_end, new_drag_end)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
