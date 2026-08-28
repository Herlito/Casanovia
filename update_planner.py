import re

with open('src/components/private/PlannerDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace("{ id: 'floorplan', label: 'Plano de Bodas', icon: Map }", "{ id: 'floorplan', label: 'Planos', icon: Map }")

with open('src/components/private/PlannerDashboard.tsx', 'w') as f:
    f.write(code)
print("Updated planner dashboard")
