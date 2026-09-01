import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

# Add shape properties
shape_props = """
        {selectedElement.type === 'svg-shape' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Forma</label>
              <select 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 outline-none"
                value={selectedElement.style.variant || 'rectangle'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="rectangle">Rectángulo</option>
                <option value="square">Cuadrado</option>
                <option value="circle">Círculo</option>
                <option value="line">Línea</option>
                <option value="triangle">Triángulo</option>
                <option value="pentagon">Pentágono</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Relleno</label>
                <div className="flex items-center space-x-1">
                    <input 
                      type="color" 
                      className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                      value={selectedElement.style.fill || '#cccccc'}
                      onChange={(e) => handleUpdateStyle('fill', e.target.value)}
                      disabled={selectedElement.style.fill === 'transparent'}
                    />
                    <button 
                        className={`text-xs px-2 py-1 rounded border ${selectedElement.style.fill === 'transparent' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                        onClick={() => handleUpdateStyle('fill', selectedElement.style.fill === 'transparent' ? '#cccccc' : 'transparent')}
                    >T</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Borde</label>
                <div className="flex items-center space-x-1">
                    <input 
                      type="color" 
                      className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                      value={selectedElement.style.stroke || '#000000'}
                      onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
                      disabled={selectedElement.style.stroke === 'transparent'}
                    />
                    <button 
                        className={`text-xs px-2 py-1 rounded border ${selectedElement.style.stroke === 'transparent' ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`}
                        onClick={() => handleUpdateStyle('stroke', selectedElement.style.stroke === 'transparent' ? '#000000' : 'transparent')}
                    >T</button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Grosor Borde</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                    value={selectedElement.style.strokeWidth || 0}
                    onChange={(e) => handleUpdateStyle('strokeWidth', parseInt(e.target.value) || 0)}
                  />
                </div>
                {['rectangle', 'square'].includes(selectedElement.style.variant || 'rectangle') && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Redondeo Esquinas</label>
                  <input 
                    type="number" 
                    min="0"
                    className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                    value={selectedElement.style.borderRadius || 0}
                    onChange={(e) => handleUpdateStyle('borderRadius', parseInt(e.target.value) || 0)}
                  />
                </div>
                )}
            </div>
            
          </div>
        )}
"""

content = content.replace(
    "{selectedElement.type === 'interactive-button' && (",
    shape_props + "\n        {selectedElement.type === 'interactive-button' && ("
)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
