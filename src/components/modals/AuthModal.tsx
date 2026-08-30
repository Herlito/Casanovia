import React, { useState, useRef } from 'react';
import { useWedding, LEVEL_1_USER } from '../../context/WeddingContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Briefcase
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    login, 
    isLevel1Admin, 
    isLevel3Planner,
    logout, 
    currentUser 
  } = useWedding();

  const [username, setUsername] = useState('');
  const [clave, setClave] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const claveInputRef = useRef<HTMLInputElement>(null);

  if (!showAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = login(username, clave);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-[2.5rem] max-w-sm w-full shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] transition-all p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="space-y-6 pt-2">
          {currentUser.isAuthenticated ? (
            <div className="bg-[#EBEBEB] rounded-3xl p-6 shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] mx-auto flex items-center justify-center text-gray-700">
                {isLevel1Admin ? <ShieldCheck className="w-6 h-6" /> : isLevel3Planner ? <Briefcase className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{currentUser.username}</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{currentUser.roleTitle}</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-3.5 rounded-2xl bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-rose-600 hover:text-rose-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center mb-4 text-gray-700">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-gray-900">
                  Acceso
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-rose-600 text-xs p-4 rounded-2xl flex items-start space-x-2 animate-shake font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-emerald-600 text-xs p-4 rounded-2xl flex items-center space-x-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider pl-2">
                    Usuario
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder=""
                      className="w-full pl-11 pr-4 py-4 text-sm rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider pl-2">
                    Clave de Acceso
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={claveInputRef}
                      type="password"
                      required
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                      placeholder=""
                      className="w-full pl-11 pr-4 py-4 text-sm rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 py-4 px-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] text-gray-800 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ingresar</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
