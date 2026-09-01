import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

# Add FilePlus import
if 'FilePlus' not in content:
    content = content.replace('Save,', 'Save, FilePlus,')
    content = content.replace('{ Save,', '{ Save, FilePlus,')

# Add button
btn_save = """<button 
          onClick={() => {
            const name = prompt("Nombre de la plantilla:");
            if (name) {
              useEditorStore.getState().saveTemplate(name);
              alert("Plantilla guardada.");
            }
          }}"""

btn_new = """<button 
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
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5 text-[#524B42]" />
          <span>Nueva Plantilla</span>
        </button>
        <button 
          onClick={() => {
            const name = prompt("Nombre de la plantilla:");
            if (name) {
              useEditorStore.getState().saveTemplate(name);
              alert("Plantilla guardada.");
            }
          }}"""

content = content.replace(btn_save, btn_new)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)
