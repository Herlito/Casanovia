import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'addTable, \n    updateTable,',
    'addTable, \n    updateTables, \n    updateTable,'
)

old_batch_func = """  const handleCreateDefaultTableBatch = async (count: number, capacity: number) => {
    const existingCount = tables.length;
    for (let i = 1; i <= count; i++) {
      const num = existingCount + i;
      await addTable({
        name: `Mesa ${num}`,
        capacity: capacity,
        shape: 'round',
        zone: 'Salón Principal',
        notes: `Mesa estándar para ${capacity} personas`,
      });
    }
  };"""

new_batch_func = """  const handleCreateDefaultTableBatch = async (count: number, capacity: number) => {
    const existingCount = tables.length;
    const newTables = [];
    for (let i = 1; i <= count; i++) {
      const num = existingCount + i;
      newTables.push({
        id: `tbl-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
        name: `Mesa ${num}`,
        capacity: capacity,
        shape: 'round' as const,
        zone: 'Salón Principal',
        notes: `Mesa estándar para ${capacity} personas`,
      });
    }
    await updateTables([...tables, ...newTables]);
  };"""

content = content.replace(old_batch_func, new_batch_func)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

