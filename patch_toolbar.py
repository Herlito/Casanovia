import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    text = f.read()

# Add useEffect to import
text = text.replace("import React, { useState, useMemo } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';")

# Add the useEffect
hook_code = """  const [isTablesCollapsed, setIsTablesCollapsed] = useState(false);

  // Contraer "Mesas Registradas" automáticamente cuando se selecciona un objeto
  useEffect(() => {
    if (selectedElement) {
      setIsTablesCollapsed(true);
    }
  }, [selectedElement]);
"""

text = text.replace("  const [isTablesCollapsed, setIsTablesCollapsed] = useState(false);", hook_code)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(text)

print("Toolbar patched!")
