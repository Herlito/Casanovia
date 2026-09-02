import re

with open('src/components/private/BudgetModule.tsx', 'r') as f:
    content = f.read()

content = content.replace('overflow-x-auto pb-2 gap-2 text-xs border-b border-transparent', 'overflow-x-auto pb-0 gap-2 text-xs border-b border-transparent')

with open('src/components/private/BudgetModule.tsx', 'w') as f:
    f.write(content)
