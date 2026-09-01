import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Fix selectElement
content = content.replace('selectElement(el.id)', 'selectElements([el.id])')
content = content.replace('selectElement(null)', 'selectElements([])')
content = content.replace('const { document, updateElement, selectedElementIds, selectElement } = useEditorStore();', 'const { document, updateElement, selectedElementIds, selectElements } = useEditorStore();')

# Fix transform properties
content = content.replace('...el.transform,\n                                x: node.x(),\n                                y: node.y(),\n                                width: Math.max(5, node.width() * scaleX),\n                                height: Math.max(5, node.height() * scaleY),\n                                rotation: node.rotation()', 
                          '...el.transform,\n                                x: node.x(),\n                                y: node.y(),\n                                width: Math.max(5, node.width() * scaleX),\n                                height: Math.max(5, node.height() * scaleY),\n                                rotation: node.rotation(),\n                                scaleX: 1,\n                                scaleY: 1')

# Fix image add element
content = content.replace('transform: { x: pointerPosition?.x || 50, y: pointerPosition?.y || 50, width: img.width / 2, height: img.height / 2, rotation: 0 },',
                          'transform: { x: pointerPosition?.x || 50, y: pointerPosition?.y || 50, width: img.width / 2, height: img.height / 2, rotation: 0, scaleX: 1, scaleY: 1 },')
                          
# Fix CanvasCountdown commonProps
content = content.replace('<CanvasCountdown el={el} />', '<CanvasCountdown el={el} commonProps={commonProps} />')

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
