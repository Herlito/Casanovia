import re

with open('src/components/private/SettingsModule.tsx', 'r') as f:
    code = f.read()

replacement = """          </div>
        </div>
        </div>

        {/* 4. Dress Code & Suggested Color Palette */}"""

code = re.sub(r"\s*<\/div>\n\s*<\/div>\n\n\s*<\/div>\n\s*<\/div>\n\n\s*\{\/\* 4\. Dress Code", replacement, code)

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(code)
print("Fixed div2")
