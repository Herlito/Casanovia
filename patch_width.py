import re

for filename in ['src/components/floorplan/FloorPlanToolbar.tsx', 'src/components/floorplan/FloorPlanGuestSidebar.tsx']:
    with open(filename, 'r') as f:
        text = f.read()

    # Ensure it's w-[50vw]
    text = text.replace('w-[60vw] max-w-[280px]', 'w-[50vw]')
    
    with open(filename, 'w') as f:
        f.write(text)
