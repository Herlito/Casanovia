import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "        {/* 4. Dress Code & Suggested Color Palette */}",
    "          </div>\n        </div>\n\n        {/* 4. Dress Code & Suggested Color Palette */}"
)

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)
print("Fixed div")
