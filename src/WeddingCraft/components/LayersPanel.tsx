import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Layers, Image as ImageIcon, Type, Eye, EyeOff, Lock, Unlock, Trash2, Clock, Link2, Frame, Boxes } from 'lucide-react';

export const LayersPanel: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { document, selectedElementIds, selectElements, updateElement, deleteElements } = useEditorStore();
  const elements = document.pages[0].elements;

  // Render elements in reverse zIndex order for the panel
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const getIcon = (type: string) => {
    switch(type) {
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'image-frame': return <Frame className="w-3.5 h-3.5 text-indigo-600" />;
      case 'countdown-widget': return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case 'interactive-button': return <Link2 className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`flex flex-col h-full wc-layers shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden ${isMobile ? "w-full bg-transparent border-none rounded-none" : "w-64 bg-[#EBEBEB]/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl"}`}>
      <div className="p-3 border-b border-gray-200/50 flex items-center justify-between bg-[#EBEBEB]/50 sticky top-0 z-10">
        <h3 className="text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">
          <Layers className="w-4 h-4 text-[#2D3748]" />
          <span>Capas (Layers)</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedElements.length === 0 && (
          <p className="text-xs text-center text-[#8C8276] mt-4 italic">No hay elementos en el lienzo</p>
        )}
        
        {sortedElements.map(el => (
          <div 
            key={el.id}
            onClick={() => selectElements([el.id])}
            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
              selectedElementIds.includes(el.id) 
                ? 'bg-rose-50 border border-rose-200 text-[#2D3748] font-semibold' 
                : 'hover:bg-[#EBEBEB]/50 sticky top-0 z-10 border border-transparent text-[#524B42]'
            }`}
          >
            <div className="flex items-center space-x-2 truncate flex-1">
              {getIcon(el.type)}
              <span className="truncate">
                {(() => {
                  if (el.type === 'text') {
                    const txt = el.content.text || 'Texto';
                    return txt.length > 20 ? `Texto: ${txt.substring(0, 15)}...` : txt;
                  }
                  if (el.type === 'image') {
                    if (el.content.isSvg) return 'Gráfico SVG';
                    if (el.content.originalSrc && el.content.originalSrc.indexOf('image/png') !== -1) return 'Imagen PNG';
                    if (el.content.originalSrc && el.content.originalSrc.indexOf('image/jpeg') !== -1) return 'Imagen JPG';
                    return 'Imagen';
                  }
                  if (el.type === 'image-frame') {
                    const variant = el.content?.shapeVariant || 'rectángulo';
                    const hasImg = Boolean(el.content?.imageSrc);
                    return `Marco (${variant})${hasImg ? ' • Foto' : ' • Vacío'}`;
                  }
                  if (el.type === 'countdown-widget') return 'Cuenta Regresiva';
                  if (el.type === 'interactive-button') return 'Botón Ubicación';
                  if (el.type === 'svg-shape') return 'Forma';
                  return 'Elemento';
                })()}
                {el.parentGroup && (
                  <span className="ml-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded" title="Elemento agrupado">
                    Grupo
                  </span>
                )}
                {el.dataBinding && <span className="ml-1 text-[#D4AF37]" title="Vinculado al evento">🔗</span>}
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-[#8C8276]">
              <button 
                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { visible: !el.visible }); }}
                className="hover:text-[#2D2A26]"
              >
                {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-50" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); updateElement(el.id, { locked: !el.locked }); }}
                className="hover:text-[#2D2A26]"
              >
                {el.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 opacity-50" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteElements([el.id]); }}
                className="hover:text-red-500 ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
