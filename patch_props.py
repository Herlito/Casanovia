import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

# I will append to the end of the space-y-5 div
new_properties = """
        {selectedElement.type === 'interactive-button' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Texto del Botón</label>
              <input 
                type="text" 
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.content.text || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Enlace (URL)</label>
              <input 
                type="text" 
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.content.linkUrl || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, linkUrl: e.target.value })}
                placeholder="https://goo.gl/maps/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Variante</label>
              <select
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.style.variant || 'solid'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="solid">Sólido</option>
                <option value="outline">Contorno</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Fondo / Borde</label>
              <input 
                type="color" 
                className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                value={selectedElement.style.backgroundColor || '#000000'}
                onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color Texto</label>
              <input 
                type="color" 
                className="w-full h-8 p-1 border border-[#D9CEBF] rounded bg-[#FAF8F5] cursor-pointer"
                value={selectedElement.style.color || '#ffffff'}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedElement.type === 'countdown-widget' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Título</label>
              <input 
                type="text" 
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Mensaje Final (Expirado)</label>
              <input 
                type="text" 
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.content.expiredMessage || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, expiredMessage: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Fecha Objetivo</label>
              <input 
                type="datetime-local" 
                disabled={selectedElement.content.useEventDate}
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5] disabled:opacity-50"
                value={selectedElement.content.targetDate ? selectedElement.content.targetDate.substring(0, 16) : ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, targetDate: new Date(e.target.value).toISOString() })}
              />
              {selectedElement.content.useEventDate && <p className="text-[10px] text-gray-500 mt-1">Vinculado a la fecha del evento.</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Estilo Visual</label>
              <select
                className="w-full text-xs p-2 border border-[#D9CEBF] rounded bg-[#FAF8F5]"
                value={selectedElement.style.variant || 'cards'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="minimal">Minimalista (Sin fondo)</option>
                <option value="cards">Tarjetas</option>
                <option value="circles">Círculos</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Mostrar Segundos</label>
              <input 
                type="checkbox" 
                checked={selectedElement.content.showSeconds}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, showSeconds: e.target.checked })}
              />
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
              </div>
              <div>
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
        )}
      </div>
    </div>
"""

text = text.replace("      </div>\n    </div>", new_properties)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
