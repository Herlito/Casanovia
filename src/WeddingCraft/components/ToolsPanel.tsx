import React, { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Type, Square, Image as ImageIcon, Music, Link2, Clock, Shapes, Frame } from 'lucide-react';

export const ToolsPanel: React.FC = () => {
  const { addElement, document } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddShape = () => {
    addElement({
      type: 'svg-shape',
      content: { svg: '' },
      style: {
        fill: '#8C8276',
        stroke: '#2D3748',
        strokeWidth: 2,
        variant: 'rectangle',
        opacity: 1
      },
      transform: { x: 100, y: 100, width: 150, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddImageFrame = () => {
    addElement({
      type: 'image-frame',
      content: { 
        imageSrc: null, 
        shapeVariant: 'rectangle', 
        objectFit: 'cover' 
      },
      style: {
        fill: '#E2E8F0',
        stroke: '#8C8276',
        strokeWidth: 2,
        borderRadius: 24,
        opacity: 1
      },
      transform: { x: 75, y: 150, width: 220, height: 220, rotation: 0, scaleX: 1, scaleY: 1 },
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
        <button onClick={handleAddShape} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]">
          <Square className="w-4 h-4 text-[#2D3748]" />
          <span>Forma</span>
        </button>
        <button onClick={handleAddImageFrame} className="flex items-center space-x-3 px-3 py-2 text-sm font-semibold hover:bg-[#F3EFEA] rounded-xl border border-transparent shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] bg-[#EBEBEB] text-[#2D3748]" title="Forma que enmarca y corta una imagen">
          <Frame className="w-4 h-4 text-[#2D3748]" />
          <span>Marco / Contenedor</span>
        </button>
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
