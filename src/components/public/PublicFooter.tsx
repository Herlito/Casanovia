import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { FooterEditModal } from '../modals/FooterEditModal';
import { 
  Phone, 
  Mail, 
  ArrowUp, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Quote,
  Lock
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { 
    settings, 
    canEditActiveWedding, 
    isLevel1Admin, 
    isHostUser, 
    currentUser, 
    setShowAuthModal 
  } = useWedding();

  const [isFooterEditOpen, setIsFooterEditOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coupleNames = settings.coupleNames || 'Nombres de los Novios';
  const romanticQuote = settings.romanticQuote || '"El amor no se mira con los ojos, sino con el corazón."';
  const phone = settings.generalContactPhone || '+52 81 0000 0000';
  const email = settings.generalContactEmail || 'boda@contacto.com';

  const canEdit = currentUser.isAuthenticated && (isLevel1Admin || isHostUser || canEditActiveWedding);

  return (
    <>
      <footer className="bg-[#2D2A26] text-[#FAF7F2] py-14 border-t border-[#443E38] relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#D4AF37]/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          {/* Main Footer Container (Highlighted in Green in User Request) */}
          <div className="relative group max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl transition-all duration-300 border border-transparent hover:border-[#D4AF37]/30 bg-white/2 hover:bg-white/5">
            
            {/* Quick Edit Action Badge for Hosts and Admins */}
            {canEdit ? (
              <div className="mb-4 inline-flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-edit-footer"
                  onClick={() => setIsFooterEditOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-linear-to-r from-[#D4AF37]/20 to-[#8B3A4A]/20 hover:from-[#D4AF37]/30 hover:to-[#8B3A4A]/30 text-[#E8DCCF] hover:text-white border border-[#D4AF37]/50 text-xs font-semibold shadow-xs transition-all cursor-pointer transform hover:scale-105"
                  title="Modificar Nombres, Frase Romántica y Contacto de este Pie de Página"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Modificar Frase, Nombres & Contacto</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#D4AF37]/30 rounded-full text-[#FDFBF7]">
                    {isLevel1Admin ? 'Admin' : 'Anfitrión'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#D9CEBF] text-[11px] font-medium border border-white/20"
                >
                  <Lock className="w-3 h-3 text-[#D4AF37]" />
                  <span>¿Eres Anfitrión o Admin? Accede para editar</span>
                </button>
              </div>
            )}

            {/* Couple Signature in Calligraphic Font */}
            <div className="space-y-2">
              <span className="font-script text-4xl sm:text-5xl text-[#D4AF37] block tracking-wide select-none drop-shadow-xs">
                {coupleNames}
              </span>
              
              {/* Romantic Quote */}
              <p className="text-sm sm:text-base text-[#D9CEBF] font-editorial max-w-lg mx-auto italic font-light leading-relaxed">
                {romanticQuote}
              </p>
            </div>

            {/* Contact Information (Phone & Email) */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#B8ADA0] pt-6 mt-4 border-t border-white/10">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center space-x-2 hover:text-[#D4AF37] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-medium">Coordinación: {phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center space-x-2 hover:text-[#D4AF37] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
              >
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-medium">{email}</span>
              </a>
            </div>

          </div>

          {/* System Footer Note */}
          <div className="text-[11px] text-[#8C8276] pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span>Casanovia</span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span>Plataforma multieventos</span>
          </div>

        </div>

        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 p-2.5 rounded-full bg-white/10 hover:bg-[#8B3A4A] text-white transition-all shadow-md cursor-pointer hover:scale-110"
          title="Volver arriba"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </footer>

      {/* Quick Edit Modal */}
      <FooterEditModal
        isOpen={isFooterEditOpen}
        onClose={() => setIsFooterEditOpen(false)}
      />
    </>
  );
};
