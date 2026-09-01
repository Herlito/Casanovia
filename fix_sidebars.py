import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# Replace showMobileToolbar with showLeftSidebar
content = content.replace('showMobileToolbar', 'showLeftSidebar')
content = content.replace('setShowMobileToolbar', 'setShowLeftSidebar')

# Replace showMobileGuests with showRightSidebar
content = content.replace('showMobileGuests', 'showRightSidebar')
content = content.replace('setShowMobileGuests', 'setShowRightSidebar')

# Replace useState<boolean>(false) with true for desktop default
content = content.replace(
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(false);',
    'const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(window.innerWidth > 768);'
)
content = content.replace(
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);',
    'const [showRightSidebar, setShowRightSidebar] = useState<boolean>(window.innerWidth > 768);'
)

# Left Sidebar classes
left_sidebar_old = "className={`absolute md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}"
left_sidebar_new = "className={`absolute z-50 h-full transition-transform duration-300 flex shadow-2xl ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full'}`}"
content = content.replace(left_sidebar_old, left_sidebar_new)

# Left Sidebar handle
left_handle_old = 'className="md:hidden absolute -right-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-l-0 border-transparent rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
left_handle_new = 'className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-l-0 border-[#D9CEBF] rounded-r-xl flex items-center justify-center shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
content = content.replace(left_handle_old, left_handle_new)

# Right Sidebar classes
right_sidebar_old = "className={`absolute right-0 md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none ${showRightSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}"
right_sidebar_new = "className={`absolute right-0 z-50 h-full transition-transform duration-300 flex shadow-2xl ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'}`}"
content = content.replace(right_sidebar_old, right_sidebar_new)

# Right Sidebar handle
right_handle_old = 'className="md:hidden absolute -left-8 bottom-4 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-transparent rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
right_handle_new = 'className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#EBEBEB] border border-r-0 border-[#D9CEBF] rounded-l-xl flex items-center justify-center shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] cursor-pointer z-50"'
content = content.replace(right_handle_old, right_handle_new)

# Also fix the toggles to not hide the other sidebar on desktop if we don't want to. 
# "setShowMobileToolbar(false)" is done when toggling the right one, let's keep it for mobile, but on desktop we can have both open.
# We'll use window.innerWidth check in the onClick.
content = content.replace(
    'onClick={() => { setShowLeftSidebar(!showLeftSidebar); setShowRightSidebar(false); }}',
    'onClick={() => { setShowLeftSidebar(!showLeftSidebar); if (window.innerWidth <= 768) setShowRightSidebar(false); }}'
)
content = content.replace(
    'onClick={() => { setShowRightSidebar(!showRightSidebar); setShowLeftSidebar(false); }}',
    'onClick={() => { setShowRightSidebar(!showRightSidebar); if (window.innerWidth <= 768) setShowLeftSidebar(false); }}'
)

# Fix the automatic show left sidebar logic
content = content.replace(
    'setShowRightSidebar(false);',
    'if (window.innerWidth <= 768) setShowRightSidebar(false);'
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
