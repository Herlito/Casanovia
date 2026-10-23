import React, { useRef } from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';
import { CanvasElement } from '../types';
import { getGradientProps } from './CanvasStage';

export const CanvasInteractiveButton: React.FC<{
  el: CanvasElement;
  commonProps: any;
  theme?: any;
}> = ({ el, commonProps, theme }) => {
  const style = el?.style || {};
  const content = el?.content || {};
  const transform = el?.transform || { width: 120, height: 44 };

  const isDef = style.isDefaultStyle && theme;
  const getCol = (defVal: any, propVal: any) => isDef ? defVal : propVal;
  const groupRef = useRef<any>(null);

  const isOutline = style.variant === 'outline';
  const w = Math.max(10, typeof transform.width === 'number' && !isNaN(transform.width) ? transform.width : 120);
  const h = Math.max(10, typeof transform.height === 'number' && !isNaN(transform.height) ? transform.height : 44);
  const cornerRadius = Math.max(0, Math.min(style.borderRadius ?? 8, w / 2, h / 2));

  return (
    <Group {...commonProps} ref={groupRef}>
      <Rect
        width={w}
        height={h}
        fill={isOutline ? 'transparent' : (!style.gradientEnabled ? getCol(theme?.palette?.primary, style.backgroundColor || '#000') : undefined)}
        {...(isOutline ? {} : getGradientProps(style, w, h))}
        stroke={getCol(theme?.palette?.primary, style.backgroundColor || '#000')}
        strokeWidth={isOutline ? 2 : 0}
        cornerRadius={cornerRadius}
      />
      <KonvaText
        text={content.text || 'Botón'}
        width={w}
        height={h}
        align="center"
        verticalAlign="middle"
        fontSize={style.fontSize || 16}
        fontFamily={style.fontFamily || 'Arial'}
        fill={isOutline ? getCol(theme?.palette?.primary, style.backgroundColor || '#000') : getCol(theme?.palette?.background, style.color || '#fff')}
      />
    </Group>
  );
};
