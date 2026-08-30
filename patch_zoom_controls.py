import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# 1. Hide the original zoom controls on mobile
old_zoom = """        {/* Center: Quick Canvas Navigation Controls */}
        <div className="flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]">"""
new_zoom = """        {/* Center: Quick Canvas Navigation Controls */}
        <div className="hidden md:flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]">"""
text = text.replace(old_zoom, new_zoom)

# 2. Add the mobile zoom controls at the bottom of the canvas
# Where is the canvas container? It's inside:
#       {/* 3. MAIN 3-PANEL WORKSPACE (Toolbar | Canvas | Guest Manager) */}
#       <div className="flex-1 flex overflow-hidden relative">

old_canvas_start = """      {/* 3. MAIN 3-PANEL WORKSPACE (Toolbar | Canvas | Guest Manager) */}
      <div className="flex-1 flex overflow-hidden relative">"""

new_canvas_start = """      {/* 3. MAIN 3-PANEL WORKSPACE (Toolbar | Canvas | Guest Manager) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Zoom Controls (Footer) */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-[#E8DCCF] shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-full transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#2D2A26] px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.85, 0.25))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-full transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1.0);
              setPan({ x: 50, y: 50 });
            }}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-full transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setGridSnap((s) => !s)}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              gridSnap ? 'bg-[#FAF8F5] text-[#8B3A4A] shadow-inner border border-[#D9CEBF]' : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>"""
text = text.replace(old_canvas_start, new_canvas_start)


with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
