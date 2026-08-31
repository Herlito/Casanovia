import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# Remove window.confirm from onDelete in TableAssignmentModule.tsx
regex = re.compile(
    r'onDelete=\{\s*tableToEdit\s*\?\s*async\s*\(\)\s*=>\s*\{\s*if\s*\(window\.confirm\(`¿Seguro que deseas eliminar[^`]+`\)\)\s*\{\s*await\s+deleteTable\(tableToEdit\.id\);\s*setIsTableModalOpen\(false\);\s*setTableToEdit\(null\);\s*\}\s*\}\s*:\s*undefined\s*\}',
    re.DOTALL
)

replacement = """onDelete={
          tableToEdit
            ? async () => {
                await deleteTable(tableToEdit.id);
                setIsTableModalOpen(false);
                setTableToEdit(null);
              }
            : undefined
        }"""

content = regex.sub(replacement, content)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)
