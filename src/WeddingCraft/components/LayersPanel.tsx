import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { 
  Layers, 
  Image as ImageIcon, 
  Type, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Clock, 
  Link2, 
  Frame, 
  Music, 
  Square, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpToLine, 
  ArrowDownToLine,
  Calendar,
  Shirt,
  MessageSquare,
  Quote
} from 'lucide-react';

export const LayersPanel: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { 
    document, 
    selectedElementIds, 
    selectElements, 
    updateElement, 
    deleteElements,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack
  } = useEditorStore();
  
  const elements = document.pages[0]?.elements || [];

  // Render elements in top-to-bottom visual layer order (highest zIndex at top)
  const sortedElements = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const getElementInfo = (el: any) => {
    switch(el.type) {
      case 'text': {
        const txt = el.content?.text || 'Texto';
        return {
          icon: <Type className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />,
          title: txt.length > 22 ? `${txt.substring(0, 20)}...` : txt,
          category: 'Texto'
        };
      }
      case 'image': {
        if (el.content?.isSvg) {
          return {
            icon: <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />,
            title: 'Gráfico SVG',
            category: 'Gráfico'
          };
        }
        return {
          icon: <ImageIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />,
          title: el.content?.originalSrc?.includes('image/png') ? 'Foto PNG' : 'Imagen',
          category: 'Imagen'
        };
      }
      case 'image-frame': {
        const variant = el.content?.shapeVariant || 'rectángulo';
        const hasImg = Boolean(el.content?.imageSrc);
        return {
          icon: <Frame className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />,
          title: `Marco ${variant} ${hasImg ? '(Con foto)' : '(Vacío)'}`,
          category: 'Marco'
        };
      }
      case 'countdown-widget':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />,
          title: 'Cuenta Regresiva',
          category: 'Widget'
        };
      case 'audio-player':
        return {
          icon: <Music className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
          title: 'Música de Fondo',
          category: 'Audio'
        };
      case 'interactive-button':
        return {
          icon: <Link2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />,
          title: el.content?.label || 'Botón de Acción',
          category: 'Botón'
        };
      case 'svg-shape': {
        const variant = el.style?.variant || 'rectángulo';
        return {
          icon: <Square className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />,
          title: `Forma (${variant})`,
          category: 'Forma'
        };
      }
      case 'event-ceremony-card':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
          title: 'Tarjeta Ceremonia',
          category: 'Tarjeta'
        };
      case 'event-reception-card':
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />,
          title: 'Tarjeta Recepción',
          category: 'Tarjeta'
        };
      case 'dress-code-card':
        return {
          icon: <Shirt className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />,
          title: 'Código de Vestimenta',
          category: 'Tarjeta'
        };
      case 'wishes-wall-card':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />,
          title: 'Muro de Deseos',
          category: 'Tarjeta'
        };
      case 'couple-quote-contacts-card':
        return {
          icon: <Quote className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />,
          title: 'Frase y Contacto',
          category: 'Tarjeta'
        };
      default:
        return {
          icon: <Layers className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />,
          title: 'Elemento',
          category: 'Capa'
        };
    }
  };

  const selectedElement = selectedElementIds.length === 1 
    ? elements.find(el => el.id === selectedElementIds[0])
    : null;

  return (
    <div className={`flex flex-col h-full wc-layers shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] overflow-hidden ${isMobile ? "w-full bg-[#EBEBEB] border-none rounded-none" : "w-72 bg-[#EBEBEB] border border-gray-200/60 rounded-3xl"}`}>
      {/* Header */}
      <div className="p-3.5 border-b border-gray-200/60 flex items-center justify-between bg-[#EBEBEB] sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center">
            <Layers className="w-4 h-4 text-gray-800" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-800 tracking-tight">Capas del Diseño</h3>
            <p className="text-[10px] text-gray-500 font-medium">{elements.length} {elements.length === 1 ? 'elemento' : 'elementos'}</p>
          </div>
        </div>

        {/* Global Layer Controls for Selected Item */}
        {selectedElement && (
          <div className="flex items-center space-x-1 bg-[#EBEBEB] p-1 rounded-xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
            <button 
              onClick={() => bringToFront(selectedElement.id)}
              className="p-1 rounded-lg hover:bg-white/80 active:scale-95 text-gray-700 transition-all"
              title="Traer al frente (Capa superior)"
            >
              <ArrowUpToLine className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => bringForward(selectedElement.id)}
              className="p-1 rounded-lg hover:bg-white/80 active:scale-95 text-gray-700 transition-all"
              title="Subir un nivel de capa"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => sendBackward(selectedElement.id)}
              className="p-1 rounded-lg hover:bg-white/80 active:scale-95 text-gray-700 transition-all"
              title="Bajar un nivel de capa"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => sendToBack(selectedElement.id)}
              className="p-1 rounded-lg hover:bg-white/80 active:scale-95 text-gray-700 transition-all"
              title="Enviar al fondo (Capa inferior)"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {sortedElements.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-gray-500 font-medium">No hay elementos en el lienzo</p>
            <p className="text-[10px] text-gray-400 mt-1">Agrega textos, imágenes o tarjetas desde el panel izquierdo.</p>
          </div>
        ) : (
          sortedElements.map((el, visualIdx) => {
            const isSelected = selectedElementIds.includes(el.id);
            const info = getElementInfo(el);
            const isTop = visualIdx === 0;
            const isBottom = visualIdx === sortedElements.length - 1;

            return (
              <div 
                key={el.id}
                onClick={() => selectElements([el.id])}
                className={`group relative flex flex-col p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-l-4 border-indigo-500' 
                    : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff]'
                }`}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                    {info.icon}
                    <div className="truncate flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                        {info.title}
                      </p>
                      <p className="text-[9px] text-gray-500 font-medium leading-none mt-0.5">
                        {info.category}
                        {el.locked ? ' • Bloqueado' : ''}
                        {!el.visible ? ' • Oculto' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-row for quick layer position changes when selected */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-gray-300/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Posición de Capa:
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); bringForward(el.id); }}
                        disabled={isTop}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          isTop ? 'opacity-30 cursor-not-allowed' : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:text-indigo-600 active:scale-95'
                        }`}
                        title="Subir nivel"
                      >
                        <ArrowUp className="w-3 h-3" />
                        <span>Subir</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); sendBackward(el.id); }}
                        disabled={isBottom}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          isBottom ? 'opacity-30 cursor-not-allowed' : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] hover:text-indigo-600 active:scale-95'
                        }`}
                        title="Bajar nivel"
                      >
                        <ArrowDown className="w-3 h-3" />
                        <span>Bajar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

