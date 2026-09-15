import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasEventCard: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const groupRef = useRef<any>(null);
  const isCeremony = el.type === 'event-ceremony-card';

  const w = Math.max(120, el.transform.width);
  const h = Math.max(120, el.transform.height);

  const bgColor = el.style.backgroundColor || '#FAF8F5';
  const borderColor = el.style.borderColor || '#EADDCE';
  const strokeWidth = el.style.strokeWidth ?? 1;
  const titleColor = el.style.titleColor || '#2D2A26';
  const textColor = el.style.color || '#524B42';
  const accentColor = el.style.accentColor || (isCeremony ? '#8A9A86' : '#C5A880');
  const cornerRadius = Math.max(0, Math.min(el.style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = el.style.titleFontFamily || el.style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = el.style.fontFamily || 'sans-serif';
  const titleFontSize = el.style.titleFontSize || Math.min(20, Math.max(13, w * 0.055));
  const bodyFontSize = el.style.bodyFontSize || 11;
  const badgeFontSize = el.style.badgeFontSize || 11;
  const align = (el.style.align || el.style.textAlign || 'left') as 'left' | 'center' | 'right';

  const content = el.content || {};
  const badgeText = content.badge || (isCeremony ? '⛪ Ceremonia Religiosa' : '🥂 Recepción & Fiesta');
  const venueTitle = content.venueName || (isCeremony ? 'Parroquia Nuestra Señora' : 'Hacienda Villa del Sol');
  const timeText = content.time ? `🕒 ${content.time}` : (isCeremony ? '🕒 17:00 hrs (Puntual)' : '🕒 19:30 hrs');
  const addressText = content.address ? `📍 ${content.address}` : '📍 Av. Principal #123, Zona Colonial';
  const headerBadgeWidth = Math.max(40, Math.min(w - 32, 210));
  const buttonWidth = Math.max(30, (w - 40) / 2);

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

      {/* Top Header Badge Pill */}
      <Rect
        x={badgeX}
        y={14}
        width={headerBadgeWidth}
        height={24}
        fill={accentColor}
        opacity={0.18}
        cornerRadius={Math.max(0, Math.min(12, headerBadgeWidth / 2))}
      />
      <KonvaText
        x={badgeX + 6}
        y={19}
        text={badgeText}
        fontSize={badgeFontSize}
        fontFamily={bodyFontFamily}
        fontStyle="bold"
        fill={accentColor}
        width={headerBadgeWidth - 12}
        align={align}
        ellipsis={true}
      />

      {/* Venue Name */}
      <KonvaText
        x={16}
        y={46}
        text={venueTitle}
        fontSize={titleFontSize}
        fontFamily={titleFontFamily}
        fontStyle="bold"
        fill={titleColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Time */}
      <KonvaText
        x={16}
        y={46 + titleFontSize + 8}
        text={timeText}
        fontSize={bodyFontSize + 1}
        fontFamily={bodyFontFamily}
        fontStyle="bold"
        fill={accentColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Address */}
      <KonvaText
        x={16}
        y={46 + titleFontSize + 8 + bodyFontSize + 12}
        text={addressText}
        fontSize={bodyFontSize}
        fontFamily={bodyFontFamily}
        fill={textColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Action Buttons Mock in Canvas */}
      {h >= 170 && (
        <Group x={16} y={Math.max(124, h - 46)}>
          {/* Google Maps Button */}
          <Rect
            x={0}
            y={0}
            width={buttonWidth}
            height={32}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth={1}
            cornerRadius={Math.max(0, Math.min(10, buttonWidth / 2, 16))}
          />
          <KonvaText
            x={0}
            y={10}
            text="🗺️ Google Maps"
            fontSize={11}
            fontFamily="sans-serif"
            fontStyle="bold"
            fill="#2D3748"
            width={buttonWidth}
            align="center"
          />

          {/* Waze Button */}
          <Rect
            x={buttonWidth + 8}
            y={0}
            width={buttonWidth}
            height={32}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth={1}
            cornerRadius={Math.max(0, Math.min(10, buttonWidth / 2, 16))}
          />
          <KonvaText
            x={buttonWidth + 8}
            y={10}
            text="🚗 Waze"
            fontSize={11}
            fontFamily="sans-serif"
            fontStyle="bold"
            fill="#2D3748"
            width={buttonWidth}
            align="center"
          />
        </Group>
      )}
    </Group>
  );
};
