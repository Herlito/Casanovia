import re

with open('src/components/private/ChecklistModule.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>Marcar todas</span>', '<span className="hidden sm:inline">Marcar todas</span>')
text = text.replace('<span>Desmarcar</span>', '<span className="hidden sm:inline">Desmarcar</span>')
text = text.replace('<span>Borrar todas</span>', '<span className="hidden sm:inline">Borrar todas</span>')
text = text.replace('<span>Añadir</span>', '<span className="hidden sm:inline">Añadir</span>')

with open('src/components/private/ChecklistModule.tsx', 'w') as f:
    f.write(text)
