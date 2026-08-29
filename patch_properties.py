import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# Add imports
imports_to_add = """import { FontPicker } from './FontPicker';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic } from 'lucide-react';
"""
text = text.replace("import { Settings2, Link as LinkIcon } from 'lucide-react';", "import { Settings2, Link as LinkIcon } from 'lucide-react';\n" + imports_to_add)

# Replace the text controls section
text_controls = """
        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => {
                  handleUpdateStyle('fontFamily', font);
                  handleUpdateStyle('isDefaultStyle', false);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Tamaño</label>
                <div className="flex items-center space-x-1">
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => {
                    handleUpdateStyle('fontSize', Math.max(8, (selectedElement.style.fontSize || 16) - 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>-</button>
                  <input 
                    type="number" 
                    className="w-full text-xs p-1.5 border border-[#D9CEBF] rounded bg-[#FAF8F5] text-center"
                    value={selectedElement.style.fontSize || 16}
                    onChange={(e) => {
                      handleUpdateStyle('fontSize', parseInt(e.target.value) || 16);
                      handleUpdateStyle('isDefaultStyle', false);
                    }}
                  />
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => {
                    handleUpdateStyle('fontSize', Math.min(144, (selectedElement.style.fontSize || 16) + 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Peso</label>
                <select 
                  className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                  value={selectedElement.style.fontWeight || 400}
                  onChange={(e) => {
                    handleUpdateStyle('fontWeight', parseInt(e.target.value));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Regular (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>SemiBold (600)</option>
                  <option value={700}>Bold (700)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-lg">
              <div className="flex space-x-1">
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'left' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'left')}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${(selectedElement.style.align || 'center') === 'center' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'center')}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'right' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'right')}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'justify' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'justify')}
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="flex space-x-1 border-l pl-2 border-gray-200">
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.fontStyle === 'italic' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('fontStyle', selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Espaciado letras</span>
                  <span>{selectedElement.style.letterSpacing || 0}px</span>
                </div>
                <input 
                  type="range" min="-2" max="20" step="0.5"
                  className="w-full accent-[#8B3A4A]"
                  value={selectedElement.style.letterSpacing || 0}
                  onChange={(e) => handleUpdateStyle('letterSpacing', parseFloat(e.target.value))}
                />
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Altura de línea</span>
                  <span>{selectedElement.style.lineHeight || 1.2}</span>
                </div>
                <input 
                  type="range" min="0.8" max="3" step="0.1"
                  className="w-full accent-[#8B3A4A]"
                  value={selectedElement.style.lineHeight || 1.2}
                  onChange={(e) => handleUpdateStyle('lineHeight', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Transformación</label>
               <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'none' || !selectedElement.style.textTransform ? 'bg-gray-200 font-bold' : 'bg-white'}`} onClick={() => handleUpdateStyle('textTransform', 'none')}>Aa</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'uppercase' ? 'bg-gray-200 font-bold' : 'bg-white'}`} onClick={() => handleUpdateStyle('textTransform', 'uppercase')}>AA</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'lowercase' ? 'bg-gray-200 font-bold' : 'bg-white'}`} onClick={() => handleUpdateStyle('textTransform', 'lowercase')}>aa</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'capitalize' ? 'bg-gray-200 font-bold' : 'bg-white'}`} onClick={() => handleUpdateStyle('textTransform', 'capitalize')}>Aa</button>
               </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
               <label className="flex items-center space-x-2">
                 <input type="checkbox" checked={selectedElement.style.shadow?.enabled || false} onChange={(e) => handleUpdateStyle('shadow', { ...selectedElement.style.shadow, enabled: e.target.checked, color: 'rgba(0,0,0,0.5)', blur: 5, offsetX: 2, offsetY: 2 })} />
                 <span className="text-xs font-bold text-gray-700">Sombra paralela</span>
               </label>
            </div>
          </div>
        )}"""

text = re.sub(r"\{\s*selectedElement.type === 'text' && \(\s*<div>\s*<label[^>]*>Tamaño de Fuente.*?</label>.*?</div>\s*\)\s*\}", text_controls, text, flags=re.DOTALL)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)

