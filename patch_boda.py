import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "'Boda Actual'",
    "'Evento Actual'"
)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(code)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "Mesas de Boda",
    "Mesas Principales"
)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(code)

with open('src/components/floorplan/FloorPlanExportPdf.ts', 'r') as f:
    code = f.read()

code = code.replace(
    "'Nuestra Boda'",
    "'Nuestro Evento'"
)

with open('src/components/floorplan/FloorPlanExportPdf.ts', 'w') as f:
    f.write(code)

print("Patched Boda references")
