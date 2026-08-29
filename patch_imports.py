import re
with open('src/components/private/SettingsModule.tsx', 'r') as f:
    text = f.read()

text = text.replace("Paintbrush\n} from 'lucide-react';", "Paintbrush,\n  MessageCircle\n} from 'lucide-react';")

with open('src/components/private/SettingsModule.tsx', 'w') as f:
    f.write(text)
print("Import patched!")
