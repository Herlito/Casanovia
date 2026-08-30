import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

old_zoom = """        {/* Mobile Zoom Controls (Footer) */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-[#E8DCCF] shadow-lg">"""

new_zoom = """        {/* Mobile Zoom Controls (Footer) */}
        {!showMobileToolbar && !showMobileGuests && (
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-[#E8DCCF] shadow-lg">"""

text = text.replace(old_zoom, new_zoom)

# Close the condition bracket after the zoom controls
old_zoom_end = """            <Magnet className="w-4 h-4" />
          </button>
        </div>"""
new_zoom_end = """            <Magnet className="w-4 h-4" />
          </button>
        </div>
        )}"""

text = text.replace(old_zoom_end, new_zoom_end)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
