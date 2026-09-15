import React from 'react';
import { useEditorStore, TemplateItem } from '../store/useEditorStore';
import { LayoutTemplate, Trash2, Edit3, Copy, CheckCircle, Plus, Image as ImageIcon } from 'lucide-react';
import { generateDocumentSquareThumbnail } from '../lib/templateThumbnail';

export const TemplatesPanel: React.FC = () => {
  const { 
    templates, 
    loadTemplateToCanvas, 
    duplicateTemplate, 
    deleteTemplate, 
    currentTemplateId, 
    hasUnsavedChanges,
    setSaveModalOpen
  } = useEditorStore();

  const handleLoad = (template: TemplateItem) => {
    if (currentTemplateId === template.id) {
      alert(`La plantilla "${template.name}" ya está abierta en el editor.`);
      return;
    }

    if (hasUnsavedChanges()) {
      const ok = confirm(
        `Hay cambios sin guardar en el diseño actual.\n\n¿Estás seguro de abrir la plantilla "${template.name}" para edición? Se sobrescribirá el contenido del lienzo.`
      );
      if (!ok) return;
    }

    loadTemplateToCanvas(template);
  };

  const handleDuplicate = async (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await duplicateTemplate(t.id);
    if (success) {
      alert(`Plantilla "${t.name}" duplicada exitosamente.`);
    }
  };

  const handleDelete = async (t: TemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar la plantilla "${t.name}"?\nEsta acción no se puede deshacer.`)) {
      await deleteTemplate(t.id);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Reciente';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Reciente';
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto wc-properties p-3 space-y-4">
      <div className="flex flex-col items-center justify-center p-5 text-center border border-dashed border-gray-300 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
        <LayoutTemplate className="w-7 h-7 text-[#2D3748] mb-2" />
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Plantillas Guardadas</h4>
        <p className="text-[11px] text-gray-500 mt-1">Disponibles para Romina y Herly Lizarazo</p>
      </div>

      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {templates.length} {templates.length === 1 ? 'Plantilla' : 'Plantillas'}
        </span>
        <button
          onClick={() => setSaveModalOpen(true)}
          className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Guardar Actual</span>
        </button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="p-6 text-center bg-[#EBEBEB] rounded-2xl shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
            <p className="text-xs text-gray-500">No hay plantillas guardadas aún.</p>
            <p className="text-[10px] text-gray-400 mt-1">Guarda tu diseño actual para verlo aquí.</p>
          </div>
        ) : (
          templates.map(t => {
            const isCurrent = currentTemplateId === t.id;
            const dateStr = formatDate(t.updatedAt || t.createdAt || parseInt(t.id));

            return (
              <div 
                key={t.id} 
                className={`p-3.5 bg-[#EBEBEB] rounded-2xl flex flex-col space-y-2.5 transition-all ${
                  isCurrent 
                    ? 'shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] border-2 border-emerald-500/40' 
                    : 'shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold text-gray-900 truncate">{t.name}</p>
                      {isCurrent && (
                        <span className="flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>En edición</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {dateStr} • {t.author || 'Romina / Herly Lizarazo'}
                    </p>
                  </div>
                </div>

                {/* Square Design Preview Thumbnail */}
                <div 
                  onClick={() => handleLoad(t)}
                  className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/60 border border-gray-200/80 shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center cursor-pointer group transition-all"
                  title="Click para cargar y previsualizar en el lienzo"
                >
                  <img 
                    src={t.thumbnail || generateDocumentSquareThumbnail(t.document, 280)} 
                    alt={t.name}
                    className="w-full h-full object-contain p-2 pointer-events-none transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 px-2.5 py-1 bg-gray-900/85 text-white text-[10px] font-bold rounded-xl shadow-md transition-all transform scale-95 group-hover:scale-100">
                      {isCurrent ? 'Diseño en Edición' : 'Cargar en Lienzo'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-gray-200/60">
                  <button 
                    onClick={() => handleLoad(t)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-[#EBEBEB] rounded-xl text-blue-700 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:bg-blue-50/50"
                    title="Cargar plantilla en el lienzo para editar"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isCurrent ? 'Editando' : 'Editar'}</span>
                  </button>

                  <button 
                    onClick={(e) => handleDuplicate(t, e)}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-[#EBEBEB] rounded-xl text-amber-700 text-xs font-bold shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:bg-amber-50/50"
                    title="Duplicar esta plantilla"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-600" />
                    <span>Duplicar</span>
                  </button>

                  <button 
                    onClick={(e) => handleDelete(t, e)}
                    className="p-1.5 bg-[#EBEBEB] rounded-xl text-rose-600 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all hover:bg-rose-50/50"
                    title="Eliminar plantilla"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

