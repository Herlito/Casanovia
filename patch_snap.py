import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_drag_move = """  const handleDragMove = (e: any) => {
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
        const diffInScaled = centerX - nodeCenterX;
        newX = node.x() + (diffInScaled / scale);
        guides.push({ type: 'line', points: [canvasConfig.width / 2, -1000, canvasConfig.width / 2, canvasConfig.height + 1000] });
    }

    node.x(newX);
    node.y(newY);
    setGuidelines(guides);
  };"""

new_drag_move = """  const handleDragMove = (e: any) => {
    const node = e.target;
    if (node.name() === 'guideline') return;
    
    let guides: any[] = [];
    if (!magnetEnabled) {
        setGuidelines([]);
        return;
    }

    const box = node.getClientRect();
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < 2) {
        guides.push({ type: 'line', points: [canvasConfig.width / 2, -1000, canvasConfig.width / 2, canvasConfig.height + 1000] });
    }

    setGuidelines(guides);
  };"""

content = content.replace(old_drag_move, new_drag_move)

old_common_props = """                    draggable: !el.locked,
                    onClick: () => selectElements([el.id]),
                    onTap: () => selectElements([el.id]),
                    onDragMove: handleDragMove,"""

new_common_props = """                    draggable: !el.locked,
                    dragBoundFunc: (pos: any) => {
                        if (!magnetEnabled) return pos;
                        let newX = pos.x;
                        const centerX = stageX + (canvasConfig.width * scale) / 2;
                        const nodeW = el.transform.width * scale;
                        const nodeCenterX = newX + nodeW / 2;
                        if (Math.abs(nodeCenterX - centerX) < 15) {
                            newX = centerX - nodeW / 2;
                        }
                        return { x: newX, y: pos.y };
                    },
                    onClick: () => selectElements([el.id]),
                    onTap: () => selectElements([el.id]),
                    onDragMove: handleDragMove,"""

content = content.replace(old_common_props, new_common_props)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
