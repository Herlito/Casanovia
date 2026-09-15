import React, { useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Rect, Path } from 'react-konva';
import useImage from 'use-image';
import { CanvasElement } from '../types';

export const CanvasImage: React.FC<{
  el: CanvasElement;
  commonProps: any;
  themePrimaryColor: string;
}> = ({ el, commonProps, themePrimaryColor }) => {
  const [img] = useImage(el.content?.src || '', 'anonymous');
  const groupRef = useRef<any>(null);
  const imgRef = useRef<any>(null);

  useEffect(() => {
    if (img && imgRef.current) {
      if (el.style.filters) {
        imgRef.current.cache();
      } else {
        imgRef.current.clearCache();
      }
    }
  }, [img, el.style.filters, el.transform.width, el.transform.height]);

  // Mask clip functions
  const clipFunc = (ctx: any) => {
    const w = Math.max(0, el.transform.width);
    const h = Math.max(0, el.transform.height);
    if (!el.style.maskId || el.style.maskId === 'none') {
      ctx.rect(0, 0, w, h);
    } else if (el.style.maskId === 'circle') {
      ctx.arc(w / 2, h / 2, Math.max(0, Math.min(w, h) / 2), 0, Math.PI * 2, false);
    } else if (el.style.maskId === 'ellipse') {
      if (ctx.ellipse) {
        ctx.ellipse(w / 2, h / 2, Math.max(0, w / 2), Math.max(0, h / 2), 0, 0, Math.PI * 2);
      } else {
        ctx.arc(w / 2, h / 2, Math.max(0, Math.min(w, h) / 2), 0, Math.PI * 2, false);
      }
    } else if (el.style.maskId === 'rounded') {
      const r = Math.max(0, Math.min(20, w / 2, h / 2));
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
    } else if (el.style.maskId === 'arch') {
      const r = Math.max(0, w / 2);
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, r);
      ctx.arc(r, r, r, Math.PI, 0, false);
      ctx.lineTo(w, h);
      ctx.closePath();
    } else if (el.style.maskId === 'heart') {
      ctx.beginPath();
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, topCurveHeight);
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.bezierCurveTo(0, h / 2, w / 2, h * 0.8, w / 2, h);
      ctx.bezierCurveTo(w / 2, h * 0.8, w, h / 2, w, topCurveHeight);
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, topCurveHeight);
      ctx.closePath();
    } else if (el.style.maskId === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      ctx.closePath();
    } else if (el.style.maskId === 'scallop') {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      // Simplify scallop to just a rect for now to avoid complex math in clip
      ctx.closePath();
    } else {
      ctx.rect(0, 0, w, h);
    }
  };

  return (
    <Group 
      {...commonProps} 
      clipFunc={clipFunc}
      ref={groupRef}
    >
      {/* Fallback bg only while loading */}
      {!img && <Rect width={el.transform.width} height={el.transform.height} fill="#e5e5e5" />}
      
      {img && (
        <KonvaImage
          ref={imgRef}
          image={img}
          width={el.transform.width * (el.style.cropScale || 1)}
          height={el.transform.height * (el.style.cropScale || 1)}
          x={el.style.cropX || 0}
          y={el.style.cropY || 0}
          // Note: Full filters would require Konva.Filters but basic React-Konva needs extra setup for complex filters.
          // Using opacity as fallback for now
        />
      )}

      {/* Frame overlay */}
      {el.style.frameId === 'gold-line' && (
        <Rect 
          x={10} y={10} 
          width={el.transform.width - 20} 
          height={el.transform.height - 20} 
          stroke={themePrimaryColor} 
          strokeWidth={2} 
        />
      )}
    </Group>
  );
};
