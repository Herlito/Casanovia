with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'r') as f:
    text = f.read()

colors_html = """        <div>
          <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color</label>
          <div className="flex items-center space-x-2 mb-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => {
                handleUpdateStyle('fill', e.target.value);
                handleUpdateStyle('isDefaultStyle', false);
              }}
            />
            <input 
              type="text" 
              className="flex-1 text-xs p-1.5 border border-[#D9CEBF] rounded uppercase font-mono"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => {
                handleUpdateStyle('fill', e.target.value);
                handleUpdateStyle('isDefaultStyle', false);
              }}
            />
          </div>
          <div className="flex space-x-1">
             {[
               { id: 'primary', color: document.theme.palette.primary },
               { id: 'secondary', color: document.theme.palette.secondary },
               { id: 'text', color: document.theme.palette.text },
               { id: 'muted', color: document.theme.palette.muted },
               { id: 'accent', color: document.theme.palette.accent }
             ].map(swatch => (
               <button 
                 key={swatch.id}
                 className="w-6 h-6 rounded border border-gray-200"
                 style={{ backgroundColor: swatch.color }}
                 title={swatch.id}
                 onClick={() => handleUpdateStyle('fill', swatch.color)}
               />
             ))}
          </div>
        </div>"""

import re
text = re.sub(r"        <div>\s*<label className=\"block text-\[10px\] font-bold text-\[#8C8276\] uppercase tracking-wider mb-1\.5\">Color</label>.*?</div>\s*</div>", colors_html, text, flags=re.DOTALL)

with open('src/WeddingCraft/components/PropertiesPanel.tsx', 'w') as f:
    f.write(text)
