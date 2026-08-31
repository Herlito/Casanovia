import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

audio_props = """
        {selectedElement.type === 'audio-player' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Título de la Canción</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">URL del Audio (mp3, etc)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.src || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.backgroundColor || '#EBEBEB'}
                  onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Elementos</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.color || '#2D3748'}
                  onChange={(e) => handleUpdateStyle('color', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
"""

# Insert audio properties before generic opacity control which we still need to add!
content = content.replace("        {selectedElement.type === 'interactive-button' && (", audio_props + "        {selectedElement.type === 'interactive-button' && (")

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)

