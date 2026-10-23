import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Sparkles, ArrowUpCircle, X, ShieldAlert } from 'lucide-react';

export const UpgradeNoticeModal: React.FC = () => {
  const { upgradeNotice, closeUpgradeNotice, setActiveView } = useWedding();

  if (!upgradeNotice?.isOpen) return null;

  const handleGoToPricing = () => {
    closeUpgradeNotice();
    setActiveView('tokens');
  };

  return (
    <div
      id="upgrade-notice-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={closeUpgradeNotice}
    >
      <div
        className="max-w-md w-full bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] p-6 sm:p-8 relative text-center space-y-5 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeUpgradeNotice}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-amber-600">
          <Sparkles className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Subir de Nivel</span>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-gray-900">
            {upgradeNotice.featureTitle || 'Función Exclusiva'}
          </h3>
        </div>

        {/* Message */}
        <div className="bg-[#EBEBEB] rounded-2xl p-4 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs text-gray-700 leading-relaxed text-left space-y-2">
          <p>{upgradeNotice.message}</p>
          <p className="text-[11px] text-gray-500 font-medium">
            Las cuentas <strong>Nivel 4 (Novia Free)</strong> cuentan con límites de demostración. Sube a un plan superior para desbloquear acceso total.
          </p>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={closeUpgradeNotice}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#EBEBEB] text-gray-700 text-xs font-bold shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] hover:text-gray-900 transition-all cursor-pointer"
          >
            Entendido
          </button>

          <button
            type="button"
            onClick={handleGoToPricing}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#EBEBEB] text-amber-800 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Ver Planes y Precios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
