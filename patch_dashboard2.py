import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>+ Crear Evento</span>', '<span className="hidden sm:inline">Nuevo Evento</span>')

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(text)
