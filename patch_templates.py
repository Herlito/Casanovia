import re

with open('src/WeddingCraft/components/TemplatesPanel.tsx', 'r') as f:
    content = f.read()

# Add imports
if 'import { db } from' not in content:
    content = "import { db } from '../../lib/firebase';\nimport { doc, deleteDoc } from 'firebase/firestore';\n" + content

# Fix handleDelete
handle_del = """  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      await deleteDoc(doc(db, 'weddingcraft_templates', id));
      loadTemplates(templates.filter(t => t.id !== id));
    }
  };"""
content = re.sub(r'  const handleDelete = async \(id: string\) => \{.*?  \};', handle_del, content, flags=re.DOTALL)

# Fix handleLoad
handle_load = """  const handleLoad = (templateDoc: any) => {
    if (confirm('¿Estás seguro de cargar esta plantilla? Se sobrescribirá tu diseño actual.')) {
      const newDoc = JSON.parse(JSON.stringify(templateDoc));
      initializeDocument(newDoc);
    }
  };"""
content = re.sub(r'  const handleLoad = \(templateDoc: any\) => \{.*?  \};', handle_load, content, flags=re.DOTALL)

with open('src/WeddingCraft/components/TemplatesPanel.tsx', 'w') as f:
    f.write(content)

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content_toolbar = f.read()

# Fix save button in Toolbar
save_btn = """<button 
          onClick={() => {
            const store = useEditorStore.getState();
            const existingTemplate = store.templates.find(t => t.id === store.document.id);
            
            if (existingTemplate) {
                const choice = prompt(`Esta plantilla ya existe como "${existingTemplate.name}".\\nEscribe "1" para Sobrescribir\\nEscribe "2" para Guardar como nueva`);
                if (choice === '1') {
                    // Update existing
                    store.saveTemplate(existingTemplate.name, true);
                    alert("Plantilla sobrescrita.");
                    return;
                } else if (choice === '2') {
                    const name = prompt("Nombre de la nueva plantilla:");
                    if (name) {
                        store.saveTemplate(name, false);
                        alert("Plantilla guardada como nueva.");
                    }
                    return;
                }
            } else {
                const name = prompt("Nombre de la plantilla:");
                if (name) {
                  store.saveTemplate(name, false);
                  alert("Plantilla guardada.");
                }
            }
          }}"""

content_toolbar = re.sub(r'<button \s*onClick=\{\(\) => \{\s*const name = prompt\("Nombre de la plantilla:"\);\s*if \(name\) \{\s*useEditorStore.getState\(\).saveTemplate\(name\);\s*alert\("Plantilla guardada."\);\s*\}\s*\}\}.*?<span>Guardar Plantilla</span>', save_btn + '\n          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors"\n        >\n          <Save className="w-3.5 h-3.5 text-[#524B42]" />\n          <span>Guardar Plantilla</span>', content_toolbar, flags=re.DOTALL)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content_toolbar)

# Fix saveTemplate in useEditorStore.ts
with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    content_store = f.read()

store_save = """  saveTemplate: (name, overwrite = false) => set((state) => {
    let newId = overwrite ? state.document.id : Date.now().toString();
    if (!overwrite) {
        state.document.id = newId;
    }
    const newTemplate = { id: newId, name, document: JSON.parse(JSON.stringify(state.document)) };
    setDoc(doc(db, 'weddingcraft_templates', newTemplate.id), newTemplate).then(() => {
      getDocs(collection(db, 'weddingcraft_templates')).then((snapshot) => {
        const templates = snapshot.docs.map(d => d.data());
        useEditorStore.getState().loadTemplates(templates);
      });
    }).catch(e => console.error("Error saving template", e));
    return state;
  }),"""

content_store = re.sub(r'  saveTemplate: \(name\) => set\(\(state\) => \{.*?(?=  setEventData:)', store_save + '\n', content_store, flags=re.DOTALL)
content_store = content_store.replace('saveTemplate: (name: string) => void;', 'saveTemplate: (name: string, overwrite?: boolean) => void;')

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(content_store)

