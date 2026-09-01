import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_logic = """  // Snapping logic
  const handleDragMove = (e: any) => {
    const node = e.target;
    if (node.name() === 'guideline') return;

    const box = node.getClientRect();
    const threshold = 10;
    let newX = node.x();
    let newY = node.y();
    let guides: any[] = [];

    if (!magnetEnabled) {
        setGuidelines([]);
        return;
    }

    // Screen center snap
    const centerX = canvasConfig.width * scale / 2;
    const centerY = canvasConfig.height * scale / 2;
    
    const nodeCenterX = box.x - stageX + box.width / 2;
    const nodeCenterY = box.y - stageY + box.height / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        newX = centerX - box.width/2 / scale;
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }
    if (Math.abs(nodeCenterY - centerY) < threshold) {
        newY = centerY - box.height/2 / scale;
        guides.push({ type: 'line', points: [0, centerY, canvasConfig.width * scale, centerY] });
    }

    // Element snap
    const siblings = stageRef.current.find('.wc-element');
    siblings.forEach((sibling: any) => {
        if (sibling === node) return;
        const sBox = sibling.getClientRect();
        const sLeft = sBox.x - stageX;
        const sRight = sLeft + sBox.width;
        const sCenter = sLeft + sBox.width/2;
        
        const nLeft = box.x - stageX;
        const nRight = nLeft + box.width;
        const nCenter = nLeft + box.width/2;

        if (Math.abs(nLeft - sLeft) < threshold) { newX = sLeft / scale; guides.push({ type: 'line', points: [sLeft, 0, sLeft, canvasConfig.height * scale] }); }
        if (Math.abs(nCenter - sCenter) < threshold) { newX = (sCenter - box.width/2) / scale; guides.push({ type: 'line', points: [sCenter, 0, sCenter, canvasConfig.height * scale] }); }
        if (Math.abs(nRight - sRight) < threshold) { newX = (sRight - box.width) / scale; guides.push({ type: 'line', points: [sRight, 0, sRight, canvasConfig.height * scale] }); }
    });

    node.x(newX);
    node.y(newY);
    setGuidelines(guides);
  };"""

new_logic = """  // Snapping logic
  const handleDragMove = (e: any) => {
    const node = e.target;
    if (node.name() === 'guideline') return;

    const box = node.getClientRect();
    const threshold = 10;
    let newX = node.x();
    let newY = node.y();
    let guides: any[] = [];

    if (!magnetEnabled) {
        setGuidelines([]);
        return;
    }

    // Screen horizontal center snap
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        newX = (centerX - box.width / 2) / scale;
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }

    node.x(newX);
    node.y(newY);
    setGuidelines(guides);
  };"""

content = content.replace(old_logic, new_logic)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
