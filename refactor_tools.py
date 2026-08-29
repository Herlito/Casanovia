import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

# We need to extract all the handlers (handleAddText, handleAddRectangle, handleAddCountdown, handleAddButton)
# and the whole tools block.
# Actually, the handlers use `addElement`, which is destructured from `useEditorStore()`.
# We can just put them into a custom hook or a new component.

# Let's extract them into a new file `ToolsPanel.tsx`
