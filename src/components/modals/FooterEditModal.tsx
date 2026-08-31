import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Quote, 
  Sparkles, 
  Phone, 
  Mail, 
  X, 
  Save, 
  Check, 
  Heart,
  ShieldCheck
} from 'lucide-react';

interface FooterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FooterEditModal: React.FC<FooterEditModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, canEditActiveWedding, isLevel1Admin, isHostUser, currentUser } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [coupleNames, setCoupleNames] = useState(settings.coupleNames || '');
  const [romanticQuote, setRomanticQuote] = useState(
    settings.romanticQuote || '"El amor no se mira con los ojos, sino con el corazón."'
  );
  const [generalContactPhone, setGeneralContactPhone] = useState(settings.generalContactPhone || '');
  const [generalContactEmail, setGeneralContactEmail] = useState(settings.generalContactEmail || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCoupleNames(settings.coupleNames || '');
      setRomanticQuote(settings.romanticQuote || '"El amor no se mira con los ojos, sino con el corazón."');
      setGeneralContactPhone(settings.generalContactPhone || '');
      setGeneralContactEmail(settings.generalContactEmail || '');
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateSettings({
        ...settings,
        coupleNames: coupleNames.trim(),
        romanticQuote: romanticQuote.trim(),
        generalContactPhone: generalContactPhone.trim(),
        generalContactEmail: generalContactEmail.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-transparent transition-all">
        
        {/* Header */}
        <div className={isNeumorphic ? "p-6 relative text-gray-800" : "bg-linear-to-r from-[#2D2A26] to-[#4A3B32] text-[#2D3748] p-6 relative"}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-300 hover:text-[#2D3748] hover:bg-[#EBEBEB]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
              <Quote className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className={isNeumorphic ? "text-[10px] font-bold tracking-widest text-gray-500 uppercase block" : "text-[10px] font-bold tracking-widest text-[#E8DCCF] uppercase block"}>
                Edición de Pie de Página (Anfitriones & Admin)
              </span>
              <h3 className={`font-serif-display text-xl font-bold ${isNeumorphic ? "text-gray-900" : "text-[#2D3748]"}`}>
                Modificar Frase, Nombres & Contactos
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-300 font-light mt-1">
            Los cambios se reflejarán inmediatamente en el pie de página de la <strong>Web Invitados</strong> y se guardarán en Firebase.
          </p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* User badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>
                Editando como: <strong>{currentUser.username}</strong> ({isLevel1Admin ? 'Super Administrador' : 'Anfitrión'})
              </span>
            </div>
            <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
              Privilegio Autorizado
            </span>
          </div>

          {/* 1. Couple Names in Footer */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1.5 flex items-center space-x-1.5">
              <Heart className="w-3.5 h-3.5 text-[#2D3748]" />
              <span>Nombres de los Novios (Firma Principal)</span>
            </label>
            <input
              type="text"
              required
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              placeholder="ej. Zenaida & Ronny"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20 font-serif font-bold text-[#2D2A26]"
            />
          </div>

          {/* 2. Romantic Quote */}
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1.5 flex items-center space-x-1.5">
              <Quote className="w-3.5 h-3.5 text-[#2D3748]" />
              <span>Frase Romántica / Lema de la Boda</span>
            </label>
            <textarea
              rows={2}
              required
              value={romanticQuote}
              onChange={(e) => setRomanticQuote(e.target.value)}
              placeholder='"El amor no se mira con los ojos, sino con el corazón."'
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20 italic text-[#2D2A26]"
            />
          </div>

          {/* 3. Phone & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1.5 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2D3748]" />
                <span>Teléfono de Coordinación</span>
              </label>
              <input
                type="text"
                required
                value={generalContactPhone}
                onChange={(e) => setGeneralContactPhone(e.target.value)}
                placeholder="+52 81 0000 0000 o +51 987 654 321"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20 text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1.5 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2D3748]" />
                <span>Correo de Contacto</span>
              </label>
              <input
                type="email"
                required
                value={generalContactEmail}
                onChange={(e) => setGeneralContactEmail(e.target.value)}
                placeholder="boda.zenaida-ronny@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20 text-[#2D2A26]"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-[#2D2A26] text-[#2D3748] border border-[#443E38] text-center space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] block font-bold">
              Vista Previa en Vivo
            </span>
            <div className="font-script text-2xl text-[#D4AF37]">
              {coupleNames || 'Nombres de los Novios'}
            </div>
            <p className="text-xs text-[#D9CEBF] italic font-editorial max-w-sm mx-auto">
              {romanticQuote || '"El amor no se mira con los ojos, sino con el corazón."'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-[#B8ADA0] pt-2 border-t border-transparent">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                <span>Coordinación: {generalContactPhone || '+52 81 0000 0000'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D4AF37]" />
                <span>{generalContactEmail || 'boda@contacto.com'}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Guardado con Éxito!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
