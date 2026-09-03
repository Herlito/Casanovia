import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { downloadHTML } from '../lib/exportHTML';
import { Save, FilePlus, Download, Undo2, Redo2, ArrowUpToLine, ArrowUp, ArrowDown, ArrowDownToLine } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Toolbar: React.FC = () => {
  const { 
    document, 
    selectedElementIds, 
    bringToFront, 
    bringForward, 
    sendBackward, 
    sendToBack, 
    undo, 
    redo, 
    history,
    currentTemplateName,
    setSaveModalOpen
  } = useEditorStore();

  const handleNewTemplate = () => {
    const store = useEditorStore.getState();
    const elements = store.document.pages[0]?.elements || [];

    // If canvas is already empty, reset template state
    if (elements.length === 0) {
      store.setCurrentTemplate(null, null);
      store.setLastSavedHash(null);
      return;
    }

    const hasUnsaved = store.hasUnsavedChanges();

    // "Solo si no se ha guardado, preguntar si se desea guardar."
    if (hasUnsaved) {
      const shouldSave = window.confirm(
        "Hay cambios sin guardar en la plantilla actual.\n\n¿Deseas guardar los cambios antes de crear una nueva plantilla?\n\n• Aceptar: Guardar cambios\n• Cancelar: Descartar y limpiar lienzo"
      );

      if (shouldSave) {
        store.setSaveModalOpen(true);
        return;
      }
    }

    // "SI ya se ha guardado anteriormente y no hay cambios, limpiar el canva."
    store.initializeDocument({
      id: uuidv4(),
      parentEventId: store.eventData?.eventId || '',
      metadata: { createdAt: Date.now(), lastModified: Date.now(), version: '1.0.0' },
      canvas: { width: 375, height: 812, backgroundColor: store.document.theme?.palette?.background || '#FDFBF7' },
      theme: store.document.theme,
      pages: [{ id: 'cover', name: 'Portada', elements: [] }],
      assetReferences: []
    });
    store.setCurrentTemplate(null, null);
    store.setLastSavedHash(null);
  };
  
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

        {currentTemplateName && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-[#EBEBEB] rounded-xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium text-gray-700 truncate max-w-[160px]">
              Editando: <strong className="text-gray-900">{currentTemplateName}</strong>
            </span>
          </div>
        )}

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
        {/* Nueva Plantilla */}
        <button 
          onClick={handleNewTemplate}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-xl transition-all text-blue-700 text-xs font-semibold"
          title="Nueva Plantilla"
        >
          <FilePlus className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Nueva</span>
        </button>

        {/* Guardar Plantilla (Unico y funcional) */}
        <button 
          onClick={() => setSaveModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-xl transition-all text-emerald-700 text-xs font-semibold"
          title="Guardar Plantilla"
        >
          <Save className="w-4 h-4 text-emerald-600" />
          <span>{currentTemplateName ? 'Guardar' : 'Guardar Plantilla'}</span>
        </button>

        {/* Exportar HTML */}
        <button 
          onClick={() => downloadHTML(useEditorStore.getState().document)} 
          className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-xl transition-all group" 
          title="Exportar Diseño"
        >
          <Download className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

