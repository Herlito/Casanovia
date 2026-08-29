import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    text = f.read()

old_cd = """      const cdId = `cd_${el.id}`;
      const isCards = el.style.variant === 'cards';
      const isCircles = el.style.variant === 'circles';
      const bgStyle = isCards ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 8px;` : 
                      isCircles ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 50%;` : '';
      
      html += `
      <div id="${cdId}" class="el" style="${baseStyle} display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">"""

new_cd = """      const cdId = `cd_${el.id}`;
      const isCards = el.style.variant === 'cards';
      const isCircles = el.style.variant === 'circles';
      const bgStyle = isCards ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 8px;` : 
                      isCircles ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 50%;` : '';
                      
      // Handle rgba conversion for container bg with opacity
      let containerBgStr = 'transparent';
      const opacity = el.style.containerOpacity ?? 0;
      if (opacity > 0) {
        let hex = el.style.containerBackgroundColor || '#ffffff';
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0,2), 16) || 255;
        const g = parseInt(hex.substring(2,4), 16) || 255;
        const b = parseInt(hex.substring(4,6), 16) || 255;
        containerBgStr = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      
      html += `
      <div id="${cdId}" class="el" style="${baseStyle} background-color: ${containerBgStr}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">"""

text = text.replace(old_cd, new_cd)

with open('src/WeddingCraft/lib/exportHTML.ts', 'w') as f:
    f.write(text)
