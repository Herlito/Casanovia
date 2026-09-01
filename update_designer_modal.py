import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# 1. Add canvasRotation state
content = content.replace("const [zoom, setZoom] = useState<number>(1.0);", "const [zoom, setZoom] = useState<number>(1.0);\n  const [canvasRotation, setCanvasRotation] = useState<number>(0);")

# 2. Add canvasRotation to FloorPlanCanvas props
content = content.replace("zoom={zoom}\n            setZoom={setZoom}", "zoom={zoom}\n            setZoom={setZoom}\n            canvasRotation={canvasRotation}")

# 3. Add UI control for rotation next to Zoom buttons (there are two places because of mobile/desktop)
rotation_button = """          <div className="h-6 w-px bg-stone-300"></div>
          <button
            onClick={() => setCanvasRotation((r) => (r + 90) % 360)}
            className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors flex items-center space-x-1"
            title="Girar Plano"
          >
            <RotateCcw className="w-4 h-4" />
          </button>"""
content = re.sub(r'(<button[^>]*onClick=\{\(\) => setZoom\(\(z\) => Math\.max\(z \* 0\.85, 0\.25\)\)\}[^>]*>\s*<ZoomOut[^>]*/>\s*</button>\s*</div>)', r'\1\n' + rotation_button, content)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
