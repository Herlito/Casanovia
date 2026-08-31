import React from 'react';
import { useWedding } from '../../context/WeddingContext';
import { MessageSquareHeart, Sparkles, Heart } from 'lucide-react';

export const WishesWall: React.FC = () => {
  const { guests } = useWedding();

  const wishes = guests
    .filter(g => g.congratulationMessage && g.congratulationMessage.trim().length > 0)
    .slice(0, 8);

  if (wishes.length === 0) return null;

  return (
    <section className="py-12 bg-[#EBEBEB] border-t border-[#EADDCE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Muro de los Deseos</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Mensajes & Bendiciones de los Invitados
          </h2>
          <p className="text-xs text-[#7A7268] mt-1">
            Palabras llenas de amor dejadas por nuestros familiares y amigos confirmados.
          </p>
        </div>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishes.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="bg-[#EBEBEB] rounded-2xl p-5 border border-transparent shadow-2xs flex flex-col justify-between"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] flex items-center justify-center font-bold text-xs">
                      {item.fullName.charAt(0)}
                    </div>
                    <h4 className="text-xs font-bold text-[#2D2A26]">{item.fullName}</h4>
                  </div>
                  <Heart className="w-3.5 h-3.5 fill-[#2D3748] text-[#2D3748]" />
                </div>
                {item.protocolRoleTitle && (
                  <span className="inline-block text-[10px] font-medium text-[#8A9A86] bg-[#8A9A86]/15 px-2 py-0.5 rounded-full mb-2">
                    {item.protocolRoleTitle}
                  </span>
                )}
                <p className="text-xs text-[#524B42] italic font-editorial leading-relaxed">
                  "{item.congratulationMessage}"
                </p>
              </div>

              <div className="text-[10px] text-[#9E9488] pt-2 border-t border-[#F2ECE3] flex items-center justify-between">
                <span>{item.updatedAt || 'Reciente'}</span>
                <span>Asistencia confirmada ✓</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
