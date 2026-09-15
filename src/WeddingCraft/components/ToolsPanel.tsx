import React, { useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { 
  Type, 
  Square, 
  Circle, 
  Heart, 
  Image as ImageIcon, 
  Music, 
  MapPin, 
  Clock, 
  Shapes, 
  Frame,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Minus,
  Church,
  PartyPopper,
  Shirt,
  MessageSquareHeart,
  CalendarDays,
  Quote
} from 'lucide-react';
import { LayersPanel } from './LayersPanel';

export const ToolsPanel: React.FC = () => {
  const { addElement, document, eventData } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shapesExpanded, setShapesExpanded] = useState(false);
  const [containerShapesExpanded, setContainerShapesExpanded] = useState(false);
  const [eventDetailsExpanded, setEventDetailsExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);

  const handleAddCeremonyCard = () => {
    const venue = eventData?.ceremonyVenue;
    const vName = venue?.name || eventData?.venueName || 'Parroquia Nuestra Señora';
    const vAddress = venue?.address || eventData?.venueAddress || 'Av. Principal #123, Zona Colonial';
    const vTime = venue?.time || '17:00 hrs (Puntual)';
    const gMaps = venue?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vName + ' ' + vAddress)}`;
    const waze = venue?.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(vName + ' ' + vAddress)}`;

    addElement({
      type: 'event-ceremony-card',
      content: {
        badge: 'Ceremonia Religiosa',
        venueName: vName,
        time: vTime,
        address: vAddress,
        googleMapsUrl: gMaps,
        wazeUrl: waze
      },
      style: {
        backgroundColor: '#FAF8F5',
        borderColor: '#EADDCE',
        titleColor: '#2D2A26',
        color: '#524B42',
        accentColor: '#8A9A86',
        borderRadius: 20
      },
      transform: { x: 40, y: 160, width: 340, height: 180, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddReceptionCard = () => {
    const venue = eventData?.receptionVenue;
    const vName = venue?.name || 'Hacienda Villa del Sol';
    const vAddress = venue?.address || 'Carretera Los Olivos Km 4.5';
    const vTime = venue?.time || '19:30 hrs';
    const gMaps = venue?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vName + ' ' + vAddress)}`;
    const waze = venue?.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(vName + ' ' + vAddress)}`;

    addElement({
      type: 'event-reception-card',
      content: {
        badge: 'Recepción & Fiesta',
        venueName: vName,
        time: vTime,
        address: vAddress,
        googleMapsUrl: gMaps,
        wazeUrl: waze
      },
      style: {
        backgroundColor: '#FAF8F5',
        borderColor: '#EADDCE',
        titleColor: '#2D2A26',
        color: '#524B42',
        accentColor: '#C5A880',
        borderRadius: 20
      },
      transform: { x: 40, y: 360, width: 340, height: 180, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddDressCode = () => {
    addElement({
      type: 'dress-code-card',
      content: {
        styleName: eventData?.dressCodeStyle || 'Formal Rigurosa',
        description: eventData?.dressCodeDescription || 'Damas: Vestido largo de gala en tonos tierra o pastel. Caballeros: Traje oscuro o smoking formal.',
        suggestedColors: eventData?.suggestedColors || [
          { name: 'Esmeralda', hex: '#2A4736' },
          { name: 'Salvia', hex: '#8A9A86' },
          { name: 'Champán', hex: '#D4AF37' },
          { name: 'Arena', hex: '#C5A880' }
        ]
      },
      style: {
        backgroundColor: '#FAF8F5',
        borderColor: '#EADDCE',
        titleColor: '#2D2A26',
        color: '#524B42',
        accentColor: '#C5A880',
        borderRadius: 20
      },
      transform: { x: 40, y: 560, width: 340, height: 190, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddWishesWall = () => {
    addElement({
      type: 'wishes-wall-card',
      content: {
        title: 'Muro de los Deseos',
        subtitle: 'Deseos y bendiciones de nuestros invitados',
        wishes: eventData?.sampleWishes || [
          { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
          { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
        ]
      },
      style: {
        backgroundColor: '#FAF8F5',
        borderColor: '#EADDCE',
        titleColor: '#2D2A26',
        color: '#524B42',
        accentColor: '#C5A880',
        borderRadius: 20
      },
      transform: { x: 40, y: 770, width: 340, height: 230, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddCoupleQuoteContacts = () => {
    const names = eventData?.coupleNames ? `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}` : 'Romina & Herly';
    const quote = eventData?.romanticQuote || 'El amor no se mira, se siente, y aún más cuando se comparte con quienes amamos. ¡Gracias por acompañarnos!';
    addElement({
      type: 'couple-quote-contacts-card',
      content: {
        badge: '💍 Frase, Nombres & Contactos',
        coupleNames: names,
        quote: quote,
        weddingDate: '15 de Noviembre de 2026',
        contactTitle: 'Confirmación & Contactos',
        contactPhone: '+54 9 11 1234-5678',
        contactEmail: 'contacto@nuestraboda.com',
        contactNote: 'Por favor confirma tu asistencia lo antes posible.'
      },
      style: {
        backgroundColor: '#FAF8F5',
        borderColor: '#EADDCE',
        titleColor: '#2D2A26',
        color: '#524B42',
        accentColor: '#C5A880',
        borderRadius: 20,
        titleFontFamily: 'Playfair Display',
        fontFamily: 'Montserrat',
        align: 'center',
        titleFontSize: 22,
        bodyFontSize: 12,
        badgeFontSize: 10
      },
      transform: { x: 40, y: 160, width: 340, height: 250, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

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

  const handleAddVectorShape = (variant: 'rectangle' | 'circle' | 'line' | 'oval') => {
    const isCircle = variant === 'circle';
    const isLine = variant === 'line';
    const isOval = variant === 'oval';

    addElement({
      type: 'svg-shape',
      content: { svgPath: '' },
      style: {
        variant: variant,
        fill: isLine ? 'transparent' : '#CBD5E1',
        stroke: '#4A5568',
        strokeWidth: isLine ? 2 : 1,
        borderRadius: isCircle ? 999 : 8,
        opacity: 1
      },
      transform: {
        x: 60,
        y: 120,
        width: isLine ? 220 : isOval ? 200 : isCircle ? 140 : 160,
        height: isLine ? 30 : isOval ? 130 : isCircle ? 140 : 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      },
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
      transform: { x: 45, y: 200, width: 285, height: 80, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddLocationButton = () => {
    addElement({
      type: 'interactive-button',
      content: { 
        text: '📍 Cómo Llegar / Ubicación', 
        actionType: 'scroll-to-section', 
        linkUrl: '#event-details-section' 
      },
      style: {
        backgroundColor: '#2D3748',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 16,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 50, y: 300, width: 220, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      {/* 1. Texto */}
      <button 
        onClick={handleAddText} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <Type className="w-4 h-4 text-[#2D3748]" />
        <span>Texto</span>
      </button>

      {/* 2. Formas (Básicas vectoriales) */}
      <div className="rounded-2xl p-2.5 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2 border border-slate-200/50">
        <div 
          onClick={() => setShapesExpanded(!shapesExpanded)}
          className="flex items-center justify-between cursor-pointer px-1 text-[#2D3748]"
        >
          <div className="flex items-center space-x-2">
            <Square className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-gray-800">Formas</span>
          </div>
          {shapesExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        </div>
        
        {shapesExpanded && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleAddVectorShape('rectangle')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Rectángulo vectorial"
            >
              <Square className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Rectángulo</span>
            </button>
            <button
              onClick={() => handleAddVectorShape('circle')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Círculo vectorial"
            >
              <Circle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Círculo</span>
            </button>
            <button
              onClick={() => handleAddVectorShape('oval')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Óvalo vectorial"
            >
              <div className="w-3.5 h-2.5 rounded-full border-2 border-emerald-600 shrink-0" />
              <span className="truncate">Óvalo</span>
            </button>
            <button
              onClick={() => handleAddVectorShape('line')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Línea divisora"
            >
              <Minus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Línea</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Formas Contenedor (Marcos de recorte para fotos) */}
      <div className="rounded-2xl p-2.5 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2 border border-slate-200/50">
        <div 
          onClick={() => setContainerShapesExpanded(!containerShapesExpanded)}
          className="flex items-center justify-between cursor-pointer px-1 text-[#2D3748]"
        >
          <div className="flex items-center space-x-2">
            <Shapes className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-800">Formas Contenedor</span>
          </div>
          {containerShapesExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        </div>
        
        {containerShapesExpanded && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => handleAddShapeContainer('rectangle')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Rectángulo redondeado"
            >
              <Square className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Rectángulo</span>
            </button>
            <button
              onClick={() => handleAddShapeContainer('circle')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Círculo contenedor"
            >
              <Circle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Círculo</span>
            </button>
            <button
              onClick={() => handleAddShapeContainer('oval')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Óvalo contenedor"
            >
              <div className="w-3.5 h-2.5 rounded-full border-2 border-indigo-600 shrink-0" />
              <span className="truncate">Óvalo</span>
            </button>
            <button
              onClick={() => handleAddShapeContainer('arch')}
              className="flex items-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Arco o portal"
            >
              <Frame className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Arco Boda</span>
            </button>
            <button
              onClick={() => handleAddShapeContainer('heart')}
              className="col-span-2 flex items-center justify-center space-x-1.5 px-2 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Corazón contenedor"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-100 shrink-0" />
              <span>Corazón Contenedor</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Imagen */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
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
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer">
          <ImageIcon className="w-4 h-4 text-[#2D3748]" />
          <span>Imagen</span>
        </button>
      </div>

      {/* 5. Objeto (SVG / Gráficos) */}
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
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer">
          <Sparkles className="w-4 h-4 text-[#2D3748]" />
          <span>Objeto</span>
        </button>
      </div>

      {/* 6. Cuenta Regresiva */}
      <button 
        onClick={handleAddCountdown} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <Clock className="w-4 h-4 text-[#2D3748]" />
        <span>Cuenta Regresiva</span>
      </button>

      {/* 7. Audio */}
      <button 
        onClick={() => {
          addElement({
            type: 'audio-player',
            content: { src: '', title: 'Canción' },
            style: { backgroundColor: '#EBEBEB', color: '#2D3748', borderRadius: 24 },
            transform: { x: 50, y: 150, width: 250, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
            zIndex: document.pages[0].elements.length,
            locked: false,
            visible: true
          });
        }} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <Music className="w-4 h-4 text-[#2D3748]" />
        <span>Audio</span>
      </button>

      {/* 8. Ubicación (Botón Interactivo de Navegación / Itinerario) */}
      <button 
        onClick={handleAddLocationButton} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <MapPin className="w-4 h-4 text-rose-600" />
        <span>Ubicación</span>
      </button>

      {/* 9. Detalles del Evento (Ceremonia Religiosa & Recepción) */}
      <div className="rounded-2xl p-2.5 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2 border border-slate-200/50">
        <div 
          onClick={() => setEventDetailsExpanded(!eventDetailsExpanded)}
          className="flex items-center justify-between cursor-pointer px-1 text-[#2D3748]"
        >
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-[#8A9A86]" />
            <span className="text-xs font-bold text-gray-800">Detalles del Evento</span>
          </div>
          {eventDetailsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        </div>
        
        {eventDetailsExpanded && (
          <div className="space-y-1.5 pt-1">
            <button
              onClick={handleAddCeremonyCard}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Insertar tarjeta de Ceremonia Religiosa con mapa y ubicación"
            >
              <Church className="w-4 h-4 text-[#8A9A86] shrink-0" />
              <span>Ceremonia Religiosa</span>
            </button>
            <button
              onClick={handleAddReceptionCard}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Insertar tarjeta de Recepción & Fiesta con mapa y ubicación"
            >
              <PartyPopper className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Recepción & Fiesta</span>
            </button>
          </div>
        )}
      </div>

      {/* 10. Código de Vestimenta (Dress Code) */}
      <button 
        onClick={handleAddDressCode} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <Shirt className="w-4 h-4 text-[#C5A880]" />
        <span>Código de Vestimenta</span>
      </button>

      {/* 11. Muro de los Deseos */}
      <button 
        onClick={handleAddWishesWall} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
      >
        <MessageSquareHeart className="w-4 h-4 text-rose-500" />
        <span>Muro de los Deseos</span>
      </button>

      {/* 12. Frase, Nombres & Contactos */}
      <button 
        onClick={handleAddCoupleQuoteContacts} 
        className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer"
        title="Modificar o agregar Frase, Nombres & Contactos"
      >
        <Quote className="w-4 h-4 text-[#D4AF37]" />
        <span>Frase, Nombres & Contactos</span>
      </button>

      {/* 12. Capas */}
      <div className="rounded-2xl p-2.5 bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] space-y-2 border border-slate-200/50">
        <div 
          onClick={() => setLayersExpanded(!layersExpanded)}
          className="flex items-center justify-between cursor-pointer px-1 text-[#2D3748]"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-gray-800">Capas</span>
          </div>
          {layersExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
        </div>

        {layersExpanded && (
          <div className="pt-1 max-h-56 overflow-y-auto">
            <LayersPanel isMobile={true} />
          </div>
        )}
      </div>
    </div>
  );
};
