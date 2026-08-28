const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanToolbar.tsx', 'utf8');

const newFurniture = `
            {/* Asientos & Butacas */}
            <div>
              <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
                Asientos & Butacas
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddElement('single_chair')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Silla Individual</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('chair_row')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Fila de Sillas</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('armchair_luis_xv')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Sillón Luis XV</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_1_seat')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Butaca (1 Cuerpo)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_2_seat')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Butaca (2 Cuerpos)</div>
                  </div>
                </button>
              </div>
            </div>
`;

code = code.replace('{/* Escenario & Entretenimiento */}', newFurniture + '\n            {/* Escenario & Entretenimiento */}');
fs.writeFileSync('src/components/floorplan/FloorPlanToolbar.tsx', code);
