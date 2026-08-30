import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Add states for mobile sidebars
state_injection = """  const [canvasHeight, setCanvasHeight] = useState<number>(1200);

  // Mobile sidebar toggles
  const [showMobileToolbar, setShowMobileToolbar] = useState<boolean>(false);
  const [showMobileGuests, setShowMobileGuests] = useState<boolean>(false);

  // Auto-show toolbar (which has properties) on mobile when element selected
  useEffect(() => {
    if (selectedElementId && window.innerWidth < 768) {
      setShowMobileToolbar(true);
      setShowMobileGuests(false);
    }
  }, [selectedElementId]);
"""
text = text.replace('  const [canvasHeight, setCanvasHeight] = useState<number>(1200);', state_injection)

# Add toggle buttons inside the canvas area for mobile
canvas_buttons = """        {/* Center: Interactive Canvas */}
        <div className="flex-1 h-full relative">
          {/* Mobile Sidebar Toggles */}
          <div className="md:hidden absolute top-4 left-4 z-40 flex space-x-2">
            <button 
              onClick={() => { setShowMobileToolbar(!showMobileToolbar); setShowMobileGuests(false); }}
              className="p-2 bg-white rounded-xl shadow-lg border border-[#E8DCCF] text-[#8B3A4A] cursor-pointer"
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>
          <div className="md:hidden absolute top-4 right-4 z-40 flex space-x-2">
            <button 
              onClick={() => { setShowMobileGuests(!showMobileGuests); setShowMobileToolbar(false); }}
              className="p-2 bg-white rounded-xl shadow-lg border border-[#E8DCCF] text-[#8B3A4A] cursor-pointer"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
"""
text = text.replace('        {/* Center: Interactive Canvas */}\n        <div className="flex-1 h-full relative">', canvas_buttons)

# Wrap sidebars in responsive classes
toolbar_replace = """        {/* Left Sidebar: Furniture & Properties */}
        <div className={`absolute md:relative z-50 h-full transition-transform duration-300 ${showMobileToolbar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <FloorPlanToolbar"""
text = text.replace('        {/* Left Sidebar: Furniture & Properties */}\n        <FloorPlanToolbar', toolbar_replace)

toolbar_end_replace = """          onSendToBack={handleSendToBack}
        />
        </div>"""
text = text.replace('          onSendToBack={handleSendToBack}\n        />', toolbar_end_replace)

guest_replace = """        {/* Right Sidebar: Seating Guest List */}
        <div className={`absolute right-0 md:relative z-50 h-full transition-transform duration-300 ${showMobileGuests ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <FloorPlanGuestSidebar"""
text = text.replace('        {/* Right Sidebar: Seating Guest List */}\n        <FloorPlanGuestSidebar', guest_replace)

guest_end_replace = """          }}
        />
        </div>"""
text = text.replace('          }}\n        />', guest_end_replace)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
