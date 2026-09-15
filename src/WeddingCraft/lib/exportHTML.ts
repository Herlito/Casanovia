import { WeddingDesignDocument, CanvasElement } from '../types';
import { getCanvasBoxShadow } from './canvasShadowUtils';

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
    background-color: ${doc.canvas.webBackgroundColor || '#EBEBEB'};
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
    box-shadow: ${getCanvasBoxShadow(doc.canvas)};
    border-radius: ${doc.canvas.borderRadius !== undefined ? `${doc.canvas.borderRadius}px` : '24px'};
  }
  .el {
    position: absolute;
    box-sizing: border-box;
  }

  /* Animations */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideLeft { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideRight { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideUpOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-50px); opacity: 0; } }
  @keyframes slideDownOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(50px); opacity: 0; } }
  @keyframes zoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.5); opacity: 0; } }
  @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
  @keyframes swing { 20% { transform: rotate3d(0, 0, 1, 15deg); } 40% { transform: rotate3d(0, 0, 1, -10deg); } 60% { transform: rotate3d(0, 0, 1, 5deg); } 80% { transform: rotate3d(0, 0, 1, -5deg); } to { transform: rotate3d(0, 0, 1, 0deg); } }
  @keyframes heartbeat { 0% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }
  
  .anim-wrapper { position: absolute; }

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
    else if (el.type === 'image-frame') {
      const shapeVariant = el.content?.shapeVariant || 'rectangle';
      const cornerRadius = el.style?.cornerRadius ?? 24;
      const stroke = el.style?.stroke || '#CBD5E1';
      const strokeWidth = el.style?.strokeWidth ?? 1;
      const imageSrc = el.content?.imageSrc;
      const w = el.transform.width;

      let clipStyle = '';
      if (shapeVariant === 'circle' || shapeVariant === 'oval') {
        clipStyle = 'border-radius: 50%;';
      } else if (shapeVariant === 'arch') {
        clipStyle = `border-radius: ${w/2}px ${w/2}px 0 0;`;
      } else if (shapeVariant === 'heart') {
        clipStyle = 'clip-path: polygon(50% 15%, 80% 0%, 100% 20%, 100% 50%, 50% 100%, 0% 50%, 0% 20%, 20% 0%);';
      } else {
        clipStyle = `border-radius: ${cornerRadius}px;`;
      }

      const imgContent = imageSrc 
        ? `<img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` 
        : `<div style="width: 100%; height: 100%; background-color: ${el.style?.fill || '#F1F5F9'};"></div>`;

      innerHtml = `
      <div class="el" style="${baseStyle} ${clipStyle} border: ${strokeWidth}px solid ${stroke}; box-sizing: border-box; overflow: hidden;">
        ${imgContent}
      </div>\n`;
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
      } else if (el.content.actionType === 'scroll-to-section') {
        scriptContent += `
        document.getElementById('${btnId}').addEventListener('click', function() {
          const targetId = '${(el.content.linkUrl || '').replace('#', '')}';
          const target = document.getElementById(targetId) || window.parent?.document?.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if ('${el.content.linkUrl || ''}'.startsWith('#')) {
            window.location.hash = '${el.content.linkUrl || ''}';
          }
        });
        `;
      } else if (el.content.linkUrl) {
        scriptContent += `
        document.getElementById('${btnId}').addEventListener('click', function() {
          const url = '${el.content.linkUrl}';
          if (url.startsWith('#')) {
            const targetId = url.replace('#', '');
            const target = document.getElementById(targetId) || window.parent?.document?.getElementById(targetId);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.location.hash = url;
            }
          } else {
            window.open(url, '_blank');
          }
        });
        `;
      }
    }
    else if (el.type === 'audio-player') {
      const audioId = `audio_${el.id}`;
      const btnId = `btn_audio_${el.id}`;
      const titleId = `title_audio_${el.id}`;
      const bgColor = el.style.backgroundColor || '#EBEBEB';
      const textColor = el.style.color || '#2D3748';
      const radius = el.style.borderRadius ?? 24;
      
      innerHtml = `
      <div id="container_${el.id}" class="el" style="${baseStyle} display: flex; align-items: center; background-color: ${bgColor}; border-radius: ${radius}px; padding: 5px; box-shadow: 6px 6px 12px #d1d1d1;">
        <button id="${btnId}" style="width: ${el.transform.height - 10}px; height: ${el.transform.height - 10}px; border-radius: 50%; background-color: ${textColor}; color: ${bgColor}; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; flex-shrink: 0; outline: none;">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path id="icon_${el.id}" d="M8 5v14l11-7z"/></svg>
        </button>
        <div id="${titleId}" style="margin-left: 10px; flex-grow: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-family: sans-serif; font-size: 14px; color: ${textColor};">${el.content.title || 'Audio'}</div>
        <audio id="${audioId}" src="${el.content.src}"></audio>
      </div>
      `;
      
      scriptContent += `
      (function() {
         const btn = document.getElementById('${btnId}');
         const audio = document.getElementById('${audioId}');
         const icon = document.getElementById('icon_${el.id}');
         let isPlaying = false;
         btn.addEventListener('click', function() {
            if (isPlaying) {
               audio.pause();
               icon.setAttribute('d', 'M8 5v14l11-7z'); // Play icon
            } else {
               audio.play().catch(e => console.log('Autoplay prevented', e));
               icon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'); // Pause icon
            }
            isPlaying = !isPlaying;
         });
      })();
      `;
    }
    else if (el.type === 'svg-shape') {
      const variant = el.style.variant || 'rectangle';
      const isLine = variant === 'line';
      const isCircle = variant === 'circle';
      const isOval = variant === 'oval' || variant === 'ovalo';

      let fill = isLine ? 'transparent' : (el.style.isDefaultStyle ? (doc.theme.palette.primary) : (el.style.fill || '#cccccc'));
      let strokeWidth = el.style.strokeWidth ?? 0;
      let stroke = el.style.stroke;

      if (isLine) {
        if (!strokeWidth || strokeWidth <= 0) strokeWidth = 2;
        if (!stroke || stroke === 'transparent') {
          stroke = el.style.fill && el.style.fill !== 'transparent' ? el.style.fill : '#2D3748';
        }
      } else if (isCircle || isOval) {
        if (!strokeWidth || strokeWidth <= 0) strokeWidth = 2;
        if (!stroke || stroke === 'transparent') {
          stroke = '#2D3748';
        }
      }

      const cornerRadius = el.style.borderRadius || 0;
      const w = el.transform.width;
      const h = el.transform.height;
      
      let shapeHtml = '';
      if (isLine) {
        shapeHtml = `<svg width="100%" height="100%" preserveAspectRatio="none"><line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" /></svg>`;
      } else if (isCircle || isOval) {
        shapeHtml = `<div style="width: 100%; height: 100%; border-radius: 50%; background-color: ${fill}; border: ${strokeWidth}px solid ${stroke}; box-sizing: border-box;"></div>`;
      } else if (variant === 'triangle') {
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,100 0,100" fill="${fill}" stroke="${stroke || 'transparent'}" stroke-width="${strokeWidth}" /></svg>`;
      } else if (variant === 'pentagon') {
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,38 81,100 19,100 0,38" fill="${fill}" stroke="${stroke || 'transparent'}" stroke-width="${strokeWidth}" /></svg>`;
      } else {
        shapeHtml = `<div style="width: 100%; height: 100%; background-color: ${fill}; border: ${strokeWidth}px solid ${stroke || 'transparent'}; border-radius: ${cornerRadius}px; box-sizing: border-box;"></div>`;
      }
      
      innerHtml = `<div class="el" style="${baseStyle}">${shapeHtml}</div>\n`;
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
    else if (el.type === 'couple-quote-contacts-card') {
      const bg = el.style.backgroundColor || '#FAF8F5';
      const border = el.style.borderColor || '#EADDCE';
      const rad = el.style.borderRadius ?? 20;
      const titleCol = el.style.titleColor || '#2D2A26';
      const textCol = el.style.color || '#524B42';
      const accent = el.style.accentColor || '#C5A880';
      const align = el.style.align || 'center';
      const titleFont = el.style.titleFontFamily || 'serif';
      const bodyFont = el.style.fontFamily || 'sans-serif';
      const titleSize = el.style.titleFontSize || 22;
      const bodySize = el.style.bodyFontSize || 12;

      innerHtml = `
      <div class="el" style="${baseStyle} background-color: ${bg}; border: 1px solid ${border}; border-radius: ${rad}px; padding: 16px; box-sizing: border-box; text-align: ${align}; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: inline-block; background: ${accent}20; color: ${accent}; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-bottom: 6px;">
            ${el.content?.badge || '💍 Frase, Nombres & Contactos'}
          </div>
          <h3 style="margin: 0 0 4px 0; font-family: ${titleFont}; font-size: ${titleSize}px; color: ${titleCol};">${el.content?.coupleNames || 'Romina & Herly'}</h3>
          ${el.content?.weddingDate ? `<p style="margin: 0 0 8px 0; font-size: 10px; color: ${accent}; font-weight: 600;">• ${el.content.weddingDate} •</p>` : ''}
          <p style="margin: 0 0 10px 0; font-style: italic; font-size: ${bodySize}px; font-family: ${titleFont}; color: ${textCol};">"${el.content?.quote || ''}"</p>
        </div>
        <div style="border-top: 1px solid ${border}; padding-top: 8px;">
          <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 10px; color: ${titleCol}; font-family: ${bodyFont};">${el.content?.contactTitle || 'Confirmación & Contactos'}</p>
          <p style="margin: 0; font-size: 10px; color: ${textCol}; font-family: ${bodyFont};">${el.content?.contactPhone ? '📞 ' + el.content.contactPhone : ''} ${el.content?.contactEmail ? '| ✉️ ' + el.content.contactEmail : ''}</p>
          ${el.content?.contactNote ? `<p style="margin: 3px 0 0 0; font-style: italic; font-size: 9px; color: ${accent};">${el.content.contactNote}</p>` : ''}
        </div>
      </div>
      `;
    }
    else if (el.type === 'dress-code-card' || el.type === 'wishes-wall-card' || el.type === 'event-ceremony-card' || el.type === 'event-reception-card') {
      const bg = el.style.backgroundColor || '#FAF8F5';
      const border = el.style.borderColor || '#EADDCE';
      const rad = el.style.borderRadius ?? 20;
      const titleCol = el.style.titleColor || '#2D2A26';
      const textCol = el.style.color || '#524B42';
      const accent = el.style.accentColor || '#C5A880';
      const align = el.style.align || 'left';
      const titleFont = el.style.titleFontFamily || 'serif';
      const bodyFont = el.style.fontFamily || 'sans-serif';
      const titleSize = el.style.titleFontSize || 18;
      const bodySize = el.style.bodyFontSize || 11;
      const badgeSize = el.style.badgeFontSize || 11;
      const strokeW = el.style.strokeWidth ?? 1;

      innerHtml = `
      <div class="el" style="${baseStyle} background-color: ${bg}; border: ${strokeW}px solid ${border}; border-radius: ${rad}px; padding: 16px; box-sizing: border-box; text-align: ${align};">
        <div style="display: inline-block; background: ${accent}20; color: ${accent}; padding: 4px 10px; border-radius: 12px; font-size: ${badgeSize}px; font-weight: bold; margin-bottom: 8px;">
          ${el.content?.badge || 'Detalles'}
        </div>
        <h4 style="margin: 0 0 6px 0; font-family: ${titleFont}; font-size: ${titleSize}px; color: ${titleCol};">${el.content?.title || el.content?.styleName || el.content?.venueName || ''}</h4>
        <p style="margin: 0; font-size: ${bodySize}px; font-family: ${bodyFont}; color: ${textCol}; line-height: 1.4;">${el.content?.description || el.content?.subtitle || el.content?.address || ''}</p>
      </div>
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
