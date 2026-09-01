import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    content = f.read()

shape_orig = r"""else if \(el.type === 'svg-shape'\) \{
      const fill = el.style.isDefaultStyle \? \(doc.theme.palette.primary\) : \(el.style.fill \|\| '#cccccc'\);
      const stroke = el.style.stroke \|\| 'transparent';
      const strokeWidth = el.style.strokeWidth \|\| 0;
      const cornerRadius = el.style.borderRadius \|\| 0;
      const w = el.transform.width;
      const h = el.transform.height;
      const variant = el.style.variant \|\| 'rectangle';
      
      let shapeHtml = '';
      if \(variant === 'line'\) \{
        shapeHtml = `<svg width="100%" height="100%" preserveAspectRatio="none"><line x1="0" y1="\$\{h/2\}" x2="\$\{w\}" y2="\$\{h/2\}" stroke="\$\{fill\}" stroke-width="\$\{strokeWidth \|\| 4\}" /></svg>`;
      \} else if \(variant === 'circle'\) \{
        shapeHtml = `<div style="width: 100%; height: 100%; border-radius: 50%; background-color: \$\{fill\}; border: \$\{strokeWidth\}px solid \$\{stroke\}; box-sizing: border-box;"></div>`;
      \} else if \(variant === 'triangle'\) \{
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,100 0,100" fill="\$\{fill\}" stroke="\$\{stroke\}" stroke-width="\$\{strokeWidth\}" /></svg>`;
      \} else if \(variant === 'pentagon'\) \{
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,38 81,100 19,100 0,38" fill="\$\{fill\}" stroke="\$\{stroke\}" stroke-width="\$\{strokeWidth\}" /></svg>`;
      \} else \{
        shapeHtml = `<div style="width: 100%; height: 100%; background-color: \$\{fill\}; border: \$\{strokeWidth\}px solid \$\{stroke\}; border-radius: \$\{cornerRadius\}px; box-sizing: border-box;"></div>`;
      \}
      
      return `
        <div id="\$\{el.id\}" class="wc-element \$\{animClass\}" style="\$\{innerStyle\} z-index: \$\{el.zIndex\}; opacity: \$\{el.style.opacity \?\? 1\}; \$\{animStyles\}">
          \$\{shapeHtml\}
        </div>
      `;
    \}"""

shape_new = """else if (el.type === 'svg-shape') {
      const fill = el.style.isDefaultStyle ? (doc.theme.palette.primary) : (el.style.fill || '#cccccc');
      const stroke = el.style.stroke || 'transparent';
      const strokeWidth = el.style.strokeWidth || 0;
      const cornerRadius = el.style.borderRadius || 0;
      const w = el.transform.width;
      const h = el.transform.height;
      const variant = el.style.variant || 'rectangle';
      
      let shapeHtml = '';
      if (variant === 'line') {
        shapeHtml = `<svg width="100%" height="100%" preserveAspectRatio="none"><line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="${fill}" stroke-width="${strokeWidth || 4}" /></svg>`;
      } else if (variant === 'circle') {
        shapeHtml = `<div style="width: 100%; height: 100%; border-radius: 50%; background-color: ${fill}; border: ${strokeWidth}px solid ${stroke}; box-sizing: border-box;"></div>`;
      } else if (variant === 'triangle') {
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,100 0,100" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" /></svg>`;
      } else if (variant === 'pentagon') {
        shapeHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,0 100,38 81,100 19,100 0,38" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" /></svg>`;
      } else {
        shapeHtml = `<div style="width: 100%; height: 100%; background-color: ${fill}; border: ${strokeWidth}px solid ${stroke}; border-radius: ${cornerRadius}px; box-sizing: border-box;"></div>`;
      }
      
      innerHtml = `<div class="el" style="${baseStyle}">${shapeHtml}</div>\\n`;
    }"""

content = re.sub(shape_orig, shape_new, content, flags=re.DOTALL)

audio_orig = r"""else if \(el.type === 'audio-player'\) \{
      const bgColor = el.style.backgroundColor \|\| 'rgba\(255,255,255,0.8\)';
      const iconColor = el.style.color \|\| '#000000';
      return `
        <div id="\$\{el.id\}" class="wc-element \$\{animClass\}" style="\$\{innerStyle\} z-index: \$\{el.zIndex\}; opacity: \$\{el.style.opacity \?\? 1\}; \$\{animStyles\}">
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: \$\{bgColor\}; border-radius: 50%; box-shadow: 0 4px 6px rgba\(0,0,0,0.1\); cursor: pointer;" onclick="var a=document.getElementById\('audio_\$\{el.id\}'\); if\(a.paused\)\{a.play\(\); this.innerHTML='<svg width=\\'50%\\' height=\\'50%\\' viewBox=\\'0 0 24 24\\' fill=\\'\$\{iconColor\}'><path d=\\'M6 19h4V5H6v14zm8-14v14h4V5h-4z\\'/></svg>';\}else\{a.pause\(\); this.innerHTML='<svg width=\\'50%\\' height=\\'50%\\' viewBox=\\'0 0 24 24\\' fill=\\'\$\{iconColor\}'><path d=\\'M8 5v14l11-7z\\'/></svg>';\}">
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="\$\{iconColor\}"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <audio id="audio_\$\{el.id\}" src="\$\{el.content.src\}" loop preload="auto"></audio>
        </div>
      `;
    \}"""

audio_new = """else if (el.type === 'audio-player') {
      const bgColor = el.style.backgroundColor || 'rgba(255,255,255,0.8)';
      const iconColor = el.style.color || '#000000';
      innerHtml = `
        <div class="el" style="${baseStyle}">
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${bgColor}; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="var a=document.getElementById('audio_${el.id}'); if(a.paused){a.play(); this.innerHTML='<svg width=\\'50%\\' height=\\'50%\\' viewBox=\\'0 0 24 24\\' fill=\\'${iconColor}\\'><path d=\\'M6 19h4V5H6v14zm8-14v14h4V5h-4z\\'/></svg>';}else{a.pause(); this.innerHTML='<svg width=\\'50%\\' height=\\'50%\\' viewBox=\\'0 0 24 24\\' fill=\\'${iconColor}\\'><path d=\\'M8 5v14l11-7z\\'/></svg>';}">
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="${iconColor}"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <audio id="audio_${el.id}" src="${el.content.src}" loop preload="auto"></audio>
        </div>
      `;
    }"""

content = re.sub(audio_orig, audio_new, content, flags=re.DOTALL)

with open('src/WeddingCraft/lib/exportHTML.ts', 'w') as f:
    f.write(content)
