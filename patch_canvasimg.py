import re

with open('src/WeddingCraft/components/CanvasImage.tsx', 'r') as f:
    text = f.read()

old_clip = """    } else if (el.style.maskId === 'heart') {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, topCurveHeight);
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.bezierCurveTo(0, h / 2, w / 2, h * 0.8, w / 2, h);
      ctx.bezierCurveTo(w / 2, h * 0.8, w, h / 2, w, topCurveHeight);
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, topCurveHeight);
      ctx.closePath();
    } else {"""

new_clip = """    } else if (el.style.maskId === 'heart') {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, topCurveHeight);
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.bezierCurveTo(0, h / 2, w / 2, h * 0.8, w / 2, h);
      ctx.bezierCurveTo(w / 2, h * 0.8, w, h / 2, w, topCurveHeight);
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, topCurveHeight);
      ctx.closePath();
    } else if (el.style.maskId === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
    } else if (el.style.maskId === 'scallop') {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      // Simplify scallop to just a rect for now to avoid complex math in clip
      ctx.closePath();
    } else {"""

text = text.replace(old_clip, new_clip)

with open('src/WeddingCraft/components/CanvasImage.tsx', 'w') as f:
    f.write(text)
