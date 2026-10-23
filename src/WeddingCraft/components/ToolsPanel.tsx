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
  Quote,
  Building2,
  MapPinned,
  Plus
} from 'lucide-react';
import { LayersPanel } from './LayersPanel';
import { processAndOptimizeImage, uploadImageToCloudStorage } from '../../lib/storageUtils';
import { prepareSvgElementContent } from '../lib/svgUtils';
import { useWedding } from '../../context/WeddingContext';

export const ToolsPanel: React.FC = () => {
  const { addElement, document, eventData } = useEditorStore();
  const { settings, activeWedding } = useWedding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shapesExpanded, setShapesExpanded] = useState(false);
  const [containerShapesExpanded, setContainerShapesExpanded] = useState(false);
  const [eventDetailsExpanded, setEventDetailsExpanded] = useState(false);
  const [layersExpanded, setLayersExpanded] = useState(false);

  const coupleNamesStr = 
    settings?.coupleNames?.trim() ||
    (settings?.groomName && settings?.brideName ? `${settings.groomName} & ${settings.brideName}` : '') ||
    (activeWedding?.coupleNames ? activeWedding.coupleNames : '') ||
    eventData?.coupleNamesText ||
    (eventData?.coupleNames ? `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}` : 'Romina & Herly');

  const ceremonyVenue = settings?.ceremonyVenue || eventData?.ceremonyVenue;
  const receptionVenue = settings?.receptionVenue || eventData?.receptionVenue;
  const allAdditionalVenues = settings?.additionalVenues || eventData?.additionalVenues || [];

  const handleAddCoupleNames = () => {
    const canvasW = document.canvas.width || 375;
    const targetW = Math.min(360, Math.round(canvasW * 0.9));
    const targetX = Math.max(10, Math.round((canvasW - targetW) / 2));

    addElement({
      type: 'text',
      content: { text: coupleNamesStr },
      dataBinding: {
        field: 'coupleNames',
        format: '{{0}} & {{1}}'
      },
      style: {
        fontFamily: document.theme?.fonts?.title || 'Playfair Display',
        fontSize: 34,
        fontWeight: 'bold',
        color: '#2D2A26',
        align: 'center',
        opacity: 1,
        letterSpacing: 1
      },
      transform: { x: targetX, y: 120, width: targetW, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddVenueCard = (venue: {
    name: string;
    type?: string;
    address?: string;
    time?: string;
    googleMapsUrl?: string;
    wazeUrl?: string;
    notes?: string;
  }) => {
    const vName = venue.name || 'Sede Adicional';
    const vAddress = venue.address || 'Dirección de la sede';
    const vTime = venue.time || '15:00 hrs';
    const gMaps = venue.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vName + ' ' + vAddress)}`;
    const waze = venue.wazeUrl || `https://waze.com/ul?q=${encodeURIComponent(vName + ' ' + vAddress)}`;
    const badge = venue.type || 'Sede Adicional';

    const canvasW = document.canvas.width || 375;
    const targetW = Math.min(340, Math.round(canvasW * 0.9));
    const targetX = Math.max(15, Math.round((canvasW - targetW) / 2));

    addElement({
      type: 'event-ceremony-card',
      content: {
        badge: `📍 ${badge}`,
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
        accentColor: '#B08D57',
        borderRadius: 20
      },
      transform: { x: targetX, y: 240, width: targetW, height: 180, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: document.pages[0].elements.length,
      locked: false,
      visible: true
    });
  };

  const handleAddCeremonyCard = () => {
    const venue = ceremonyVenue;
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
    const venue = receptionVenue || eventData?.receptionVenue;
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
        orientation: isLine ? 'horizontal' : undefined,
        lineStyle: isLine ? 'solid' : undefined,
        lineCap: isLine ? 'round' : undefined,
        fill: isLine ? 'transparent' : '#CBD5E1',
        stroke: '#2D3748',
        strokeWidth: isLine ? 2 : 1,
        borderRadius: isCircle ? 999 : 8,
        opacity: 1
      },
      transform: {
        x: 60,
        y: 120,
        width: isLine ? 240 : isOval ? 200 : isCircle ? 140 : 160,
        height: isLine ? 24 : isOval ? 130 : isCircle ? 140 : 120,
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
              const elId = Date.now().toString();
              const currentEvtId = eventData?.eventId || 'default';
              const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

              if (isSvg) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const svgText = ev.target?.result as string;
                  const initialColor = '#2D3748';
                  const prepared = prepareSvgElementContent(svgText, initialColor);

                  const img = new Image();
                  img.onload = () => {
                    const w = Math.min(img.width || 180, 260);
                    const h = Math.min(img.height || 180, 260 * ((img.height || 180) / (img.width || 180)));
                    addElement({
                      id: elId,
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
                      transform: { x: 50, y: 50, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1 },
                      zIndex: (document.pages[0]?.elements?.length || 0) + 1,
                      locked: false,
                      visible: true
                    });
                  };
                  img.src = prepared.src;
                };
                reader.readAsText(file);
              } else {
                processAndOptimizeImage(file, 1200, 0.85).then(({ dataUrl }) => {
                  const img = new Image();
                  img.onload = () => {
                    addElement({
                      id: elId,
                      type: 'image',
                      content: { src: dataUrl, originalSrc: dataUrl, naturalWidth: img.width, naturalHeight: img.height },
                      style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                      transform: { x: 50, y: 50, width: Math.min(img.width / 2, 350), height: Math.min(img.height / 2, 350 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                      zIndex: (document.pages[0]?.elements?.length || 0) + 1,
                      locked: false,
                      visible: true
                    });

                    // Upload to Firebase Cloud Storage in the background for cross-device loading
                    uploadImageToCloudStorage(file, `weddingcraft_images/${currentEvtId}`).then(({ url, isCloudStorage }) => {
                      if (isCloudStorage && url) {
                        useEditorStore.getState().updateElement(elId, {
                          content: {
                            ...useEditorStore.getState().document.pages[0].elements.find(el => el.id === elId)?.content,
                            src: url,
                            originalSrc: url
                          }
                        });
                      }
                    }).catch(err => console.warn('Background storage upload error:', err));
                  };
                  img.src = dataUrl;
                }).catch(err => {
                  console.error('Error optimizing image:', err);
                });
              }
            }
            e.target.value = '';
          }}
        />
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] transition-all cursor-pointer">
          <ImageIcon className="w-4 h-4 text-[#2D3748]" />
          <span>Imagen</span>
        </button>
      </div>

      {/* 5. Objeto (SVG / Gráficos Vectoriales) */}
      <div className="relative">
        <input
          type="file"
          accept="image/svg+xml,.svg"
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 2 * 1024 * 1024) {
                alert("El archivo SVG excede los 2MB");
                return;
              }
              const reader = new FileReader();
              reader.onload = (ev) => {
                const svgText = ev.target?.result as string;
                const initialColor = '#2D3748';
                const prepared = prepareSvgElementContent(svgText, initialColor);

                const img = new Image();
                img.onload = () => {
                  const w = Math.min(img.width || 150, 180);
                  const h = Math.min(img.height || 150, 180 * ((img.height || 150) / (img.width || 150)));
                  addElement({
                    type: 'image',
                    content: {
                      src: prepared.src,
                      originalSrc: prepared.originalSrc,
                      isSvg: true,
                      rawSvgText: prepared.rawSvgText,
                      svgText: prepared.svgText,
                      naturalWidth: img.width || 150,
                      naturalHeight: img.height || 150,
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
                    transform: {
                      x: 50,
                      y: 50,
                      width: w,
                      height: h,
                      rotation: 0,
                      scaleX: 1,
                      scaleY: 1
                    },
                    zIndex: document.pages[0].elements.length,
                    locked: false,
                    visible: true
                  });
                };
                img.src = prepared.src;
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

      {/* 9. Detalles del Evento (Novios, Ceremonia, Recepción & Sedes Creadas en Ajustes) */}
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
            {/* 1. Nombre de los Novios (Objeto de Boda con datos de Ajustes) */}
            <button
              onClick={handleAddCoupleNames}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer group"
              title={`Insertar Nombre de los Novios: ${coupleNamesStr}`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-100 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-left truncate">
                  <span className="block font-bold text-gray-800">Nombre de los Novios</span>
                  <span className="block text-[10px] text-gray-500 truncate max-w-[170px]">{coupleNamesStr}</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-600 shrink-0 ml-1" />
            </button>

            {/* Separador de Ubicaciones creadas en el Menú de Ajustes */}
            <div className="pt-2 pb-0.5 px-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Ubicaciones (Ajustes)</span>
              </span>
            </div>

            {/* Ceremonia Religiosa */}
            <button
              onClick={handleAddCeremonyCard}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer group"
              title="Insertar tarjeta de Ceremonia Religiosa con mapa y ubicación"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Church className="w-4 h-4 text-[#8A9A86] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-left truncate">
                  <span className="block font-bold text-gray-800">Ceremonia Religiosa</span>
                  <span className="block text-[10px] text-gray-500 truncate max-w-[170px]">
                    {ceremonyVenue?.name || 'Parroquia Nuestra Señora'}
                  </span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8A9A86] shrink-0 ml-1" />
            </button>

            {/* Recepción & Fiesta */}
            <button
              onClick={handleAddReceptionCard}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer group"
              title="Insertar tarjeta de Recepción & Fiesta con mapa y ubicación"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <PartyPopper className="w-4 h-4 text-[#C5A880] shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-left truncate">
                  <span className="block font-bold text-gray-800">Recepción & Fiesta</span>
                  <span className="block text-[10px] text-gray-500 truncate max-w-[170px]">
                    {receptionVenue?.name || 'Hacienda Villa del Sol'}
                  </span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C5A880] shrink-0 ml-1" />
            </button>

            {/* Sedes Adicionales Creadas en el Menú de Ajustes */}
            {allAdditionalVenues.map((venue: any, idx: number) => (
              <button
                key={venue.id || idx}
                onClick={() => handleAddVenueCard(venue)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer group"
                title={`Insertar ubicación creada en Ajustes: ${venue.name}`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Building2 className="w-4 h-4 text-[#B08D57] shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="text-left truncate">
                    <span className="block font-bold text-gray-800 truncate">{venue.name || 'Sede Adicional'}</span>
                    <span className="block text-[10px] text-[#B08D57] truncate max-w-[170px]">
                      {venue.type || 'Sede Adicional'} {venue.time ? `• ${venue.time}` : ''}
                    </span>
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#B08D57] shrink-0 ml-1" />
              </button>
            ))}

            {allAdditionalVenues.length === 0 && (
              <button
                onClick={() => handleAddVenueCard({
                  name: 'Hotel & Hospedaje',
                  type: 'Hospedaje / Preparación',
                  address: 'Av. Principal #450',
                  time: '14:00 hrs',
                  googleMapsUrl: '',
                  wazeUrl: ''
                })}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium bg-[#EBEBEB] hover:bg-white/80 rounded-xl border border-dashed border-gray-300 text-gray-600 transition-all cursor-pointer group"
                title="Insertar tarjeta de Sede Adicional (puedes registrar más sedes en el menú de Ajustes)"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate text-[11px]">+ Sede Adicional / Hotel</span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono">(Ajustes)</span>
              </button>
            )}

            {/* Separador de Protocolo & Otros Bloques */}
            <div className="pt-2 pb-0.5 px-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Protocolo & Widgets
              </span>
            </div>

            {/* Código de Vestimenta */}
            <button
              onClick={handleAddDressCode}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Insertar Código de Vestimenta"
            >
              <Shirt className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Código de Vestimenta</span>
            </button>

            {/* Muro de los Deseos */}
            <button
              onClick={handleAddWishesWall}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Insertar Muro de los Deseos"
            >
              <MessageSquareHeart className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Muro de los Deseos</span>
            </button>

            {/* Frase, Nombres & Contactos */}
            <button
              onClick={handleAddCoupleQuoteContacts}
              className="w-full flex items-center space-x-2.5 px-2.5 py-2 text-xs font-semibold bg-[#EBEBEB] hover:bg-white rounded-xl shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-gray-700 transition-all cursor-pointer"
              title="Modificar o agregar Frase, Nombres & Contactos"
            >
              <Quote className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Frase, Nombres & Contactos</span>
            </button>
          </div>
        )}
      </div>

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
