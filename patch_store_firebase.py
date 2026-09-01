import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    content = f.read()

# Add imports
if 'import { db } from' not in content:
    content = "import { db } from '../../lib/firebase';\nimport { collection, getDocs, setDoc, doc } from 'firebase/firestore';\n" + content

save_tmpl = """  saveTemplate: (name) => set((state) => {
    const newTemplate = { id: Date.now().toString(), name, document: JSON.parse(JSON.stringify(state.document)) };
    setDoc(doc(db, 'weddingcraft_templates', newTemplate.id), newTemplate).then(() => {
      // Reload templates
      getDocs(collection(db, 'weddingcraft_templates')).then((snapshot) => {
        const templates = snapshot.docs.map(d => d.data());
        useEditorStore.getState().loadTemplates(templates);
      });
    }).catch(e => console.error("Error saving template", e));
    return state;
  }),"""

content = re.sub(r'saveTemplate: \(name\) => set\(\(state\) => \{.*?(?=  setEventData:)', save_tmpl + '\n', content, flags=re.DOTALL)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(content)
