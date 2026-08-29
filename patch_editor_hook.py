import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    text = f.read()

# Add to the top of WeddingCraftEditor
text = text.replace(
    "const { setEventData, initializeDocument } = useEditorStore();",
    "const { setEventData, initializeDocument } = useEditorStore();\n  const isPreviewModalOpen = useEditorStore((state) => state.isPreviewModalOpen);"
)

# Change the render output
text = text.replace(
    "{useEditorStore((state) => state.isPreviewModalOpen) && (",
    "{isPreviewModalOpen && ("
)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(text)
