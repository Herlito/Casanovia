import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('Diseñador 2D', 'Plano Local')

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)
