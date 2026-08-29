import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon, Clock, Link2, Shapes } from 'lucide-react';
import { downloadHTML } from '../lib/exportHTML';

export const Toolbar: React.FC = () => {
  const { eventData, undo, redo, history, addElement, selectedElementIds, bringToFront, bringForward, sendBackward, sendToBack } = useEditorStore();

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
  };

  const handleAddCountdown = () => {
    const theme = useEditorStore.getState().document.theme;
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
        title: "Falta para el gran día",
        showSeconds: true,
        labels: { days: "días", hours: "hrs", minutes: "min", seconds: "seg" },
        expiredMessage: "¡Hoy es el día!"
      },
      style: { 
        variant: 'cards',
        numberFont: theme.typography.displayFont,
        labelFont: theme.typography.bodyFont,
        numberSize: 32,
        labelSize: 12,
        numberColor: theme.palette.primary,
        labelColor: theme.palette.muted,
        titleColor: theme.palette.text,
        backgroundColor: '#ffffff',
        borderColor: theme.palette.primary,
        gap: 10,
        isDefaultStyle: true 
      },
      transform: { x: 50, y: 150, width: 300, height: 100, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 10,
      locked: false,
      visible: true
    });
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
        borderRadius: 8,
        paddingX: 20,
        paddingY: 10,
        isDefaultStyle: true 
      },
      transform: { x: 50, y: 250, width: 200, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 10,
      locked: false,
      visible: true
    });
  };

  return (
    <div className="m-3 mb-0 h-14 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-2xl flex items-center justify-between px-4 wc-toolbar z-10 relative shadow-sm">
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

        <div className="hidden md:flex items-center space-x-2">
          <button onClick={handleAddText} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Type className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Texto</span>
          </button>
          <button onClick={handleAddRectangle} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Square className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Forma</span>
          </button>
          
          <div className="relative">
             <input 
               type="file" 
               accept="image/png, image/jpeg, image/webp, image/svg+xml" 
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   if (file.size > 5 * 1024 * 1024) {
                     alert("La imagen excede los 5MB");
                     return;
                   }
                   const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
                   const reader = new FileReader();
                   
                   reader.onload = (ev) => {
                     const result = ev.target?.result as string;
                     let src = result;
                     let svgText = '';
                     
                     if (isSvg) {
                       svgText = result;
                       src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
                     }
                     
                     const img = new Image();
                     img.onload = () => {
                       addElement({
                         type: 'image',
                         content: { src, originalSrc: src, isSvg, svgText, naturalWidth: img.width, naturalHeight: img.height },
                         style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: isSvg ? '#000000' : undefined, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                         transform: { x: 50, y: 50, width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                         zIndex: 15,
                         locked: false,
                         visible: true
                       });
                     };
                     img.src = src;
                   };
                   
                   if (isSvg) {
                     reader.readAsText(file);
                   } else {
                     reader.readAsDataURL(file);
                   }
                 }
                 e.target.value = '';
               }}
             />
             <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
               <ImageIcon className="w-3.5 h-3.5 text-[#8B3A4A]" />
               <span>Imagen</span>
             </button>
          </div>
          <div className="relative">
             <input 
               type="file" 
               accept="image/svg+xml,.svg" 
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
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
                     const color = '#8B3A4A';
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
                         style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: '#8B3A4A', filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                         transform: { x: 50, y: 50, width: Math.min(img.width, 150), height: Math.min(img.height, 150 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                         zIndex: 15,
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
             <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
               <Shapes className="w-3.5 h-3.5 text-[#8B3A4A]" />
               <span>Objeto</span>
             </button>
          </div>

          <button onClick={handleAddCountdown} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Clock className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Cuenta Regresiva</span>
          </button>
          <button onClick={handleAddButton} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Link2 className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Botón Ubicación</span>
          </button>

        </div>

        {selectedElementIds.length === 1 && (
          <>
            <div className="h-6 w-px bg-[#E8DCCF]"></div>
            <div className="flex items-center space-x-1">
              <button onClick={() => bringToFront(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Traer al frente (Ctrl + ])">
                <ArrowUpToLine className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => bringForward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Subir una capa (])">
                <ArrowUp className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => sendBackward(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Bajar una capa ([)">
                <ArrowDown className="w-4 h-4 text-[#524B42]" />
              </button>
              <button onClick={() => sendToBack(selectedElementIds[0])} className="p-1.5 hover:bg-[#F3EFEA] rounded" title="Enviar al fondo (Ctrl + [)">
                <ArrowDownToLine className="w-4 h-4 text-[#524B42]" />
              </button>
            </div>
          </>
        )}

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
        <button 
          onClick={() => {
            const name = prompt("Nombre de la plantilla:");
            if (name) {
              useEditorStore.getState().saveTemplate(name);
              alert("Plantilla guardada.");
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-[#524B42]" />
          <span>Guardar Plantilla</span>
        </button>
        <button onClick={() => downloadHTML(useEditorStore.getState().document)} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B3A4A] text-white rounded hover:bg-[#7a3240] transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Diseño</span>
        </button>
      </div>
    </div>
  );
};
