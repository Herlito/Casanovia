import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

# Change restriction on delete button
code = code.replace(
    "{isLevel1Admin && weddings.length > 1 && (",
    "{(isLevel1Admin || isLevel3Planner) && weddings.length > 1 && ("
)
# Make sure to also change "Eliminar boda" title just in case:
code = code.replace(
    "title=\"Eliminar boda\"",
    "title=\"Eliminar evento\""
)
code = code.replace(
    "Eliminar la boda de",
    "Eliminar el evento de"
)

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)

print("Patched delete permissions")
