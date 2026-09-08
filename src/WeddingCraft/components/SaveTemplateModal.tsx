import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Save, Copy, X, Check, FileEdit } from 'lucide-react';

export const SaveTemplateModal: React.FC = () => {
  const { 
    isSaveModalOpen, 
    setSaveModalOpen, 
    currentTemplateId, 
    currentTemplateName, 
    saveTemplate,
    saveModalInitialMode
  } = useEditorStore();

  const [mode, setMode] = useState<'prompt' | 'save_as'>('prompt');
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isSaveModalOpen) {
      if (saveModalInitialMode === 'save_as') {
        setMode('save_as');
        setTemplateName(currentTemplateName ? `${currentTemplateName} (Copia)` : 'Mi Plantilla de Boda');
      } else if (currentTemplateName) {
        setMode('prompt');
        setTemplateName(`${currentTemplateName} (Copia)`);
      } else {
        setMode('save_as');
        setTemplateName('Mi Plantilla de Boda');
      }
      setSuccessMsg(null);
      setIsSaving(false);
    }
  }, [isSaveModalOpen, currentTemplateName, saveModalInitialMode]);

  if (!isSaveModalOpen) return null;

  const handleSaveSameName = async () => {
    if (!currentTemplateName) return;
    setIsSaving(true);
    const res = await saveTemplate(currentTemplateName, true);
    setIsSaving(false);
    if (res.success) {
      setSuccessMsg(`¡Plantilla "${res.name}" guardada con éxito!`);
      setTimeout(() => {
        setSaveModalOpen(false);
      }, 1200);
    }
  };

  const handleSaveAs = async () => {
    if (!templateName.trim()) {
      alert('Por favor ingresa un nombre para la plantilla');
      return;
    }
    setIsSaving(true);
    const res = await saveTemplate(templateName.trim(), false);
    setIsSaving(false);
    if (res.success) {
      setSuccessMsg(`¡Plantilla "${res.name}" guardada como nueva!`);
      setTimeout(() => {
        setSaveModalOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#EBEBEB] rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] w-full max-w-md p-6 relative flex flex-col space-y-5">
        
        {/* Close Button */}
        <button 
          onClick={() => setSaveModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#EBEBEB] text-gray-500 hover:text-gray-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-emerald-600">
            <Save className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {currentTemplateId ? 'Guardar Plantilla' : 'Nueva Plantilla'}
            </h3>
            <p className="text-[11px] text-gray-500">
              {currentTemplateId 
                ? `Editando: "${currentTemplateName}"` 
                : 'Guarda este diseño para Romina y Herly Lizarazo'}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-700 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content based on state */}
        {!successMsg && (
          <>
            {currentTemplateId && mode === 'prompt' ? (
              <div className="flex flex-col space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Has realizado cambios en la plantilla guardada <span className="font-bold text-gray-800">"{currentTemplateName}"</span>. ¿Cómo deseas guardarla?
                </p>

                <div className="space-y-2.5 pt-2">
                  <button
                    disabled={isSaving}
                    onClick={handleSaveSameName}
                    className="w-full text-left p-3.5 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center space-x-3 group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-100/50 text-emerald-700">
                      <Save className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">
                        Guardar con el mismo nombre
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Sobrescribir los cambios en "{currentTemplateName}"
                      </p>
                    </div>
                  </button>

                  <button
                    disabled={isSaving}
                    onClick={() => setMode('save_as')}
                    className="w-full text-left p-3.5 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center space-x-3 group"
                  >
                    <div className="p-2 rounded-xl bg-blue-100/50 text-blue-700">
                      <Copy className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700">
                        Guardar Como (Nuevo nombre)
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Crear una copia nueva sin sobrescribir la original
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {currentTemplateId && (
                  <button
                    onClick={() => setMode('prompt')}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <span>&larr; Volver a opciones</span>
                  </button>
                )}

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    {currentTemplateId ? 'Nombre de la nueva plantilla' : 'Nombre de la plantilla'}
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ej. Boda Minimalista Oro"
                    className="w-full bg-[#EBEBEB] text-gray-800 text-sm px-4 py-2.5 rounded-2xl shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] outline-none transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveAs();
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="flex-1 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-600 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveAs}
                    className="flex-1 py-2.5 rounded-2xl bg-[#EBEBEB] text-emerald-700 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-emerald-600" />
                        <span>{currentTemplateId ? 'Guardar Como' : 'Guardar Plantilla'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
