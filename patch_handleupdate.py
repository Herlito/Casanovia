import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

old_func = """  const handleUpdateStyle = (key: string, value: any) => {
    updateElement(selectedElement.id, { 
      style: { ...selectedElement.style, [key]: value } 
    });
  };"""

new_func = """  const handleUpdateStyle = (key: string, value: any) => {
    // Get latest state to avoid closure staleness on multiple sync calls
    const state = useEditorStore.getState();
    const el = state.document.pages[0].elements.find(e => e.id === selectedElement.id);
    if (!el) return;
    updateElement(selectedElement.id, { 
      style: { ...el.style, [key]: value } 
    });
  };"""

text = text.replace(old_func, new_func)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
