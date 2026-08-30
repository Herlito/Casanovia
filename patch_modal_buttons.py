import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    text = f.read()

# Guardar Plano button
guardar = "<span>{saveSuccessNotice ? '¡Guardado!' : 'Guardar Plano'}</span>"
guardar_replaced = "<span className=\"hidden sm:inline\">{saveSuccessNotice ? '¡Guardado!' : 'Guardar Plano'}</span>"
text = text.replace(guardar, guardar_replaced)

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(text)
