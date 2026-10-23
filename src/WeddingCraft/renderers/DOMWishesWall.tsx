import React from 'react';
import { CanvasElement } from '../types';
import { Heart, MessageSquare } from 'lucide-react';

interface DOMWishesWallProps {
  element: CanvasElement;
}

export const DOMWishesWall: React.FC<DOMWishesWallProps> = ({ element }) => {
  const style = element?.style || {};
  const content = element.content || {};

  const bgColor = style.backgroundColor || '#FAF8F5';
  const textColor = style.color || '#2D2A26';
  const accentColor = style.accentColor || '#C5A880';
  const fontFamily = style.fontFamily || 'sans-serif';
  const cornerRadius = style.borderRadius || 12;

  const sampleWishes = content.sampleWishes || [
    { author: 'María', message: '¡Felicidades a los novios!' },
    { author: 'Carlos', message: 'Que vivan felices por siempre.' }
  ];

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
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <Heart size={20} color={accentColor} />
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: textColor
          }}
        >
          Deseos de los Invitados
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {sampleWishes.map((wish: any, index: number) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '8px',
              display: 'flex',
              gap: '8px'
            }}
          >
            <MessageSquare size={16} color={accentColor} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: textColor,
                  marginBottom: '2px'
                }}
              >
                {wish.author}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: textColor,
                  lineHeight: 1.3
                }}
              >
                {wish.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
