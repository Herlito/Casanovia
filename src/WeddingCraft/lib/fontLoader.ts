const loadedFonts = new Set<string>();

const SYSTEM_FONTS = new Set([
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'sans-serif',
  'serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui'
]);

export const loadGoogleFont = async (fontFamily: string, weights?: number[]): Promise<void> => {
  if (!fontFamily || typeof fontFamily !== 'string') return;
  const cleanFamily = fontFamily.trim().replace(/^['"]|['"]$/g, '');
  if (!cleanFamily || SYSTEM_FONTS.has(cleanFamily) || loadedFonts.has(cleanFamily)) {
    return;
  }

  const familyParam = cleanFamily.replace(/ /g, '+');
  const weightsParam = weights && weights.length > 0 ? `:wght@${weights.join(';')}` : '';
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}${weightsParam}&display=swap`;

  const linkId = `google-font-${familyParam.toLowerCase()}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  
  loadedFonts.add(cleanFamily);

  try {
    if (document.fonts && document.fonts.load) {
      await document.fonts.load(`16px "${cleanFamily}"`);
    }
  } catch (err) {
    console.warn('Error loading font:', cleanFamily, err);
  }
};

export const loadDocumentFonts = (doc: any): void => {
  if (!doc || typeof window === 'undefined') return;
  const fontFamilies = new Set<string>();

  if (doc.canvas?.fontFamily) fontFamilies.add(doc.canvas.fontFamily);

  const pages = doc.pages || (doc.elements ? [{ elements: doc.elements }] : []);
  for (const page of pages) {
    for (const el of page.elements || []) {
      if (el.style?.fontFamily) fontFamilies.add(el.style.fontFamily);
      if (el.style?.titleFontFamily) fontFamilies.add(el.style.titleFontFamily);
      if (el.style?.numberFont) fontFamilies.add(el.style.numberFont);
      if (el.style?.labelFont) fontFamilies.add(el.style.labelFont);
      if (el.content?.fontFamily) fontFamilies.add(el.content.fontFamily);
      if (el.content?.titleFontFamily) fontFamilies.add(el.content.titleFontFamily);
    }
  }

  fontFamilies.forEach(family => {
    loadGoogleFont(family);
  });
};

export const preloadFontList = (fonts: string[]): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      fonts.forEach(font => loadGoogleFont(font));
    });
  } else {
    setTimeout(() => {
      fonts.forEach(font => loadGoogleFont(font));
    }, 100);
  }
};

