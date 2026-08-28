const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

const replacement = `          {/* Export PDF */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-xs font-semibold text-[#2D2A26] transition-colors shadow-2xs cursor-pointer"
              title="Exportar documento PDF de alta calidad para montaje"
            >
              <FileDown className="w-3.5 h-3.5 text-[#8B3A4A]" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E8DCCF] rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-1.5 flex flex-col">
                  <button onClick={() => handleExportPdf('all')} className="text-left px-3 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] rounded-lg transition-colors cursor-pointer">
                    📄 Todo (Plano + Lista)
                  </button>
                  <button onClick={() => handleExportPdf('plan_only')} className="text-left px-3 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] rounded-lg transition-colors cursor-pointer">
                    🖼️ Solo Plano de Distribución
                  </button>
                  <button onClick={() => handleExportPdf('list_only')} className="text-left px-3 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#FAF8F5] hover:text-[#8B3A4A] rounded-lg transition-colors cursor-pointer">
                    👥 Solo Lista de Invitados
                  </button>
                </div>
              </div>
            )}
          </div>`;

code = code.replace(/\{\/\* Export PDF \*\/\}[\s\S]*?<\/button>/, replacement);
fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
