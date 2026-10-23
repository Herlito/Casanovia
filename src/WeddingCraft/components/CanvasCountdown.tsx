import React, { useEffect, useState, useRef } from 'react';
import { Group, Text as KonvaText, Rect } from 'react-konva';
import { CanvasElement } from '../types';
import { getGradientProps } from './CanvasStage';
import { parseDateSafe } from '../../lib/dateUtils';

export const CanvasCountdown: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const style = el?.style || {};
  const isDef = style?.isDefaultStyle && theme;
  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, expired: false
  });
  const groupRef = useRef<any>(null);

  const targetDate = el?.content?.targetDate;

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const parsed = targetDate ? parseDateSafe(targetDate) : new Date();
        const difference = parsed.getTime() - Date.now();
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        }
      } catch {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const gap = Math.max(0, style?.gap || 10);
  const numItems = el?.content?.showSeconds ? 4 : 3;
  const rawWidth = Math.max(20, el?.transform?.width || 120);
  const itemWidth = Math.max(10, (rawWidth - (gap * (numItems - 1))) / numItems);
  const innerHeight = Math.max(10, (el?.transform?.height || 50) - 30);

  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Container Background */}
      {(style?.containerOpacity ?? 0) > 0 && (
        <Rect
          width={rawWidth}
          height={Math.max(10, el?.transform?.height || 50)}
          fill={getCol(theme?.palette?.background, style?.containerBackgroundColor || '#ffffff')}
          opacity={style?.containerOpacity ?? 0}
          cornerRadius={8}
        />
      )}
      {/* Title */}
      <KonvaText
        text={el?.content?.title || 'Faltan'}
        width={rawWidth}
        align="center"
        fontSize={14}
        fontFamily={style?.labelFont || 'Arial'}
        fill={style?.isDefaultStyle ? getCol(theme?.palette?.primary, style?.titleColor || '#000') : (style?.titleColor || '#000')}
        y={0}
      />

      {timeLeft.expired ? (
        <KonvaText
          text={el?.content?.expiredMessage || '¡El gran día ha llegado!'}
          width={rawWidth}
          align="center"
          fontSize={style?.numberSize || 24}
          fontFamily={style?.numberFont || 'Arial'}
          fill={style?.isDefaultStyle ? getCol(theme?.palette?.primary, style?.numberColor || '#000') : (style?.numberColor || '#000')}
          y={30 + innerHeight / 2 - (style?.numberSize || 24) / 2}
        />
      ) : (
        [
          { value: timeLeft.days, label: el?.content?.labels?.days || 'días' },
          { value: timeLeft.hours, label: el?.content?.labels?.hours || 'hrs' },
          { value: timeLeft.minutes, label: el?.content?.labels?.minutes || 'min' },
          ...(el?.content?.showSeconds ? [{ value: timeLeft.seconds, label: el?.content?.labels?.seconds || 'seg' }] : [])
        ].map((item, index) => {
          const xPos = index * (itemWidth + gap);
          return (
            <Group key={index} x={xPos} y={30}>
              {style?.variant === 'cards' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={!style?.gradientEnabled ? getCol(theme?.palette?.background, style?.backgroundColor || '#fff') : undefined}
                  {...getGradientProps(style, itemWidth, innerHeight)}
                  stroke={style?.borderColor || '#ccc'}
                  cornerRadius={Math.max(0, Math.min(style?.borderRadius ?? 12, itemWidth / 2, innerHeight / 2))}
                />
              )}
              {style?.variant === 'circles' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={!style?.gradientEnabled ? getCol(theme?.palette?.background, style?.backgroundColor || '#fff') : undefined}
                  {...getGradientProps(style, itemWidth, innerHeight)}
                  stroke={style?.borderColor || '#ccc'}
                  cornerRadius={Math.max(0, Math.min(itemWidth, innerHeight) / 2)}
                />
              )}
              <KonvaText
                text={String(item.value).padStart(2, '0')}
                width={itemWidth}
                align="center"
                fontSize={style?.numberSize || 24}
                fontFamily={style?.numberFont || 'Arial'}
                fill={style?.isDefaultStyle ? getCol(theme?.palette?.primary, style?.numberColor || '#000') : (style?.numberColor || '#000')}
                y={innerHeight / 2 - (style?.numberSize || 24) / 2 - 5}
              />
              <KonvaText
                text={item.label}
                width={itemWidth}
                align="center"
                fontSize={style?.labelSize || 10}
                fontFamily={style?.labelFont || 'Arial'}
                fill={style?.isDefaultStyle ? getCol(theme?.palette?.text, style?.labelColor || '#666') : (style?.labelColor || '#666')}
                y={innerHeight / 2 + (style?.numberSize || 24) / 2 - 5}
              />
            </Group>
          );
        })
      )}
    </Group>
  );
};
