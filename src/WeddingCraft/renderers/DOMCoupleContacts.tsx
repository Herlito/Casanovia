import React from 'react';
import { CanvasElement } from '../types';
import { Heart, Phone, Mail } from 'lucide-react';

interface DOMCoupleContactsProps {
  element: CanvasElement;
  eventData?: {
    coupleNames?: [string, string];
    romanticQuote?: string;
    eventDate?: string;
  };
  isPublishedDocument?: boolean; // Flag to indicate if this is a published (baked) document
}

export const DOMCoupleContacts: React.FC<DOMCoupleContactsProps> = ({ element, eventData, isPublishedDocument = false }) => {
  const style = element?.style || {};
  const content = element.content || {};

  const bgColor = style.backgroundColor || '#FAF8F5';
  const textColor = style.color || '#2D2A26';
  const accentColor = style.accentColor || '#C5A880';
  const fontFamily = style.fontFamily || 'sans-serif';
  const cornerRadius = style.borderRadius || 12;

  // CRITICAL: If published document, use only baked content values (no fallback to eventData)
  // This ensures 100% parity between published and guest web display
  const coupleNames = content.coupleNames || (!isPublishedDocument && eventData?.coupleNames ? `${eventData.coupleNames[0]} & ${eventData.coupleNames[1]}` : 'Sofía & Alejandro');
  const quote = content.quote || (!isPublishedDocument && eventData?.romanticQuote ? eventData.romanticQuote : 'El amor no se mira con los ojos, sino con el corazón.');
  const weddingDate = content.weddingDate || (!isPublishedDocument && eventData?.eventDate ? eventData.eventDate : '');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${cornerRadius}px`,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <Heart size={20} color={accentColor} />
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: textColor
          }}
        >
          {coupleNames}
        </div>
      </div>
      {quote && (
        <div
          style={{
            fontSize: '13px',
            fontStyle: 'italic',
            color: textColor,
            marginBottom: '12px',
            lineHeight: 1.4,
            textAlign: 'center'
          }}
        >
          "{quote}"
        </div>
      )}
      {weddingDate && (
        <div
          style={{
            fontSize: '12px',
            color: textColor,
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Heart size={14} color={accentColor} />
          <span>{new Date(weddingDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      )}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: textColor
          }}
        >
          <Phone size={14} color={accentColor} />
          <span>Contacto</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: textColor
          }}
        >
          <Mail size={14} color={accentColor} />
          <span>Email</span>
        </div>
      </div>
    </div>
  );
};
