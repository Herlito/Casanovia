const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

const replacement = `          {/* Sync Tables & Guests button */}
          <div className="flex items-center bg-white border border-rose-200 rounded-xl shadow-2xs overflow-hidden">
            <button
              onClick={handleSyncWithWedding}
              className={\`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer \${
                syncSuccessNotice
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'hover:bg-rose-50 text-[#8B3A4A]'
              }\`}
              title="Sincronizar mesas y asientos con la distribución actual de invitados y acompañantes"
            >
              <RefreshCw className={\`w-3.5 h-3.5 text-[#8B3A4A] \${syncSuccessNotice ? 'animate-spin' : ''}\`} />
              <span className="font-bold">
                {syncSuccessNotice ? '¡Sincronizado!' : 'Sincronizar Mesas'}
              </span>
            </button>
            <div className="w-px h-5 bg-rose-100"></div>
            <label className="flex items-center space-x-1 px-2 py-1.5 cursor-pointer hover:bg-rose-50 transition-colors" title="Sincronización Automática al cargar">
              <input 
                type="checkbox" 
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-3 h-3 text-[#8B3A4A] border-rose-200 rounded focus:ring-[#8B3A4A]"
              />
              <span className="text-[10px] font-bold text-[#8C8276]">Auto</span>
            </label>
          </div>`;

code = code.replace(/\{\/\* Sync Tables & Guests button \*\/\}[\s\S]*?<\/button>/, replacement);
fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
