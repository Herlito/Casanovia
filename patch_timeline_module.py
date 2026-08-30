import re

with open('src/components/private/TimelineModule.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>Añadir Hito</span>', '<span className="hidden sm:inline">Añadir Hito</span>')

with open('src/components/private/TimelineModule.tsx', 'w') as f:
    f.write(text)
