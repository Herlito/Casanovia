import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# Left handle
left_old = 'className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-l-0 border-[#D9CEBF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
left_new = 'className="absolute -right-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-l-0 border-[#D9CEBF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
content = content.replace(left_old, left_new)

# Right handle
right_old = 'className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
right_new = 'className="absolute -left-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
content = content.replace(right_old, right_new)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
