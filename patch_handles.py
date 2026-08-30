import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Change left handle
old_left = 'className="md:hidden absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-l-0 border-[#E8DCCF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
new_left = 'className="md:hidden absolute -right-8 bottom-4 w-8 h-16 bg-white border border-l-0 border-[#E8DCCF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
text = text.replace(old_left, new_left)

# Change right handle
old_right = 'className="md:hidden absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-r-0 border-[#E8DCCF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
new_right = 'className="md:hidden absolute -left-8 bottom-4 w-8 h-16 bg-white border border-r-0 border-[#E8DCCF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
text = text.replace(old_right, new_right)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
