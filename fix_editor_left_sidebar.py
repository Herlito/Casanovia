import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    content = f.read()

# Replace LayersPanel import with LeftSidebar
content = content.replace("import { LayersPanel } from './LayersPanel';", "import { LeftSidebar } from './LeftSidebar';\nimport { FooterControls } from './FooterControls';")

# Replace <div className="hidden md:flex flex-col h-full"><LayersPanel /></div> with <LeftSidebar />
content = content.replace('<div className="hidden md:flex flex-col h-full"><LayersPanel /></div>', '<LeftSidebar />')

# And we will add FooterControls later below CanvasStage... Wait, CanvasStage is inside <div className="flex-1 flex overflow-hidden ...
content = content.replace("<CanvasStage />", "<div className=\"flex-1 flex flex-col min-w-0 overflow-hidden relative\">\n          <CanvasStage />\n          <FooterControls />\n        </div>")

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(content)
