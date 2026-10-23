import { WeddingDesignDocument, CanvasElement } from '../types';
import { predefinedThemes } from '../themes';
import { v4 as uuidv4 } from 'uuid';
import { parseDateSafe, formatSpanishDateLong } from '../../lib/dateUtils';

/**
 * Responsive reflow function that reorganizes elements fluidly across any canvas width.
 */
export function reflowCanvasElements(
  elements: CanvasElement[],
  newWidth: number,
  oldWidth?: number
): CanvasElement[] {
  const isMobile = newWidth < 500;
  const centerX = (w: number) => Math.round((newWidth - w) / 2);

  const updated = elements.map(el => {
    // 1. Header Tag ("NUESTRA BODA")
    if (el.dataBinding?.field === 'headerTag' || (el.type === 'text' && el.content?.text === 'NUESTRA BODA')) {
      const w = Math.min(newWidth - 40, 360);
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: 44, width: w, height: 22 }
      };
    }

    // 2. Hero Couple Names
    if (el.dataBinding?.field === 'coupleNames' || (el.type === 'text' && el.style?.fontSize && el.style.fontSize >= 30)) {
      const w = Math.min(newWidth - 40, 580);
      return {
        ...el,
        style: { ...el.style, fontSize: isMobile ? 32 : 44 },
        transform: { ...el.transform, x: centerX(w), y: 72, width: w, height: isMobile ? 55 : 65 }
      };
    }

    // 3. Romantic Quote
    if (el.dataBinding?.field === 'romanticQuote' || (el.type === 'text' && (el.content?.text || '').includes('Y recuerda'))) {
      const w = Math.min(newWidth - 60, 580);
      const h = isMobile ? 90 : 72;
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: 152, width: w, height: h }
      };
    }

    // 4. Date Line
    if (el.dataBinding?.field === 'eventDate' || (el.type === 'text' && (el.content?.text || '').toLowerCase().includes('julio'))) {
      const w = Math.min(newWidth - 40, 480);
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: isMobile ? 258 : 252, width: w, height: 24 }
      };
    }

    // 5. Venue Name
    if (el.dataBinding?.field === 'venueName' || (el.type === 'text' && ((el.content?.text || '').includes('Iglesia') || (el.content?.text || '').trim().toLowerCase() === 'lugar'))) {
      const w = Math.min(newWidth - 40, 480);
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: isMobile ? 286 : 282, width: w, height: 32 }
      };
    }

    // 6. Countdown Widget
    if (el.type === 'countdown-widget') {
      const w = Math.min(newWidth - 60, 420);
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: isMobile ? 356 : 352, width: w, height: 90 }
      };
    }

    // 7. Footer Greeting
    if (el.dataBinding?.field === 'footerGreeting' || (el.type === 'text' && (el.content?.text || '').includes('Esperamos'))) {
      const w = Math.min(newWidth - 40, 480);
      return {
        ...el,
        transform: { ...el.transform, x: centerX(w), y: isMobile ? 830 : 850, width: w, height: 36 }
      };
    }

    // Fallback for centered elements
    if (oldWidth && oldWidth > 0 && Math.abs(el.transform.x + el.transform.width / 2 - oldWidth / 2) < 40) {
      const newX = centerX(el.transform.width);
      return {
        ...el,
        transform: { ...el.transform, x: newX }
      };
    }

    return el;
  });

  // Re-align and stack action buttons
  const buttons = updated.filter(el => el.type === 'interactive-button');
  if (buttons.length > 0) {
    
    const btnWidth = Math.min(newWidth - 80, 460);
    const startY = isMobile ? 476 : 474;
    const gap = 12;
    const btnHeight = 46;

    buttons.forEach((btn, index) => {
      btn.transform.x = centerX(btnWidth);
      btn.transform.y = startY + index * (btnHeight + gap);
      btn.transform.width = btnWidth;
      btn.transform.height = btnHeight;
    });
  }

  return updated;
}

/**
 * Generates the default digital invitation canvas document based on "Web Invitados"
 * structure with fluid native web sections directly on the neutral canvas background.
 */
export function createDefaultWebInvitationDocument(options: {
  eventId?: string;
  coupleNames?: [string, string] | string[];
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
  romanticQuote?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}): WeddingDesignDocument {
  const couple1 = options.coupleNames?.[0] || 'Luciana';
  const couple2 = options.coupleNames?.[1] || 'Mateo';
  const rawDate = options.eventDate ? parseDateSafe(options.eventDate) : parseDateSafe('2027-07-16T18:00:00');
  const targetIsoDate = !isNaN(rawDate.getTime()) ? rawDate.toISOString() : '2027-07-16T18:00:00.000Z';

  // Formatting date for text elements - guaranteed to preserve exact configuration day
  const dateFormatted = options.eventDate
    ? formatSpanishDateLong(options.eventDate)
    : 'sábado, 16 de julio de 2027';
  
  const venue = (options.venueName && options.venueName !== 'Lugar') ? options.venueName : 'Hacienda Villa del Sol';
  const quote = options.romanticQuote || 'Y recuerda, tal y como estaba escrito, que querer a otra persona es ver la cara de Dios. Querer a alguien y que nos quieran es la sensación más gratificante que podemos sentir los seres humanos';

  const theme = predefinedThemes[0] || {
    id: 'editorial-neutral',
    name: 'Editorial Neutral',
    palette: {
      background: '#EBEBEB',
      primary: '#2D3748',
      secondary: '#6B6358',
      accent: '#D4AF37'
    }
  };

  const canvasWidth = options.canvasWidth || 720;
  const canvasHeight = options.canvasHeight || 980;

  const centerX = (w: number) => Math.round((canvasWidth - w) / 2);

  // Responsive widths
  const tagWidth = Math.min(canvasWidth - 40, 360);
  const heroWidth = Math.min(canvasWidth - 40, 580);
  const quoteWidth = Math.min(canvasWidth - 60, 580);
  const detailsWidth = Math.min(canvasWidth - 40, 480);
  const countdownWidth = Math.min(canvasWidth - 60, 420);
  const btnWidth = Math.min(canvasWidth - 80, 460);
  const footerWidth = Math.min(canvasWidth - 40, 480);

  const elements: CanvasElement[] = [
    // 1. Header Tag ("NUESTRA BODA")
    {
      id: uuidv4(),
      type: 'text',
      content: { text: 'NUESTRA BODA' },
      style: {
        fontFamily: 'Montserrat',
        fontSize: 12,
        color: '#8C8276',
        align: 'center',
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 1
      },
      transform: { x: centerX(tagWidth), y: 44, width: tagWidth, height: 22, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 1,
      locked: false,
      visible: true,
      dataBinding: { field: 'headerTag' }
    },
    // 2. Nombre del Evento (Hero)
    {
      id: uuidv4(),
      type: 'text',
      content: { text: `${couple1} & ${couple2}` },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: canvasWidth < 500 ? 32 : 44,
        color: '#2D2A26',
        align: 'center',
        lineHeight: 1.15,
        opacity: 1
      },
      transform: { x: centerX(heroWidth), y: 72, width: heroWidth, height: 64, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 2,
      locked: false,
      visible: true,
      dataBinding: { field: 'coupleNames', format: '{{0}} & {{1}}' }
    },
    // 3. Frase Romántica
    {
      id: uuidv4(),
      type: 'text',
      content: { text: `"${quote}"` },
      style: {
        fontFamily: 'Cormorant Garamond',
        fontSize: 16,
        color: '#6B6358',
        align: 'center',
        fontStyle: 'italic',
        lineHeight: 1.45,
        opacity: 1
      },
      transform: { x: centerX(quoteWidth), y: 152, width: quoteWidth, height: 72, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 3,
      locked: false,
      visible: true,
      dataBinding: { field: 'romanticQuote' }
    },
    // 4. Fecha
    {
      id: uuidv4(),
      type: 'text',
      content: { text: dateFormatted },
      style: {
        fontFamily: 'Montserrat',
        fontSize: 13,
        color: '#2D3748',
        align: 'center',
        letterSpacing: 2,
        opacity: 1
      },
      transform: { x: centerX(detailsWidth), y: 252, width: detailsWidth, height: 24, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 4,
      locked: false,
      visible: true,
      dataBinding: { field: 'eventDate' }
    },
    // 5. Lugar
    {
      id: uuidv4(),
      type: 'text',
      content: { text: venue },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 20,
        color: '#2D2A26',
        align: 'center',
        opacity: 1
      },
      transform: { x: centerX(detailsWidth), y: 282, width: detailsWidth, height: 32, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 5,
      locked: false,
      visible: true,
      dataBinding: { field: 'venueName' }
    },
    // 6. Cuenta Regresiva
    {
      id: uuidv4(),
      type: 'countdown-widget',
      content: {
        targetDate: targetIsoDate,
        title: 'CUENTA REGRESIVA',
        expiredMessage: '¡Llegó el gran día!',
        labels: { days: 'días', hours: 'hrs', minutes: 'min' }
      },
      style: {
        backgroundColor: '#EBEBEB',
        borderColor: '#CBD5E1',
        titleColor: '#8C8276',
        numberColor: '#2D3748',
        labelColor: '#718096',
        numberFont: 'Montserrat',
        numberSize: 24,
        labelSize: 10,
        variant: 'cards',
        borderRadius: 14,
        gap: 12,
        opacity: 1
      },
      transform: { x: centerX(countdownWidth), y: 352, width: countdownWidth, height: 90, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 6,
      locked: false,
      visible: true
    },
    // 7. Confirmar Asistencia
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
        borderRadius: 16,
        fontSize: 14,
        fontFamily: 'Montserrat',
        opacity: 1
      },
      transform: { x: centerX(btnWidth), y: 474, width: btnWidth, height: 46, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 7,
      locked: false,
      visible: true
    },
    // 8. Mensaje de despedida / Footer
    {
      id: uuidv4(),
      type: 'text',
      content: { text: '¡Esperamos celebrar este gran día contigo!' },
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 15,
        color: '#718096',
        align: 'center',
        fontStyle: 'italic',
        opacity: 1
      },
      transform: { x: centerX(footerWidth), y: 846, width: footerWidth, height: 36, rotation: 0, scaleX: 1, scaleY: 1 },
      zIndex: 8,
      locked: false,
      visible: true,
      dataBinding: { field: 'footerGreeting' }
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
      backgroundColor: '#EBEBEB',
      borderRadius: 0
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
