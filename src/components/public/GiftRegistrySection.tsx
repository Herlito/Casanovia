import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Gift, 
  CreditCard, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  HeartHandshake,
  ShoppingBag
} from 'lucide-react';

export const GiftRegistrySection: React.FC = () => {
  const { settings } = useWedding();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (settings.showGiftRegistry === false) return null;

  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <section id="gift-registry-section" className="py-12 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#8B6B23] text-xs font-semibold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Mesa de Regalos</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2A26]">
            {settings.giftRegistryTitle || 'Mesa de Regalos & Transferencias'}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268] max-w-lg mx-auto mt-2">
            {settings.giftRegistryMessage || 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.'}
          </p>
        </div>

        {/* Responsive Grid: If showBankDetails is false, department stores take full width or center nicely */}
        <div className={`grid grid-cols-1 ${settings.showBankDetails !== false ? 'lg:grid-cols-12' : 'max-w-2xl mx-auto'} gap-6 items-stretch`}>
          
          {/* Department Stores Cards (Left Column or Full Center) */}
          <div className={`${settings.showBankDetails !== false ? 'lg:col-span-6' : 'w-full'} space-y-4 flex flex-col justify-between`}>
            
            {settings.giftRegistries.map((store, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#E8DCCF] shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-center text-[#8B3A4A] group-hover:bg-[#8B3A4A] group-hover:text-white transition-colors shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9A86] block">
                      {store.badgeText || 'Mesa Oficial'}
                    </span>
                    <h3 className="font-serif-display text-lg font-bold text-[#2D2A26]">
                      {store.storeName}
                    </h3>
                    <p className="text-xs text-[#7A7268]">
                      Evento / No. de Mesa: <span className="font-mono font-semibold text-[#8B3A4A]">{store.eventNumber}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#FAF7F2] text-[#524B42] hover:bg-[#8B3A4A] hover:text-white transition-colors border border-[#D9CEBF] flex items-center space-x-1 text-xs font-semibold shrink-0"
                >
                  <span className="hidden sm:inline">Ver Mesa</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-[#8A9A86]/10 border border-[#8A9A86]/20 text-xs text-[#3C5038] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8A9A86] shrink-0" />
              <span>Puedes realizar tus compras en línea o directamente en sucursal mencionando el número de evento.</span>
            </div>
          </div>

          {/* Elegant Bank Transfer Card (Right Column) - Shown ONLY if settings.showBankDetails is not false */}
          {settings.showBankDetails !== false && (
            <div className="lg:col-span-6">
              <div className="h-full rounded-2xl sm:rounded-3xl bg-linear-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F3ECE0] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                
                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#8B6B23] flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B3A4A] block">
                          Lluvia de Sobres / Transferencia
                        </span>
                        <h3 className="font-serif-display text-xl font-bold text-[#2D2A26]">
                          Datos Bancarios
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-[#8B6B23] border border-[#D4AF37]/30 shadow-2xs">
                      {settings.bankDetails.bankName}
                    </span>
                  </div>

                  {/* Bank Details Table with 1-click copy */}
                  <div className="space-y-3.5 my-5">
                    {/* Beneficiary */}
                    <div className="bg-white/80 p-3 rounded-xl border border-[#EAE0D1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C8276] uppercase block">Titulares de la Cuenta</span>
                        <span className="text-xs font-bold text-[#2D2A26]">{settings.bankDetails.accountHolder}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(settings.bankDetails.accountHolder, 'holder')}
                        className="p-1.5 rounded-lg text-[#7A7268] hover:text-[#8B3A4A] hover:bg-[#FAF7F2] transition-colors"
                        title="Copiar Titular"
                      >
                        {copiedField === 'holder' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* CLABE */}
                    <div className="bg-white/80 p-3 rounded-xl border border-[#EAE0D1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C8276] uppercase block">CLABE Interbancaria</span>
                        <span className="text-xs font-mono font-bold text-[#8B3A4A]">{settings.bankDetails.clabe}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(settings.bankDetails.clabe.replace(/\s+/g, ''), 'clabe')}
                        className="p-1.5 rounded-lg text-[#7A7268] hover:text-[#8B3A4A] hover:bg-[#FAF7F2] transition-colors"
                        title="Copiar CLABE"
                      >
                        {copiedField === 'clabe' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Account Number */}
                    <div className="bg-white/80 p-3 rounded-xl border border-[#EAE0D1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C8276] uppercase block">Número de Cuenta</span>
                        <span className="text-xs font-mono font-bold text-[#2D2A26]">{settings.bankDetails.accountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(settings.bankDetails.accountNumber.replace(/\s+/g, ''), 'account')}
                        className="p-1.5 rounded-lg text-[#7A7268] hover:text-[#8B3A4A] hover:bg-[#FAF7F2] transition-colors"
                        title="Copiar Cuenta"
                      >
                        {copiedField === 'account' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Concept */}
                    <div className="bg-white/80 p-3 rounded-xl border border-[#EAE0D1] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#8C8276] uppercase block">Concepto Sugerido</span>
                        <span className="text-xs font-medium text-[#524B42]">{settings.bankDetails.concept}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyText(settings.bankDetails.concept, 'concept')}
                        className="p-1.5 rounded-lg text-[#7A7268] hover:text-[#8B3A4A] hover:bg-[#FAF7F2] transition-colors"
                        title="Copiar Concepto"
                      >
                        {copiedField === 'concept' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-[11px] text-[#7A7268]">
                  <span className="flex items-center space-x-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-[#8B3A4A]" />
                    <span>¡Infinitas gracias por su cariño!</span>
                  </span>
                  {copiedField && (
                    <span className="text-emerald-700 font-semibold animate-fadeIn">
                      ✓ Dato copiado al portapapeles
                    </span>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
