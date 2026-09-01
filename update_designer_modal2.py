import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

rotation_button = """          <div className="w-px h-4 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-1.5 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#EBEBEB] rounded-lg transition-colors cursor-pointer text-[10px] font-semibold flex items-center space-x-1"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>"""
content = re.sub(r'(<Maximize2 className="w-3\.5 h-3\.5" />\s*</button>)', r'\1\n' + rotation_button, content)

rotation_button_mobile = """          <div className="w-px h-5 bg-[#D9CEBF] mx-1" />
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-full transition-colors flex items-center"
            title="Girar Plano 90°"
          >
            <RotateCcw className="w-4 h-4" />
          </button>"""
content = re.sub(r'(<Maximize2 className="w-4 h-4" />\s*</button>)', r'\1\n' + rotation_button_mobile, content)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
