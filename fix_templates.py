import re

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'r') as f:
    content = f.read()

# Make templates real-time
old_fetch = """        // Load templates from Firebase
        try {
           const snap = await getDocs(collection(db, 'weddingcraft_templates'));
           const templates = snap.docs.map(d => d.data());
           useEditorStore.getState().loadTemplates(templates);
        } catch (e) {
           console.error("Error loading templates", e);
        }"""

new_fetch = """        // Load templates from Firebase (real-time)
        try {
           import('firebase/firestore').then(({ onSnapshot, collection }) => {
              onSnapshot(collection(db, 'weddingcraft_templates'), (snap) => {
                 const templates = snap.docs.map(d => d.data());
                 useEditorStore.getState().loadTemplates(templates);
              });
           });
        } catch (e) {
           console.error("Error loading templates", e);
        }"""

content = content.replace(old_fetch, new_fetch)

with open('src/WeddingCraft/components/WeddingCraftEditor.tsx', 'w') as f:
    f.write(content)
