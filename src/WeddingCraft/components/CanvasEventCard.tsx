import React from 'react';

export const CanvasEventCard: React.FC<{ element: any; isSelected: boolean; onSelect: () => void; onChange: (updated: any) => void }> = ({ element }) => {
  return (
    <div className="p-4 rounded-xl bg-white/60 shadow text-center">
      <p className="text-sm font-bold text-gray-800">{element?.content || 'Detalles del Evento'}</p>
    </div>
  );
};
