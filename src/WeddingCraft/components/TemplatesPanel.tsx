import React, { useRef, useState } from 'react';
import { useEditorStore, TemplateItem } from '../store/useEditorStore';
import { normalizeCanvasDocument } from '../lib/canvasElementUtils';
import { 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Check, 
  FileCode2,
  AlertCircle
} from 'lucide-react';

export const TemplatesPanel: React.FC = () => {
  const { 
    templates, 
    loadTemplates, 
    loadTemplateToCanvas, 
    duplicateTemplate, 
    deleteTemplate, 
    openSaveModal, 
    initializeDocument,
    saveTemplate,
    currentTemplateId
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // 1. Export Individual Template as JSON file
  const handleExportSingleTemplate = (tpl: TemplateItem) => {
    try {
      const templateTitle = tpl.name || 'plantilla_weddingcraft';
      const cleanTitle = templateTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fileName = `${cleanTitle}_${Date.now()}.json`;

      const jsonPayload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        templateName: tpl.name,
        template: tpl,
        document: tpl.document
      };

      const jsonString = JSON.stringify(jsonPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showStatus(`¡Plantilla "${tpl.name}" exportada en JSON exitosamente!`);
    } catch (err) {
      console.error('Error al exportar plantilla:', err);
      showStatus('Ocurrió un error al exportar la plantilla.', 'error');
    }
  };

  // 2. Import Design or Templates from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onerror = (error) => {
      console.error('Error en FileReader:', error);
      showStatus('Error al leer el archivo. El archivo podría estar corrupto.', 'error');
    };

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error('Archivo vacío');

        const parsed = JSON.parse(content);
        let importedDocument = parsed.document || parsed.template?.document || parsed;

        if (importedDocument && (importedDocument.pages || importedDocument.canvas || importedDocument.id)) {
          const normalizedDoc = normalizeCanvasDocument(importedDocument);
          initializeDocument(normalizedDoc);

          const importedName = parsed.templateName || parsed.name || normalizedDoc.metadata?.title || file.name.replace(/\.json$/i, '') || 'Diseño Importado';
          await saveTemplate(importedName, false);

          showStatus(`¡Diseño "${importedName}" importado y guardado con éxito!`);
        } else if (Array.isArray(parsed) || Array.isArray(parsed.templates)) {
          const importedList = Array.isArray(parsed) ? parsed : parsed.templates;
          const validList = importedList.filter((t: any) => t && t.id && t.document);

          if (validList.length > 0) {
            const map = new Map<string, TemplateItem>();
            templates.forEach(t => map.set(t.id, t));
            validList.forEach((t: any) => map.set(t.id, t));

            const mergedTemplates = Array.from(map.values());
            loadTemplates(mergedTemplates);

            if (validList[0]?.document) {
              initializeDocument(normalizeCanvasDocument(validList[0].document));
            }

            showStatus(`¡Se importaron ${validList.length} plantilla(s) correctamente!`);
          } else {
            showStatus('El archivo JSON no contiene plantillas válidas.', 'error');
          }
        } else {
          showStatus('El archivo no posee un formato reconocido de WeddingCraft.', 'error');
        }
      } catch (err) {
        console.error('Error al importar JSON:', err);
        showStatus('Error al leer el archivo JSON. Verifica la validez del archivo.', 'error');
      } finally {
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const formatTemplateDate = (timestamp?: number) => {
    if (!timestamp) return 'Reciente';
    const date = new Date(timestamp);
    const day = date.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-3 overflow-y-auto space-y-3 select-none custom-scrollbar">
      
      {/* Hidden File Input for JSON import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept=".json,application/json" 
        onChange={handleImportJSON} 
        className="hidden" 
      />

      {/* Status Alert Banner */}
      {statusMsg && (
        <div className={`p-2.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{statusMsg.text}</span>
        </div>
      )}

      {/* PLANTILLAS List Section Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">
          {templates.length} PLANTILLAS
        </span>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-gray-700 hover:text-gray-900 border border-gray-200/60 transition-all cursor-pointer"
            title="Importar plantilla desde archivo JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => openSaveModal('prompt')}
            className="px-2.5 py-1 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-emerald-700 hover:text-emerald-800 text-[10px] font-bold flex items-center space-x-1 border border-emerald-200/60 transition-all cursor-pointer"
            title="Guardar el diseño activo como una nueva plantilla"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Guardar Actual</span>
          </button>
        </div>
      </div>

      {/* Templates List Grid (2 Columns, Reduced Card Size) */}
      <div className="grid grid-cols-2 gap-2 pb-6">
        {templates.map((tpl) => {
          const isActive = currentTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`bg-[#EBEBEB] p-2 rounded-2xl shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] border transition-all flex flex-col justify-between relative group ${
                isActive ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : 'border-gray-200/40'
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-extrabold shadow-2xs">
                  Activa
                </div>
              )}

              {/* Template Title & Date */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-900 truncate pr-5" title={tpl.name}>
                  {tpl.name}
                </h4>
                <p className="text-[9px] text-gray-500 font-medium">
                  {formatTemplateDate(tpl.updatedAt || tpl.createdAt)}
                </p>
              </div>

              {/* Thumbnail Square / Top Part of Design */}
              <div className="w-full aspect-square my-1.5 rounded-xl bg-white/80 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border border-gray-200/60 p-0.5 flex flex-col items-center justify-center overflow-hidden">
                {tpl.thumbnail ? (
                  <img 
                    src={tpl.thumbnail} 
                    alt={tpl.name} 
                    className="w-full h-full object-cover object-top rounded-lg pointer-events-none" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 space-y-1">
                    <FileCode2 className="w-5 h-5 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-semibold line-clamp-2">
                      {tpl.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Edit (pencil icon only), Export JSON (icon only), Duplicate (icon only), Delete (icon only) */}
              <div className="flex items-center space-x-1 pt-1 border-t border-gray-200/40">
                <button
                  type="button"
                  onClick={() => loadTemplateToCanvas(tpl)}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-blue-600 hover:text-blue-800 border border-blue-200/50 transition-all cursor-pointer flex items-center justify-center"
                  title="Editar en el lienzo"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExportSingleTemplate(tpl)}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-gray-700 hover:text-gray-900 border border-gray-200/50 transition-all cursor-pointer flex items-center justify-center"
                  title="Exportar plantilla individual como JSON"
                >
                  <Download className="w-3.5 h-3.5 text-gray-700" />
                </button>

                <button
                  type="button"
                  onClick={() => duplicateTemplate(tpl.id)}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-gray-600 hover:text-gray-900 border border-gray-200/50 transition-all cursor-pointer flex items-center justify-center"
                  title="Duplicar plantilla"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar la plantilla "${tpl.name}"?`)) {
                      deleteTemplate(tpl.id);
                    }
                  }}
                  className="flex-1 py-1.5 px-1 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-rose-500 hover:text-rose-700 border border-rose-200/50 transition-all cursor-pointer flex items-center justify-center"
                  title="Eliminar plantilla"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
