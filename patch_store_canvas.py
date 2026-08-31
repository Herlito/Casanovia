import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "updateElement: (id: string, updates: Partial<CanvasElement>) => void;",
    "updateElement: (id: string, updates: Partial<CanvasElement>) => void;\n  updateCanvas: (updates: Partial<WeddingDesignDocument['canvas']>) => void;"
)

update_canvas_impl = """  updateCanvas: (updates) => {
    set(produce((state: EditorState) => {
      Object.assign(state.document.canvas, updates);
      state.document.metadata.lastModified = Date.now();
    }));
  },
  
  updateElement: (id, updates) => {"""

content = content.replace("  updateElement: (id, updates) => {", update_canvas_impl)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(content)

