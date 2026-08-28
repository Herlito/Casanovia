const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanToolbar.tsx', 'utf8');

const replacement = `            {/* Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                Nombre / Identificador
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#8B3A4A]"
                />
                <div className="relative shrink-0" title="Color del texto">
                  <input
                    type="color"
                    value={selectedElement.textColor || '#2D2A26'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div 
                    style={{ backgroundColor: selectedElement.textColor || '#2D2A26' }}
                    className="w-7 h-7 rounded-lg border border-[#D9CEBF] shadow-xs hover:scale-105 transition-transform mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Número de Sillas en Fila */}
            {selectedElement.type === 'chair_row' && (
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                  Cantidad de Sillas
                </label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={selectedElement.chairCount || 4}
                  onChange={(e) => onUpdateElement(selectedElement.id, { chairCount: parseInt(e.target.value) || 4 })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#8B3A4A]"
                />
              </div>
            )}`;

code = code.replace(/\{\/\* Nombre \*\/\}[\s\S]*?className="w-full px-2\.5 py-1\.5 bg-\[#FAF8F5\] border border-\[#D9CEBF\] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-\[#8B3A4A\]"\s*\/>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/floorplan/FloorPlanToolbar.tsx', code);
