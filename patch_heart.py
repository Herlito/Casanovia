import re

with open('src/WeddingCraft/components/CanvasImage.tsx', 'r') as f:
    text = f.read()

arch_mask = """    } else if (el.style.maskId === 'arch') {
      const r = w / 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, r);
      ctx.arc(r, r, r, Math.PI, 0, false);
      ctx.lineTo(w, h);
      ctx.closePath();
"""

heart_mask = arch_mask + """    } else if (el.style.maskId === 'heart') {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, topCurveHeight);
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.bezierCurveTo(0, h / 2, w / 2, h * 0.8, w / 2, h);
      ctx.bezierCurveTo(w / 2, h * 0.8, w, h / 2, w, topCurveHeight);
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, topCurveHeight);
      ctx.closePath();
"""

text = text.replace(arch_mask, heart_mask)

with open('src/WeddingCraft/components/CanvasImage.tsx', 'w') as f:
    f.write(text)
