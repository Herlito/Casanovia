import re

with open('src/WeddingCraft/store/useEditorStore.ts', 'r') as f:
    content = f.read()

old_save = """  saveTemplate: (name, overwrite = false) => set((state) => {
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

new_save = """  saveTemplate: async (name, overwrite = false) => {
    const state = useEditorStore.getState();
    const newId = overwrite ? state.document.id : Date.now().toString();
    
    // Create new document with updated ID
    const newDoc = JSON.parse(JSON.stringify(state.document));
    if (!overwrite) {
        newDoc.id = newId;
        // Update document ID in store
        useEditorStore.setState({ document: newDoc });
    }
    
    const newTemplate = { id: newId, name, document: newDoc };
    
    try {
        await setDoc(doc(db, 'weddingcraft_templates', newTemplate.id), newTemplate);
        // Load latest
        const snapshot = await getDocs(collection(db, 'weddingcraft_templates'));
        const templates = snapshot.docs.map(d => d.data());
        useEditorStore.getState().loadTemplates(templates);
    } catch (e) {
        console.error("Error saving template to cloud:", e);
        alert("Hubo un error al guardar la plantilla en la nube. Revisa tu conexión y permisos.");
    }
  },"""

content = content.replace(old_save, new_save)

with open('src/WeddingCraft/store/useEditorStore.ts', 'w') as f:
    f.write(content)
