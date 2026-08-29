import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

text = text.replace("import { get, set } from 'idb-keyval';", "import { get as idbGet, set as idbSet } from 'idb-keyval';")
text = text.replace("get('wedding_craft_templates')", "idbGet('wedding_craft_templates')")
text = text.replace("set('wedding_craft_templates'", "idbSet('wedding_craft_templates'")

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
