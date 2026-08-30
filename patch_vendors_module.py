import re

with open('src/components/private/VendorsModule.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>Registrar Proveedor</span>', '<span className="hidden sm:inline">Nuevo Proveedor</span>')

with open('src/components/private/VendorsModule.tsx', 'w') as f:
    f.write(text)
