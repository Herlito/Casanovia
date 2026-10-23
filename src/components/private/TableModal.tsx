import React from 'react';

export const TableModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave?: (table: any) => void; initialTable?: any }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#EBEBEB] rounded-3xl p-6 max-w-md w-full shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Configurar Mesa</h3>
        <p className="text-sm text-gray-600 mb-6">Gestión de mesa y distribución de invitados.</p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 font-bold text-sm shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
