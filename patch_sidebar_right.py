import re

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    text = f.read()

# 1. Remove Header using Regex to be safe
text = re.sub(r'\{\/\*\s*Header\s*\*\/\}.*?<\/div>\s*<\/div>', '', text, flags=re.DOTALL)

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(text)
