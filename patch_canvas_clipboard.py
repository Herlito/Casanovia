import re

with open('src/WeddingCraft/components/CanvasStage.tsx', 'r') as f:
    text = f.read()

paste_effect = """
  // Clipboard Paste Logic
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // 1. Ignore if typing in an input/textarea or contentEditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // 2. Ignore if currently editing text in Canvas
      if (editingTextId) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const store = useEditorStore.getState();
      const addElement = store.addElement;
      const theme = store.document.theme;

      let handled = false;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // --- IMAGE HANDLING ---
        if (item.type.indexOf('image/') === 0) {
          handled = true;
          const file = item.getAsFile();
          if (!file) continue;

          const isSvg = file.type === 'image/svg+xml';
          const reader = new FileReader();

          reader.onload = (ev) => {
            const result = ev.target?.result as string;
            let src = result;
            let svgText = '';

            if (isSvg) {
              svgText = result;
              src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
            }

            const img = new window.Image();
            img.onload = () => {
              addElement({
                type: 'image',
                content: { src, originalSrc: src, isSvg, svgText, naturalWidth: img.width, naturalHeight: img.height },
                style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: isSvg ? '#000000' : undefined, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                transform: { x: (canvasConfig.width / 2) - (Math.min(img.width, 200) / 2), y: (canvasConfig.height / 2) - (Math.min(img.height, 200 * (img.height / img.width)) / 2), width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: 20,
                locked: false,
                visible: true
              });
            };
            img.src = src;
          };

          if (isSvg) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
          break; // Stop after first matched item
        }

        // --- TEXT / SVG TEXT HANDLING ---
        if (item.type === 'text/plain' && !handled) {
          item.getAsString((textData) => {
            if (!textData) return;
            
            // Check if it's an SVG string
            if (textData.trim().toLowerCase().startsWith('<svg')) {
              const svgText = textData.trim();
              const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
              const img = new window.Image();
              img.onload = () => {
                addElement({
                  type: 'image',
                  content: { src, originalSrc: src, isSvg: true, svgText, naturalWidth: img.width, naturalHeight: img.height },
                  style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: '#000000', filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                  transform: { x: (canvasConfig.width / 2) - (Math.min(img.width, 200) / 2), y: (canvasConfig.height / 2) - (Math.min(img.height, 200 * (img.height / img.width)) / 2), width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                  zIndex: 20,
                  locked: false,
                  visible: true
                });
              };
              img.src = src;
            } else {
              // Standard Text
              addElement({
                type: 'text',
                content: { text: textData.trim() },
                style: { fontSize: 32, fill: theme?.palette?.text || '#000', fontFamily: theme?.typography?.bodyFont || 'Arial', isDefaultStyle: true },
                transform: { x: canvasConfig.width / 2 - 100, y: canvasConfig.height / 2 - 25, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: 20,
                locked: false,
                visible: true
              });
            }
          });
          break; // Stop after first text
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [editingTextId, canvasConfig]);
"""

old_effect = """  useEffect(() => {
    const checkSize = () => {"""

text = text.replace(old_effect, paste_effect + "\n" + old_effect)

with open('src/WeddingCraft/components/CanvasStage.tsx', 'w') as f:
    f.write(text)
