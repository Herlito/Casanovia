import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    content = f.read()

# Add magnetEnabled type
content = content.replace("zoom: number;", "zoom: number;\n  magnetEnabled: boolean;\n  setMagnetEnabled: (enabled: boolean) => void;")

# Add initial state and setter
content = content.replace("zoom: 1,", "zoom: 1,\n  magnetEnabled: true,\n  setMagnetEnabled: (enabled) => set({ magnetEnabled: enabled }),")

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(content)
