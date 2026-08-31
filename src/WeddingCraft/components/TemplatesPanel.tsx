import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { LayoutTemplate, Trash2, DownloadCloud } from 'lucide-react';
import { get, set } from 'idb-keyval';

export const TemplatesPanel: React.FC = () => {
  const { templates, loadTemplates, initializeDocument, document } = useEditorStore();

  const handleLoad = (templateDoc: any) => {
    if (confirm('¿Estás seguro de cargar esta plantilla? Se sobrescribirá tu diseño actual.')) {
      // Create a fresh copy
      const newDoc = JSON.parse(JSON.stringify(templateDoc));
      newDoc.id = document.id; // Keep current ID
      initializeDocument(newDoc);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      const newTemplates = templates.filter(t => t.id !== id);
      await set('wedding_craft_templates', newTemplates);
      loadTemplates(newTemplates);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto wc-properties p-3 space-y-4">
      <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50 mb-4">
        <LayoutTemplate className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500 font-medium">Tus plantillas guardadas</p>
      </div>

      <div className="space-y-2">
        {templates.length === 0 ? (
           <p className="text-xs text-gray-400 text-center py-4">No hay plantillas guardadas aún.</p>
        ) : templates.map(t => (
          <div key={t.id} className="p-3 bg-[#EBEBEB] border border-gray-200 rounded-xl flex items-center justify-between shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
            <div className="flex-1 truncate pr-2">
              <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
              <p className="text-[10px] text-gray-400">{new Date(parseInt(t.id)).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <button 
                onClick={() => handleLoad(t.document)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Cargar Plantilla"
              >
                <DownloadCloud className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(t.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Eliminar Plantilla"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
