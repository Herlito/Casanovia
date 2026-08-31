import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    content = f.read()

audio_export = """    else if (el.type === 'audio-player') {
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
"""

content = content.replace("    else if (el.type === 'countdown-widget') {", audio_export + "    else if (el.type === 'countdown-widget') {")

with open('src/WeddingCraft/lib/exportHTML.ts', 'w') as f:
    f.write(content)

