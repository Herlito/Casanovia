import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasCoupleContacts: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const groupRef = useRef<any>(null);

  const style = el?.style || {};
  const transform = el?.transform || { width: 300, height: 200 };

  const w = Math.max(200, typeof transform.width === 'number' && !isNaN(transform.width) ? transform.width : 300);
  const h = Math.max(160, typeof transform.height === 'number' && !isNaN(transform.height) ? transform.height : 200);

  const bgColor = style.backgroundColor === '#FAF8F5' ? '#EBEBEB' : (style.backgroundColor || '#FAF8F5');
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const cornerRadius = Math.max(0, Math.min(style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || Math.min(22, Math.max(16, w * 0.06));
  const bodyFontSize = style.bodyFontSize || 12;
  const badgeFontSize = style.badgeFontSize || 10;
  const align = (style.align || style.textAlign || 'center') as 'left' | 'center' | 'right';

  const content = el.content || {};
  const badgeText = content.badge || '💍 Frase, Nombres & Contactos';
  const coupleNames = content.coupleNames || 'Romina & Herly';
  const quote = content.quote || 'El amor no se mira, se siente, y aún más cuando se comparte con quienes amamos. ¡Gracias por acompañarnos!';
  const weddingDate = content.weddingDate || '15 de Noviembre de 2026';
  const contactTitle = content.contactTitle || 'Confirmación & Contactos';
  const contactPhone = content.contactPhone || '+54 9 11 1234-5678';
  const contactEmail = content.contactEmail || 'contacto@nuestraboda.com';
  const contactNote = content.contactNote || 'Por favor confirma tu asistencia lo antes posible.';

  const headerBadgeWidth = Math.max(40, Math.min(w - 32, 230));
  const badgeX = align === 'center' ? (w - headerBadgeWidth) / 2 : align === 'right' ? (w - 16 - headerBadgeWidth) : 16;
  const contentX = align === 'left' ? 16 : align === 'right' ? 16 : 16;
  const contentWidth = Math.max(20, w - 32);

  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Background Card */}
      <Rect
        width={w}
        height={h}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={strokeWidth}
        cornerRadius={cornerRadius}
        shadowColor="rgba(0,0,0,0.06)"
        shadowBlur={10}
        shadowOffset={{ x: 0, y: 4 }}
      />

      {/* Header Badge Pill */}
      <Rect
        x={badgeX}
        y={14}
        width={headerBadgeWidth}
        height={22}
        fill={accentColor + '18'}
        stroke={accentColor + '40'}
        strokeWidth={1}
        cornerRadius={11}
      />
      <KonvaText
        x={badgeX}
        y={19}
        width={headerBadgeWidth}
        text={badgeText}
        fontSize={badgeFontSize}
        fontFamily={bodyFontFamily}
        fontStyle="bold"
        fill={accentColor}
        align="center"
      />

      {/* Couple Names */}
      <KonvaText
        x={contentX}
        y={44}
        width={contentWidth}
        text={coupleNames}
        fontSize={titleFontSize}
        fontFamily={titleFontFamily}
        fontStyle="bold"
        fill={titleColor}
        align={align}
        lineHeight={1.2}
      />

      {/* Date Line / Subtitle */}
      {weddingDate && (
        <KonvaText
          x={contentX}
          y={44 + titleFontSize + 4}
          width={contentWidth}
          text={`• ${weddingDate} •`}
          fontSize={Math.max(9, bodyFontSize - 1)}
          fontFamily={bodyFontFamily}
          fill={accentColor}
          align={align}
          letterSpacing={1.5}
        />
      )}

      {/* Romantic Quote */}
      <KonvaText
        x={contentX}
        y={44 + titleFontSize + 22}
        width={contentWidth}
        text={`"${quote}"`}
        fontSize={bodyFontSize}
        fontFamily={titleFontFamily}
        fontStyle="italic"
        fill={textColor}
        align={align}
        lineHeight={1.35}
      />

      {/* Divider line inside card */}
      <Rect
        x={16}
        y={Math.max(120, h - 85)}
        width={Math.max(10, w - 32)}
        height={1}
        fill={borderColor}
      />

      {/* Contacts section */}
      <KonvaText
        x={contentX}
        y={Math.max(126, h - 78)}
        width={contentWidth}
        text={contactTitle}
        fontSize={Math.max(9, bodyFontSize - 1)}
        fontFamily={bodyFontFamily}
        fontStyle="bold"
        fill={titleColor}
        align={align}
      />

      {/* Phone / Email / Note line */}
      <KonvaText
        x={contentX}
        y={Math.max(142, h - 60)}
        width={contentWidth}
        text={`${contactPhone ? '📞 ' + contactPhone : ''}${contactPhone && contactEmail ? '   |   ' : ''}${contactEmail ? '✉️ ' + contactEmail : ''}`}
        fontSize={Math.max(9, bodyFontSize - 1)}
        fontFamily={bodyFontFamily}
        fill={textColor}
        align={align}
      />

      {contactNote && (
        <KonvaText
          x={contentX}
          y={Math.max(158, h - 42)}
          width={contentWidth}
          text={contactNote}
          fontSize={Math.max(8, bodyFontSize - 2)}
          fontFamily={bodyFontFamily}
          fontStyle="italic"
          fill={accentColor}
          align={align}
        />
      )}
    </Group>
  );
};
