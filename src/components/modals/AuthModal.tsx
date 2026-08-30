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
  ArrowRight,
  Briefcase
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    login, 
    isLevel1Admin, 
    isLevel3Planner,
    isHostUser,
    logout, 
    currentUser 
  } = useWedding();
  const [username, setUsername] = useState('Herly Lizarazo');
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

  const handleSelectQuickUser = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setClave('');
    setErrorMsg('');
    setSuccessMsg('');
    setTimeout(() => {
      claveInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DCCF] transition-all">
        
        {/* Header */}
        <div className="bg-linear-to-r from-[#2D2A26] to-[#4A3B32] text-white p-6 relative">
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8B3A4A] flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              
              <h3 className="font-serif-display text-xl font-bold text-white">
                Acceso
              </h3>
            </div>
          </div>
          
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser.isAuthenticated ? (
            <div className={`border rounded-2xl p-4 text-center space-y-3 ${
              isLevel1Admin 
                ? 'bg-emerald-50 border-emerald-200' 
                : isLevel3Planner 
                ? 'bg-teal-50 border-teal-200' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                isLevel1Admin 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : isLevel3Planner 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {isLevel1Admin ? <ShieldCheck className="w-6 h-6" /> : isLevel3Planner ? <Briefcase className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-[#2D2A26] text-sm">Sesión Activa: {currentUser.username}</h4>
                <p className="text-xs text-[#7A7268] mt-0.5">{currentUser.roleTitle}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 bg-[#8B3A4A] text-white rounded-xl text-xs font-semibold hover:bg-[#6E2937] transition-colors cursor-pointer"
                >
                  Continuar al Dashboard
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 bg-white text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Herly Lizarazo, Guest Planner, Zenaida Anahua..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524B42] mb-1.5">
                  Clave de Acceso
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                  <input
                    ref={claveInputRef}
                    type="password"
                    required
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Ingresar</span>
              </button>

              </form>
          )}


        </div>

      </div>
    </div>
  );
};
