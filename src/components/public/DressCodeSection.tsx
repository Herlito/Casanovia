import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Shirt, Sparkles, Check, AlertCircle, Edit3, Palette, ShieldCheck } from 'lucide-react';
import { DressCodeColor } from '../../types';
import { DressCodeEditModal } from '../modals/DressCodeEditModal';

export const DressCodeSection: React.FC = () => {
  const { 
    settings, 
    currentUser, 
    isLevel1Admin, 
    isHostUser, 
    canEditActiveWedding 
  } = useWedding();

  const [selectedColor, setSelectedColor] = useState<DressCodeColor | null>(
    settings.suggestedColors && settings.suggestedColors.length > 0 ? settings.suggestedColors[0] : null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update selectedColor if suggestedColors list changes
  useEffect(() => {
    if (settings.suggestedColors && settings.suggestedColors.length > 0) {
      if (!selectedColor || !settings.suggestedColors.some(c => c.hex === selectedColor.hex)) {
        setSelectedColor(settings.suggestedColors[0]);
      }
    } else {
      setSelectedColor(null);
    }
  }, [settings.suggestedColors]);

  const canEdit = currentUser.isAuthenticated && (isLevel1Admin || isHostUser || canEditActiveWedding);

  return (
    <section id="dress-code-section" className="py-12 sm:py-16 bg-[#EBEBEB] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8A9A86]/20 theme-badge text-[#3C5038] text-xs font-semibold uppercase tracking-wider mb-2">
            <Shirt className="w-3.5 h-3.5" />
            <span>Etiqueta & Estilo</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2A26]">
            Código de Vestimenta (Dress Code)
          </h2>
          <p className="font-serif-display text-lg text-[#2D3748] theme-primary-text font-semibold mt-1">
            {settings.dressCodeStyle || 'Formal Rigurosa'}
          </p>
          <p className="text-xs sm:text-sm text-[#7A7268] max-w-xl mx-auto mt-2 leading-relaxed">
            {settings.dressCodeDescription || 'Recomendamos vestimenta de gala acorde a la ocasión.'}
          </p>

          {/* Quick Edit button for Hosts & Admins */}
          {canEdit && (
            <div className="mt-4">
              <button
                type="button"
                id="btn-edit-dress-code"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-linear-to-r from-[#8A9A86]/20 to-[#2D3748]/20 hover:from-[#8A9A86]/30 hover:to-[#2D3748]/30 text-[#4A3B32] hover:text-[#2D2A26] border border-[#8A9A86]/40 text-xs font-semibold shadow-2xs transition-all cursor-pointer transform hover:scale-105"
                title="Modificar código de vestimenta, descripción y paleta visual de colores"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#8A9A86]" />
                <span>Modificar Código de Vestimenta & Paleta de Colores</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#8A9A86] text-[#2D3748] rounded-full">
                  {isLevel1Admin ? 'Admin' : 'Anfitrión'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Card with Interactive Suggested Palette (Reflects Mockup: Círculos con Colores sugeridos) */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#EBEBEB] p-6 sm:p-8 border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold text-[#8C8276] uppercase tracking-widest flex items-center justify-center space-x-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Paleta Visual de Colores Sugeridos</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            </h3>
            <p className="text-xs text-[#7A7268]">
              Haz clic en cualquier tonalidad para ver su descripción y recomendaciones de combinación
            </p>
          </div>

          {/* Interactive Color Circles */}
          {settings.suggestedColors && settings.suggestedColors.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
              {settings.suggestedColors.map((col, idx) => {
                const isSelected = selectedColor?.hex === col.hex && selectedColor?.name === col.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
                  >
                    <div 
                      style={{ backgroundColor: col.hex }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all duration-300 transform group-hover:scale-110 flex items-center justify-center border-3 ${
                        isSelected ? 'border-transparent scale-110 ring-4 ring-[#d1d1d1]/20' : 'border-transparent'
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-6 h-6 text-[#2D3748] drop-shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#524B42] mt-2 group-hover:text-[#2D3748] transition-colors">
                      {col.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#9E9488]">
                      {col.hex}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#8C8276]">
              No hay colores configurados en la paleta.
            </div>
          )}

          {/* Active Selected Color Info Box */}
          {selectedColor && (
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] max-w-md mx-auto text-center animate-fadeIn">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <span 
                  className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-2xs" 
                  style={{ backgroundColor: selectedColor.hex }} 
                />
                <h4 className="text-xs font-bold text-[#2D2A26]">{selectedColor.name}</h4>
                <span className="text-[10px] font-mono text-[#8C8276] font-normal">({selectedColor.hex})</span>
              </div>
              <p className="text-xs text-[#6B6358]">{selectedColor.description || 'Color sugerido para el evento.'}</p>
            </div>
          )}

          {/* Golden Rule / Forbidden colors disclaimer */}
          <div className="mt-6 pt-5 border-t border-[#F2ECE3] flex items-start space-x-3 text-xs text-[#7A7268] bg-[#FAF8F5]/80 p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-[#2D3748] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#2D3748]">Regla de Oro: </span>
              <span>{settings.forbiddenColorsNote || 'Blanco, marfil y beige están reservados exclusivamente para la novia.'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      <DressCodeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </section>
  );
};
