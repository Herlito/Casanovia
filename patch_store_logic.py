import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

replacement = """
  loadTemplates: (templates) => set({ templates }),
  saveTemplate: (name) => set((state) => {
    import('idb-keyval').then(({ get, set }) => {
      get('wedding_craft_templates').then((existing) => {
        const templates = existing || [];
        const newTemplate = { id: Date.now().toString(), name, document: JSON.parse(JSON.stringify(state.document)) };
        templates.push(newTemplate);
        set('wedding_craft_templates', templates).then(() => {
          useEditorStore.getState().loadTemplates(templates);
        });
      });
    });
    return state;
  }),
"""

text = text.replace('  saveTemplate: (name) => {},\n  loadTemplates: (templates) => set({ templates }),', replacement.strip())

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
