import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    content = f.read()

# Add onSnapshot to import
content = content.replace("import { collection, getDocs } from 'firebase/firestore';", "import { collection, getDocs, onSnapshot } from 'firebase/firestore';")

# Replace require
old_load = """        // Load templates from Firebase (real-time)
        try {
            const { onSnapshot, collection } = require('firebase/firestore');
            onSnapshot(collection(db, 'weddingcraft_templates'), (snap) => {
                const templates = snap.docs.map(d => d.data());
                useEditorStore.getState().loadTemplates(templates);
            });
        } catch (e) {
           console.error("Error loading templates", e);
        }"""

new_load = """        // Load templates from Firebase (real-time)
        try {
            onSnapshot(collection(db, 'weddingcraft_templates'), (snap) => {
                const templates = snap.docs.map(d => d.data());
                useEditorStore.getState().loadTemplates(templates);
            });
        } catch (e) {
           console.error("Error loading templates", e);
        }"""

content = content.replace(old_load, new_load)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(content)
