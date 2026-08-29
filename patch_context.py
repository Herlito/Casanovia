import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    text = f.read()

# Interface addition
text = text.replace("showFloorPlanModal: boolean;\n  setShowFloorPlanModal: (show: boolean) => void;", "showFloorPlanModal: boolean;\n  setShowFloorPlanModal: (show: boolean) => void;\n  showWeddingCraftModal: boolean;\n  setShowWeddingCraftModal: (show: boolean) => void;")

# State addition
text = text.replace("const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);", "const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);\n  const [showWeddingCraftModal, setShowWeddingCraftModal] = useState(false);")

# Context value addition
text = text.replace("showFloorPlanModal,\n        setShowFloorPlanModal,", "showFloorPlanModal,\n        setShowFloorPlanModal,\n        showWeddingCraftModal,\n        setShowWeddingCraftModal,")

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(text)

print("Context patched!")
