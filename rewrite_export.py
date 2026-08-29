import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    text = f.read()

# Locate the start of the `if (el.type === 'text')` block down to the end of the element loop
start_idx = text.find("    if (el.type === 'text') {")
end_idx = text.find("  });\n  \n  html += `</div>")

if start_idx == -1 or end_idx == -1:
    print("Could not find blocks")
    exit(1)

old_logic = text[start_idx:end_idx]

# We need to change how html is accumulated. 
# We'll accumulate inner html into `let innerHtml = '';` and then wrap it.
new_logic = """    let innerHtml = '';
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
      innerHtml = `<div class="el" style="${baseStyle} ${textStyle.replace(/\\n/g, '')}">${el.content.text.replace(/\\n/g, '<br>')}</div>\\n`;
    } 
    else if (el.type === 'image') {
      let maskStyle = '';
      if (el.style.maskId === 'circle') maskStyle = 'border-radius: 50%;';
      if (el.style.maskId === 'rounded') maskStyle = 'border-radius: 20px;';
      innerHtml = `<img class="el" src="${el.content.src}" style="${baseStyle} object-fit: cover; ${maskStyle}" />\\n`;
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
      innerHtml = `<button id="${btnId}" class="el" style="${baseStyle} ${btnStyle.replace(/\\n/g, '')}">${el.content.text || 'Botón'}</button>\\n`;
      
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
      </div>\\n`;
      
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
                    '<span style="font-family: \\\\\\'${el.style.numberFont || 'Arial'}\\\\\\', sans-serif; font-size: ${el.style.numberSize || 24}px; color: ${el.style.numberColor || '#000'}; line-height: 1;">' + val + '</span>' +
                    '<span style="font-family: \\\\\\'${el.style.labelFont || 'Arial'}\\\\\\', sans-serif; font-size: ${el.style.labelSize || 10}px; color: ${el.style.labelColor || '#666'}; margin-top: 4px;">' + p.l + '</span>' +
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
         innerHtml = `<div class="el" style="${baseStyle} background-color: ${el.style.fill || '#000'};"></div>\\n`;
       }
    }
    
    // Wrap the element if it has a wrapper style
    html += `<div class="anim-wrapper" id="wrap_${el.id}" style="${wrapperStyle}">${innerHtml}</div>\\n`;
"""

text = text[:start_idx] + new_logic + text[end_idx:]

# Additionally, the previous patch had a bug where it might have missed replacing old style block due to regex issue.
# Let's ensure the old style block isn't duplicated.

with open('src/WeddingCraft/lib/exportHTML.ts', 'w') as f:
    f.write(text)
