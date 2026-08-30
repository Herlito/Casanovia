import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Add showMobileTopBar state
state_injection = """  const [showMobileGuests, setShowMobileGuests] = useState<boolean>(false);
  const [showMobileTopBar, setShowMobileTopBar] = useState<boolean>(false);"""
text = text.replace('  const [showMobileGuests, setShowMobileGuests] = useState<boolean>(false);', state_injection)

# Also add ChevronUp to imports
text = text.replace('ChevronDown,', 'ChevronDown,\n  ChevronUp,')

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
