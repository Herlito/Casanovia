import re

with open('src/components/Navbar.tsx', 'r') as f:
    code = f.read()

code = code.replace(">Nueva Boda</span>", ">Crear Evento</span>")
code = code.replace("<span>Plano de Bodas</span>", "<span>Planos</span>")
code = code.replace("Crear evento y generar lista de tareas", "Crear evento y generar lista de tareas")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(code)
print("Updated navbar")
