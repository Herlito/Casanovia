import React, { useState, useEffect } from 'react';
import { CanvasElement } from '../types';
import { parseDateSafe } from '../../lib/dateUtils';

interface DOMCountdownProps {
  element: CanvasElement;
  eventData?: {
    eventDate?: string;
  };
}

export const DOMCountdown: React.FC<DOMCountdownProps> = ({ element, eventData }) => {
  const style = element?.style || {};
  const content = element.content || {};

  const targetDate = content.targetDate || eventData?.eventDate || new Date().toISOString();
  const bgColor = style.backgroundColor || '#2D3748';
  const textColor = style.color || '#FFFFFF';
  const numberColor = style.numberColor || '#D4AF37';
  const labelColor = style.labelColor || '#FFFFFF';
  const fontFamily = style.fontFamily || 'sans-serif';
  const numberFont = style.numberFont || style.fontFamily || 'sans-serif';
  const numberSize = style.numberSize || 32;
  const labelSize = style.labelSize || 10;
  const cornerRadius = style.borderRadius || 12;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const target = parseDateSafe(targetDate);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' }
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        borderRadius: `${cornerRadius}px`,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '50px'
            }}
          >
            <div
              style={{
                fontFamily: numberFont,
                fontSize: `${numberSize}px`,
                fontWeight: 'bold',
                color: numberColor,
                lineHeight: 1
              }}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            <div
              style={{
                fontFamily,
                fontSize: `${labelSize}px`,
                color: labelColor,
                textTransform: 'uppercase',
                marginTop: '2px'
              }}
            >
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
