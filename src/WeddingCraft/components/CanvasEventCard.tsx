import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasEventCard: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const groupRef = useRef<any>(null);

  const style = el?.style || {};
  const transform = el?.transform || { width: 300, height: 150 };

  const w = Math.max(200, typeof transform.width === 'number' && !isNaN(transform.width) ? transform.width : 300);
  const h = Math.max(120, typeof transform.height === 'number' && !isNaN(transform.height) ? transform.height : 150);

  const bgColor = style.backgroundColor === '#FAF8F5' ? '#EBEBEB' : (style.backgroundColor || '#FAF8F5');
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const cornerRadius = Math.max(0, Math.min(style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || Math.min(18, Math.max(14, w * 0.05));
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 10;
  const align = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const content = el.content || {};
  const badgeText = content.badge || (el.type === 'event-ceremony-card' ? '💒 Ceremonia' : '🎉 Recepción');
  const title = content.title || (el.type === 'event-ceremony-card' ? 'Ceremonia Civil' : 'Recepción & Fiesta');
  const location = content.location || 'Iglesia San Francisco, Av. Principal 123';
  const time = content.time || '16:00 hs';
  const address = content.address || 'Ciudad, País';

  const headerBadgeWidth = Math.max(40, Math.min(w - 32, 140));
  const badgeX = align === 'center' ? (w - headerBadgeWidth) / 2 : align === 'right' ? (w - 16 - headerBadgeWidth) : 16;

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
        fill={accentColor}
        opacity={0.18}
        cornerRadius={Math.max(0, Math.min(11, headerBadgeWidth / 2))}
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

      {/* Event Title */}
      <KonvaText
        x={16}
        y={44}
        width={w - 32}
        text={title}
        fontSize={titleFontSize}
        fontFamily={titleFontFamily}
        fontStyle="bold"
        fill={titleColor}
        align={align}
        ellipsis={true}
      />

      {/* Location */}
      <KonvaText
        x={16}
        y={44 + titleFontSize + 6}
        width={w - 32}
        text={location}
        fontSize={bodyFontSize}
        fontFamily={bodyFontFamily}
        fill={textColor}
        align={align}
        ellipsis={true}
      />

      {/* Time */}
      <KonvaText
        x={16}
        y={44 + titleFontSize + bodyFontSize + 12}
        width={w - 32}
        text={`🕐 ${time}`}
        fontSize={bodyFontSize}
        fontFamily={bodyFontFamily}
        fontStyle="bold"
        fill={accentColor}
        align={align}
      />

      {/* Address */}
      {h >= 140 && (
        <KonvaText
          x={16}
          y={44 + titleFontSize + bodyFontSize * 2 + 18}
          width={w - 32}
          text={address}
          fontSize={Math.max(9, bodyFontSize - 1)}
          fontFamily={bodyFontFamily}
          fill={textColor}
          align={align}
          ellipsis={true}
        />
      )}
    </Group>
  );
};
