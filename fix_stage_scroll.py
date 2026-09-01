import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# 1. Add handleWheel
wheel_code = """
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const currentZoom = useEditorStore.getState().zoom;
    
    // Zoom in on scroll up (deltaY < 0), zoom out on scroll down
    let newZoom = e.evt.deltaY > 0 ? currentZoom / scaleBy : currentZoom * scaleBy;
    newZoom = Math.max(0.1, Math.min(newZoom, 5));
    
    useEditorStore.getState().setZoom(newZoom);
  };
"""

# Find where to insert handleWheel (after handleDragEnd maybe)
content = content.replace("  const handleDragEnd = (e: any) => {", wheel_code + "\n  const handleDragEnd = (e: any) => {")

# 2. Update Stage sizing and positioning
old_sizing = """  const baseScale = Math.min(
    (stageSize.width - 40) / canvasConfig.width,
    (stageSize.height - 40) / canvasConfig.height
  );
  const scale = baseScale * zoom;
  
  const stageX = (stageSize.width - canvasConfig.width * scale) / 2;
  const stageY = (stageSize.height - canvasConfig.height * scale) / 2;"""

new_sizing = """  const baseScale = Math.min(
    (stageSize.width - 40) / canvasConfig.width,
    (stageSize.height - 40) / canvasConfig.height
  );
  const scale = baseScale * zoom;
  
  const padding = 100;
  const contentWidth = canvasConfig.width * scale + padding;
  const contentHeight = canvasConfig.height * scale + padding;

  const actualStageWidth = Math.max(stageSize.width, contentWidth);
  const actualStageHeight = Math.max(stageSize.height, contentHeight);
  
  const stageX = (actualStageWidth - canvasConfig.width * scale) / 2;
  const stageY = (actualStageHeight - canvasConfig.height * scale) / 2;"""

content = content.replace(old_sizing, new_sizing)

# 3. Update the container div and Stage props
old_render = """  return (
    <div 
      className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onClick={(e) => {"""

new_render = """  return (
    <div 
      className="flex-1 bg-gray-100 flex items-start justify-start overflow-auto relative"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        width={actualStageWidth}
        height={actualStageHeight}
        ref={stageRef}
        onWheel={handleWheel}
        onClick={(e) => {"""

content = content.replace(old_render, new_render)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
