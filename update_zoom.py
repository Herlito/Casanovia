import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# Remove top zoom controls
top_zoom_regex = r'\{/\* Center: Quick Canvas Navigation Controls \*/\}.*?\{/\* Right: Actions \*/\}'
content = re.sub(top_zoom_regex, '{/* Right: Actions */}', content, flags=re.DOTALL)

# Update bottom zoom controls
bottom_zoom_old = r'\{/\* Mobile Zoom Controls \(Footer\) \*/\}.*?\{/\* Left Sidebar: Furniture & Properties \*/\}'
bottom_zoom_new = """{/* Universal Zoom Controls (Footer) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-[#EBEBEB]/90 backdrop-blur-sm p-1.5 rounded-2xl border border-transparent shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Acercar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#2D2A26] px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(z * 0.85, 0.25))}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Alejar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const isMobile = window.innerWidth <= 768;
              const availableWidth = window.innerWidth - (showLeftSidebar && !isMobile ? 320 : 0) - (showRightSidebar && !isMobile ? 320 : 0);
              const availableHeight = window.innerHeight - 120;
              const zoomX = availableWidth / canvasWidth;
              const zoomY = availableHeight / canvasHeight;
              const newZoom = Math.min(zoomX, zoomY, 3.5);
              setZoom(Math.max(0.1, newZoom - 0.05));
              setPan({ x: 50, y: 50 });
            }}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Restablecer vista"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition-colors flex items-center shadow-[inset_5px_5px_10px_transparent,inset_-5px_-5px_10px_transparent] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setGridSnap((s) => !s)}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
              gridSnap ? 'bg-[#EBEBEB] text-[#2D3748] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]' : 'text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#FAF8F5] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
            }`}
            title="Ajustar a la cuadrícula"
          >
            <Magnet className="w-4 h-4" />
          </button>
        </div>

        {/* Left Sidebar: Furniture & Properties */}"""

content = re.sub(bottom_zoom_old, bottom_zoom_new, content, flags=re.DOTALL)

# Add neomorphic rounded classes and flex-1 so they don't break layout if not using absolute layout.
# But they are absolute positioned... Wait! We changed them to `absolute` but didn't restrict their width?
# Ah, the original left sidebar was:
# <div className={`absolute md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
# We changed it to:
# <div className={`absolute z-50 h-full transition-transform duration-300 flex shadow-2xl ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
# BUT if they are purely absolute, the canvas spans 100% width. This is fine, but we might want them relative on desktop to push the canvas if the user wants. The image shows the sidebars NOT overlapping the canvas, they are part of the layout. Wait, if they are absolute, the canvas spans full width and they hover over it. The canvas has its own panning, so they can pan.
# But wait, we changed it to absolute on desktop too!
# Let's revert the sidebar positioning to allow `md:relative` on desktop!

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
