import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    text = f.read()

# Add hidden sm:inline to typical buttons
text = text.replace('<span>Diseñador de Planos 2D / PDF</span>', '<span className="hidden sm:inline">Diseñador 2D / PDF</span>')
text = text.replace('<span>+ Nueva Mesa</span>', '<span className="hidden sm:inline">Nueva Mesa</span>')
text = text.replace('<span>Auto-Distribuir</span>', '<span className="hidden sm:inline">Auto-Distribuir</span>')
text = text.replace('<span>Imprimir Plano</span>', '<span className="hidden sm:inline">Imprimir</span>')

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(text)
