import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { downloadHTML } from '../lib/exportHTML';
import { 
  Save, 
  FilePlus, 
  Download, 
  Undo2, 
  Redo2, 
  ArrowUpToLine, 
  ArrowUp, 
  ArrowDown, 
  ArrowDownToLine, 
  Copy, 
  Boxes, 
  Ungroup,
  BookmarkPlus,
  Check,
  Loader2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Toolbar: React.FC = () => {
  const [isSavingDirect, setIsSavingDirect] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

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
    currentTemplateId,
    currentTemplateName,
    setSaveModalOpen,
    openSaveModal,
    directSaveCurrentTemplate,
    duplicateElements,
    groupElements,
    ungroupElements
  } = useEditorStore();

  const elements = document.pages[0]?.elements || [];
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  
  // Determine if all selected elements share the same group
  const isAllSameGroup = selectedElements.length > 0 && selectedElements.every(el => 
    el.parentGroup && el.parentGroup === selectedElements[0].parentGroup
  );
  const hasAnyGroup = selectedElements.some(el => Boolean(el.parentGroup));

  const handleNewTemplate = () => {
    const store = useEditorStore.getState();
    const currentElements = store.document.pages[0]?.elements || [];

    // If canvas is already empty, reset template state
    if (currentElements.length === 0) {
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
        store.openSaveModal('prompt');
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
      <div className="flex items-center space-x-3">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={undo}
            disabled={history.past.length === 0}
            className={`p-1.5 rounded-xl transition-all ${history.past.length === 0 ? 'text-gray-300' : 'text-[#524B42] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] bg-[#EBEBEB]'}`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={redo}
            disabled={history.future.length === 0}
            className={`p-1.5 rounded-xl transition-all ${history.future.length === 0 ? 'text-gray-300' : 'text-[#524B42] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] bg-[#EBEBEB]'}`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {currentTemplateName && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-[#EBEBEB] rounded-xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-medium text-gray-700 truncate max-w-[140px]">
              Editando: <strong className="text-gray-900">{currentTemplateName}</strong>
            </span>
          </div>
        )}

        {/* Multi-element or Selected element actions: Duplicate, Group, Layer order */}
        {selectedElementIds.length > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-1.5">
              {/* Duplicar button */}
              <button 
                onClick={() => duplicateElements(selectedElementIds)}
                className="flex items-center space-x-1 px-2 py-1 bg-[#EBEBEB] rounded-xl text-amber-800 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:text-amber-900"
                title="Duplicar elemento(s) seleccionado(s) (Ctrl+D)"
              >
                <Copy className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Duplicar</span>
              </button>

              {/* Agrupar / Desagrupar button */}
              {selectedElementIds.length >= 2 && !isAllSameGroup && (
                <button 
                  onClick={() => groupElements(selectedElementIds)}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#EBEBEB] rounded-xl text-indigo-800 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:text-indigo-900"
                  title="Agrupar elementos seleccionados (Ctrl+G)"
                >
                  <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Agrupar</span>
                </button>
              )}

              {(isAllSameGroup || (selectedElementIds.length === 1 && hasAnyGroup)) && (
                <button 
                  onClick={() => ungroupElements(selectedElementIds)}
                  className="flex items-center space-x-1 px-2 py-1 bg-[#EBEBEB] rounded-xl text-indigo-800 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:text-indigo-900"
                  title="Desagrupar elementos (Ctrl+Shift+G)"
                >
                  <Ungroup className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden md:inline">Desagrupar</span>
                </button>
              )}

              {/* Single element layer ordering */}
              {selectedElementIds.length === 1 && (
                <div className="hidden lg:flex items-center space-x-1 ml-1">
                  <button onClick={() => bringToFront(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg text-gray-700" title="Traer al frente (Ctrl + ])">
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => bringForward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg text-gray-700" title="Subir una capa (])">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => sendBackward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg text-gray-700" title="Bajar una capa ([)">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => sendToBack(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded-lg text-gray-700" title="Enviar al fondo (Ctrl + [)">
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Nueva Plantilla */}
        <button 
          onClick={handleNewTemplate}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all text-blue-700 text-xs font-bold"
          title="Nueva Plantilla"
        >
          <FilePlus className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Nueva</span>
        </button>

        {/* Guardar Como Button */}
        <button 
          onClick={() => openSaveModal('save_as')}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all text-purple-700 text-xs font-bold"
          title="Guardar como nueva plantilla"
        >
          <BookmarkPlus className="w-4 h-4 text-purple-600" />
          <span className="hidden sm:inline">Guardar Como</span>
        </button>

        {/* Guardar Plantilla (Directo si ya tiene nombre, o abre modal si es nueva) */}
        <button 
          onClick={async () => {
            if (currentTemplateId && currentTemplateName) {
              setIsSavingDirect(true);
              const res = await directSaveCurrentTemplate();
              setIsSavingDirect(false);
              if (res.success) {
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2500);
              }
            } else {
              openSaveModal('save_as');
            }
          }}
          disabled={isSavingDirect}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl transition-all text-xs font-bold ${
            justSaved 
              ? 'bg-emerald-600 text-white shadow-[inset_4px_4px_8px_#047857]' 
              : 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-emerald-700'
          }`}
          title={currentTemplateName ? `Guardar cambios en "${currentTemplateName}"` : 'Guardar plantilla'}
        >
          {isSavingDirect ? (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          ) : justSaved ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Save className="w-4 h-4 text-emerald-600" />
          )}
          <span>{isSavingDirect ? 'Guardando...' : justSaved ? '¡Guardado!' : 'Guardar'}</span>
        </button>

        {/* Exportar HTML */}
        <button 
          onClick={() => downloadHTML(useEditorStore.getState().document)} 
          className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] rounded-2xl transition-all text-gray-700 hover:text-gray-900" 
          title="Exportar Diseño Web"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

