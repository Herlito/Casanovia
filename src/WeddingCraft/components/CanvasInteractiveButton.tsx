import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';
import { getGradientProps } from './CanvasStage';

export const CanvasInteractiveButton: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const isDef = el.style.isDefaultStyle && theme;
  const getCol = (defVal, propVal) => isDef ? defVal : propVal;
  const groupRef = useRef<any>(null);

  const isOutline = el.style.variant === 'outline';
  const w = Math.max(10, el.transform.width);
  const h = Math.max(10, el.transform.height);
  const cornerRadius = Math.max(0, Math.min(el.style.borderRadius ?? 8, w / 2, h / 2));

  return (
    <Group {...commonProps} ref={groupRef}>
      <Rect
        width={w}
        height={h}
        fill={isOutline ? 'transparent' : (!el.style.gradientEnabled ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(el.style, w, h))}
        stroke={getCol(theme?.palette.primary, el.style.backgroundColor || '#000')}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={cornerRadius}
      />
      <KonvaText
        text={el.content.text || 'Botón'}
        width={w}
        height={h}
        align="center"
        verticalAlign="middle"
        fontSize={el.style.fontSize || 16}
        fontFamily={el.style.fontFamily || 'Arial'}
        fill={isOutline ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : getCol(theme?.palette.background, el.style.color || '#fff')}
      />
    </Group>
  );
};
