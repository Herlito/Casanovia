import re

with open('src/components/private/GuestManagement.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>Excel</span>', '<span className="hidden sm:inline">Excel</span>')
text = text.replace('<span>Importar</span>', '<span className="hidden sm:inline">Importar</span>')
text = text.replace('<span>+ Agregar Invitado</span>', '<span className="hidden sm:inline">Nuevo Invitado</span>')

with open('src/components/private/GuestManagement.tsx', 'w') as f:
    f.write(text)
