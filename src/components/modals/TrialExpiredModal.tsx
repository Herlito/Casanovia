import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Clock, LogOut, ArrowUpCircle, ShieldAlert } from 'lucide-react';

export const TrialExpiredModal: React.FC = () => {
  const { isLevel4TrialExpired, level4RegistrationDateStr, logout, setActiveView } = useWedding();

  if (!isLevel4TrialExpired) return null;

  const handleUpgrade = () => {
    setActiveView('tokens');
  };

  return (
    <div
      id="trial-expired-modal"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="max-w-md w-full bg-[#EBEBEB] rounded-[2.5rem] shadow-[16px_16px_32px_#2a2a2a,-16px_-16px_32px_#ffffff] p-6 sm:p-8 relative text-center space-y-6 transition-all border border-rose-300/40">
        
        {/* Top Warning Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-center justify-center text-rose-600">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-600 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acceso Cerrado</span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-gray-900">
            Ha Finalizado tu Etapa de Prueba
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Novia Free (Nivel 4)
          </p>
        </div>

        {/* Details Box */}
        <div className="bg-[#EBEBEB] rounded-2xl p-5 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs text-gray-700 leading-relaxed text-left space-y-3">
          <p>
            Las cuentas de <strong>Nivel 4 (Novia Free)</strong> disponen de un plazo de <strong>48 horas (2 días)</strong> para usar la plataforma desde la creación de su cuenta.
          </p>
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 pt-1 border-t border-gray-300/60">
            <span>Fecha y hora de registro:</span>
            <span className="text-gray-900">{level4RegistrationDateStr || 'Sin registro'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-600">
            <span>Estado actual:</span>
            <span>Plazo de 48 horas vencido</span>
          </div>
          <p className="text-[11px] text-gray-500 pt-1">
            Para continuar organizando tu evento y tener acceso a descargas de PDF, impresión de reportes y herramientas sin restricciones, por favor sube a uno de nuestros planes de pago.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="btn-trial-logout"
            onClick={logout}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-[#EBEBEB] text-gray-700 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] hover:text-gray-900 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            type="button"
            id="btn-trial-upgrade"
            onClick={handleUpgrade}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-[#EBEBEB] text-amber-800 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowUpCircle className="w-4 h-4 text-amber-600" />
            <span>Subir de Nivel</span>
          </button>
        </div>

      </div>
    </div>
  );
};
