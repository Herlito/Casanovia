import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    text = f.read()

# Replace the baseStyle block
old_block_pattern = r"    const rot = el\.transform\.rotation \|\| 0;\s*let baseStyle = `left: \$\{x\}px; top: \$\{y\}px; width: \$\{width\}px; height: \$\{height\}px; transform: rotate\(\$\{rot\}deg\); z-index: \$\{el\.zIndex\}; opacity: \$\{el\.style\.opacity \?\? 1\};`;"

new_block = """    const rot = el.transform.rotation || 0;
    
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
    
    let baseStyle = `${innerStyle}`;"""

text = re.sub(old_block_pattern, new_block, text)

# Ensure keyframes are present
if "keyframes fadeIn" not in text:
    old_style = "    <style>\n      body { margin: 0; background: #fff; overflow-x: hidden; }\n      .canvas-container { position: relative; width: 100%; min-height: 100vh; overflow: hidden; background: #fff; }\n      .el { position: absolute; box-sizing: border-box; }\n    </style>"
    new_style = """    <style>
      body { margin: 0; background: #fff; overflow-x: hidden; }
      .canvas-container { position: relative; width: 100%; min-height: 100vh; overflow: hidden; background: #fff; }
      .el { position: absolute; box-sizing: border-box; }
      .anim-wrapper { position: absolute; box-sizing: border-box; }
      
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes slideLeft { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideRight { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
      @keyframes bounceIn { 
        0% { transform: scale(0.8); opacity: 0; } 
        60% { transform: scale(1.05); opacity: 1; } 
        100% { transform: scale(1); opacity: 1; } 
      }
      @keyframes slideUpOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-50px); opacity: 0; } }
      @keyframes slideDownOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(50px); opacity: 0; } }

      @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
      @keyframes spin { 100% { transform: rotate(360deg); } }
      @keyframes shake { 
        0%, 100% { transform: translateX(0); } 
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 
        20%, 40%, 60%, 80% { transform: translateX(5px); } 
      }
      @keyframes swing {
        20% { transform: rotate(15deg); }
        40% { transform: rotate(-10deg); }
        60% { transform: rotate(5deg); }
        80% { transform: rotate(-5deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.1); }
        28% { transform: scale(1); }
        42% { transform: scale(1.1); }
        70% { transform: scale(1); }
      }
    </style>"""
    text = text.replace(old_style, new_style)

with open('src/WeddingCraft/lib/exportHTML.ts', 'w') as f:
    f.write(text)
