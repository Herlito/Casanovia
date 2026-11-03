import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { DigitalGuestPass, DigitalPassValidationResult } from '../../types';
import { validatePassAtDoor } from '../../services/digitalPassService';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Armchair, 
  Search,
  ScanLine,
  UserCheck
} from 'lucide-react';

interface PassValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassValidationModal: React.FC<PassValidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeWedding, weddings, activeWeddingId } = useWedding();
  const wedding = activeWedding || weddings.find((w) => w.id === activeWeddingId);

  const [tokenInput, setTokenInput] = useState('');
  const [passesToAdmit, setPassesToAdmit] = useState<number>(1);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<DigitalPassValidationResult | null>(null);

  if (!isOpen || !wedding) return null;

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsValidating(true);
    setResult(null);

    try {
      const res = await validatePassAtDoor(wedding, tokenInput.trim(), passesToAdmit);
      setResult(res);
    } catch (err) {
      setResult({
        valid: false,
        message: 'Error al procesar la validación en el servidor.',
        code: 'NOT_FOUND',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleReset = () => {
    setTokenInput('');
    setResult(null);
    setPassesToAdmit(1);
  };

  return (
    <div
      id="pass-validation-modal"
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-[#EBEBEB] rounded-[2.5rem] p-6 sm:p-8 shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] border border-white/80 relative my-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2.5 rounded-2xl bg-[#EBEBEB] text-gray-500 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-emerald-700 mb-3">
            <ScanLine className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-gray-900">
            Control de Ingreso & Escáner
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Validador de códigos QR y control de cupo en puerta para {wedding.coupleNames}.
          </p>
        </div>

        {/* Validation Result Box */}
        {result && (
          <div className={`p-5 rounded-2xl mb-5 animate-fadeIn border ${
            result.valid 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/90 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-start space-x-3">
              {result.valid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm leading-snug">{result.message}</p>
                {result.pass && (
                  <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-1">
                    <p><span className="font-bold">Invitado:</span> {result.pass.guestFullName}</p>
                    <p><span className="font-bold">Pases usados:</span> {result.pass.usedPasses} de {result.pass.confirmedPasses}</p>
                    {result.pass.assignedTable && (
                      <p><span className="font-bold">Mesa:</span> {result.pass.assignedTable}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 text-right">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold underline cursor-pointer"
              >
                Escanear / Validar Otro
              </button>
            </div>
          </div>
        )}

        {/* Scanner / Token input form */}
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Token QR o Código de Pase
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Escanea el código QR o pega el token..."
                className="w-full px-5 py-4 text-center font-mono text-xs rounded-2xl bg-[#EBEBEB] text-gray-900 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden transition-all"
              />
              <QrCode className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
            <span className="text-xs font-bold text-gray-600">Personas a ingresar ahora:</span>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassesToAdmit(num)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    passesToAdmit === num
                      ? 'bg-[#EBEBEB] text-emerald-800 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]'
                      : 'bg-[#EBEBEB] text-gray-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isValidating || !tokenInput.trim()}
            className="w-full py-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-sm transition-all duration-300 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>{isValidating ? 'Validando Acceso...' : 'Validar e Ingresar'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
