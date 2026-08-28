const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanToolbar.tsx', 'utf8');

const additionalProps = `
              </div>

              {(selectedElement.type === 'chair_row' || selectedElement.type === 'armchair_luis_xv' || selectedElement.type === 'sofa_1_seat' || selectedElement.type === 'sofa_2_seat') && (
                <div>
                  <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                    Cantidad de Asientos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedElement.chairCount || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      // Update width automatically based on the base width
                      const baseWidths = {
                        chair_row: 40,
                        armchair_luis_xv: 60,
                        sofa_1_seat: 60,
                        sofa_2_seat: 120
                      };
                      const baseW = baseWidths[selectedElement.type] || 40;
                      onUpdateElement(selectedElement.id, {
                        chairCount: val,
                        width: baseW * val
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-mono"
                  />
                </div>
              )}
`;

code = code.replace(/              <\/div>\s*<div>\s*<label className="block text-\[10px\] font-bold text-\[#8C8276\] uppercase mb-1">\s*ROTACIÓN/g, additionalProps + `\n              <div>\n                <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">\n                  ROTACIÓN`);

fs.writeFileSync('src/components/floorplan/FloorPlanToolbar.tsx', code);
