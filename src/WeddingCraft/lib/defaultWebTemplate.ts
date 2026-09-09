import { WeddingDesignDocument, CanvasElement } from '../types';
import { predefinedThemes } from '../themes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates the default digital invitation canvas document based on "Web Invitados"
 * structure with interactive buttons connected to Casanovia modules (Opción 2).
 */
export function createDefaultWebInvitationDocument(options: {
  eventId?: string;
  coupleNames?: [string, string] | string[];
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
  romanticQuote?: string;
}): WeddingDesignDocument {
  const couple = options.coupleNames && options.coupleNames.length >= 2 
    ? `${options.coupleNames[0]} & ${options.coupleNames[1]}`
    : 'Nuestra Boda';
  
  const couple1 = options.coupleNames?.[0] || 'Novio';
  const couple2 = options.coupleNames?.[1] || 'Novia';
  const rawDate = options.eventDate ? new Date(options.eventDate) : new Date(Date.now() + 90 * 86400000);
  const targetIsoDate = !isNaN(rawDate.getTime()) ? rawDate.toISOString() : new Date(Date.now() + 90 * 86400000).toISOString();

  // Formatting date for text elements
  const dateFormatted = !isNaN(rawDate.getTime()) 
    ? rawDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Sábado, 24 de Octubre de 2026';
  
  const venue = options.venueName || 'Hacienda San José';
  const quote = options.romanticQuote || 'Con la bendición de Dios y de nuestras familias, tenemos el honor de invitarte a celebrar nuestra boda.';

  const theme = predefinedThemes[0] || {
    id: 'editorial-neutral',
    name: 'Editorial Neutral',
    palette: {
      background: '#FAF8F5',
      primary: '#2D3748',
      secondary: '#6B6358',
      accent: '#D4AF37'
    }
  };

  const canvasWidth = 375;
  const canvasHeight = 980;

  const elements: CanvasElement[] = [
    // 1. Decorative Header Tag
    {
      id: uuidv4(),
      type: 'text',
      content: { text: 'NUESTRA BODA' },
      style: {
        fontFamily: 'Montserrat',
        fontSize: 11,
        color: '#8C8276',
        align: 'center',
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 1
      },
      transform: { x: 20, y: 35, width: 335, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 1,
      locked: false,
      visible: true
    },

    // 2. Couple Names in Elegant Serif
    {
      id: uuidv4(),
      type: 'text',
      content: { text: `${couple1} & ${couple2}` },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 34,
        color: '#2D2A26',
        align: 'center',
        lineHeight: 1.15,
        opacity: 1
      },
      transform: { x: 15, y: 65, width: 345, height: 85, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 2,
      locked: false,
      visible: true
    },

    // 3. Romantic Quote
    {
      id: uuidv4(),
      type: 'text',
      content: { text: `"${quote}"` },
      style: {
        fontFamily: 'Cormorant Garamond',
        fontStyle: 'italic',
        fontSize: 15,
        color: '#6B6358',
        align: 'center',
        lineHeight: 1.35,
        opacity: 1
      },
      transform: { x: 25, y: 155, width: 325, height: 60, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 3,
      locked: false,
      visible: true
    },

    // 4. Elegant Date Line
    {
      id: uuidv4(),
      type: 'text',
      content: { text: dateFormatted.toUpperCase() },
      style: {
        fontFamily: 'Montserrat',
        fontSize: 12,
        color: '#2D3748',
        align: 'center',
        letterSpacing: 2,
        opacity: 1
      },
      transform: { x: 20, y: 225, width: 335, height: 26, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 4,
      locked: false,
      visible: true
    },

    // 5. Venue Name
    {
      id: uuidv4(),
      type: 'text',
      content: { text: venue },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 18,
        color: '#2D2A26',
        align: 'center',
        opacity: 1
      },
      transform: { x: 20, y: 255, width: 335, height: 30, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 5,
      locked: false,
      visible: true
    },

    // 6. Real-Time Countdown Widget
    {
      id: uuidv4(),
      type: 'countdown-widget',
      content: {
        targetDate: targetIsoDate,
        title: 'CUENTA REGRESIVA',
        expiredMessage: '¡Llegó el gran día!'
      },
      style: {
        backgroundColor: '#FFFFFF',
        numberColor: '#2D3748',
        titleColor: '#8C8276',
        labelColor: '#718096',
        variant: 'cards',
        borderRadius: 16,
        opacity: 1
      },
      transform: { x: 25, y: 300, width: 325, height: 85, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 6,
      locked: false,
      visible: true
    },

    // 7. Interactive Action Button: Confirmar Asistencia (RSVP)
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '✉️ Confirmar Asistencia',
        actionType: 'scroll-to-section',
        linkUrl: '#rsvp-section'
      },
      style: {
        backgroundColor: '#2D3748',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 15,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 415, width: 305, height: 48, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 7,
      locked: false,
      visible: true
    },

    // 8. Interactive Action Button: Pase Digital & Protocolo
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '👑 Mi Pase & Ubicación de Mesa',
        actionType: 'scroll-to-section',
        linkUrl: '#protocol-lookup-section'
      },
      style: {
        backgroundColor: '#D4AF37',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 475, width: 305, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 8,
      locked: false,
      visible: true
    },

    // 9. Interactive Action Button: Cómo llegar / Itinerario
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '📍 Cómo Llegar & Itinerario',
        actionType: 'scroll-to-section',
        linkUrl: '#event-details-section'
      },
      style: {
        backgroundColor: '#4A5568',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 533, width: 305, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 9,
      locked: false,
      visible: true
    },

    // 10. Interactive Action Button: Código de Vestimenta
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '👗 Código de Vestimenta',
        actionType: 'scroll-to-section',
        linkUrl: '#dress-code-section'
      },
      style: {
        backgroundColor: '#718096',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 591, width: 305, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 10,
      locked: false,
      visible: true
    },

    // 11. Interactive Action Button: Mesa de Regalos
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '🎁 Mesa de Regalos',
        actionType: 'scroll-to-section',
        linkUrl: '#gift-registry-section'
      },
      style: {
        backgroundColor: '#8C8276',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 649, width: 305, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 11,
      locked: false,
      visible: true
    },

    // 12. Interactive Action Button: Muro de Deseos
    {
      id: uuidv4(),
      type: 'interactive-button',
      content: {
        text: '💌 Muro de Deseos & Bendiciones',
        actionType: 'scroll-to-section',
        linkUrl: '#wishes-wall-section'
      },
      style: {
        backgroundColor: '#A0AEC0',
        color: '#FFFFFF',
        variant: 'solid',
        borderRadius: 18,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: 35, y: 707, width: 305, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 12,
      locked: false,
      visible: true
    },

    // 13. Bottom Romantic Greeting
    {
      id: uuidv4(),
      type: 'text',
      content: { text: '¡Esperamos celebrar este gran día contigo!' },
      style: {
        fontFamily: 'Playfair Display',
        fontStyle: 'italic',
        fontSize: 14,
        color: '#718096',
        align: 'center',
        opacity: 1
      },
      transform: { x: 20, y: 780, width: 335, height: 35, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 13,
      locked: false,
      visible: true
    }
  ];

  return {
    id: uuidv4(),
    parentEventId: options.eventId || '',
    metadata: {
      createdAt: Date.now(),
      lastModified: Date.now(),
      version: '1.0.0'
    },
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#FAF8F5'
    },
    theme,
    pages: [
      {
        id: 'cover',
        name: 'Invitación Digital',
        elements
      }
    ],
    assetReferences: []
  };
}
