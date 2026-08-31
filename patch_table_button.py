import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<span className="hidden sm:inline">Diseñador 2D / PDF</span>',
    '<span className="hidden sm:inline">Diseñador 2D</span>'
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

