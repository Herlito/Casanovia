import React from 'react';
import { CanvasElement } from '../types';

interface DOMDressCodeProps {
  element: CanvasElement;
}

export const DOMDressCode: React.FC<DOMDressCodeProps> = ({ element }) => {
  const style = element?.style || {};
  const content = element.content || {};

  const bgColor = style.backgroundColor || '#FAF8F5';
  const textColor = style.color || '#2D2A26';
  const accentColor = style.accentColor || '#C5A880';
  const fontFamily = style.fontFamily || 'sans-serif';
  const cornerRadius = style.borderRadius || 12;

  const styleName = content.styleName || 'Rigurosa Etiqueta / Formal Gala';
  const description = content.description || 'Damas: Vestido largo elegante. Caballeros: Traje oscuro.';
  const suggestedColors = content.suggestedColors || [];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${cornerRadius}px`,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: accentColor,
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}
      >
        Dress Code
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: textColor,
          marginBottom: '8px'
        }}
      >
        {styleName}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: textColor,
          marginBottom: '12px',
          lineHeight: 1.4
        }}
      >
        {description}
      </div>
      {suggestedColors.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {suggestedColors.map((color: any, index: number) => (
            <div
              key={index}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: color.hex || color,
                border: '2px solid rgba(0,0,0,0.1)'
              }}
              title={color.name}
            />
          ))}
        </div>
      )}
    </div>
  );
};
