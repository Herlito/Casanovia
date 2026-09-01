import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_snap = """    // Screen horizontal center snap
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        // newX is in unscaled coordinates
        newX = (canvasConfig.width / 2) - (box.width / scale / 2);
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }"""

new_snap = """    // Screen horizontal center snap
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        const diffInScaled = centerX - nodeCenterX;
        newX = node.x() + (diffInScaled / scale);
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }"""

content = content.replace(old_snap, new_snap)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
