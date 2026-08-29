import { WeddingDesignDocument, CanvasElement } from '../types';

export const exportToHTML = (doc: WeddingDesignDocument) => {
  const page = doc.pages[0];
  const w = doc.canvas.width;
  const h = doc.canvas.height;
  
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Wedding Design</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: sans-serif;
  }
  .canvas-container {
    width: ${w}px;
    height: ${h}px;
    background-color: ${doc.canvas.backgroundColor || '#ffffff'};
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .el {
    position: absolute;
    box-sizing: border-box;
  }
</style>
`;
  
  // Collect fonts
  const fonts = new Set<string>();
  page.elements.forEach(el => {
    if (el.style.fontFamily) fonts.add(el.style.fontFamily);
    if (el.type === 'countdown-widget') {
      if (el.style.numberFont) fonts.add(el.style.numberFont);
      if (el.style.labelFont) fonts.add(el.style.labelFont);
    }
  });
  
  if (fonts.size > 0) {
    const fontFamilies = Array.from(fonts).map(f => f.replace(/ /g, '+') + ':wght@300;400;500;600;700').join('&family=');
    html += `<link href="https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap" rel="stylesheet">\n`;
  }
  
  html += `</head>\n<body>\n<div class="canvas-container">\n`;
  
  let scriptContent = '';
  
  // Sort elements by zIndex
  const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
  
  sortedElements.forEach((el, index) => {
    if (!el.visible) return;
    
    const x = el.transform.x;
    const y = el.transform.y;
    const width = el.transform.width;
    const height = el.transform.height;
    const rot = el.transform.rotation || 0;
    
    // Process Animations
    let animStyles = [];
    let initialOpacity = el.style.opacity ?? 1;

    if (el.animation) {
      const anims = [];
      const ent = el.animation.entrance;
      const perm = el.animation.permanent;
      
      let totalDelay = 0;
      if (ent && ent.type !== 'none') {
        anims.push(`${ent.type} ${ent.duration}s ${ent.easing} ${ent.delay}s forwards`);
        if (ent.trigger === 'onLoad') {
           initialOpacity = 0; // Hide initially for entrance animations
        }
        totalDelay = (ent.duration || 0) + (ent.delay || 0);
      }
      
      if (perm && perm.type !== 'none') {
        const pDelay = totalDelay + (perm.delay || 0);
        anims.push(`${perm.type} ${perm.duration}s ${perm.easing} ${pDelay}s infinite ${perm.direction || 'normal'}`);
      }
      
      if (anims.length > 0) {
        animStyles.push(`animation: ${anims.join(', ')};`);
      }
    }

    const wrapperStyle = `left: ${x}px; top: ${y}px; z-index: ${el.zIndex}; ${animStyles.join(' ')} opacity: ${initialOpacity};`;
    const innerStyle = `width: ${width}px; height: ${height}px; transform: rotate(${rot}deg); transform-origin: top left;`;
    
    let baseStyle = `${innerStyle}`;
    
    let innerHtml = '';
    if (el.type === 'text') {
      const textStyle = `
        font-family: '${el.style.fontFamily || 'Arial'}', sans-serif;
        font-size: ${el.style.fontSize || 16}px;
        color: ${el.style.fill || el.style.color || '#000'};
        font-weight: ${el.style.fontWeight || 'normal'};
        font-style: ${el.style.fontStyle || 'normal'};
        text-align: ${el.style.align || 'left'};
        letter-spacing: ${el.style.letterSpacing || 0}px;
        line-height: ${el.style.lineHeight || 1.2};
        text-transform: ${el.style.textTransform || 'none'};
        ${el.style.shadow?.enabled ? `text-shadow: ${el.style.shadow.offsetX}px ${el.style.shadow.offsetY}px ${el.style.shadow.blur}px ${el.style.shadow.color};` : ''}
      `;
      innerHtml = `<div class="el" style="${baseStyle} ${textStyle.replace(/\n/g, '')}">${el.content.text.replace(/\n/g, '<br>')}</div>\n`;
    } 
    else if (el.type === 'image') {
      let maskStyle = '';
      if (el.style.maskId === 'circle') maskStyle = 'border-radius: 50%;';
      if (el.style.maskId === 'rounded') maskStyle = 'border-radius: 20px;';
      innerHtml = `<img class="el" src="${el.content.src}" style="${baseStyle} object-fit: cover; ${maskStyle}" />\n`;
    }
    else if (el.type === 'interactive-button') {
      const isOutline = el.style.variant === 'outline';
      const btnStyle = `
        font-family: '${el.style.fontFamily || 'Arial'}', sans-serif;
        font-size: ${el.style.fontSize || 16}px;
        color: ${isOutline ? (el.style.backgroundColor || '#000') : (el.style.color || '#fff')};
        background-color: ${isOutline ? 'transparent' : (el.style.backgroundColor || '#000')};
        border: ${isOutline ? `2px solid ${el.style.backgroundColor || '#000'}` : 'none'};
        border-radius: ${el.style.borderRadius || 8}px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      const btnId = `btn_${el.id}`;
      innerHtml = `<button id="${btnId}" class="el" style="${baseStyle} ${btnStyle.replace(/\n/g, '')}">${el.content.text || 'Botón'}</button>\n`;
      
      if (el.content.actionType === 'copy-link') {
        scriptContent += `
        document.getElementById('${btnId}').addEventListener('click', function() {
          navigator.clipboard.writeText('${el.content.linkUrl || ''}').then(() => {
            const originalText = this.innerText;
            this.innerText = '¡Copiado!';
            setTimeout(() => this.innerText = originalText, 2000);
          });
        });
        `;
      }
    }
    else if (el.type === 'countdown-widget') {
      const cdId = `cd_${el.id}`;
      const isCards = el.style.variant === 'cards';
      const isCircles = el.style.variant === 'circles';
      const bgStyle = isCards ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 8px;` : 
                      isCircles ? `background-color: ${el.style.backgroundColor || '#fff'}; border: 1px solid ${el.style.borderColor || '#ccc'}; border-radius: 50%;` : '';
      
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
      
      innerHtml = `
      <div id="${cdId}" class="el" style="${baseStyle} background-color: ${containerBgStr}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
        <div style="font-family: '${el.style.labelFont || 'Arial'}', sans-serif; font-size: 14px; color: ${el.style.titleColor || '#000'}; margin-bottom: 10px;">${el.content.title}</div>
        <div class="cd-timer" style="display: flex; gap: ${el.style.gap || 10}px; width: 100%; justify-content: center;">
          <!-- JS will inject here -->
        </div>
        <div class="cd-expired" style="display: none; font-family: '${el.style.numberFont || 'Arial'}', sans-serif; font-size: ${el.style.numberSize || 24}px; color: ${el.style.numberColor || '#000'}; margin-top: 10px;">
          ${el.content.expiredMessage}
        </div>
      </div>\n`;
      
      scriptContent += `
      (function() {
        const container = document.getElementById('${cdId}');
        const timerEl = container.querySelector('.cd-timer');
        const expiredEl = container.querySelector('.cd-expired');
        const targetDate = new Date('${el.content.targetDate}').getTime();
        const showSeconds = ${el.content.showSeconds};
        
        function update() {
          const now = new Date().getTime();
          const distance = targetDate - now;
          
          if (distance < 0) {
            timerEl.style.display = 'none';
            expiredEl.style.display = 'block';
            return;
          }
          
          const d = Math.floor(distance / (1000 * 60 * 60 * 24));
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          
          let parts = [
            {v: d, l: '${el.content.labels?.days || 'días'}'},
            {v: h, l: '${el.content.labels?.hours || 'hrs'}'},
            {v: m, l: '${el.content.labels?.minutes || 'min'}'}
          ];
          if (showSeconds) parts.push({v: s, l: '${el.content.labels?.seconds || 'seg'}'});
          
          timerEl.innerHTML = parts.map(p => { 
             const val = String(p.v).padStart(2, '0'); 
             return '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; ${bgStyle} aspect-ratio: 1; min-height: 40px;">' +
                    '<span style="font-family: \\\'${el.style.numberFont || 'Arial'}\\\', sans-serif; font-size: ${el.style.numberSize || 24}px; color: ${el.style.numberColor || '#000'}; line-height: 1;">' + val + '</span>' +
                    '<span style="font-family: \\\'${el.style.labelFont || 'Arial'}\\\', sans-serif; font-size: ${el.style.labelSize || 10}px; color: ${el.style.labelColor || '#666'}; margin-top: 4px;">' + p.l + '</span>' +
                    '</div>';
          }).join('');
        }
        
        update();
        setInterval(update, 1000);
      })();
      `;
    }
    else {
       if (el.content.shapeType === 'rect') { 
         innerHtml = `<div class="el" style="${baseStyle} background-color: ${el.style.fill || '#000'};"></div>\n`;
       }
    }
    
    // Wrap the element if it has a wrapper style
    html += `<div class="anim-wrapper" id="wrap_${el.id}" style="${wrapperStyle}">${innerHtml}</div>\n`;
  });
  
  html += `</div>\n`;
  if (scriptContent) {
    html += `<script>\n${scriptContent}\n</script>\n`;
  }
  html += `</body>\n</html>`;
  
  return html;
};

export const downloadHTML = (doc: WeddingDesignDocument) => {
  const html = exportToHTML(doc);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wedding-design-${doc.id || 'export'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
