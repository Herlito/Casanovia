import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Add ChevronLeft and ChevronRight to imports
text = text.replace('ChevronDown,', 'ChevronDown,\n  ChevronLeft,\n  ChevronRight,')

# Remove the previously added floating buttons
floating_buttons = """          {/* Mobile Sidebar Toggles */}
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
          </div>"""
text = text.replace(floating_buttons, '')

# Update left sidebar wrapper to add the handle
left_sidebar_old = """        {/* Left Sidebar: Furniture & Properties */}
        <div className={`absolute md:relative z-50 h-full transition-transform duration-300 ${showMobileToolbar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <FloorPlanToolbar"""

left_sidebar_new = """        {/* Left Sidebar: Furniture & Properties */}
        <div className={`absolute md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showMobileToolbar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <FloorPlanToolbar"""
text = text.replace(left_sidebar_old, left_sidebar_new)

left_sidebar_end_old = """          onSendToBack={handleSendToBack}
        />
        </div>"""
left_sidebar_end_new = """          onSendToBack={handleSendToBack}
        />
          {/* Collapse/Expand Handle Left */}
          <button
            onClick={() => { setShowMobileToolbar(!showMobileToolbar); setShowMobileGuests(false); }}
            className="md:hidden absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-l-0 border-[#E8DCCF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"
          >
            {showMobileToolbar ? <ChevronLeft className="w-5 h-5 text-[#8B3A4A]" /> : <ChevronRight className="w-5 h-5 text-[#8B3A4A]" />}
          </button>
        </div>"""
text = text.replace(left_sidebar_end_old, left_sidebar_end_new)


# Update right sidebar wrapper to add the handle
right_sidebar_old = """        {/* Right Sidebar: Seating Guest List */}
        <div className={`absolute right-0 md:relative z-50 h-full transition-transform duration-300 ${showMobileGuests ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <FloorPlanGuestSidebar"""
right_sidebar_new = """        {/* Right Sidebar: Seating Guest List */}
        <div className={`absolute right-0 md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showMobileGuests ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {/* Collapse/Expand Handle Right */}
          <button
            onClick={() => { setShowMobileGuests(!showMobileGuests); setShowMobileToolbar(false); }}
            className="md:hidden absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-r-0 border-[#E8DCCF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"
          >
            {showMobileGuests ? <ChevronRight className="w-5 h-5 text-[#8B3A4A]" /> : <ChevronLeft className="w-5 h-5 text-[#8B3A4A]" />}
          </button>
          <FloorPlanGuestSidebar"""
text = text.replace(right_sidebar_old, right_sidebar_new)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
