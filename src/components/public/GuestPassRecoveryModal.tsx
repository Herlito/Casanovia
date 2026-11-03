import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { DigitalGuestPass as DigitalGuestPassType } from '../../types';
import { recoverPassByGuestCode } from '../../services/digitalPassService';
import { DigitalGuestPass } from './DigitalGuestPass';
import { 
  X, 
  Search, 
  KeyRound, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface GuestPassRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassRecovered?: (pass: DigitalGuestPassType) => void;
}

export const GuestPassRecoveryModal: React.FC<GuestPassRecoveryModalProps> = ({
  isOpen,
  onClose,
  onPassRecovered,
}) => {
  const { activeWedding, weddings, activeWeddingId } = useWedding();
  const wedding = activeWedding || weddings.find((w) => w.id === activeWeddingId);

  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveredPass, setRecoveredPass] = useState<DigitalGuestPassType | null>(null);

  if (!isOpen || !wedding) return null;

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMessage('Por favor introduce tu código de invitado.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const res = await recoverPassByGuestCode(wedding, inputCode.trim());
      if (res.success && res.pass) {
        setRecoveredPass(res.pass);
        if (onPassRecovered) {
          onPassRecovered(res.pass);
        }
      } else {
        setErrorMessage(
          res.error || 'No se encontró ningún pase confirmado con este código. Verifica que tu asistencia esté confirmada.'
        );
      }
    } catch (err) {
      setErrorMessage('Ocurrió un error al consultar el pase. Por favor intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetSearch = () => {
    setRecoveredPass(null);
    setInputCode('');
    setErrorMessage(null);
  };

  return (
    <div
      id="guest-pass-recovery-modal"
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-[#EBEBEB] rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] border border-white/80 relative my-6">
        
        {/* Close Button (Neumorphic) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2.5 rounded-2xl bg-[#EBEBEB] text-gray-500 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {recoveredPass ? (
          /* Show recovered digital pass */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  ¡Pase Recuperado con Éxito!
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetSearch}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Consultar otro</span>
              </button>
            </div>

            <DigitalGuestPass
              pass={recoveredPass}
              wedding={wedding}
              onClose={onClose}
              showCloseButton={true}
            />
          </div>
        ) : (
          /* Recovery input form */
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-amber-700 mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-900">
                Recuperar Mi Pase Digital
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                ¿Ya confirmaste tu asistencia desde otro dispositivo? Ingresa tu código de invitado para acceder a tu tarjeta virtual y código QR.
              </p>
            </div>

            <form onSubmit={handleRecover} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Código de Invitado
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      setErrorMessage(null);
                    }}
                    placeholder="Ej. BODA-SOFI-01"
                    className="w-full px-5 py-4 text-center font-mono font-bold text-sm tracking-wider rounded-2xl bg-[#EBEBEB] text-gray-900 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
                  />
                  <Sparkles className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  El código fue asignado al confirmar tu asistencia en el sistema.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-sm transition-all duration-300 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <Search className="w-4 h-4 text-gray-700" />
                <span>{isSearching ? 'Buscando Pase...' : 'Recuperar Mi Tarjeta'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
