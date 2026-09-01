import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# Add titleColor to countdown widget
countdown_colors = """            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Números</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.numberColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('numberColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Etiquetas</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.labelColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('labelColor', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color del Título</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.titleColor || '#000000'}
                onChange={(e) => handleUpdateStyle('titleColor', e.target.value)}
              />
            </div>"""

regex = re.compile(r'<div className="grid grid-cols-2 gap-1.5">\s*<div>\s*<label className="block text-\[10px\] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Números</label>.*?</div>\s*</div>', re.DOTALL)
content = regex.sub(countdown_colors, content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
