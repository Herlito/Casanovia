import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# 1. Update the main header bar wrapper
old_header = """      {/* 1. TOP MASTER HEADER BAR */}
      <div className="h-14 overflow-x-auto border-b border-[#E8DCCF] bg-white flex items-center justify-between px-4 sm:px-6 shadow-2xs z-30">
        
        {/* Left: Brand & Wedding Selector */}
        <div className="flex items-center space-x-3">"""

new_header = """      {/* 1. TOP MASTER HEADER BAR */}
      <div className={`relative flex flex-col md:flex-row md:items-center justify-between border-b border-[#E8DCCF] bg-white shadow-2xs z-30 transition-all duration-300 ${showMobileTopBar ? 'h-auto pb-3 md:pb-0' : 'h-14 overflow-hidden md:overflow-visible'}`}>
        
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 w-full md:w-auto shrink-0">
          {/* Left: Brand & Wedding Selector */}
          <div className="flex items-center space-x-3">"""
text = text.replace(old_header, new_header)


# 2. Insert Mobile Handle & Close right after the Left block ends (before Center block)
# We need to find:
#             </div>
#           </div>
#         </div>
# 
#         {/* Center: Quick Canvas Navigation Controls */}

old_center_transition = """            </div>
          </div>
        </div>

        {/* Center: Quick Canvas Navigation Controls */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]">"""

new_center_transition = """            </div>
          </div>
        </div>
        
        {/* Mobile Handle & Close */}
        <div className="flex items-center space-x-1 md:hidden">
          <button
            onClick={() => setShowMobileTopBar(!showMobileTopBar)}
            className="p-2 text-[#8B3A4A] bg-rose-50 rounded-xl transition-colors"
          >
            {showMobileTopBar ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tools & Actions Row */}
      <div className={`flex flex-wrap md:flex-nowrap items-center justify-center md:justify-end gap-2 px-4 sm:px-6 w-full md:flex-1`}>

        {/* Center: Quick Canvas Navigation Controls */}
        <div className="flex lg:flex items-center space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DCCF]">"""
text = text.replace(old_center_transition, new_center_transition)


# 3. Modify "Right: Actions" to be flex-wrap and remove the inner Close Modal button since we added it to the mobile header
old_right_actions = """        {/* Right: Actions */}
        <div className="flex items-center space-x-2">"""
new_right_actions = """        {/* Right: Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">"""
text = text.replace(old_right_actions, new_right_actions)

old_close_btn = """          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>"""
new_close_btn = """          {/* Desktop Close modal (hidden on mobile) */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2 text-[#8C8276] hover:text-[#2D2A26] hover:bg-[#F3EFEA] rounded-xl transition-colors cursor-pointer ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>"""
text = text.replace(old_close_btn, new_close_btn)


with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
