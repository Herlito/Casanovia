import { useEffect } from 'react';

export const useThemeFonts = (fonts: { displayFont: string; bodyFont: string; scriptFont?: string }) => {
  useEffect(() => {
    const fontFamilies = [fonts.displayFont, fonts.bodyFont, fonts.scriptFont].filter(Boolean) as string[];
    const familiesParam = fontFamilies.map(f => `family=${f.replace(/ /g, '+')}`).join('&');
    
    const linkId = 'google-fonts-theme';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Solo actualizar si la URL es diferente
    const newHref = `https://fonts.googleapis.com/css2?${familiesParam}&display=swap`;
    if (link.href !== newHref) {
      link.href = newHref;
    }
  }, [fonts]);
};
