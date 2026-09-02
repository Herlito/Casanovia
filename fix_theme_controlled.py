import re

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'r') as f:
    content = f.read()

content = content.replace('value={editedTheme.name}', "value={editedTheme.name || ''}")
content = content.replace('value={editedTheme.palette.primary}', "value={editedTheme.palette.primary || '#000000'}")
content = content.replace('value={editedTheme.palette.secondary}', "value={editedTheme.palette.secondary || '#000000'}")
content = content.replace('value={editedTheme.palette.background}', "value={editedTheme.palette.background || '#ffffff'}")
content = content.replace('value={editedTheme.palette.text}', "value={editedTheme.palette.text || '#000000'}")
content = content.replace('value={editedTheme.palette.muted}', "value={editedTheme.palette.muted || '#000000'}")

with open('src/WeddingCraft/components/ThemeSelector.tsx', 'w') as f:
    f.write(content)
