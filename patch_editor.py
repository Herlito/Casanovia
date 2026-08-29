import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    text = f.read()

# Add import
text = text.replace("import { RightSidebar } from './RightSidebar';", "import { RightSidebar } from './RightSidebar';\nimport { MobileNavigation } from './MobileNavigation';")

# Hide desktop panels on mobile
text = text.replace('<LayersPanel />', '<div className="hidden md:flex flex-col h-full"><LayersPanel /></div>')
text = text.replace('<RightSidebar />', '<div className="hidden md:flex flex-col h-full"><RightSidebar /></div>')

# Change CanvasStage padding/margins on mobile so it takes up space correctly.
# Currently: <div className="flex-1 flex overflow-hidden p-3 gap-3">
text = text.replace('<div className="flex-1 flex overflow-hidden p-3 gap-3">', '<div className="flex-1 flex overflow-hidden p-0 md:p-3 md:gap-3">')

# Add MobileNavigation at the end before Close button
text = text.replace('{/* Close button float */}', '<MobileNavigation />\n      {/* Close button float */}')

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(text)
