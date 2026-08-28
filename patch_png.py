import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "Plano_Boda_${weddingTitle",
    "Plano_${weddingTitle"
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(code)

print("Patched FloorPlanDesignerModal.tsx")
