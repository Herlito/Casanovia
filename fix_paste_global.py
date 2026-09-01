import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    content = f.read()

# 1. Update the 'keydown' logic to write to navigator.clipboard and remove the 'v' logic
old_keydown = """      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
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

new_keydown = """      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        if (selectedElementIds.length > 0) {
            const elementsToCopy = elements.filter(el => selectedElementIds.includes(el.id));
            const dataString = JSON.stringify({ wc_internal: true, elements: elementsToCopy });
            sessionStorage.setItem('wc_clipboard', dataString);
            navigator.clipboard.writeText(dataString).catch(() => {});
        }
      }"""

content = content.replace(old_keydown, new_keydown)

# 2. Add the 'paste' event listener inside a useEffect
# Let's insert it right after the keydown useEffect (around line 98)

paste_effect = """
  // Global Paste Event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if typing in an input
      if (editingTextId || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const store = useEditorStore.getState();
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      let hasImage = false;
      for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
              hasImage = true;
              const file = item.getAsFile();
              if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                      const src = event.target?.result as string;
                      const img = new Image();
                      img.onload = () => {
                          store.addElement({
                              type: 'image',
                              content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                              style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                              transform: { x: 50, y: 50, width: img.width / 2, height: img.height / 2, rotation: 0, scaleX: 1, scaleY: 1 },
                              zIndex: store.document.pages[0].elements.length,
                              visible: true,
                              locked: false
                          });
                      };
                      img.src = src;
                  };
                  reader.readAsDataURL(file);
              }
          }
      }

      if (!hasImage) {
          const text = clipboardData.getData('text');
          if (text) {
              try {
                  const parsed = JSON.parse(text);
                  if (parsed.wc_internal && parsed.elements) {
                      parsed.elements.forEach((el: any) => {
                          const { id, ...elWithoutId } = el;
                          const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                          store.addElement(newEl);
                      });
                      return;
                  }
              } catch(err) {
                  // Standard text paste
                  store.addElement({
                      type: 'text',
                      content: { text: text },
                      style: { fontFamily: 'Playfair Display', fontSize: 24, color: '#000000', align: 'left' },
                      transform: { x: 50, y: 50, width: 300, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
                      zIndex: store.document.pages[0].elements.length,
                      visible: true,
                      locked: false
                  });
                  return;
              }
          }
          
          // Fallback to sessionStorage if system clipboard read failed but paste event fired
          const clip = sessionStorage.getItem('wc_clipboard');
          if (clip) {
              try {
                  const parsed = JSON.parse(clip);
                  if (parsed.wc_internal && parsed.elements) {
                      parsed.elements.forEach((el: any) => {
                          const { id, ...elWithoutId } = el;
                          const newEl = { ...elWithoutId, transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 } };
                          store.addElement(newEl);
                      });
                  }
              } catch(err) {}
          }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingTextId, elements]);
"""

old_dependency = "}, [selectedElementIds, editingTextId, elements]);"
new_dependency = old_dependency + "\n" + paste_effect

content = content.replace(old_dependency, new_dependency)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(content)
