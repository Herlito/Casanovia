import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

old_func = """  const handleUpdateContent = (text: string) => {
    updateElement(selectedElement.id, { 
      content: { ...selectedElement.content, text } 
    });
  };"""

new_func = """  const handleUpdateContent = (textOrObj: string | any) => {
    if (typeof textOrObj === 'string') {
        updateElement(selectedElement.id, { 
          content: { ...selectedElement.content, text: textOrObj } 
        });
    } else {
        updateElement(selectedElement.id, { 
          content: textOrObj 
        });
    }
  };"""

text = text.replace(old_func, new_func)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
