import React, { useState, useRef } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Lock, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    login,
    currentUser,
    appTheme 
  } = useWedding();

  const [username, setUsername] = useState('');
  const [clave, setClave] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const claveInputRef = useRef<HTMLInputElement>(null);

  // If modal is not requested, do not render
  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = login(username, clave);

    if (res.success) {
      setSuccessMsg('');
      setShowAuthModal(false);
      setUsername('');
      setClave('');
    } else {
      setErrorMsg(res.message);
    }
  };

  const isNeumorphic = appTheme === 'neumorphic' || true; // Force true for now but reference appTheme so it doesn't error

  return (
    <div id="auth-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className={`max-w-sm w-full transition-all relative overflow-hidden ${isNeumorphic ? 'bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] p-8' : 'bg-[#EBEBEB] rounded-3xl shadow-2xl'}`}>
        
        {/* Classic Theme Top Header */}
        {!isNeumorphic && (
          <div className="bg-[#5D4037] pt-8 pb-6 px-8 text-center relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer bg-[#EBEBEB]/10 hover:bg-[#EBEBEB]/20 text-[#2D3748]/80 hover:text-[#2D3748]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-[#EBEBEB]/10 mx-auto flex items-center justify-center mb-3 text-[#2D3748]">
              <User className="w-8 h-8" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-[#2D3748]">
              Acceso
            </h3>
          </div>
        )}

        {/* Neumorphic Close Button */}
        {isNeumorphic && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-500 hover:text-gray-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Content */}
        <div className={isNeumorphic ? 'space-y-4 pt-2' : 'p-4 space-y-4'}>
          {/* Neumorphic Header */}
          {isNeumorphic && (
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center mb-2 text-gray-700">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-serif-display text-xl font-bold text-gray-900">
                Acceso
              </h3>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className={isNeumorphic 
                ? "bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-rose-600 text-xs p-4 rounded-2xl flex items-start space-x-2 animate-shake font-semibold"
                : "bg-rose-50 text-rose-600 text-xs p-4 rounded-xl flex items-start space-x-2 animate-shake font-medium border border-rose-100"
              }>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div className={isNeumorphic
                ? "bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-emerald-600 text-xs p-4 rounded-2xl flex items-center space-x-2 font-semibold"
                : "bg-emerald-50 text-emerald-600 text-xs p-4 rounded-xl flex items-center space-x-2 font-medium border border-emerald-100"
              }>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            
            <div>
              <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wider ${isNeumorphic ? 'text-gray-500 pl-2' : 'text-[#8C8276]'}`}>
                Usuario
              </label>
              <div className="relative">
                <User className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isNeumorphic ? 'text-gray-400' : 'text-[#8C8276]'}`} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=""
                  className={isNeumorphic
                    ? "w-full pl-11 pr-4 py-4 text-sm rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all"
                    : "w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-[#2D2A26] focus:outline-none focus:border-transparent focus:ring-1 focus:ring-[#d1d1d1] transition-all"
                  }
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wider ${isNeumorphic ? 'text-gray-500 pl-2' : 'text-[#8C8276]'}`}>
                Clave de Acceso
              </label>
              <div className="relative">
                <KeyRound className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isNeumorphic ? 'text-gray-400' : 'text-[#8C8276]'}`} />
                <input
                  ref={claveInputRef}
                  type="password"
                  required
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder=""
                  className={isNeumorphic
                    ? "w-full pl-11 pr-4 py-4 text-sm rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all"
                    : "w-full pl-11 pr-4 py-3 text-sm rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] text-[#2D2A26] focus:outline-none focus:border-transparent focus:ring-1 focus:ring-[#d1d1d1] transition-all"
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className={isNeumorphic
                ? "w-full mt-8 py-4 px-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-gray-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
                : "w-full mt-6 py-3.5 px-4 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]"
              }
            >
              <Lock className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
