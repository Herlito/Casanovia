import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

text = text.replace("const { eventData, undo, redo, history, addElement } = useEditorStore();", "const { eventData, undo, redo, history, addElement, selectedElementIds, bringToFront, bringForward, sendBackward, sendToBack } = useEditorStore();")
text = text.replace("useEditorStore.getState().bringToFront(useEditorStore.getState().selectedElementIds[0])", "bringToFront(selectedElementIds[0])")
text = text.replace("useEditorStore.getState().bringForward(useEditorStore.getState().selectedElementIds[0])", "bringForward(selectedElementIds[0])")
text = text.replace("useEditorStore.getState().sendBackward(useEditorStore.getState().selectedElementIds[0])", "sendBackward(selectedElementIds[0])")
text = text.replace("useEditorStore.getState().sendToBack(useEditorStore.getState().selectedElementIds[0])", "sendToBack(selectedElementIds[0])")
text = text.replace("useEditorStore.getState().selectedElementIds.length === 1", "selectedElementIds.length === 1")

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
