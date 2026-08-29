import re

with open('src/WeddingCraft/lib/exportHTML.ts', 'r') as f:
    text = f.read()

# Add keyframes to the CSS string
keyframes = """    html += `
    <style>
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
    </style>\n`;"""

# Replace the current body/style logic
old_style_block = """    html += `
    <style>
      body { margin: 0; background: #fff; overflow-x: hidden; }
      .canvas-container { position: relative; width: 100%; min-height: 100vh; overflow: hidden; background: #fff; }
      .el { position: absolute; box-sizing: border-box; }
    </style>\n`;"""
    
text = text.replace(old_style_block, keyframes)


# Now inside the element loop:
loop_start = """    const x = el.transform.x;
    const y = el.transform.y;
    const width = el.transform.width;
    const height = el.transform.height;
    const rot = el.transform.rotation || 0;
    
    let baseStyle = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; transform: rotate(${rot}deg); z-index: ${el.zIndex}; opacity: ${el.style.opacity ?? 1};`;"""

new_loop_start = """    const x = el.transform.x;
    const y = el.transform.y;
    const width = el.transform.width;
    const height = el.transform.height;
    const rot = el.transform.rotation || 0;
    
    // Process Animations
    let animClasses = [];
    let animStyles = [];
    let initialOpacity = el.style.opacity ?? 1;

    if (el.animation) {
      const anims = [];
      const ent = el.animation.entrance;
      const perm = el.animation.permanent;
      const ex = el.animation.exit;
      
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
      
      // Exit animations would require JS to trigger usually, but if provided without a trigger, they don't auto-run unless chained. 
      // We skip pure CSS exit animations unless triggered by JS. For now, just add if there's no trigger.
      
      if (anims.length > 0) {
        animStyles.push(`animation: ${anims.join(', ')};`);
      }
    }

    const wrapperStyle = `left: ${x}px; top: ${y}px; z-index: ${el.zIndex}; ${animStyles.join(' ')} opacity: ${initialOpacity};`;
    const innerStyle = `width: ${width}px; height: ${height}px; transform: rotate(${rot}deg); transform-origin: top left;`;
    
    let baseStyle = `${innerStyle}`;"""

text = text.replace(loop_start, new_loop_start)

# Now, we need to wrap every html += ... in the wrapper.
# Since there are multiple places, it's easier to just change html += `<div ...>` to `<div class="anim-wrapper"><div class="el"...></div></div>`
# Wait, let's just create a string called `elementHtml = ""` and then wrap it at the end.

# This might be tricky via regex. Let's do it carefully.
# Instead of rewriting the whole logic, let's just replace `class="el"` with `class="el" style="${baseStyle} ..."` 
# WAIT. In the current code, the absolute positioning `left` and `top` and `z-index` are inside `baseStyle`.
# If I change `baseStyle` to only be `innerStyle`, then the elements will lose their `left`, `top` UNLESS I wrap them.

# Let's write a python function to replace the HTML appending inside the loop.
