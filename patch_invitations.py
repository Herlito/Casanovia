import re

with open('src/components/private/InvitationsModule.tsx', 'r') as f:
    text = f.read()

text = text.replace("<span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>", "<span className=\"hidden sm:inline\">{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>")
text = text.replace('<span>Exportar PNG</span>', '<span className="hidden sm:inline">Exportar PNG</span>')

with open('src/components/private/InvitationsModule.tsx', 'w') as f:
    f.write(text)
