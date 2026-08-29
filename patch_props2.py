import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# Change Máscara (Recorte) to Forma de la Foto
text = text.replace('Máscara (Recorte)', 'Forma de la Foto')

# Add SVG recoloring block
svg_block = """
        {selectedElement.type === 'image' && (
          <div className="space-y-4">
            {selectedElement.content.isSvg && (
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color del Ícono / SVG</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.fill || '#000000'}
                  onChange={(e) => {
                    const color = e.target.value;
                    handleUpdateStyle('fill', color);
                    
                    // Modify the SVG source
                    if (selectedElement.content.svgText) {
                      let newSvg = selectedElement.content.svgText;
                      // Inject a style to force fill color
                      const styleTag = `<style>* { fill: ${color} !important; stroke: ${color} !important; }</style>`;
                      if (newSvg.includes('<svg')) {
                        newSvg = newSvg.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
                      }
                      const newSrc = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(newSvg)));
                      handleUpdateContent({ ...selectedElement.content, src: newSrc });
                    }
                  }}
                />
              </div>
            )}
"""

text = text.replace("""        {selectedElement.type === 'image' && (
          <div className="space-y-4">""", svg_block)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
