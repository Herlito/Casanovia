import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText, Circle } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasWishesWall: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const groupRef = useRef<any>(null);

  const w = Math.max(180, el.transform.width);
  const h = Math.max(150, el.transform.height);

  const bgColor = el.style.backgroundColor || '#FAF8F5';
  const borderColor = el.style.borderColor || '#EADDCE';
  const strokeWidth = el.style.strokeWidth ?? 1;
  const titleColor = el.style.titleColor || '#2D2A26';
  const textColor = el.style.color || '#524B42';
  const accentColor = el.style.accentColor || '#C5A880';
  const cornerRadius = Math.max(0, Math.min(el.style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = el.style.titleFontFamily || el.style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = el.style.fontFamily || 'sans-serif';
  const titleFontSize = el.style.titleFontSize || Math.min(20, Math.max(14, w * 0.055));
  const bodyFontSize = el.style.bodyFontSize || 11;
  const badgeFontSize = el.style.badgeFontSize || 11;
  const align = (el.style.align || el.style.textAlign || 'left') as 'left' | 'center' | 'right';

  const content = el.content || {};
  const badgeText = content.badge || '💌 Muro de los Deseos';
  const title = content.title || 'Muro de los Deseos';
  const subtitle = content.subtitle || 'Deseos y bendiciones de nuestros invitados';
  
  const wishes = content.wishes?.length > 0 ? content.wishes : [
    { author: 'Familia Ramírez', message: '¡Que su hogar siempre rebose de alegría, paz y amor incondicional!' },
    { author: 'Carlos y Sofía', message: '¡Felicitaciones en esta nueva etapa! Los queremos un montón.' }
  ];

  const headerBadgeWidth = Math.max(40, Math.min(w - 32, 200));
  const bubbleWidth = Math.max(30, w - 32);
  const badgeX = align === 'center' ? (w - headerBadgeWidth) / 2 : align === 'right' ? (w - 16 - headerBadgeWidth) : 16;

  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Card background */}
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

      {/* Header Badge */}
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

      {/* Main Title */}
      <KonvaText
        x={16}
        y={46}
        text={title}
        fontSize={titleFontSize}
        fontFamily={titleFontFamily}
        fontStyle="bold"
        fill={titleColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Subtitle */}
      <KonvaText
        x={16}
        y={46 + titleFontSize + 6}
        text={subtitle}
        fontSize={bodyFontSize}
        fontFamily={bodyFontFamily}
        fill={textColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Wishes sample bubbles */}
      {h >= 160 && (
        <Group x={16} y={Math.max(92, 46 + titleFontSize + bodyFontSize + 16)}>
          {wishes.slice(0, 2).map((wish: any, idx: number) => {
            const bubbleY = idx * 48;
            if (92 + bubbleY + 40 > h) return null;
            return (
              <Group key={idx} y={bubbleY}>
                <Rect
                  width={bubbleWidth}
                  height={42}
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth={1}
                  cornerRadius={Math.max(0, Math.min(12, bubbleWidth / 2, 21))}
                />
                <Circle
                  x={18}
                  y={21}
                  radius={11}
                  fill={idx === 0 ? '#E8DCCF' : '#D1E0D7'}
                />
                <KonvaText
                  x={12}
                  y={15}
                  text={wish.author?.[0] || '❤️'}
                  fontSize={10}
                  fontFamily={bodyFontFamily}
                  fontStyle="bold"
                  fill="#2D3748"
                />
                <KonvaText
                  x={36}
                  y={8}
                  text={wish.author}
                  fontSize={10}
                  fontFamily={bodyFontFamily}
                  fontStyle="bold"
                  fill="#2D3748"
                  width={w - 74}
                  ellipsis={true}
                />
                <KonvaText
                  x={36}
                  y={22}
                  text={`"${wish.message}"`}
                  fontSize={10}
                  fontFamily={bodyFontFamily}
                  fill="#64748B"
                  width={w - 74}
                  ellipsis={true}
                />
              </Group>
            );
          })}
        </Group>
      )}
    </Group>
  );
};
