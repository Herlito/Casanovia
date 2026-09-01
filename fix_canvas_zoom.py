import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Add store variables
content = content.replace("const eventData = useEditorStore(state => state.eventData);", "const eventData = useEditorStore(state => state.eventData);\n  const zoom = useEditorStore(state => state.zoom);\n  const magnetEnabled = useEditorStore(state => state.magnetEnabled);")

# Update scale calculation to use zoom
content = content.replace("const scale = Math.min(\n    (stageSize.width - 40) / canvasConfig.width,\n    (stageSize.height - 40) / canvasConfig.height\n  );",
                          "const baseScale = Math.min(\n    (stageSize.width - 40) / canvasConfig.width,\n    (stageSize.height - 40) / canvasConfig.height\n  );\n  const scale = baseScale * zoom;")

# Respect magnetEnabled in handleDragMove
content = content.replace("const threshold = 10;\n    let newX = node.x();\n    let newY = node.y();\n    let guides: any[] = [];",
                          "const threshold = 10;\n    let newX = node.x();\n    let newY = node.y();\n    let guides: any[] = [];\n\n    if (!magnetEnabled) {\n        setGuidelines([]);\n        return;\n    }")

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
