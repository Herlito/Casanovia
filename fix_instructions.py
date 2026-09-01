import re

# Update FloorPlanGuestSidebar.tsx
with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Arrastra cualquier invitado directamente sobre una silla en el plano para asignarlo.',
    'Toca o haz clic en cualquier asiento del plano para asignarle un invitado.'
)

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(content)

# Update FloorPlanCanvas.tsx
with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Arrastra un invitado desde la barra lateral o haz clic para asignar.',
    'Toca o haz clic en un asiento para asignar.'
)

content = content.replace(
    'Haz clic en el punto inicial y luego en el punto final de una pared o medida conocida',
    'Toca o haz clic en el punto inicial y luego en el final de una pared o medida conocida'
)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
