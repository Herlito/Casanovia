import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate } from 'lucide-react';

export const Toolbar: React.FC = () => {
  const { eventData, undo, redo, history, addElement } = useEditorStore();

  const handleAddText = () => {
    addElement({
      type: 'text',
      content: { text: 'Nuevo Texto' },
      style: { fontSize: 24, fill: '#2D2A26', fontFamily: 'sans-serif' },
      transform: { x: 50, y: 50, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 10,
      locked: false,
      visible: true
    });
  };

  const handleAddRectangle = () => {
    addElement({
      type: 'svg-shape',
      content: { shapeType: 'rect' },
      style: { fill: '#D9CEBF' },
      transform: { x: 100, y: 100, width: 150, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 5,
      locked: false,
      visible: true
    });
  };

  return (
    <div className="h-14 bg-white border-b border-[#E8DCCF] flex items-center justify-between px-4 wc-toolbar z-10 relative shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <LayoutTemplate className="w-5 h-5 text-[#8B3A4A]" />
          <span className="font-serif-display font-bold text-[#2D2A26]">WeddingCraft</span>
        </div>
        
        <div className="h-6 w-px bg-[#E8DCCF]"></div>
        
        {/* Undo / Redo */}
        <div className="flex items-center space-x-1">
          <button onClick={undo} disabled={history.past.length === 0} className="p-1.5 hover:bg-[#F3EFEA] rounded disabled:opacity-30">
            <Undo2 className="w-4 h-4 text-[#524B42]" />
          </button>
          <button onClick={redo} disabled={history.future.length === 0} className="p-1.5 hover:bg-[#F3EFEA] rounded disabled:opacity-30">
            <Redo2 className="w-4 h-4 text-[#524B42]" />
          </button>
        </div>

        <div className="h-6 w-px bg-[#E8DCCF]"></div>

        {/* Tools */}
        <div className="flex items-center space-x-2">
          <button onClick={handleAddText} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Type className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Texto</span>
          </button>
          <button onClick={handleAddRectangle} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Square className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Forma</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {eventData?.isReadOnly && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Modo Seguro (Read-Only)</span>
          </div>
        )}
        
        <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors">
          <Save className="w-3.5 h-3.5 text-[#524B42]" />
          <span>Guardar Borrador</span>
        </button>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B3A4A] text-white rounded hover:bg-[#7a3240] transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Diseño</span>
        </button>
      </div>
    </div>
  );
};
