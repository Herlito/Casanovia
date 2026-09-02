import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('px-4 py-1.5.5', 'px-4 py-1.5')

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(content)
