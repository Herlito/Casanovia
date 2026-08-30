import re

with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

# Replace:
# {el.type === 'text' ? (el.content.text || 'Texto') : el.type === 'countdown-widget' ? 'Cuenta Regresiva' : el.type === 'interactive-button' ? 'Botón Ubicación' : el.type === 'image' ? 'Imagen' : 'Forma'}

old_name = "{el.type === 'text' ? (el.content.text || 'Texto') : el.type === 'countdown-widget' ? 'Cuenta Regresiva' : el.type === 'interactive-button' ? 'Botón Ubicación' : el.type === 'image' ? 'Imagen' : 'Forma'}"

def generate_new_name():
    return """
                {(() => {
                  if (el.type === 'text') {
                    const txt = el.content.text || 'Texto';
                    return txt.length > 20 ? `Texto: ${txt.substring(0, 15)}...` : txt;
                  }
                  if (el.type === 'image') {
                    if (el.content.isSvg) return 'Gráfico SVG';
                    if (el.content.originalSrc && el.content.originalSrc.indexOf('image/png') !== -1) return 'Imagen PNG';
                    if (el.content.originalSrc && el.content.originalSrc.indexOf('image/jpeg') !== -1) return 'Imagen JPG';
                    return 'Imagen';
                  }
                  if (el.type === 'countdown-widget') return 'Cuenta Regresiva';
                  if (el.type === 'interactive-button') return 'Botón Ubicación';
                  if (el.type === 'svg-shape') return 'Forma';
                  return 'Elemento';
                })()}"""

text = text.replace(old_name, generate_new_name().strip())

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)
