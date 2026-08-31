import re

with open('src/context/WeddingContext.tsx', 'r') as f:
    content = f.read()

# Change logout to hide auth modal and set view mode to public
content = content.replace(
    "setShowAuthModal(true); setViewMode('public');",
    "setShowAuthModal(false); setViewMode('public');"
)

with open('src/context/WeddingContext.tsx', 'w') as f:
    f.write(content)
