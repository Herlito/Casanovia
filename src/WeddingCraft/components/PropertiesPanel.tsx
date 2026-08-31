import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Settings2, Link as LinkIcon } from 'lucide-react';
import { FontPicker } from './FontPicker';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic } from 'lucide-react';


export const PropertiesPanel: React.FC = () => {
  const { document, selectedElementIds, updateElement, updateCanvas, eventData } = useEditorStore();
  
  const selectedElement = selectedElementIds.length === 1 
    ? document.pages[0].elements.find(e => e.id === selectedElementIds[0])
    : null;


  if (!selectedElement) {
    const canvasConfig = document.canvas;
    return (
      <div className="flex flex-col h-full wc-properties overflow-y-auto">
        <div className="p-3 border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
            <Settings2 className="w-4 h-4 text-gray-800" />
            <span>Propiedades del Lienzo</span>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-xs text-[#8C8276] mb-4">Selecciona un elemento para editarlo, o configura la tarjeta base:</p>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Ancho (px)</label>
            <input 
              type="number"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.width}
              onChange={(e) => {
                 updateCanvas({ width: parseInt(e.target.value) || 375 });
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Alto (px)</label>
            <input 
              type="number"
              className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
              value={canvasConfig.height}
              onChange={(e) => {
                 updateCanvas({ height: parseInt(e.target.value) || 812 });
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color de Fondo</label>
            <input 
              type="color"
              className="w-full h-8 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
              value={canvasConfig.backgroundColor}
              onChange={(e) => {
                 updateCanvas({ backgroundColor: e.target.value });
              }}
            />
          </div>
        </div>
      </div>
    );
  }


  const handleUpdateStyle = (key: string, value: any) => {
    // Get latest state to avoid closure staleness on multiple sync calls
    const state = useEditorStore.getState();
    const el = state.document.pages[0].elements.find(e => e.id === selectedElement.id);
    if (!el) return;
    updateElement(selectedElement.id, { 
      style: { ...el.style, [key]: value } 
    });
  };

  const handleUpdateContent = (textOrObj: string | any) => {
    if (typeof textOrObj === 'string') {
        updateElement(selectedElement.id, { 
          content: { ...selectedElement.content, text: textOrObj } 
        });
    } else {
        updateElement(selectedElement.id, { 
          content: textOrObj 
        });
    }
  };

  return (
    <div className="flex flex-col h-full wc-properties overflow-y-auto">
      <div className="p-3 border-b border-gray-200/50 bg-[#EBEBEB]/50 backdrop-blur-md sticky top-0 z-10">
        <h3 className="text-[11px] font-semibold text-gray-800 flex items-center space-x-1.5 uppercase tracking-wide">
          <Settings2 className="w-4 h-4 text-gray-800" />
          <span>Propiedades del Objeto</span>
        </h3>
      </div>

      <div className="p-3 space-y-4">
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
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto</label>
            <textarea 
              className="w-full text-xs p-2 border border-[#D9CEBF] rounded-lg bg-[#FAF8F5] resize-none"
              rows={3}
              value={selectedElement.content.text || ''}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color</label>
          <div className="flex items-center space-x-2 mb-2">
            <input 
              type="color" 
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => {
                handleUpdateStyle('fill', e.target.value);
                handleUpdateStyle('isDefaultStyle', false);
              }}
            />
            <input 
              type="text" 
              className="flex-1 text-xs p-1.5 border border-[#D9CEBF] rounded uppercase font-mono"
              value={selectedElement.style.fill || '#000000'}
              onChange={(e) => {
                handleUpdateStyle('fill', e.target.value);
                handleUpdateStyle('isDefaultStyle', false);
              }}
            />
          </div>
          <div className="flex space-x-1">
             {[
               { id: 'primary', color: document.theme.palette.primary },
               { id: 'secondary', color: document.theme.palette.secondary },
               { id: 'text', color: document.theme.palette.text },
               { id: 'muted', color: document.theme.palette.muted },
               { id: 'accent', color: document.theme.palette.accent }
             ].map(swatch => (
               <button 
                 key={swatch.id}
                 className="w-6 h-6 rounded border border-gray-200"
                 style={{ backgroundColor: swatch.color }}
                 title={swatch.id}
                 onClick={() => handleUpdateStyle('fill', swatch.color)}
               />
             ))}
          </div>
        </div>


        {selectedElement.type === 'image' && (
          <div className="space-y-4">
            {selectedElement.content.isSvg && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color del Ícono / SVG</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.fill || '#000000'}
                  onChange={(e) => {
                    const color = e.target.value;
                    handleUpdateStyle('fill', color);
                    
                    // Modify the SVG source
                    if (selectedElement.content.svgText) {
                      let newSvg = selectedElement.content.svgText;
                      // Inject a style to force fill color
                      const styleTag = `<style>* { fill: ${color} !important; stroke: ${color} !important; }</style>`;
                      if (newSvg.includes('<svg')) {
                        newSvg = newSvg.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
                      }
                      const newSrc = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(newSvg)));
                      handleUpdateContent({ ...selectedElement.content, src: newSrc });
                    }
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Forma de la Foto</label>
              <div className="grid grid-cols-4 gap-2">
                {['none', 'circle', 'ellipse', 'rounded', 'arch', 'heart', 'scallop', 'diamond'].map(mask => (
                  <button 
                    key={mask}
                    className={`p-1.5 border rounded-lg flex items-center justify-center bg-gray-50 ${selectedElement.style.maskId === mask ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('maskId', mask)}
                    title={mask}
                  >
                     <div className="w-6 h-6 bg-gray-300" style={{
                       borderRadius: mask === 'circle' ? '50%' : mask === 'rounded' ? '4px' : '0'
                     }}></div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Marco Decorativo</label>
              <div className="grid grid-cols-3 gap-2">
                 <button 
                    className={`p-2 border rounded-lg text-xs ${!selectedElement.style.frameId ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', null)}
                  >
                    Ninguno
                  </button>
                  <button 
                    className={`p-2 border rounded-lg text-xs ${selectedElement.style.frameId === 'gold-line' ? 'border-transparent bg-[#FAF8F5]' : 'border-gray-200'}`}
                    onClick={() => handleUpdateStyle('frameId', 'gold-line')}
                  >
                    Línea Fina
                  </button>
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => {
                  handleUpdateStyle('fontFamily', font);
                  handleUpdateStyle('isDefaultStyle', false);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tamaño</label>
                <div className="flex items-center space-x-1">
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => {
                    handleUpdateStyle('fontSize', Math.max(8, (selectedElement.style.fontSize || 16) - 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>-</button>
                  <input 
                    type="number" 
                    className="w-full text-xs p-1.5 text-gray-900 border border-[#D9CEBF] rounded bg-[#FAF8F5] text-center"
                    value={selectedElement.style.fontSize || 16}
                    onChange={(e) => {
                      handleUpdateStyle('fontSize', parseInt(e.target.value) || 16);
                      handleUpdateStyle('isDefaultStyle', false);
                    }}
                  />
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => {
                    handleUpdateStyle('fontSize', Math.min(144, (selectedElement.style.fontSize || 16) + 1));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}>+</button>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Peso</label>
                <select 
                  className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                  value={selectedElement.style.fontWeight || 400}
                  onChange={(e) => {
                    handleUpdateStyle('fontWeight', parseInt(e.target.value));
                    handleUpdateStyle('isDefaultStyle', false);
                  }}
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Regular (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>SemiBold (600)</option>
                  <option value={700}>Bold (700)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-1 rounded-lg">
              <div className="flex space-x-1">
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'left' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'left')}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${(selectedElement.style.align || 'center') === 'center' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'center')}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'right' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'right')}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.align === 'justify' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('align', 'justify')}
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="flex space-x-1 border-l pl-2 border-gray-200">
                <button 
                  className={`p-1.5 rounded ${selectedElement.style.fontStyle === 'italic' ? 'bg-[#EBEBEB] shadow' : 'hover:bg-gray-200'}`}
                  onClick={() => handleUpdateStyle('fontStyle', selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Espaciado letras</span>
                  <span>{selectedElement.style.letterSpacing || 0}px</span>
                </div>
                <input 
                  type="range" min="-2" max="20" step="0.5"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.letterSpacing || 0}
                  onChange={(e) => handleUpdateStyle('letterSpacing', parseFloat(e.target.value))}
                />
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] font-bold text-[#8C8276] uppercase tracking-wider mb-1">
                  <span>Altura de línea</span>
                  <span>{selectedElement.style.lineHeight || 1.2}</span>
                </div>
                <input 
                  type="range" min="0.8" max="3" step="0.1"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.lineHeight || 1.2}
                  onChange={(e) => handleUpdateStyle('lineHeight', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
               <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Transformación</label>
               <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'none' || !selectedElement.style.textTransform ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'none')}>Aa</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'uppercase' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'uppercase')}>AA</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'lowercase' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'lowercase')}>aa</button>
                 <button className={`flex-1 text-xs py-1 ${selectedElement.style.textTransform === 'capitalize' ? 'bg-gray-200 font-bold' : 'bg-[#EBEBEB]'}`} onClick={() => handleUpdateStyle('textTransform', 'capitalize')}>Aa</button>
               </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
               <label className="flex items-center space-x-2">
                 <input type="checkbox" checked={selectedElement.style.shadow?.enabled || false} onChange={(e) => handleUpdateStyle('shadow', { ...selectedElement.style.shadow, enabled: e.target.checked, color: 'rgba(0,0,0,0.5)', blur: 5, offsetX: 2, offsetY: 2 })} />
                 <span className="text-xs font-bold text-gray-700">Sombra paralela</span>
               </label>
            </div>
          </div>
        )}


        {selectedElement.type === 'audio-player' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Título de la Canción</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">URL del Audio (mp3, etc)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.src || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.backgroundColor || '#EBEBEB'}
                  onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Elementos</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.color || '#2D3748'}
                  onChange={(e) => handleUpdateStyle('color', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
        {selectedElement.type === 'interactive-button' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipografía</label>
              <FontPicker 
                value={selectedElement.style.fontFamily || ''}
                onChange={(font) => handleUpdateStyle('fontFamily', font)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto del Botón</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.text || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Enlace (URL)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.linkUrl || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, linkUrl: e.target.value })}
                placeholder="https://goo.gl/maps/..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Variante</label>
              <select
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.style.variant || 'solid'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="solid">Sólido</option>
                <option value="outline">Contorno</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Fondo / Borde</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.backgroundColor || '#000000'}
                onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Texto</label>
              <input 
                type="color" 
                className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                value={selectedElement.style.color || '#ffffff'}
                onChange={(e) => handleUpdateStyle('color', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedElement.type === 'countdown-widget' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Título</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.title || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mensaje Final (Expirado)</label>
              <input 
                type="text" 
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.content.expiredMessage || ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, expiredMessage: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha Objetivo</label>
              <input 
                type="datetime-local" 
                disabled={selectedElement.content.useEventDate}
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all disabled:opacity-50"
                value={selectedElement.content.targetDate ? selectedElement.content.targetDate.substring(0, 16) : ''}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, targetDate: new Date(e.target.value).toISOString() })}
              />
              {selectedElement.content.useEventDate && <p className="text-[10px] text-gray-500 mt-1">Vinculado a la fecha del evento.</p>}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Estilo Visual</label>
              <select
                className="w-full text-xs p-1.5 text-gray-900 border border-gray-200 rounded-lg bg-gray-50/50 focus:bg-[#EBEBEB] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all"
                value={selectedElement.style.variant || 'cards'}
                onChange={(e) => handleUpdateStyle('variant', e.target.value)}
              >
                <option value="minimal">Minimalista (Sin fondo)</option>
                <option value="cards">Tarjetas</option>
                <option value="circles">Círculos</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Mostrar Segundos</label>
              <input 
                type="checkbox" 
                checked={selectedElement.content.showSeconds}
                onChange={(e) => handleUpdateContent({ ...selectedElement.content, showSeconds: e.target.checked })}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fuente Números</label>
                <FontPicker 
                  value={selectedElement.style.numberFont || ''}
                  onChange={(font) => handleUpdateStyle('numberFont', font)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fuente Textos</label>
                <FontPicker 
                  value={selectedElement.style.labelFont || ''}
                  onChange={(font) => handleUpdateStyle('labelFont', font)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Números</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.numberColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('numberColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Color Etiquetas</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.labelColor || '#000000'}
                  onChange={(e) => handleUpdateStyle('labelColor', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fondo Contenedor</label>
                <input 
                  type="color" 
                  className="w-full h-7 p-0.5 border border-gray-200 rounded bg-gray-50/50 cursor-pointer"
                  value={selectedElement.style.containerBackgroundColor || '#ffffff'}
                  onChange={(e) => handleUpdateStyle('containerBackgroundColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Transparencia</label>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full accent-[#2D3748]"
                  value={selectedElement.style.containerOpacity ?? 0}
                  onChange={(e) => handleUpdateStyle('containerOpacity', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200/50 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>Opacidad Global</span>
              <span>{Math.round((selectedElement.style.opacity ?? 1) * 100)}%</span>
            </label>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full accent-[#2D3748]"
              value={selectedElement.style.opacity ?? 1}
              onChange={(e) => handleUpdateStyle('opacity', parseFloat(e.target.value))}
            />
          </div>
          
          {['text', 'countdown-widget', 'interactive-button', 'svg-shape', 'audio-player'].includes(selectedElement.type) && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCurrentThemeColors"
                checked={selectedElement.style.isDefaultStyle || false}
                onChange={(e) => handleUpdateStyle('isDefaultStyle', e.target.checked)}
                className="rounded border-gray-300 text-[#2D3748] focus:ring-[#2D3748]"
              />
              <label htmlFor="useCurrentThemeColors" className="text-xs text-gray-700 cursor-pointer">
                Usar colores del estilo actual
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
