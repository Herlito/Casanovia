import React from 'react';
import { CanvasElement } from '../types';
import { formatSpanishDateLong } from '../../lib/dateUtils';
import { DOMEventCard } from './DOMEventCard';
import { DOMCountdown } from './DOMCountdown';
import { DOMDressCode } from './DOMDressCode';
import { DOMInteractiveButton } from './DOMInteractiveButton';
import { DOMWishesWall } from './DOMWishesWall';
import { DOMCoupleContacts } from './DOMCoupleContacts';

interface DOMElementRendererProps {
  element: CanvasElement;
  eventData?: {
    coupleNames: [string, string];
    eventDate: string;
    venueName?: string;
    romanticQuote?: string;
    receptionVenue?: any;
    ceremonyVenue?: any;
  };
  onButtonClick?: (el: CanvasElement) => void;
  isCopied?: boolean;
}

export const DOMElementRenderer: React.FC<DOMElementRendererProps> = ({
  element,
  eventData,
  onButtonClick,
  isCopied = false
}) => {
  const transform = (element.transform && typeof element.transform === 'object') ? element.transform : { x: 0, y: 0, width: 100, height: 40, rotation: 0 };
  const style = (element.style && typeof element.style === 'object') ? element.style : {};
  const content = (element.content && typeof element.content === 'object') ? element.content : {};
  const type = element.type;

  console.log('[DOMElementRenderer] Rendering element:', { id: element.id, type, visible: element.visible });

  const x = transform.x || 0;
  const y = transform.y || 0;
  const width = transform.width || 100;
  const height = transform.height || 40;
  const rotation = transform.rotation || 0;

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: 'top left',
    zIndex: element.zIndex || 1,
    opacity: (typeof style.opacity === 'number' && !isNaN(style.opacity)) ? style.opacity : 1,
    boxSizing: 'border-box',
    pointerEvents: type === 'interactive-button' ? 'auto' : 'none'
  };

  // TEXT ELEMENT
  if (type === 'text') {
    let transformedText = content.text || '';
    if (element.dataBinding && eventData) {
      if (element.dataBinding.field === 'coupleNames' && eventData.coupleNames && eventData.coupleNames.length >= 2) {
        transformedText = element.dataBinding.format
          ? element.dataBinding.format.replace('{{0}}', eventData.coupleNames[0]).replace('{{1}}', eventData.coupleNames[1])
          : `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}`;
      } else if (element.dataBinding.field === 'eventDate' && eventData.eventDate) {
        transformedText = formatSpanishDateLong(eventData.eventDate);
      } else if (element.dataBinding.field === 'venueName') {
        transformedText = eventData.venueName || '';
      } else if (element.dataBinding.field === 'romanticQuote' && eventData.romanticQuote) {
        transformedText = `"${eventData.romanticQuote}"`;
      }
    }

    // Auto-substitute literal "Lugar" with configured venue
    const liveReceptionVenue = eventData?.receptionVenue?.name?.trim() || (eventData?.venueName && eventData.venueName.trim().toLowerCase() !== 'lugar' ? eventData.venueName.trim() : '') || 'Fundo Paraíso';
    if ((element.dataBinding?.field === 'venueName' || transformedText.trim().toLowerCase() === 'lugar') && liveReceptionVenue) {
      transformedText = liveReceptionVenue;
    }

    if (style.textTransform === 'uppercase') transformedText = transformedText.toUpperCase();
    else if (style.textTransform === 'lowercase') transformedText = transformedText.toLowerCase();
    else if (style.textTransform === 'capitalize') transformedText = transformedText.replace(/\b\w/g, (l: string) => l.toUpperCase());

    const textShadow = style.shadow?.enabled
      ? `${style.shadow.offsetX || 0}px ${style.shadow.offsetY || 0}px ${style.shadow.blur || 0}px ${style.shadow.color || 'rgba(0,0,0,0.3)'}`
      : undefined;

    const isGradient = style.gradientEnabled;
    const gradientColors = style.gradientColors || ['#ff0000', '#0000ff'];
    const textBackground = isGradient
      ? (style.gradientType === 'radial'
        ? `radial-gradient(circle, ${gradientColors.join(', ')})`
        : `linear-gradient(135deg, ${gradientColors.join(', ')})`)
      : undefined;

    return (
      <div
        style={{
          ...wrapperStyle,
          fontFamily: style.fontFamily ? `'${style.fontFamily}', sans-serif` : 'serif',
          fontSize: `${style.fontSize || 16}px`,
          fontWeight: style.fontWeight || 'normal',
          fontStyle: style.fontStyle || 'normal',
          color: isGradient ? undefined : (style.color || style.fill || '#2D3748'),
          background: textBackground,
          WebkitBackgroundClip: isGradient ? 'text' : undefined,
          WebkitTextFillColor: isGradient ? 'transparent' : undefined,
          textAlign: (style.align as any) || 'center',
          letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
          lineHeight: style.lineHeight || 1.25,
          textTransform: (style.textTransform as any) || 'none',
          textShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start',
          wordBreak: 'break-word',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {transformedText}
      </div>
    );
  }

  // IMAGE ELEMENT
  if (type === 'image') {
    const imageSrc = content.src || content.url || '';
    const objectFit = style.objectFit || 'cover';
    const borderRadius = style.borderRadius !== undefined ? `${style.borderRadius}px` : '0px';

    return (
      <div style={wrapperStyle}>
        <img
          src={imageSrc}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            borderRadius,
            filter: style.filters ? `
              brightness(${style.filters.brightness || 100}%)
              contrast(${style.filters.contrast || 100}%)
              saturate(${style.filters.saturate || 100}%)
              grayscale(${style.filters.grayscale || 0}%)
              blur(${style.filters.blur || 0}px)
              sepia(${style.filters.sepia || 0}%)
            ` : undefined
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // SVG SHAPE ELEMENT
  if (type === 'svg-shape') {
    const svgContent = content.svg || content.content || '';
    const fill = style.fill || style.color || '#D4AF37';
    const stroke = style.strokeEnabled ? (style.stroke || '#000000') : undefined;
    const strokeWidth = style.strokeWidth || 2;

    return (
      <div
        style={{
          ...wrapperStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // COUNTDOWN WIDGET
  if (type === 'countdown-widget') {
    return (
      <div style={wrapperStyle}>
        <DOMCountdown element={element} eventData={eventData} />
      </div>
    );
  }

  // EVENT CARD (Ceremony/Reception)
  if (type === 'event-ceremony-card' || type === 'event-reception-card') {
    return (
      <div style={wrapperStyle}>
        <DOMEventCard element={element} />
      </div>
    );
  }

  // DRESS CODE CARD
  if (type === 'dress-code-card') {
    return (
      <div style={wrapperStyle}>
        <DOMDressCode element={element} />
      </div>
    );
  }

  // INTERACTIVE BUTTON
  if (type === 'interactive-button') {
    return (
      <div style={wrapperStyle}>
        <DOMInteractiveButton
          element={element}
          onClick={() => onButtonClick?.(element)}
          isCopied={isCopied}
        />
      </div>
    );
  }

  // WISHES WALL CARD
  if (type === 'wishes-wall-card') {
    return (
      <div style={wrapperStyle}>
        <DOMWishesWall element={element} />
      </div>
    );
  }

  // COUPLE QUOTE CONTACTS CARD
  if (type === 'couple-quote-contacts-card') {
    return (
      <div style={wrapperStyle}>
        <DOMCoupleContacts element={element} eventData={eventData} />
      </div>
    );
  }

  // Fallback for unknown types
  return null;
};
