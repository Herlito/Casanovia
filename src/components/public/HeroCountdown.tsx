import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Clock, Heart, Sparkles } from 'lucide-react';
import { parseWeddingDateParts, formatCeremonyTimeSimple, isRsvpDeadlinePassed } from '../../lib/dateUtils';

export const HeroCountdown: React.FC = () => {
  const { settings } = useWedding();
  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(settings.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.weddingDate]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dateParts = parseWeddingDateParts(settings.weddingDate);
  const isCivilOnly = settings.hasReligiousCeremony === false;
  const targetVenue = isCivilOnly ? settings.receptionVenue : settings.ceremonyVenue;
  const venueName = targetVenue?.name || (isCivilOnly ? 'Salón de Recepción' : 'Iglesia Santa Marta');
  const formattedTime = formatCeremonyTimeSimple(
    targetVenue?.time || settings.weddingTime,
    '12:00m'
  );

  const brideFirstName = settings.brideName ? settings.brideName.split(' ')[0] : 'Zenaida';
  const groomFirstName = settings.groomName ? settings.groomName.split(' ')[0] : 'Ronny';

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#FDFBF7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        {/* Couple Names in Large Display Serif Typography */}
        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D2A26] tracking-tight leading-none mb-2">
          {brideFirstName}{' '}
          <span className="font-editorial italic font-normal text-[#8B3A4A] text-4xl sm:text-6xl md:text-7xl inline-block mx-0.5 align-middle">
            &
          </span>{' '}
          {groomFirstName}
        </h1>

        {/* Subtitle / Blessing Quote */}
        <p className="font-editorial italic text-base sm:text-lg md:text-xl text-[#6B6358] max-w-xl mx-auto mb-3 sm:mb-4 leading-normal sm:leading-snug">
          Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar la unión de nuestras vidas.
        </p>

        {/* Date Section framed by parallel lines - All items aligned on exact same horizontal baseline with matching #8B3A4A color */}
        <div className="w-full max-w-md mx-auto my-2.5 sm:my-3.5">
          <div className="border-t border-[#D9CEBF]" />
          <div className="py-1.5 sm:py-2 flex items-baseline justify-center space-x-4 sm:space-x-6 text-[#8B3A4A]">
            <span className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#8B3A4A] tracking-wide font-normal leading-none">
              {dateParts.dayOfWeek}
            </span>
            <span className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-normal text-[#8B3A4A] tracking-tight leading-none">
              {dateParts.dayNumber}
            </span>
            <span className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#8B3A4A] tracking-wide font-normal leading-none">
              {dateParts.monthName}
            </span>
          </div>
          <div className="border-b border-[#D9CEBF]" />
        </div>

        {/* Venue & Ceremony/Reception Time */}
        <div className="space-y-0.5 mb-5 sm:mb-6">
          <h3 className="font-editorial text-xl sm:text-2xl font-medium text-[#2D2A26] tracking-wide leading-tight">
            {venueName}
          </h3>
          <p className="font-editorial text-lg sm:text-xl text-[#524B42] leading-tight">
            {formattedTime}
          </p>
        </div>

        {/* Countdown Card */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-[#FAF7F2]/90 border border-[#E8DCCF] shadow-2xs max-w-xl mx-auto mb-6 overflow-hidden">
          <div className="flex items-center justify-center space-x-1.5 text-[#8B3A4A] text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cuenta Regresiva para el Gran Día</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-md mx-auto mb-4">
            {/* Days */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#8B3A4A]">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Días
              </span>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Horas
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Minutos
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#8A9A86]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Segundos
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#8C8276] font-light">
            Cada segundo cuenta para encontrarnos y celebrar este sueño de amor.
          </p>
        </div>

        {/* RSVP Status / Action Buttons */}
        {isDeadlinePassed ? (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white border border-[#E5DACD] text-xs sm:text-sm font-medium text-[#7A7268] shadow-2xs">
            <Clock className="w-4 h-4 text-[#8B3A4A]" />
            <span>El tiempo de confirmación de asistencia ha concluido. ¡Nos vemos en la boda!</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
            <button
              id="hero-cta-rsvp"
              onClick={() => scrollToSection('rsvp-section')}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#8B3A4A] text-white font-semibold text-sm hover:bg-[#6E2937] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Confirmar Asistencia (RSVP)</span>
            </button>

            <button
              id="hero-cta-protocol"
              onClick={() => scrollToSection('protocol-lookup-section')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#524B42] border border-[#D9CEBF] font-semibold text-sm hover:bg-[#FAF7F2] hover:text-[#8B3A4A] transition-all duration-200 shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Consultar Pase & Guía Protocolar</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
