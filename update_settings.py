import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

code = code.replace("Configuración & Gestión de Bodas", "Configuración")
code = code.replace("Configuración de la Boda", "Configuración")
code = code.replace("Bodas Activas en la Plataforma", "Mis Eventos")
code = code.replace("Datos Principales de los Novios", "Datos Principales del Evento")
code = code.replace("Nombres de la Pareja", "Nombre del Evento")
code = code.replace("Firma / Nombres de la Pareja en Pie de Página", "Firma / Nombre del Evento en Pie de Página")

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)
print("Updated settings")
