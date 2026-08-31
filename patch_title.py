import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<span>Asignación de Mesas a los Invitados</span>',
    '<span>Asignación de Mesas</span>'
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

