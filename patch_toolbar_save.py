import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

# We have:
#        <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors">
#          <Save className="w-3.5 h-3.5 text-[#524B42]" />
#          <span>Guardar Borrador</span>
#        </button>

btn = """
        <button 
          onClick={() => {
            const name = prompt("Nombre de la plantilla:");
            if (name) {
              useEditorStore.getState().saveTemplate(name);
              alert("Plantilla guardada.");
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-[#524B42]" />
          <span>Guardar Plantilla</span>
        </button>
"""

# Let's add it right before "Exportar Diseño"
text = text.replace(
    '<button onClick={() => downloadHTML(useEditorStore.getState().document)}',
    btn.strip() + '\n        <button onClick={() => downloadHTML(useEditorStore.getState().document)}'
)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
