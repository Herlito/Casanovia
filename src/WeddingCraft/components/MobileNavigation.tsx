import React, { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Layers, Settings2, Plus, Type, Square, Clock, Link2, Image as ImageIcon, Shapes, X } from 'lucide-react';
import { LayersPanel } from './LayersPanel';
import { RightSidebar } from './RightSidebar';
import { prepareSvgElementContent } from '../lib/svgUtils';

export const MobileNavigation: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'none' | 'layers' | 'properties' | 'add'>('none');
  const { addElement, selectedElementIds } = useEditorStore();

  const closePanel = () => setActivePanel('none');

  const handleAddText = () => {
    const theme = useEditorStore.getState().document.theme;
    addElement({
      type: 'text',
      content: { text: 'Nuevo Texto' },
      style: { fontSize: 32, fill: theme.palette.text, fontFamily: theme.typography.displayFont, isDefaultStyle: true },
      transform: { x: 50, y: 50, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 10,
      locked: false,
      visible: true
    });
    closePanel();
  };

  const handleAddRectangle = () => {
    const theme = useEditorStore.getState().document.theme;
    addElement({
      type: 'svg-shape',
      content: { shapeType: 'rect' },
      style: { fill: theme.palette.primary, isDefaultStyle: true },
      transform: { x: 100, y: 100, width: 150, height: 150, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 5,
      locked: false,
      visible: true
    });
    closePanel();
  };

  const handleAddCountdown = () => {
    const eventData = useEditorStore.getState().eventData;
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90);
    if (eventData?.eventDate) {
      targetDate = new Date(eventData.eventDate);
    }
    addElement({
      type: 'countdown-widget',
      content: { 
         targetDate: targetDate.toISOString(), 
         useEventDate: !!eventData?.eventDate,
         title: 'Nuestra Boda',
         showSeconds: true,
         expiredMessage: '¡El día ha llegado!',
         labels: { days: 'días', hours: 'hrs', minutes: 'min', seconds: 'seg' }
      },
      style: { 
         variant: 'cards',
         titleColor: '#2D2A26',
         numberColor: '#2D3748',
         labelColor: '#8C8276',
         backgroundColor: '#ffffff',
         borderColor: '#E8DCCF',
         containerBackgroundColor: '#ffffff',
         containerOpacity: 0
      },
      transform: { x: 50, y: 50, width: 300, height: 120, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 15,
      locked: false,
      visible: true
    });
    closePanel();
  };

  const handleAddButton = () => {
    const theme = useEditorStore.getState().document.theme;
    addElement({
      type: 'interactive-button',
      content: { 
         text: 'Copiar Ubicación',
        actionType: 'copy-link',
        linkUrl: ''
      },
      style: { 
         variant: 'solid',
        fontFamily: theme.typography.bodyFont,
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: theme.palette.primary,
        borderRadius: 8
      },
      transform: { x: 50, y: 50, width: 200, height: 45, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 20,
      locked: false,
      visible: true
    });
    closePanel();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isSvgIcon = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo excede los 5MB");
        return;
      }
      const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
      const reader = new FileReader();
      
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        
        if (isSvg) {
          const initialColor = '#2D3748';
          const prepared = prepareSvgElementContent(result, initialColor);
          const img = new Image();
          img.onload = () => {
            addElement({
              type: 'image',
              content: {
                src: prepared.src,
                originalSrc: prepared.originalSrc,
                isSvg: true,
                rawSvgText: prepared.rawSvgText,
                svgText: prepared.svgText,
                naturalWidth: img.width || 200,
                naturalHeight: img.height || 200,
                isTransparent: true
              },
              style: { 
                maskId: null, 
                frameId: null, 
                objectFit: 'cover', 
                cropX: 0, 
                cropY: 0, 
                cropScale: 1, 
                fill: initialColor, 
                filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } 
              },
              transform: { x: 50, y: 50, width: Math.min(img.width || 180, 200), height: Math.min(img.height || 180, 200 * ((img.height || 180) / (img.width || 180))), rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: 15,
              locked: false,
              visible: true
            });
          };
          img.src = prepared.src;
        } else {
          const img = new Image();
          img.onload = () => {
            addElement({
              type: 'image',
              content: { src: result, originalSrc: result, isSvg: false, naturalWidth: img.width, naturalHeight: img.height },
              style: { 
                maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, 
                filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } 
              },
              transform: { x: 50, y: 50, width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
              zIndex: 15,
              locked: false,
              visible: true
            });
          };
          img.src = result;
        }
      };
      
      if (isSvg) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
    closePanel();
  };

  return (
    <>
      {/* Floating Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#EBEBEB]/80 backdrop-blur-2xl border border-transparent shadow-xl rounded-full px-5 py-2.5 space-x-8 z-[60]">
        <button 
          onClick={() => setActivePanel(activePanel === 'layers' ? 'none' : 'layers')} 
          className={`flex flex-col items-center transition-colors ${activePanel === 'layers' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium tracking-wide">Capas</span>
        </button>
        
        <button 
          onClick={() => setActivePanel('add')} 
          className="bg-gray-800 text-white p-3.5 rounded-full shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] -translate-y-4 hover:scale-105 transition-transform"
        >
          <Plus className={`w-6 h-6 transition-transform ${activePanel === 'add' ? 'rotate-45' : ''}`} />
        </button>
        
        <button 
          onClick={() => setActivePanel(activePanel === 'properties' ? 'none' : 'properties')} 
          className={`flex flex-col items-center transition-colors ${(activePanel === 'properties' || selectedElementIds.length > 0) && activePanel !== 'layers' && activePanel !== 'add' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <Settings2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-medium tracking-wide">Editar</span>
        </button>
      </div>

      {/* Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[65] transition-opacity duration-300 ${activePanel !== 'none' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closePanel}
      />

      {/* Bottom Sheet Container */}
      <div 
        className={`md:hidden fixed inset-x-0 bottom-0 z-[70] bg-[#f2f2f7] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${activePanel !== 'none' ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '75vh' }}
      >
        <div className="flex justify-center p-3 shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 relative">
          {/* Add Panel */}
          {activePanel === 'add' && (
            <div className="p-4 grid grid-cols-3 gap-4">
              <button onClick={handleAddText} className="flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                <Type className="w-8 h-8 text-gray-800 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Texto</span>
              </button>
              
              <div className="relative flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                 <input type="file" accept="image/png, image/jpeg, image/webp" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e)} />
                 <ImageIcon className="w-8 h-8 text-gray-800 mb-2" />
                 <span className="text-xs font-semibold text-gray-700">Imagen</span>
              </div>

              <div className="relative flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                 <input type="file" accept="image/svg+xml,.svg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, true)} />
                 <Shapes className="w-8 h-8 text-gray-800 mb-2" />
                 <span className="text-xs font-semibold text-gray-700">Objeto</span>
              </div>

              <button onClick={handleAddRectangle} className="flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                <Square className="w-8 h-8 text-gray-800 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Forma</span>
              </button>

              <button onClick={handleAddCountdown} className="flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                <Clock className="w-8 h-8 text-gray-800 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Reloj</span>
              </button>

              <button onClick={handleAddButton} className="flex flex-col items-center justify-center p-4 bg-[#EBEBEB] rounded-2xl shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:scale-95 transition-transform">
                <Link2 className="w-8 h-8 text-gray-800 mb-2" />
                <span className="text-xs font-semibold text-gray-700">Botón</span>
              </button>
            </div>
          )}

          {/* Properties Panel (Reuses RightSidebar) */}
          <div className={activePanel === 'properties' ? 'block h-full' : 'hidden'}>
             <div className="h-full relative overflow-y-auto">
               <RightSidebar isMobile />
             </div>
          </div>

          {/* Layers Panel */}
          <div className={activePanel === 'layers' ? 'block h-full' : 'hidden'}>
             <div className="h-full relative overflow-y-auto">
               <LayersPanel isMobile />
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
