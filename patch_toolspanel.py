import re

with open('src/WeddingCraft/components/ToolsPanel.tsx', 'r') as f:
    content = f.read()

# Add text-[#2D3748] to the buttons
content = re.sub(r'className="([^"]*flex items-center space-x-3[^"]*)"', r'className="\1 text-[#2D3748]"', content)

with open('src/WeddingCraft/components/ToolsPanel.tsx', 'w') as f:
    f.write(content)
