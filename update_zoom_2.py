import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# Fix the sidebars absolute position on desktop so they don't cover the canvas
left_sidebar_old = "className={`absolute z-50 h-full transition-transform duration-300 flex shadow-2xl ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'}`}"
left_sidebar_new = "className={`absolute md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}"
content = content.replace(left_sidebar_old, left_sidebar_new)

right_sidebar_old = "className={`absolute right-0 z-50 h-full transition-transform duration-300 flex shadow-2xl ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'}`}"
right_sidebar_new = "className={`absolute right-0 md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showRightSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}"
content = content.replace(right_sidebar_old, right_sidebar_new)

# Right Sidebar handle - we put it outside, let's just make sure it stays visible
right_handle_old = 'className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
right_handle_new = 'className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'

# Fix initial state on desktop to both be open without overriding
content = content.replace(
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(window.innerWidth > 768);',
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);'
)
content = content.replace(
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(window.innerWidth > 768);',
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);'
)

# And make sure window is only checked in useEffect or handlers
content = content.replace(
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);',
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(window.innerWidth > 768);'
)
content = content.replace(
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);',
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(window.innerWidth > 768);'
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
