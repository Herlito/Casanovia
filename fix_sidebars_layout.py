import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    content = f.read()

# Left Sidebar classes
left_sidebar_old = r"className=\{`absolute md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none \$\{showLeftSidebar \? 'translate-x-0' : '-translate-x-full md:translate-x-0'\}`\}"
left_sidebar_new = "className={`absolute md:relative z-50 h-full transition-all duration-300 flex shadow-2xl md:shadow-none ${showLeftSidebar ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-80'}`}"
content = re.sub(left_sidebar_old, left_sidebar_new, content)

# Right Sidebar classes
right_sidebar_old = r"className=\{`absolute right-0 md:relative z-50 h-full transition-transform duration-300 flex shadow-2xl md:shadow-none \$\{showRightSidebar \? 'translate-x-0' : 'translate-x-full md:translate-x-0'\}`\}"
right_sidebar_new = "className={`absolute right-0 md:relative z-50 h-full transition-all duration-300 flex shadow-2xl md:shadow-none ${showRightSidebar ? 'translate-x-0 md:mr-0' : 'translate-x-full md:translate-x-0 md:-mr-80'}`}"
content = re.sub(right_sidebar_old, right_sidebar_new, content)

# Remove the duplicated window.innerWidth condition I accidentally added previously
content = content.replace(
    'if (window.innerWidth <= 768) if (window.innerWidth <= 768) setShowRightSidebar(false);',
    'if (window.innerWidth <= 768) setShowRightSidebar(false);'
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(content)
