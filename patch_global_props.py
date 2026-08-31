import re

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    content = f.read()

global_props = """
        <div className="pt-4 border-t border-gray-200/50 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>Opacidad Global</span>
              <span>{Math.round((selectedElement.style.opacity ?? 1) * 100)}%</span>
            </label>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full accent-[#2D3748]"
              value={selectedElement.style.opacity ?? 1}
              onChange={(e) => handleUpdateStyle('opacity', parseFloat(e.target.value))}
            />
          </div>
          
          {['text', 'countdown-widget', 'interactive-button', 'svg-shape', 'audio-player'].includes(selectedElement.type) && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCurrentThemeColors"
                checked={selectedElement.style.isDefaultStyle || false}
                onChange={(e) => handleUpdateStyle('isDefaultStyle', e.target.checked)}
                className="rounded border-gray-300 text-[#2D3748] focus:ring-[#2D3748]"
              />
              <label htmlFor="useCurrentThemeColors" className="text-xs text-gray-700 cursor-pointer">
                Usar colores del estilo actual
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
"""

# Replace the end of PropertiesPanel
content = re.sub(r'      </div>\s*</div>\s*\);\s*};\s*$', global_props + '  );\n};\n', content)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(content)

