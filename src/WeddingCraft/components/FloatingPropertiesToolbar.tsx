import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  Copy, 
  Lock, 
  Unlock,
  ChevronDown
} from 'lucide-react';
import { FontPicker } from './FontPicker';
import { recolorSvg, extractSvgTextFromSrc } from '../lib/svgUtils';

export const FloatingPropertiesToolbar: React.FC = () => {
  const { 
    document, 
    selectedElementIds, 
    updateElement, 
    deleteElements, 
    duplicateElements 
  } = useEditorStore();

  if (selectedElementIds.length === 0) return null;

  const elements = document.pages?.[0]?.elements || [];
  const selectedElement = elements.find(el => el.id === selectedElementIds[0]);
  if (!selectedElement) return null;

  const isMulti = selectedElementIds.length > 1;

  const handleUpdateStyle = (key: string, val: any) => {
    selectedElementIds.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (!el) return;
      updateElement(id, {
        style: {
          ...el.style,
          [key]: val
        }
      });
    });
  };

  const handleSvgColorChange = (color: string) => {
    selectedElementIds.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const currentContent = el.content || {};
      const rawSvg = currentContent.rawSvgText || currentContent.svgText || extractSvgTextFromSrc(currentContent.src) || '';
      if (!rawSvg) {
        updateElement(id, { style: { ...el.style, fill: color } });
        return;
      }
      const { svgText: newSvg, dataUrl: newSrc } = recolorSvg(rawSvg, color);
      updateElement(id, {
        style: { ...el.style, fill: color },
        content: {
          ...currentContent,
          isSvg: true,
          rawSvgText: currentContent.rawSvgText || rawSvg,
          svgText: newSvg,
          src: newSrc,
          originalSrc: currentContent.originalSrc || newSrc
        }
      });
    });
  };

  const isText = selectedElement.type === 'text';
  const isButton = selectedElement.type === 'interactive-button';
  const isCountdown = selectedElement.type === 'countdown-widget';
  const isImage = selectedElement.type === 'image';
  const isFrame = selectedElement.type === 'image-frame';
  const isShape = selectedElement.type === 'svg-shape';

  return (
    <div 
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-white/60 rounded-2xl transition-all max-w-[95%] overflow-x-auto text-[#2D3748]"
      style={{ minHeight: '44px' }}
    >
      {/* Element Type Pill */}
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-600 shrink-0">
        {isMulti ? `${selectedElementIds.length} elem.` : isText ? 'Texto' : isButton ? 'Botón' : isCountdown ? 'Cuenta Reg.' : isFrame ? 'Contenedor' : isShape ? (selectedElement.style?.variant === 'line' ? 'Línea' : 'Forma') : (isImage && selectedElement.content?.isSvg ? 'Vector SVG' : isImage ? 'Imagen' : 'Elemento')}
      </span>

      <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />

      {/* Text / Button Quick Formatting */}
      {(isText || isButton) && (
        <>
          {/* Font Picker */}
          <div className="w-28 shrink-0">
            <FontPicker
              value={selectedElement.style?.fontFamily || ''}
              onChange={(font) => handleUpdateStyle('fontFamily', font)}
            />
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 shrink-0">
            <input 
              type="number"
              min={8}
              max={140}
              value={selectedElement.style?.fontSize || 16}
              onChange={(e) => handleUpdateStyle('fontSize', Number(e.target.value))}
              className="w-12 text-xs py-1 px-1.5 text-center bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-lg font-bold text-gray-800 outline-none"
              title="Tamaño de Fuente"
            />
          </div>

          {/* Color Picker */}
          <label className="shrink-0 flex items-center cursor-pointer" title="Color de Texto">
            <input 
              type="color"
              value={selectedElement.style?.color || '#2D3748'}
              onChange={(e) => handleUpdateStyle('color', e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>

          {/* Bold toggle */}
          <button 
            type="button"
            onClick={() => {
              const currentWeight = selectedElement.style?.fontWeight;
              const nextWeight = currentWeight === 'bold' || currentWeight === 700 ? 'normal' : 'bold';
              handleUpdateStyle('fontWeight', nextWeight);
            }}
            className={`p-1.5 rounded-lg transition-all text-xs ${
              selectedElement.style?.fontWeight === 'bold' || selectedElement.style?.fontWeight === 700
                ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] font-extrabold text-blue-600'
                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-gray-700'
            }`}
            title="Negrita"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic toggle */}
          <button 
            type="button"
            onClick={() => {
              const currentStyle = selectedElement.style?.fontStyle;
              const nextStyle = currentStyle === 'italic' ? 'normal' : 'italic';
              handleUpdateStyle('fontStyle', nextStyle);
            }}
            className={`p-1.5 rounded-lg transition-all text-xs ${
              selectedElement.style?.fontStyle === 'italic'
                ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-blue-600'
                : 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] text-gray-700'
            }`}
            title="Cursiva"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Alignment buttons */}
          <div className="flex items-center gap-0.5 shrink-0 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] p-0.5 rounded-lg">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                type="button"
                onClick={() => handleUpdateStyle('align', align)}
                className={`p-1 rounded-md transition-all ${
                  selectedElement.style?.align === align 
                    ? 'bg-white shadow-[2px_2px_4px_#d1d1d1] text-blue-600 font-bold' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title={`Alinear a ${align}`}
              >
                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                {align === 'center' && <AlignCenter className="w-3 h-3" />}
                {align === 'right' && <AlignRight className="w-3 h-3" />}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />
        </>
      )}

      {/* Button specific quick background color */}
      {isButton && (
        <>
          <label className="shrink-0 flex items-center cursor-pointer gap-1" title="Color Fondo Botón">
            <span className="text-[10px] text-gray-500 font-bold">Fondo:</span>
            <input 
              type="color"
              value={selectedElement.style?.backgroundColor || '#2D3748'}
              onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />
        </>
      )}

      {/* Line Shape Specific Quick Controls */}
      {isShape && selectedElement.style?.variant === 'line' && (
        <>
          <label className="shrink-0 flex items-center cursor-pointer gap-1" title="Color de Línea">
            <span className="text-[10px] text-gray-500 font-bold">Línea:</span>
            <input 
              type="color"
              value={selectedElement.style?.stroke || '#2D3748'}
              onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <div className="flex items-center gap-1 shrink-0" title="Grosor de Línea">
            <span className="text-[10px] text-gray-500 font-bold">Grosor:</span>
            <input 
              type="number"
              min={1}
              max={50}
              value={selectedElement.style?.strokeWidth ?? 2}
              onChange={(e) => handleUpdateStyle('strokeWidth', parseInt(e.target.value) || 1)}
              className="w-12 text-xs py-1 px-1 text-center bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-lg font-bold text-gray-800 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const isVert = selectedElement.style?.orientation === 'vertical';
              handleUpdateStyle('orientation', isVert ? 'horizontal' : 'vertical');
              updateElement(selectedElement.id, {
                transform: {
                  ...selectedElement.transform,
                  width: isVert ? Math.max(selectedElement.transform.height, 120) : 24,
                  height: isVert ? 24 : Math.max(selectedElement.transform.width, 120)
                }
              });
            }}
            className="px-2 py-1 text-[10px] font-bold bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] rounded-lg text-gray-700 hover:text-black transition-all"
            title="Alternar orientación horizontal/vertical"
          >
            {selectedElement.style?.orientation === 'vertical' ? '↕ Vert' : '↔ Horiz'}
          </button>
          <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />
        </>
      )}

      {/* Shape / Container fill & border quick colors */}
      {((isShape && selectedElement.style?.variant !== 'line') || isFrame) && (
        <>
          <label className="shrink-0 flex items-center cursor-pointer gap-1" title="Color de Relleno">
            <span className="text-[10px] text-gray-500 font-bold">Relleno:</span>
            <input 
              type="color"
              value={selectedElement.style?.fill || '#cbd5e1'}
              onChange={(e) => handleUpdateStyle('fill', e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <label className="shrink-0 flex items-center cursor-pointer gap-1" title="Color de Borde">
            <span className="text-[10px] text-gray-500 font-bold">Borde:</span>
            <input 
              type="color"
              value={selectedElement.style?.stroke || '#94a3b8'}
              onChange={(e) => handleUpdateStyle('stroke', e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />
        </>
      )}

      {/* SVG Vector Quick Fill Color */}
      {isImage && selectedElement.content?.isSvg && (
        <>
          <label className="shrink-0 flex items-center cursor-pointer gap-1.5" title="Color de Relleno del Vector SVG">
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Relleno SVG:</span>
            <input 
              type="color"
              value={selectedElement.style?.fill || '#2D3748'}
              onChange={(e) => handleSvgColorChange(e.target.value)}
              className="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />
        </>
      )}

      {/* Opacity Control */}
      <div className="flex items-center gap-1 shrink-0" title="Opacidad">
        <span className="text-[10px] text-gray-500 font-bold">Op:</span>
        <input 
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={selectedElement.style?.opacity ?? 1}
          onChange={(e) => handleUpdateStyle('opacity', parseFloat(e.target.value))}
          className="w-14 h-1.5 accent-blue-600 cursor-pointer"
        />
      </div>

      <div className="w-px h-5 bg-gray-300 shrink-0 mx-0.5" />

      {/* Common Actions: Lock, Duplicate, Delete */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => {
            selectedElementIds.forEach(id => {
              const el = elements.find(e => e.id === id);
              if (el) updateElement(id, { locked: !el.locked });
            });
          }}
          className="p-1.5 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-lg text-gray-600 hover:text-gray-900 transition-all"
          title={selectedElement.locked ? "Desbloquear" : "Bloquear"}
        >
          {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => duplicateElements(selectedElementIds)}
          className="p-1.5 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-lg text-amber-700 hover:text-amber-900 transition-all"
          title="Duplicar elemento(s)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => deleteElements(selectedElementIds)}
          className="p-1.5 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1] rounded-lg text-rose-600 hover:text-rose-800 transition-all"
          title="Eliminar elemento(s)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
