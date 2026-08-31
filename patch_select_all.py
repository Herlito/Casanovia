import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<button\s*type="button"\s*onClick=\{handleSelectAllVisibleGuests\}.*?</button>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

