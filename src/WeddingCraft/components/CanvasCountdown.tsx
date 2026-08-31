import React, { useEffect, useState, useRef } from 'react';
import { Group, Text as KonvaText, Rect } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasCountdown: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const isDef = el.style.isDefaultStyle && theme;
  const getCol = (defVal, propVal) => isDef ? defVal : propVal;
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, expired: false
  });
  const groupRef = useRef<any>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(el.content.targetDate).getTime() - new Date().getTime();
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
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [el.content.targetDate]);

  const gap = el.style.gap || 10;
  const numItems = el.content.showSeconds ? 4 : 3;
  const itemWidth = (el.transform.width - (gap * (numItems - 1))) / numItems;
  const innerHeight = el.transform.height - 30; // Leave room for title

  return (
    <Group {...commonProps} ref={groupRef}>
      {/* Container Background */}
      {(el.style.containerOpacity ?? 0) > 0 && (
        <Rect
          width={el.transform.width}
          height={el.transform.height}
          fill={getCol(theme?.palette.background, el.style.containerBackgroundColor || '#ffffff')}
          opacity={el.style.containerOpacity ?? 0}
          cornerRadius={8}
        />
      )}
      {/* Title */}
      <KonvaText
        text={el.content.title}
        width={el.transform.width}
        align="center"
        fontSize={14}
        fontFamily={el.style.labelFont || 'Arial'}
        fill={getCol(theme?.palette.primary, el.style.titleColor || '#000')}
        y={0}
      />

      {timeLeft.expired ? (
        <KonvaText
          text={el.content.expiredMessage}
          width={el.transform.width}
          align="center"
          fontSize={el.style.numberSize || 24}
          fontFamily={el.style.numberFont || 'Arial'}
          fill={getCol(theme?.palette.primary, el.style.numberColor || '#000')}
          y={30 + innerHeight / 2 - (el.style.numberSize || 24) / 2}
        />
      ) : (
        [
          { value: timeLeft.days, label: el.content.labels?.days || 'días' },
          { value: timeLeft.hours, label: el.content.labels?.hours || 'hrs' },
          { value: timeLeft.minutes, label: el.content.labels?.minutes || 'min' },
          ...(el.content.showSeconds ? [{ value: timeLeft.seconds, label: el.content.labels?.seconds || 'seg' }] : [])
        ].map((item, index) => {
          const xPos = index * (itemWidth + gap);
          return (
            <Group key={index} x={xPos} y={30}>
              {el.style.variant === 'cards' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={getCol(theme?.palette.background, el.style.backgroundColor || '#fff')}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={8}
                />
              )}
              {el.style.variant === 'circles' && (
                <Rect
                  width={itemWidth}
                  height={innerHeight}
                  fill={getCol(theme?.palette.background, el.style.backgroundColor || '#fff')}
                  stroke={el.style.borderColor || '#ccc'}
                  cornerRadius={Math.min(itemWidth, innerHeight) / 2}
                />
              )}
              <KonvaText
                text={String(item.value).padStart(2, '0')}
                width={itemWidth}
                align="center"
                fontSize={el.style.numberSize || 24}
                fontFamily={el.style.numberFont || 'Arial'}
                fill={getCol(theme?.palette.primary, el.style.numberColor || '#000')}
                y={innerHeight / 2 - (el.style.numberSize || 24) / 2 - 5}
              />
              <KonvaText
                text={item.label}
                width={itemWidth}
                align="center"
                fontSize={el.style.labelSize || 10}
                fontFamily={el.style.labelFont || 'Arial'}
                fill={getCol(theme?.palette.text, el.style.labelColor || '#666')}
                y={innerHeight / 2 + (el.style.numberSize || 24) / 2 - 5}
              />
            </Group>
          );
        })
      )}
    </Group>
  );
};
