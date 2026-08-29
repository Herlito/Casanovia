const loadedFonts = new Set<string>();

export const loadGoogleFont = async (fontFamily: string, weights: number[] = [400, 700]): Promise<void> => {
  if (loadedFonts.has(fontFamily)) {
    return Promise.resolve();
  }

  const familyParam = fontFamily.replace(/ /g, '+');
  const weightsParam = weights.length > 0 ? `:wght@${weights.join(';')}` : '';
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}${weightsParam}&display=swap`;

  const link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  loadedFonts.add(fontFamily);

  try {
    // Wait for the font to be actually loaded by the browser
    await document.fonts.load(`16px "${fontFamily}"`);
  } catch (err) {
    console.warn('Error loading font:', fontFamily, err);
  }
};

export const preloadFontList = (fonts: string[]): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      fonts.forEach(font => loadGoogleFont(font));
    });
  } else {
    setTimeout(() => {
      fonts.forEach(font => loadGoogleFont(font));
    }, 1000);
  }
};
