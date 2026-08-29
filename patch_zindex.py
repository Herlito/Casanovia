import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

actions_to_add = """  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
"""
text = text.replace("  commitHistory: () => void;", "  commitHistory: () => void;\n" + actions_to_add)

impl_to_add = """  bringToFront: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > -1 && index < elements.length - 1) {
        const [el] = elements.splice(index, 1);
        elements.push(el);
      }
    }));
  },
  sendToBack: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > 0) {
        const [el] = elements.splice(index, 1);
        elements.unshift(el);
      }
    }));
  },
  bringForward: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > -1 && index < elements.length - 1) {
        const el = elements[index];
        elements[index] = elements[index + 1];
        elements[index + 1] = el;
      }
    }));
  },
  sendBackward: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > 0) {
        const el = elements[index];
        elements[index] = elements[index - 1];
        elements[index - 1] = el;
      }
    }));
  },
"""
text = text.replace("  setTheme: (theme) => {", impl_to_add + "  setTheme: (theme) => {")

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)
