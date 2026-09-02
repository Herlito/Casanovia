import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { downloadHTML } from '../lib/exportHTML';
import { Save, FilePlus, Download, Undo2, Redo2, ArrowUpToLine, ArrowUp, ArrowDown, ArrowDownToLine } from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { document, selectedElementIds, bringToFront, bringForward, sendBackward, sendToBack, undo, redo, history } = useEditorStore();
  
  return (
    <div className="m-3 mb-0 h-14 bg-[#EBEBEB]/80 backdrop-blur-2xl border border-transparent rounded-2xl flex items-center justify-between px-4 wc-toolbar z-10 relative shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
      <div className="flex items-center space-x-4">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={undo}
            disabled={history.past.length === 0}
            className={`p-1.5 rounded transition-colors ${history.past.length === 0 ? 'text-gray-300' : 'text-[#524B42] hover:bg-[#F3EFEA]'}`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={history.future.length === 0}
            className={`p-1.5 rounded transition-colors ${history.future.length === 0 ? 'text-gray-300' : 'text-[#524B42] hover:bg-[#F3EFEA]'}`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {selectedElementIds.length === 1 && (
          <>
            <div className="h-6 w-px bg-[#E8DCCF]"></div>
            <div className="flex items-center space-x-1">
              <button onClick={() => bringToFront(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Traer al frente (Ctrl + ])">
                <ArrowUpToLine className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => bringForward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Subir una capa (])">
                <ArrowUp className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => sendBackward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Bajar una capa ([)">
                <ArrowDown className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => sendToBack(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Enviar al fondo (Ctrl + [)">
                <ArrowDownToLine className="w-4 h-4 text-[#524B42]" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Guardar Borrador">
          <Save className="w-4 h-4 text-emerald-600" />
        </button>

        <button 
          onClick={() => {
            const store = useEditorStore.getState();
            const hasElements = store.document.pages[0].elements.length > 0;
            const existingTemplate = store.templates.find(t => t.id === store.document.id);
            const isSavedAndUnchanged = existingTemplate && JSON.stringify(existingTemplate.document) === JSON.stringify(store.document);
            
            if (hasElements && !isSavedAndUnchanged) {
               const confirmNew = window.confirm("¿Deseas guardar la plantilla actual antes de crear una nueva?\n\nAceptar: Guardar y continuar\nCancelar: Descartar y empezar de cero");
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
        >
          <FilePlus className="w-4 h-4 text-blue-600" />
        </button>

        <button 
          onClick={() => {
            const store = useEditorStore.getState();
            const existingTemplate = store.templates.find(t => t.id === store.document.id);
            
            if (existingTemplate) {
                const choice = prompt(`Esta plantilla ya existe como "${existingTemplate.name}".\nEscribe "1" para Sobrescribir\nEscribe "2" para Guardar como nueva`);
                if (choice === '1') {
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
          }}
          className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Guardar Plantilla"
        >
          <Save className="w-4 h-4 text-emerald-600" />
        </button>

        <button onClick={() => downloadHTML(useEditorStore.getState().document)} className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] rounded hover:bg-[#7a3240] transition-colors group" title="Exportar Diseño">
          <Download className="w-4 h-4 text-purple-600 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};
