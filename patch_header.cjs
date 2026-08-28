const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

const replacement = `
        {/* Left: Brand & Wedding Selector */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B3A4A] border border-rose-200 flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
            {weddingTitle.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="font-bold text-xs sm:text-sm text-[#2D2A26] font-serif">
                {weddingTitle}
              </h1>
              <div className="flex items-center space-x-2 text-[11px] text-[#8C8276]">
                {scaleCalibration.isCalibrated && (
                  <span className="text-emerald-700 font-semibold hidden sm:inline">
                    📏 1m = {scaleCalibration.pixelsPerMeter.toFixed(1)}px
                  </span>
                )}
              </div>
            </div>
            
            {/* Canvas Dimensions Editor */}
            <div className="hidden md:flex items-center space-x-2 bg-blue-50 p-1.5 rounded-lg border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Lienzo</span>
              <input 
                type="number" 
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value) || 1600)}
                className="w-16 h-6 px-1 text-xs border border-blue-300 rounded focus:outline-hidden text-center"
                title="Ancho del lienzo (px)"
              />
              <span className="text-xs text-blue-500 font-bold">x</span>
              <input 
                type="number" 
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value) || 1200)}
                className="w-16 h-6 px-1 text-xs border border-blue-300 rounded focus:outline-hidden text-center"
                title="Alto del lienzo (px)"
              />
            </div>
          </div>
        </div>
`;

code = code.replace(/\{\/\* Left: Brand & Wedding Selector \*\/\}[\s\S]*?\{\scaleCalibration\.isCalibrated && \([\s\S]*?<\/div>\s*<\/div>/, replacement);
fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
