import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText, Circle } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasDressCode: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const groupRef = useRef<any>(null);

  const style = el?.style || {};
  const transform = el?.transform || { width: 300, height: 200 };

  const w = Math.max(160, typeof transform.width === 'number' && !isNaN(transform.width) ? transform.width : 300);
  const h = Math.max(140, typeof transform.height === 'number' && !isNaN(transform.height) ? transform.height : 200);

  const bgColor = style.backgroundColor === '#FAF8F5' ? '#EBEBEB' : (style.backgroundColor || '#FAF8F5');
  const borderColor = style.borderColor || '#EADDCE';
  const strokeWidth = style.strokeWidth ?? 1;
  const titleColor = style.titleColor || '#2D2A26';
  const textColor = style.color || '#524B42';
  const accentColor = style.accentColor || '#C5A880';
  const cornerRadius = Math.max(0, Math.min(style.borderRadius ?? 20, w / 2, h / 2));

  const titleFontFamily = style.titleFontFamily || style.fontFamily || 'Playfair Display, serif';
  const bodyFontFamily = style.fontFamily || 'sans-serif';
  const titleFontSize = style.titleFontSize || Math.min(20, Math.max(14, w * 0.055));
  const bodyFontSize = style.bodyFontSize || 11;
  const badgeFontSize = style.badgeFontSize || 11;
  const align = (style.align || style.textAlign || 'left') as 'left' | 'center' | 'right';

  const content = el.content || {};
  const badgeText = content.badge || '👔 Código de Vestimenta';
  const styleName = content.styleName || 'Formal Rigurosa';
  const description = content.description || 'Damas: Vestido largo de gala en tonos tierra o pastel. Caballeros: Traje oscuro o smoking formal.';
  const colors: Array<{ name: string; hex: string }> = content.suggestedColors || [
    { name: 'Esmeralda', hex: '#2A4736' },
    { name: 'Salvia', hex: '#8A9A86' },
    { name: 'Champán', hex: '#D4AF37' },
    { name: 'Arena', hex: '#C5A880' },
  ];

  const headerBadgeWidth = Math.max(40, Math.min(w - 32, 220));
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

      {/* Dress Code Style Title */}
      <KonvaText
        x={16}
        y={46}
        text={styleName}
        fontSize={titleFontSize}
        fontFamily={titleFontFamily}
        fontStyle="bold"
        fill={titleColor}
        width={w - 32}
        align={align}
        ellipsis={true}
      />

      {/* Description */}
      <KonvaText
        x={16}
        y={46 + titleFontSize + 8}
        text={description}
        fontSize={bodyFontSize}
        fontFamily={bodyFontFamily}
        fill={textColor}
        width={w - 32}
        height={Math.max(20, h - (46 + titleFontSize + 8) - (colors.length > 0 ? 55 : 16))}
        align={align}
        ellipsis={true}
      />

      {/* Palette Title & Circles */}
      {h >= 170 && colors.length > 0 && (
        <Group x={16} y={Math.max(120, h - 55)}>
          <KonvaText
            x={0}
            y={0}
            text="Gama de Colores Sugerida:"
            fontSize={10}
            fontFamily={bodyFontFamily}
            fontStyle="bold"
            fill={titleColor}
            width={w - 32}
            align={align}
          />
          {(() => {
            const circleRadius = Math.max(1, Math.min(12, (w - 40) / (colors.length * 2.8)));
            const totalCirclesWidth = colors.length * (circleRadius * 2 + 10) - 10;
            const startX = align === 'center' ? Math.max(0, (w - 32 - totalCirclesWidth) / 2) + circleRadius :
                           align === 'right' ? (w - 32 - totalCirclesWidth) + circleRadius :
                           circleRadius;

            return colors.slice(0, 6).map((col, idx) => {
              const cx = startX + idx * (circleRadius * 2 + 10);
              return (
                <Group key={idx}>
                  <Circle
                    x={cx}
                    y={24}
                    radius={circleRadius}
                    fill={col.hex}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowBlur={3}
                    shadowOffset={{ x: 0, y: 1 }}
                  />
                </Group>
              );
            });
          })()}
        </Group>
      )}
    </Group>
  );
};
