with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

text = text.replace("activeWedding?.title ||", "activeWedding?.coupleNames ||")

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
