import React, { useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { 
  Type, 
  Square, 
  Circle, 
  Heart, 
  Image as ImageIcon, 
  Music, 
  Link2, 
  Clock, 
  Shapes, 
  Frame,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ToolsPanel: React.FC = () => {
  const { addElement, document } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shapesExpanded, setShapesExpanded] = useState(true);

  const handleAddText = () => {
    addElement({
      type: 'text',
      content: { text: 'Nuevo Texto' },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 32,
        color: '#2D3748',
        align: 'center',
        opacity: 1
      },
      transform: { x: 50, y: 50, width: 250, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddShapeContainer = (shapeVariant: 'rectangle' | 'circle' | 'oval' | 'arch' | 'heart' = 'rectangle') => {
    const isCircle = shapeVariant === 'circle';
    const isOval = shapeVariant === 'oval';
    const isArch = shapeVariant === 'arch';
    const isHeart = shapeVariant === 'heart';

    addElement({
      type: 'image-frame',
      content: { 
        imageSrc: null, 
        shapeVariant: shapeVariant, 
        objectFit: 'cover' 
      },
      style: {
        fill: '#F1F5F9',
        stroke: '#94A3B8',
        strokeWidth: 2,
        borderRadius: isCircle ? 999 : isArch ? 110 : 20,
        opacity: 1
      },
      transform: { 
        x: 75, 
        y: 150, 
        width: isOval ? 240 : 220, 
        height: isArch ? 260 : isOval ? 160 : 220, 
        rotation: 0, 
        scaleX: 1, 
        scaleY: 1 
      },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddCountdown = () => {
    addElement({
      type: 'countdown-widget',
      content: { 
        targetDate: '2026-12-31T00:00:00.000Z', 
        title: 'Faltan', 
        expiredMessage: '¡Llegó el gran día!' 
      },
      style: {
        backgroundColor: '#FFFFFF',
        numberColor: '#2D3748',
        titleColor: '#2D3748',
        labelColor: '#666666',
        variant: 'cards',
        opacity: 1
      },
      transform: { x: 50, y: 200, width: 280, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddButton = () => {
    addElement({
      type: 'interactive-button',
      content: { text: 'Ver Ubicación', actionType: 'copy-link', linkUrl: '' },
      style: {
        backgroundColor: '#524B42',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 8,
        opacity: 1
      },
      transform: { x: 50, y: 300, width: 200, height: 45, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#EBEBEB] rounded-3xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-4">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Herramientas</h3>
      <div className="flex flex-col space-y-2">
        <button onClick={handleAddText} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
          <Type className="w-4 h-4 text-[#2D3748]" />
          <span>Texto</span>
        </button>

        {/* Forma Contenedor de Imagen (Sección Principal de Formas) */}
        <div className="rounded-2xl p-2.5 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2 border border-slate-200/50">
          <div 
            onClick={() => setShapesExpanded(!shapesExpanded)}
            className="flex items-center justify-between cursor-pointer px-1 text-[#2D3748]"
          >
            <div className="flex items-center space-x-2">
              <Shapes className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-gray-800">Formas Contenedor</span>
            </div>
            {shapesExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
          </div>
          
          <p className="text-[10px] text-gray-500 px-1 leading-tight">
            Inserta una forma que corta y enmarca fotos arrastradas dentro de ella.
          </p>

          {shapesExpanded && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => handleAddShapeContainer('rectangle')}
                className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all"
                title="Rectángulo con esquinas redondeadas"
              >
                <Square className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Rectángulo</span>
              </button>

              <button
                onClick={() => handleAddShapeContainer('circle')}
                className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all"
                title="Círculo contenedor"
              >
                <Circle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Círculo</span>
              </button>

              <button
                onClick={() => handleAddShapeContainer('oval')}
                className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all"
                title="Óvalo contenedor"
              >
                <div className="w-3.5 h-2.5 rounded-full border-2 border-indigo-600 shrink-0" />
                <span className="truncate">Óvalo</span>
              </button>

              <button
                onClick={() => handleAddShapeContainer('arch')}
                className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all"
                title="Arco o portal de boda"
              >
                <Frame className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Arco Boda</span>
              </button>

              <button
                onClick={() => handleAddShapeContainer('heart')}
                className="col-span-2 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all"
                title="Corazón contenedor"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-100 shrink-0" />
                <span>Corazón Contenedor</span>
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const src = ev.target?.result as string;
                  const img = new Image();
                  img.onload = () => {
                    addElement({
                      type: 'image',
                      content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                      style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                      transform: { x: 50, y: 50, width: img.width / 2, height: img.height / 2, rotation: 0, scaleX: 1, scaleY: 1 },
                      zIndex: document.pages[0].elements.length,
                      locked: false,
                      visible: true
                    });
                  };
                  img.src = src;
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }}
          />
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
            <ImageIcon className="w-4 h-4 text-[#2D3748]" />
            <span>Imagen</span>
          </button>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/svg+xml,.svg"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  alert("El SVG excede los 2MB");
                  return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                  let svgText = ev.target?.result as string;
                  const color = '#2D3748';
                  const styleTag = `<style>* { fill: ${color} !important; stroke: ${color} !important; }</style>`;
                  if (svgText.includes('<svg')) {
                    svgText = svgText.replace(/(<svg[^>]*>)/i, `$1${styleTag}`);
                  }
                  const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
                  
                  const img = new Image();
                  img.onload = () => {
                    addElement({
                      type: 'image',
                      content: { src, originalSrc: src, isSvg: true, svgText, naturalWidth: img.width, naturalHeight: img.height },
                      style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: '#2D3748', filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                      transform: { x: 50, y: 50, width: Math.min(img.width, 150), height: Math.min(img.height, 150 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                      zIndex: document.pages[0].elements.length,
                      locked: false,
                      visible: true
                    });
                  };
                  img.src = src;
                };
                reader.readAsText(file);
              }
              e.target.value = '';
            }}
          />
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
            <Shapes className="w-4 h-4 text-[#2D3748]" />
            <span>Objeto</span>
          </button>
        </div>
        <button onClick={handleAddCountdown} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
          <Clock className="w-4 h-4 text-[#2D3748]" />
          <span>Cuenta Regresiva</span>
        </button>
        <button onClick={() => {
          addElement({
            type: 'audio-player',
            content: { src: '', title: 'Canción' },
            style: { backgroundColor: '#EBEBEB', color: '#2D3748', borderRadius: 24 },
            transform: { x: 50, y: 150, width: 250, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            zIndex: document.pages[0].elements.length,
            locked: false,
            visible: true
          });
        }} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
          <Music className="w-4 h-4 text-[#2D3748]" />
          <span>Audio</span>
        </button>
        <button onClick={handleAddButton} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
          <Link2 className="w-4 h-4 text-[#2D3748]" />
          <span>Botón Ubicación</span>
        </button>
      </div>
    </div>
  );
};
