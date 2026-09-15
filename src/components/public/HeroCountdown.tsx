import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Clock, Heart, Sparkles, Edit3 } from 'lucide-react';
import { parseWeddingDateParts, formatCeremonyTimeSimple, isRsvpDeadlinePassed } from '../../lib/dateUtils';
import { useSyncedInvitationDesign } from '../../hooks/useSyncedInvitationDesign';
import { SyncedInvitationHero } from './SyncedInvitationHero';

export const HeroCountdown: React.FC = () => {
  const { settings, activeWedding, activeWeddingId, currentUser, setShowWeddingCraftModal } = useWedding();
  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  const targetEventId = activeWedding?.id || activeWeddingId || (settings as any)?.id || 'demo_event';
  const { document: syncedDesign, hasCustomDesign } = useSyncedInvitationDesign(targetEventId);

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

    const isWedding = !settings.eventType || settings.eventType === 'Boda';
  const brideFirstName = (settings.brideName ? settings.brideName.split(' ')[0] : settings.coupleNames?.split('&')[0]?.trim()) || 'Novia';
  const groomFirstName = (settings.groomName ? settings.groomName.split(' ')[0] : settings.coupleNames?.split('&')[1]?.trim()) || 'Novio';

  const displayTitle = isWedding ? (
    <>
      {brideFirstName}{' '}
      <span className="font-editorial italic font-normal text-[#2D3748] theme-primary-text text-4xl sm:text-6xl md:text-7xl inline-block mx-0.5 align-middle">
        &
      </span>{' '}
      {groomFirstName}
    </>
  ) : (
    <>{settings.coupleNames}</>
  );

  // If a visual design has been customized/published in WeddingCraft, render the synced WYSIWYG hero
  if (hasCustomDesign && syncedDesign) {
    return (
      <SyncedInvitationHero
        document={syncedDesign}
        onOpenEditor={() => setShowWeddingCraftModal(true)}
        showEditTrigger={Boolean(currentUser)}
      />
    );
  }

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[#EBEBEB]">
      {Boolean(currentUser) && (
        <div className="max-w-xl mx-auto px-4 mb-4 flex justify-end">
          <button
            id="btn-open-editor-from-hero"
            onClick={() => setShowWeddingCraftModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#EBEBEB] text-xs font-semibold text-[#2D3748] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Personalizar Diseño Visual</span>
          </button>
        </div>
      )}
      <div className="w-full mx-auto px-4 sm:px-6 text-center">
        {/* Couple Names in Large Display Serif Typography */}
        <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#2D2A26] tracking-tight leading-none mb-2">
          {displayTitle}
        </h1>

        {/* Subtitle / Blessing Quote */}
        <p className="font-editorial italic text-base sm:text-lg md:text-xl text-[#6B6358] max-w-xl mx-auto mb-3 sm:mb-4 leading-normal sm:leading-snug">
          {settings.romanticQuote || 'Con la bendición de Dios y de nuestros padres, tenemos el honor de invitarte a celebrar la unión de nuestras vidas.'}
        </p>

        {/* Date Section framed by parallel lines - All items aligned on exact same horizontal baseline with matching #2D3748 color */}
        <div className="w-full max-w-md mx-auto my-2.5 sm:my-3.5">
          <div className="border-t border-[#D9CEBF]" />
          <div className="py-1.5 sm:py-2 flex items-baseline justify-center space-x-4 sm:space-x-6 text-[#2D3748] theme-primary-text">
            <span className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#2D3748] theme-primary-text tracking-wide font-normal leading-none">
              {dateParts.dayOfWeek}
            </span>
            <span className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-normal text-[#2D3748] theme-primary-text tracking-tight leading-none">
              {dateParts.dayNumber}
            </span>
            <span className="font-editorial text-xl sm:text-2xl md:text-3xl text-[#2D3748] theme-primary-text tracking-wide font-normal leading-none">
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
        <div className="relative rounded-3xl p-6 sm:p-8 bg-[#EBEBEB]/90 border border-transparent shadow-2xs max-w-xl mx-auto mb-6 overflow-hidden">
          <div className="flex items-center justify-center space-x-1.5 text-[#2D3748] theme-primary-text text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] theme-accent-text" />
            <span>Cuenta Regresiva para el Gran Día</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] theme-accent-text" />
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-md mx-auto mb-4">
            {/* Days */}
            <div className="bg-[#EBEBEB] rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] theme-card-highlight shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D3748] theme-primary-text">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Días
              </span>
            </div>

            {/* Hours */}
            <div className="bg-[#EBEBEB] rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] theme-card-highlight shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Horas
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-[#EBEBEB] rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] theme-card-highlight shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Minutos
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-[#EBEBEB] rounded-2xl p-3 sm:p-4 border border-[#EBE3D7] theme-card-highlight shadow-xs flex flex-col items-center justify-center">
              <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#8A9A86] theme-secondary-text">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#8C8276] uppercase tracking-wider mt-1">
                Segundos
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#8C8276] font-light">
            Cada segundo cuenta para encontrarnos y celebrar
          </p>
        </div>

        {/* RSVP Status / Action Buttons */}
        {isDeadlinePassed ? (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#EBEBEB] border border-[#E5DACD] text-xs sm:text-sm font-medium text-[#7A7268] shadow-2xs">
            <Clock className="w-4 h-4 text-[#2D3748] theme-primary-text" />
            <span>El tiempo de confirmación de asistencia ha concluido. ¡Nos vemos en la boda!</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
            <button
              id="hero-cta-rsvp"
              onClick={() => scrollToSection('rsvp-section')}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] theme-button-primary text-[#2D3748] font-semibold text-sm hover:bg-[#EBEBEB] transition-all duration-200 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Confirmar Asistencia (RSVP)</span>
            </button>

            <button
              id="hero-cta-protocol"
              onClick={() => scrollToSection('protocol-lookup-section')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#EBEBEB] text-[#524B42] border border-[#D9CEBF] font-semibold text-sm hover:bg-[#EBEBEB] hover:text-[#2D3748] transition-all duration-200 shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37] theme-accent-text" />
              <span>Consultar Pase & Guía Protocolar</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
