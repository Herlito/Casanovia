import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

# Add templates to interface
text = text.replace(
    '  history: {\n    past: WeddingDesignDocument[];\n    future: WeddingDesignDocument[];\n  };',
    '  history: {\n    past: WeddingDesignDocument[];\n    future: WeddingDesignDocument[];\n  };\n  templates: { id: string; name: string; document: WeddingDesignDocument }[];\n  isPreviewModalOpen: boolean;\n  setPreviewModalOpen: (isOpen: boolean) => void;\n  saveTemplate: (name: string) => void;\n  loadTemplates: (templates: any[]) => void;'
)

# Initialize in state
text = text.replace(
    '  history: { past: [], future: [] },',
    '  history: { past: [], future: [] },\n  templates: [],\n  isPreviewModalOpen: false,\n  setPreviewModalOpen: (isOpen) => set({ isPreviewModalOpen: isOpen }),\n  saveTemplate: (name) => {},\n  loadTemplates: (templates) => set({ templates }),'
)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
