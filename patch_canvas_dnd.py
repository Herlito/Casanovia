with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    text = f.read()

dnd_code = """
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (eventData?.isReadOnly) return;
    
    stageRef.current?.setPointersPositions(e);
    const pointerPosition = stageRef.current?.getPointerPosition();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = ev.target?.result as string;
          const img = new Image();
          img.onload = () => {
             useEditorStore.getState().addElement({
                type: 'image',
                content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                transform: { 
                  x: pointerPosition ? pointerPosition.x : 50, 
                  y: pointerPosition ? pointerPosition.y : 50, 
                  width: Math.min(img.width, 200), 
                  height: Math.min(img.height, 200 * (img.height / img.width)), 
                  rotation: 0, scaleX: 1, scaleY: 1 
                },
                zIndex: 15,
                locked: false,
                visible: true
             });
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      }
    }
  };
"""

text = text.replace("  const checkDeselect = (e: any) => {", dnd_code + "\n  const checkDeselect = (e: any) => {")
text = text.replace('          <Stage\n            width={canvasConfig.width}', '          <Stage\n            width={canvasConfig.width}\n            onDragOver={handleDragOver}\n            onDrop={handleDrop}')
text = text.replace('    <div className="flex-1 bg-[#F5F1E8] relative overflow-hidden flex items-center justify-center wc-canvas-container" ref={containerRef}>', '    <div className="flex-1 bg-[#F5F1E8] relative overflow-hidden flex items-center justify-center wc-canvas-container" ref={containerRef} onDragOver={handleDragOver} onDrop={handleDrop}>')

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(text)
