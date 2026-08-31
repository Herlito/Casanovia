import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'\{/\* Top Gold Ornament Bar \*/\}\s*<div className="h-1\.5 bg-linear-to-r from-\[\#D4AF37\] via-\[\#C5A880\] to-\[\#2D3748\] w-full" />',
    '',
    content
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

