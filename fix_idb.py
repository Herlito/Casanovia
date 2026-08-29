import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

# Make sure idb-keyval is imported at top
if 'import { get, set } from \'idb-keyval\';' not in text:
    text = text.replace("import { ThemePreset, predefinedThemes } from '../themes';", "import { ThemePreset, predefinedThemes } from '../themes';\nimport { get, set } from 'idb-keyval';")

replacement = """
  saveTemplate: (name) => set((state) => {
    get('wedding_craft_templates').then((existing) => {
      const templates = existing || [];
      const newTemplate = { id: Date.now().toString(), name, document: JSON.parse(JSON.stringify(state.document)) };
      templates.push(newTemplate);
      set('wedding_craft_templates', templates).then(() => {
        useEditorStore.getState().loadTemplates(templates);
      });
    });
    return state;
  }),
"""
text = re.sub(r'saveTemplate: \(name\) => set\(\(state\) => \{\s+import\(\'idb-keyval\'\).*?return state;\s+\}\),', replacement.strip() + ',', text, flags=re.DOTALL)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
