import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# Add imports for firestore
if 'import { db } from' not in content:
    content = "import { db } from '../../lib/firebase';\nimport { collection, addDoc, getDocs } from 'firebase/firestore';\n" + content

# Fix keydown handler
keydown_orig = r"""const handleKeyDown = \(e: KeyboardEvent\) => \{
      // Don't trigger if editing text or typing in an input
      if \(editingTextId || e\.target instanceof HTMLInputElement || e\.target instanceof HTMLTextAreaElement\) return;"""

keydown_new = """const handleKeyDown = (e: KeyboardEvent) => {
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
"""
content = re.sub(keydown_orig, keydown_new, content)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
