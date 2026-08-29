import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Settings2, Link as LinkIcon } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const { document, selectedElementIds, updateElement, eventData } = useEditorStore();
  
  const selectedElement = selectedElementIds.length === 1 
    ? document.pages[0].elements.find(e => e.id === selectedElementIds[0])
    : null;

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-[#E8DCCF] h-full flex items-center justify-center wc-properties p-6 text-center">
        <p className="text-xs text-[#8C8276]">Selecciona un elemento en el lienzo para editar sus propiedades.</p>
      </div>
    );
  }

  const handleUpdateStyle = (key: string, value: any) => {
    updateElement(selectedElement.id, { 
      style: { ...selectedElement.style, [key]: value } 
    });
  };

  const handleUpdateContent = (text: string) => {
    updateElement(selectedElement.id, { 
      content: { ...selectedElement.content, text } 
    });
  };

  return (
    <div className="w-72 bg-white border-l border-[#E8DCCF] flex flex-col h-full wc-properties overflow-y-auto">
      <div className="p-3 border-b border-[#E8DCCF] bg-[#FAF8F5]">
        <h3 className="text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">
          <Settings2 className="w-4 h-4 text-[#8B3A4A]" />
          <span>Propiedades del Objeto</span>
        </h3>
      </div>

      <div className="p-4 space-y-5">
        {selectedElement.dataBinding && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start space-x-2">
            <LinkIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900">Vinculado a Datos</p>
              <p className="text-[10px] text-blue-700 mt-0.5">El contenido de este texto se inyecta desde el evento principal (Solo Lectura).</p>
            </div>
          </div>
        )}

        {selectedElement.type === 'text' && !selectedElement.dataBinding && (
          <div>
            <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Texto</label>
            <textarea 
              className="w-full text-xs p-2 border border-[#D9CEBF] rounded-lg bg-[#FAF8F5] resize-none"
              rows={3}
              value={selectedElement.content.text || ''}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Color</label>
          <div className="flex items-center space-x-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => handleUpdateStyle('fill', e.target.value)}
            />
            <input 
              type="text" 
              className="flex-1 text-xs p-1.5 border border-[#D9CEBF] rounded uppercase font-mono"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => handleUpdateStyle('fill', e.target.value)}
            />
          </div>
        </div>

        {selectedElement.type === 'text' && (
          <div>
            <label className="block text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1.5">Tamaño de Fuente</label>
            <input 
              type="number" 
              className="w-full text-xs p-2 border border-[#D9CEBF] rounded-lg bg-[#FAF8F5]"
              value={selectedElement.style.fontSize || 16}
              onChange={(e) => handleUpdateStyle('fontSize', parseInt(e.target.value) || 16)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
