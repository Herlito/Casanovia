import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

old_new_btn = """        <button 
          onClick={() => {
            const store = useEditorStore.getState();
            const hasElements = store.document.pages[0].elements.length > 0;
            
            if (hasElements) {
               const confirmNew = window.confirm("¿Deseas guardar la plantilla actual antes de crear una nueva?\\n\\nAceptar: Guardar y continuar\\nCancelar: Descartar y empezar de cero");
               if (confirmNew) {
                   const name = prompt("Nombre de la plantilla para guardar:");
                   if (name) {
                       store.saveTemplate(name);
                   } else {
                       return;
                   }
               }
            }
            
            store.initializeDocument({
               ...store.document,
               id: Date.now().toString(),
               pages: [{ id: 'cover', name: 'Portada', elements: [] }]
            });
          }}
          className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Nueva Plantilla"
        >"""

new_new_btn = """        <button 
          onClick={() => {
            const store = useEditorStore.getState();
            const hasElements = store.document.pages[0].elements.length > 0;
            const existingTemplate = store.templates.find(t => t.id === store.document.id);
            const isSavedAndUnchanged = existingTemplate && JSON.stringify(existingTemplate.document) === JSON.stringify(store.document);
            
            if (hasElements && !isSavedAndUnchanged) {
               const confirmNew = window.confirm("¿Deseas guardar la plantilla actual antes de crear una nueva?\\n\\nAceptar: Guardar y continuar\\nCancelar: Descartar y empezar de cero");
               if (confirmNew) {
                   if (existingTemplate) {
                       store.saveTemplate(existingTemplate.name, true);
                   } else {
                       const name = prompt("Nombre de la plantilla para guardar:");
                       if (name) {
                           store.saveTemplate(name, false);
                       } else {
                           return;
                       }
                   }
               }
            }
            
            store.initializeDocument({
               ...store.document,
               id: Date.now().toString(),
               pages: [{ id: 'cover', name: 'Portada', elements: [] }]
            });
          }}
          className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Nueva Plantilla"
        >"""

content = content.replace(old_new_btn, new_new_btn)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)
