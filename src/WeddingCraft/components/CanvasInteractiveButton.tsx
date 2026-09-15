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

  return (
    <Group {...commonProps} ref={groupRef}>
      <Rect
        width={el.transform.width}
        height={el.transform.height}
        fill={isOutline ? 'transparent' : (!el.style.gradientEnabled ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(el.style, el.transform.width, el.transform.height))}
        stroke={getCol(theme?.palette.primary, el.style.backgroundColor || '#000')}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={Math.max(0, el.style.borderRadius ?? 8)}
      />
      <KonvaText
        text={el.content.text || 'Botón'}
        width={el.transform.width}
        height={el.transform.height}
        align="center"
        verticalAlign="middle"
        fontSize={el.style.fontSize || 16}
        fontFamily={el.style.fontFamily || 'Arial'}
        fill={isOutline ? getCol(theme?.palette.primary, el.style.backgroundColor || '#000') : getCol(theme?.palette.background, el.style.color || '#fff')}
      />
    </Group>
  );
};
