import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# Add font picker to interactive-button
old_btn = """        {selectedElement.type === 'interactive-button' && (
          <div className="space-y-4">
            <div>"""
new_btn = """        {selectedElement.type === 'interactive-button' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => handleUpdateStyle('fontFamily', font)}
              />
            </div>
            <div>"""
text = text.replace(old_btn, new_btn)

# Add font picker to countdown-widget
old_cd = """            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Números</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.numberColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('numberColor', e.target.value)}
                />
              </div>"""

new_cd = """            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Fuente Números</label>
                <FontPicker 
                  value={selectedElement.style.numberFont || ''}
                  onChange={(font) => handleUpdateStyle('numberFont', font)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Fuente Textos</label>
                <FontPicker 
                  value={selectedElement.style.labelFont || ''}
                  onChange={(font) => handleUpdateStyle('labelFont', font)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Números</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.numberColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('numberColor', e.target.value)}
                />
              </div>"""

text = text.replace(old_cd, new_cd)

# Add container opacity logic
old_cd_opacity = """              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Etiquetas</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.labelColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('labelColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}"""

new_cd_opacity = """              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Etiquetas</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.labelColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('labelColor', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                  value={selectedElement.style.containerBackgroundColor || '#ffffff'}
                  onChange={(e) => handleUpdateStyle('containerBackgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Transparencia</label>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full accent-[#8B3A4A]"
                  value={selectedElement.style.containerOpacity ?? 0}
                  onChange={(e) => handleUpdateStyle('containerOpacity', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}"""

text = text.replace(old_cd_opacity, new_cd_opacity)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
