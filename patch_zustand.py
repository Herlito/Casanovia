import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    text = f.read()

text = text.replace("export const useEditorStore = create<EditorState>((set, get) => ({", "export const useEditorStore = create<EditorState>()((set, get) => ({")

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(text)

print("Zustand store patched!")
