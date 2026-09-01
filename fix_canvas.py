import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Replace EVERYTHING that looks like [a-zA-Z]*const handleKeyDown = (e: KeyboardEvent) => {
# and the whole block down to `if (selectedElementIds.length === 1) {`
# Actually, let's just find the first `// Keyboard shortcuts` and replace everything until `window.addEventListener('keydown', handleKeyDown);`

start_idx = content.find('// Keyboard shortcuts')
end_idx = content.find("window.addEventListener('keydown', handleKeyDown);", start_idx)

if start_idx != -1 and end_idx != -1:
    new_block = """// Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if editing text or typing in an input
      if (editingTextId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useEditorStore.getState();
      
      if (e.key === 'c' && e.ctrlKey) {
        // Copy to library
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
                  const newEl = { ...el, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                  store.addElement(newEl);
                  
                  // Save to library
                  addDoc(collection(db, 'weddingcraft_library'), {
                      templateName,
                      element: newEl,
                      createdAt: Date.now()
                  }).catch(err => console.error("Error saving to library", err));
              });
          }
      }
      
      if (selectedElementIds.length === 1) {
        const id = selectedElementIds[0];
        if (e.key === ']' && e.ctrlKey) {
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
        }
      }
    };
    
    """
    
    content = content[:start_idx] + new_block + content[end_idx:]
    with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
        f.write(content)
