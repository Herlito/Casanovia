import React from 'react';
import { CanvasElement } from '../types';
import { ExternalLink, Check } from 'lucide-react';

interface DOMInteractiveButtonProps {
  element: CanvasElement;
  onClick?: () => void;
  isCopied?: boolean;
}

export const DOMInteractiveButton: React.FC<DOMInteractiveButtonProps> = ({
  element,
  onClick,
  isCopied = false
}) => {
  const style = element?.style || {};
  const content = element.content || {};

  const bgColor = style.backgroundColor || '#D4AF37';
  const textColor = style.color || '#FFFFFF';
  const fontFamily = style.fontFamily || 'sans-serif';
  const fontSize = style.fontSize || 14;
  const fontWeight = style.fontWeight || 'bold';
  const cornerRadius = style.borderRadius || 8;
  const paddingX = style.paddingX || 24;
  const paddingY = style.paddingY || 12;

  const buttonText = content.text || 'Confirmar Asistencia';
  const actionType = content.actionType;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        color: textColor,
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        borderRadius: `${cornerRadius}px`,
        padding: `${paddingY}px ${paddingX}px`,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: style.shadow?.enabled
          ? `${style.shadow.offsetX || 0}px ${style.shadow.offsetY || 2}px ${style.shadow.blur || 4}px ${style.shadow.color || 'rgba(0,0,0,0.2)'}`
          : undefined
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isCopied ? (
        <>
          <Check size={16} />
          <span>¡Copiado!</span>
        </>
      ) : (
        <>
          {actionType === 'link' && <ExternalLink size={16} />}
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};
