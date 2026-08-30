import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    text = f.read()

text = text.replace('<span>Sincronizar con Proveedores ({vendors.length})</span>', '<span className="hidden sm:inline">Sincronizar Proveedores</span>')
text = text.replace('<span>Agregar Concepto</span>', '<span className="hidden sm:inline">Nuevo Concepto</span>')

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(text)
