import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

old_code = """      if (e.key === 'c' && e.ctrlKey) {
        if (selectedElementIds.length > 0) {
            const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
            sessionStorage.setItem('wc_clipboard', JSON.stringify(elementsToCopy));
        }
      } else if (e.key === 'v' && e.ctrlKey) {
          const clip = sessionStorage.getItem('wc_clipboard');
          if (clip) {
              const pastedElements = JSON.parse(clip);
              const templateName = store.templates.find(t => t.id === store.document.id)?.name || 'Plantilla Actual';
              
              pastedElements.forEach((el: any) => {
                  const { id, ...elWithoutId } = el;
                  const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                  store.addElement(newEl);
                  
                  addDoc(collection(db, 'weddingcraft_library'), {
                      templateName,
                      element: newEl,
                      createdAt: Date.now()
                  }).catch(err => console.error("Error saving to library", err));
              });
          }
      }"""

new_code = """      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        if (selectedElementIds.length > 0) {
            const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
            sessionStorage.setItem('wc_clipboard', JSON.stringify(elementsToCopy));
        }
      } else if (e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) {
          const clip = sessionStorage.getItem('wc_clipboard');
          if (clip) {
              const pastedElements = JSON.parse(clip);
              
              pastedElements.forEach((el: any) => {
                  const { id, ...elWithoutId } = el;
                  const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                  store.addElement(newEl);
              });
          }
      }"""

content = content.replace(old_code, new_code)

# Check bring forward / send back keys too, they use ctrlKey
old_z_index = """        if (e.key === ']' && e.ctrlKey) {
          e.preventDefault();
          store.bringToFront(id);
        } else if (e.key === '[' && e.ctrlKey) {
          e.preventDefault();
          store.sendToBack(id);
        } else if (e.key === ']') {
          e.preventDefault();
          store.bringForward(id);
        } else if (e.key === '[') {
          e.preventDefault();
          store.sendBackward(id);
        }"""

new_z_index = """        if (e.key === ']' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          store.bringToFront(id);
        } else if (e.key === '[' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          store.sendToBack(id);
        } else if (e.key === ']') {
          e.preventDefault();
          store.bringForward(id);
        } else if (e.key === '[') {
          e.preventDefault();
          store.sendBackward(id);
        }"""

content = content.replace(old_z_index, new_z_index)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
