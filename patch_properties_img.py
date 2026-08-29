with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

image_controls = """        {selectedElement.type === 'image' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Máscara (Recorte)</label>
              <div className="grid grid-cols-4 gap-2">
                {['none', 'circle', 'ellipse', 'rounded', 'arch', 'heart', 'scallop', 'diamond'].map(mask => (
                  <button 
                    key={mask}
                    className={`p-1.5 border rounded-lg flex items-center justify-center bg-gray-50 ${selectedElement.style.maskId === mask ? 'border-[#8B3A4A] bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('maskId', mask)}
                    title={mask}
                  >
                     <div className="w-6 h-6 bg-gray-300" style={{
                       borderRadius: mask === 'circle' ? '50%' : mask === 'rounded' ? '4px' : '0'
                     }}></div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Marco Decorativo</label>
              <div className="grid grid-cols-3 gap-2">
                 <button 
                    className={`p-2 border rounded-lg text-xs ${!selectedElement.style.frameId ? 'border-[#8B3A4A] bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', null)}
                  >
                    Ninguno
                  </button>
                  <button 
                    className={`p-2 border rounded-lg text-xs ${selectedElement.style.frameId === 'gold-line' ? 'border-[#8B3A4A] bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', 'gold-line')}
                  >
                    Línea Fina
                  </button>
              </div>
            </div>
          </div>
        )}"""

import re
text = re.sub(r"        </div>\s*\{selectedElement\.type === 'text' && \(", image_controls + "\n\n        {selectedElement.type === 'text' && (", text)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
