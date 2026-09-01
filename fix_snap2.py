import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Let's fix the logic so that newX matches exactly the center in unscaled coordinates
# nodeCenterX is in "scaled" space relative to the top-left of the canvas
# centerX is canvasConfig.width * scale / 2
# So if we want the node's center to be at centerX
# The node's unscaled center should be canvasConfig.width / 2
# Since node.x() + (box.width / scale) / 2 = nodeCenterUnscaled
# Then newX = (canvasConfig.width / 2) - (box.width / scale / 2)

old_code = """    // Screen horizontal center snap
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        newX = (centerX - box.width / 2) / scale;
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }"""

new_code = """    // Screen horizontal center snap
    const centerX = canvasConfig.width * scale / 2;
    const nodeCenterX = box.x - stageX + box.width / 2;

    if (Math.abs(nodeCenterX - centerX) < threshold) {
        // newX is in unscaled coordinates
        newX = (canvasConfig.width / 2) - (box.width / scale / 2);
        guides.push({ type: 'line', points: [centerX, 0, centerX, canvasConfig.height * scale] });
    }"""

content = content.replace(old_code, new_code)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
