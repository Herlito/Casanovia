import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

old_rotate = """          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors flex items-center shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>"""

new_rotate = """          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors flex items-center shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="relative flex items-center">
            <input
              type="number"
              value={canvasRotation}
              onChange={(e) => setCanvasRotation(Number(e.target.value))}
              className="w-12 h-8 bg-transparent text-xs font-mono font-bold text-[#2D2A26] text-center focus:outline-hidden focus:ring-1 focus:ring-[#8C8276] rounded-md"
              title="Giro del plano (grados)"
            />
            <span className="absolute right-1 text-[10px] font-bold text-[#2D2A26] pointer-events-none">°</span>
          </div>"""

content = content.replace(old_rotate, new_rotate)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)

