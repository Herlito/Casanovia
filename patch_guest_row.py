import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '{(isSelected || isAssigned || guest.rsvpStatus !== \'confirmed\') && (',
    '{isSelected && ('
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)
