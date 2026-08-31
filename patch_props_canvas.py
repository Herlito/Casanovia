import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# Add updateCanvas to destructured useEditorStore
content = content.replace(
    "const { document, selectedElementIds, updateElement, eventData } = useEditorStore();",
    "const { document, selectedElementIds, updateElement, updateCanvas, eventData } = useEditorStore();"
)

# Replace state mutation with updateCanvas
content = re.sub(
    r'const state = useEditorStore\.getState\(\);\n\s*state\.document\.canvas\.width = parseInt\(e\.target\.value\) \|\| 375;\n\s*useEditorStore\.setState\(\{ document: \{ \.\.\.state\.document \} \}\);',
    'updateCanvas({ width: parseInt(e.target.value) || 375 });',
    content
)

content = re.sub(
    r'const state = useEditorStore\.getState\(\);\n\s*state\.document\.canvas\.height = parseInt\(e\.target\.value\) \|\| 812;\n\s*useEditorStore\.setState\(\{ document: \{ \.\.\.state\.document \} \}\);',
    'updateCanvas({ height: parseInt(e.target.value) || 812 });',
    content
)

content = re.sub(
    r'const state = useEditorStore\.getState\(\);\n\s*state\.document\.canvas\.backgroundColor = e\.target\.value;\n\s*useEditorStore\.setState\(\{ document: \{ \.\.\.state\.document \} \}\);',
    'updateCanvas({ backgroundColor: e.target.value });',
    content
)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)

