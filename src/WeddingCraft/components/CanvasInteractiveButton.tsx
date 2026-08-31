import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';

export const CanvasInteractiveButton: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const isDef = el.style.isDefaultStyle && theme;
  const getCol = (defVal, propVal) => isDef ? defVal : propVal;
  const groupRef = useRef<any>(null);

  const isOutline = el.style.variant === 'outline';

  return (
    <Group {...commonProps} ref={groupRef}>
      <Rect
        width={el.transform.width}
        height={el.transform.height}
        fill={isOutline ? 'transparent' : (el.style.backgroundColor || '#000')}
        stroke={el.style.backgroundColor || '#000'}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={el.style.borderRadius || 8}
      />
      <KonvaText
        text={el.content.text || 'Botón'}
        width={el.transform.width}
        height={el.transform.height}
        align="center"
        verticalAlign="middle"
        fontSize={el.style.fontSize || 16}
        fontFamily={el.style.fontFamily || 'Arial'}
        fill={isOutline ? (el.style.backgroundColor || '#000') : (el.style.color || '#fff')}
      />
    </Group>
  );
};
