import re

with open('src/components/CasanoviaLoadingScreen.tsx', 'r') as f:
    text = f.read()

text = text.replace('Cargando Boda...', 'Cargando...')

with open('src/components/CasanoviaLoadingScreen.tsx', 'w') as f:
    f.write(text)
