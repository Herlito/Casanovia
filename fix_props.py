import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

old_code = """                {['rectangle', 'square'].includes(selectedElement.style.variant || 'rectangle') && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Radio de Esquinas</label>"""

new_code = """            {/* Gradient Controls */}
            <div className="mt-4 pt-4 border-t border-[#D9CEBF]">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-semibold text-[#8C8276] uppercase tracking-wider">Usar Degradado</label>
                    <input 
                        type="checkbox"
                        className="w-4 h-4 text-[#2D3748] rounded border-gray-300 focus:ring-[#2D3748] cursor-pointer"
                        checked={selectedElement.style.gradientEnabled || false}
                        onChange={(e) => handleUpdateStyle('gradientEnabled', e.target.checked)}
                    />
                </div>
                
                {selectedElement.style.gradientEnabled && (
                    <div className="space-y-3 mt-2">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo de Degradado</label>
                            <select
                                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50"
                                value={selectedElement.style.gradientType || 'linear'}
                                onChange={(e) => handleUpdateStyle('gradientType', e.target.value)}
                            >
                                <option value="linear">Lineal</option>
                                <option value="radial">Circular / Radial</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {/* Color 1 */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color 1</label>
                                <div className="flex items-center space-x-1 mb-1">
                                    <input 
                                        type="color"
                                        className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                                        value={(selectedElement.style.gradientColors && selectedElement.style.gradientColors[0] && selectedElement.style.gradientColors[0].length === 9) ? selectedElement.style.gradientColors[0].substring(0, 7) : (selectedElement.style.gradientColors && selectedElement.style.gradientColors[0] ? selectedElement.style.gradientColors[0].substring(0, 7) : '#ff0000')}
                                        onChange={(e) => {
                                            const currentColors = selectedElement.style.gradientColors || ['#ff0000ff', '#0000ffff'];
                                            const hex = e.target.value;
                                            const alpha = currentColors[0]?.length === 9 ? currentColors[0].substring(7, 9) : 'ff';
                                            handleUpdateStyle('gradientColors', [hex + alpha, currentColors[1]]);
                                        }}
                                    />
                                </div>
                                <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Opacidad: {Math.round((parseInt(((selectedElement.style.gradientColors && selectedElement.style.gradientColors[0]?.length === 9) ? selectedElement.style.gradientColors[0].substring(7, 9) : 'ff'), 16) / 255) * 100)}%</label>
                                <input 
                                    type="range"
                                    min="0" max="255"
                                    className="w-full accent-[#2D3748]"
                                    value={parseInt(((selectedElement.style.gradientColors && selectedElement.style.gradientColors[0]?.length === 9) ? selectedElement.style.gradientColors[0].substring(7, 9) : 'ff'), 16)}
                                    onChange={(e) => {
                                        const currentColors = selectedElement.style.gradientColors || ['#ff0000ff', '#0000ffff'];
                                        const hex = currentColors[0]?.substring(0, 7) || '#ff0000';
                                        const alpha = parseInt(e.target.value).toString(16).padStart(2, '0');
                                        handleUpdateStyle('gradientColors', [hex + alpha, currentColors[1]]);
                                    }}
                                />
                            </div>
                            
                            {/* Color 2 */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color 2</label>
                                <div className="flex items-center space-x-1 mb-1">
                                    <input 
                                        type="color"
                                        className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                                        value={(selectedElement.style.gradientColors && selectedElement.style.gradientColors[1] && selectedElement.style.gradientColors[1].length === 9) ? selectedElement.style.gradientColors[1].substring(0, 7) : (selectedElement.style.gradientColors && selectedElement.style.gradientColors[1] ? selectedElement.style.gradientColors[1].substring(0, 7) : '#0000ff')}
                                        onChange={(e) => {
                                            const currentColors = selectedElement.style.gradientColors || ['#ff0000ff', '#0000ffff'];
                                            const hex = e.target.value;
                                            const alpha = currentColors[1]?.length === 9 ? currentColors[1].substring(7, 9) : 'ff';
                                            handleUpdateStyle('gradientColors', [currentColors[0], hex + alpha]);
                                        }}
                                    />
                                </div>
                                <label className="block text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Opacidad: {Math.round((parseInt(((selectedElement.style.gradientColors && selectedElement.style.gradientColors[1]?.length === 9) ? selectedElement.style.gradientColors[1].substring(7, 9) : 'ff'), 16) / 255) * 100)}%</label>
                                <input 
                                    type="range"
                                    min="0" max="255"
                                    className="w-full accent-[#2D3748]"
                                    value={parseInt(((selectedElement.style.gradientColors && selectedElement.style.gradientColors[1]?.length === 9) ? selectedElement.style.gradientColors[1].substring(7, 9) : 'ff'), 16)}
                                    onChange={(e) => {
                                        const currentColors = selectedElement.style.gradientColors || ['#ff0000ff', '#0000ffff'];
                                        const hex = currentColors[1]?.substring(0, 7) || '#0000ff';
                                        const alpha = parseInt(e.target.value).toString(16).padStart(2, '0');
                                        handleUpdateStyle('gradientColors', [currentColors[0], hex + alpha]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

                {['rectangle', 'square'].includes(selectedElement.style.variant || 'rectangle') && (
                  <div className="mt-4">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Radio de Esquinas</label>"""

content = content.replace(old_code, new_code)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)
