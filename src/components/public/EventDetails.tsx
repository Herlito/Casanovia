import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Church, 
  PartyPopper, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Navigation, 
  Copy, 
  Check, 
  Car, 
  Sparkles 
} from 'lucide-react';
import { formatWeddingTimeCustom } from '../../lib/dateUtils';
import { safeUrl } from '../../lib/safeUrl';

export const EventDetails: React.FC = () => {
  const { settings } = useWedding();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const ceremonyVenue = settings?.ceremonyVenue || {
    name: 'Capilla / Parroquia Principal',
    time: '17:00',
    address: 'Ubicación por definir',
    googleMapsUrl: '#',
    wazeUrl: '#',
  };

  const receptionVenue = settings?.receptionVenue || {
    name: 'Hacienda / Fundo de Recepción',
    time: '19:00',
    address: 'Ubicación por definir',
    googleMapsUrl: '#',
    wazeUrl: '#',
  };

  const hasReligiousCeremony = settings?.hasReligiousCeremony !== false;

  const copyToClipboard = (text: string, type: 'ceremony' | 'reception') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2500);
  };

  return (
    <section id="event-details-section" className="py-12 sm:py-16 bg-[#EBEBEB] border-t border-b border-[#EADDCE]">
      <div className="w-full mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Itinerario de Lugares</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2A26]">
            Detalles del Evento
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268] max-w-lg mx-auto mt-2">
            AcompaÃ±a cada momento especial. Consulta las ubicaciones, accesos y mapas de navegaciÃ³n directa.
          </p>
        </div>

        {/* Venue Cards Grid (Adapts if hasReligiousCeremony is disabled) */}
        <div className={!hasReligiousCeremony ? 'max-w-xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'}>
          
          {/* 1. CEREMONIA RELIGIOSA (Solo si tiene ceremonia religiosa habilitada) */}
          {hasReligiousCeremony && (
            <div className="rounded-2xl sm:rounded-3xl bg-[#EBEBEB] p-6 sm:p-8 border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-shadow relative flex flex-col justify-between">
              {/* Top Icon Badge */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center border border-transparent">
                    <Church className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBEBEB] text-[#2D3748] border border-transparent">
                    Puntualidad Requerida
                  </span>
                </div>

                <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26] mb-2">
                  Ceremonia Religiosa
                </h3>
                <p className="font-serif-display text-base text-[#524B42] font-semibold mb-3">
                  {ceremonyVenue.name}
                </p>

                {/* Time & Address */}
                <div className="space-y-2 text-xs text-[#6B6358] mb-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-[#2D3748] shrink-0 mt-0.5" />
                    <span>{formatWeddingTimeCustom(ceremonyVenue.time, '5:00 pm (Puntual)')}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[#8A9A86] shrink-0 mt-0.5" />
                    <span>{ceremonyVenue.address}</span>
                  </div>
                </div>

                {/* Simulated Map Visual Card */}
                <div className="relative rounded-xl overflow-hidden bg-[#EFEBE4] border border-[#D9CEBF] p-3 mb-4 text-center">
                  <div className="h-28 w-full rounded-lg bg-linear-to-br from-[#E6E0D4] to-[#D9D1C1] flex flex-col items-center justify-center relative px-2">
                    <div className="w-8 h-8 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] animate-bounce">
                      <Church className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#2D2A26] mt-1 bg-[#EBEBEB]/90 px-2 py-0.5 rounded-full shadow-xs truncate max-w-[90%]">
                      {ceremonyVenue.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#F2ECE3]">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={safeUrl(ceremonyVenue.googleMapsUrl) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#EBEBEB] text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] hover:border-transparent transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#2D3748]" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={safeUrl(ceremonyVenue.wazeUrl) || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#EBEBEB] text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold hover:bg-[#2C3E50] hover:text-[#2D3748] hover:border-[#2C3E50] transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#2C3E50]" />
                    <span>Abrir en Waze</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(ceremonyVenue.address, 'ceremony')}
                  className="w-full py-2 px-3 rounded-xl text-xs text-[#7A7268] hover:text-[#2D2A26] hover:bg-[#EBEBEB] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedAddress === 'ceremony' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">¡Dirección de Capilla copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar dirección para InDrive / Taxi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. RECEPCIÓN & BANQUETE */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#EBEBEB] p-6 sm:p-8 border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-shadow relative flex flex-col justify-between">
            {/* Top Icon Badge */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 text-[#8B6B23] flex items-center justify-center border border-[#D4AF37]/30">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBEBEB] text-[#8B6B23] border border-transparent">
                  Cóctel & Gran Fiesta
                </span>
              </div>

              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26] mb-2">
                Recepción & Fiesta
              </h3>
              <p className="font-serif-display text-base text-[#524B42] font-semibold mb-3">
                {receptionVenue.name}
              </p>

              {/* Time & Address */}
              <div className="space-y-2 text-xs text-[#6B6358] mb-4">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{receptionVenue.time}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-[#8A9A86] shrink-0 mt-0.5" />
                  <span>{receptionVenue.address}</span>
                </div>
              </div>

              {/* Simulated Map Visual Card */}
              <div className="relative rounded-xl overflow-hidden bg-[#EFEBE4] border border-[#D9CEBF] p-3 mb-4 text-center">
                <div className="h-28 w-full rounded-lg bg-linear-to-br from-[#E6E0D4] to-[#D9D1C1] flex flex-col items-center justify-center relative">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#2D3748] flex items-center justify-center shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] animate-bounce">
                    <PartyPopper className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-[#2D2A26] mt-1 bg-[#EBEBEB]/90 px-2 py-0.5 rounded-full shadow-xs">
                    {receptionVenue.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#F2ECE3]">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={safeUrl(receptionVenue.googleMapsUrl) || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#EBEBEB] text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:text-[#2D3748] hover:border-transparent transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2D3748]" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={safeUrl(receptionVenue.wazeUrl) || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#EBEBEB] text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold hover:bg-[#2C3E50] hover:text-[#2D3748] hover:border-[#2C3E50] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#2C3E50]" />
                  <span>Abrir en Waze</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(receptionVenue.address, 'reception')}
                className="w-full py-2 px-3 rounded-xl text-xs text-[#7A7268] hover:text-[#2D2A26] hover:bg-[#EBEBEB] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copiedAddress === 'reception' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">¡Dirección de Hacienda copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar dirección para InDrive / Taxi</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
