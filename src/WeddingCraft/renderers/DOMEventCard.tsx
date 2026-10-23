import React from 'react';
import { CanvasElement } from '../types';

interface DOMEventCardProps {
  element: CanvasElement;
}

export const DOMEventCard: React.FC<DOMEventCardProps> = ({ element }) => {
  const style = element?.style || {};
  const transform = element?.transform || { width: 300, height: 200 };
  const content = element.content || {};

  const isCeremony = element.type === 'event-ceremony-card';

  const w = Math.max(120, typeof transform.width === 'number' && !isNaN(transform.width) ? transform.width : 300);
  const h = Math.max(120, typeof transform.height === 'number' && !isNaN(transform.height) ? transform.height : 200);

  const bgColor = style.backgroundColor === '#FAF8F5' ? '#EBEBEB' : (style.backgroundColor || '#FAF8F5');
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || (isCeremony ? '#8A9A86' : '#C5A880');
  const cornerRadius = Math.max(0, Math.min(style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || Math.min(20, Math.max(13, w * 0.055));
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 11;
  const align = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const badgeText = content.badge || (isCeremony ? '⛪ Ceremonia Religiosa' : '🥂 Recepción & Fiesta');
  const venueTitle = content.venueName || (isCeremony ? 'Parroquia Nuestra Señora' : 'Hacienda Villa del Sol');
  const timeText = content.time ? `🕒 ${content.time}` : (isCeremony ? '🕒 17:00 hrs (Puntual)' : '🕒 19:30 hrs');
  const addressText = content.address ? `📍 ${content.address}` : '📍 Av. Principal #123, Zona Colonial';

  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        border: `${strokeWidth}px solid ${borderColor}`,
        borderRadius: `${cornerRadius}px`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Badge Pill */}
      <div
        style={{
          alignSelf: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          marginBottom: '12px'
        }}
      >
        <div
          style={{
            backgroundColor: accentColor,
            opacity: 0.18,
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: `${badgeFontSize}px`,
            fontWeight: 'bold',
            color: accentColor,
            fontFamily: bodyFontFamily,
            maxWidth: '210px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Venue Name */}
      <div
        style={{
          fontFamily: titleFontFamily,
          fontSize: `${titleFontSize}px`,
          fontWeight: 'bold',
          color: titleColor,
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        className={alignClass}
      >
        {venueTitle}
      </div>

      {/* Time */}
      <div
        style={{
          fontFamily: bodyFontFamily,
          fontSize: `${bodyFontSize}px`,
          color: textColor,
          marginBottom: '4px'
        }}
        className={alignClass}
      >
        {timeText}
      </div>

      {/* Address */}
      <div
        style={{
          fontFamily: bodyFontFamily,
          fontSize: `${bodyFontSize}px`,
          color: textColor,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        className={alignClass}
      >
        {addressText}
      </div>
    </div>
  );
};
