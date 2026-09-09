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
      <footer className="bg-[#EBEBEB] text-gray-800 py-14 border-t border-transparent relative overflow-hidden">
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          {/* Main Footer Container (Neumorphic Card) */}
          <div className="relative group max-w-2xl mx-auto p-6 sm:p-8 rounded-[2.5rem] transition-all duration-300 bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff]">
            
            {/* Quick Edit Action Badge for Hosts and Admins */}
            {canEdit ? (
              <div className="mb-4 inline-flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-edit-footer"
                  onClick={() => setIsFooterEditOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 text-xs font-semibold transition-all cursor-pointer"
                  title="Modificar Nombres, Frase Romántica y Contacto de este Pie de Página"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-700" />
                  <span>Modificar Frase, Nombres & Contacto</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-full text-gray-600 font-bold">
                    {isLevel1Admin ? 'Admin' : 'Anfitrión'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center space-x-1.5 px-3 py-1 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-600 text-[11px] font-medium"
                >
                  <Lock className="w-3 h-3 text-gray-500" />
                  <span>¿Eres Anfitrión o Admin? Accede para editar</span>
                </button>
              </div>
            )}

            {/* Couple Signature in Calligraphic Font */}
            <div className="space-y-2">
              <span className="font-script text-4xl sm:text-5xl text-gray-900 block tracking-wide select-none">
                {coupleNames}
              </span>
              
              {/* Romantic Quote */}
              <p className="text-sm sm:text-base text-gray-600 font-editorial max-w-lg mx-auto italic font-light leading-relaxed">
                {romanticQuote}
              </p>
            </div>

            {/* Contact Information (Phone & Email) */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 pt-6 mt-4 border-t border-gray-300/50">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all py-1.5 px-3 rounded-xl hover:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]"
              >
                <Phone className="w-3.5 h-3.5 text-gray-600" />
                <span className="font-medium">Coordinación: {phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-all py-1.5 px-3 rounded-xl hover:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]"
              >
                <Mail className="w-3.5 h-3.5 text-gray-600" />
                <span className="font-medium">{email}</span>
              </a>
            </div>

          </div>

          {/* System Footer Note */}
          <div className="text-[11px] text-gray-500 pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 font-medium">
            <span>Casanovia</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span>Plataforma multieventos</span>
          </div>

        </div>

        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className="absolute right-6 bottom-6 p-3 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-800 transition-all cursor-pointer"
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
