import re

with open('src/components/Navbar.tsx', 'r') as f:
    text = f.read()

text = text.replace("  Palette\n  LayoutTemplate,\n} from 'lucide-react';", "  Palette,\n  LayoutTemplate,\n} from 'lucide-react';")
text = text.replace("  Palette\n  LayoutTemplate,", "  Palette,\n  LayoutTemplate,")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(text)

print("Navbar fixed!")
