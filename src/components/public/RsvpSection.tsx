import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { RsvpStatus } from '../../types';
import { isRsvpDeadlinePassed, formatRsvpCutoffDate, formatRsvpDeadline } from '../../lib/dateUtils';
import { 
  Heart, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Utensils, 
  MessageSquareHeart, 
  Sparkles,
  Search,
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RsvpSection: React.FC = () => {
  const { 
    guests, 
    settings,
    submitGuestRsvp, 
    selectedGuestForGuide, 
    setSelectedGuestForGuide 
  } = useWedding();

  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  const [fullName, setFullName] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('confirmed');
  const [confirmedPasses, setConfirmedPasses] = useState<number>(2);
  const [maxPassesAvailable, setMaxPassesAvailable] = useState<number>(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('Ninguna');
  const [customDietary, setCustomDietary] = useState('');
  const [confirmedRehearsalPhotos, setConfirmedRehearsalPhotos] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (isDeadlinePassed) {
    return null;
  }

  // Sync with selectedGuestForGuide when set elsewhere in the app
  useEffect(() => {
    if (selectedGuestForGuide) {
      setFullName(selectedGuestForGuide.fullName);
      setRsvpStatus(selectedGuestForGuide.rsvpStatus || 'confirmed');
      setConfirmedPasses(selectedGuestForGuide.confirmedPasses || selectedGuestForGuide.totalPasses || 1);
      setMaxPassesAvailable(selectedGuestForGuide.totalPasses || 2);
      if (selectedGuestForGuide.dietaryRestrictions) {
        if (['Ninguna', 'Vegetariana', 'Vegana', 'Sin Gluten (Celíaco)', 'Sin Lácteos', 'Alérgico a Mariscos / Frutos Secos'].includes(selectedGuestForGuide.dietaryRestrictions)) {
          setDietaryRestrictions(selectedGuestForGuide.dietaryRestrictions);
        } else {
          setDietaryRestrictions('Otro');
          setCustomDietary(selectedGuestForGuide.dietaryRestrictions);
        }
      }
      setConfirmedRehearsalPhotos(selectedGuestForGuide.confirmedRehearsalPhotoAttendance ?? true);
      setMessage(selectedGuestForGuide.congratulationMessage || '');
    }
  }, [selectedGuestForGuide]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    
    // Auto-match guest from database
    const matched = guests.find(g => g.fullName.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setSelectedGuestForGuide(matched);
      setMaxPassesAvailable(matched.totalPasses);
      setConfirmedPasses(matched.confirmedPasses || matched.totalPasses);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setSubmissionFeedback({
        type: 'error',
        text: 'Por favor ingresa tu nombre completo.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    const finalDiet = dietaryRestrictions === 'Otro' ? customDietary : dietaryRestrictions;

    try {
      const result = await submitGuestRsvp(fullName, {
        fullName: fullName.trim(),
        rsvpStatus,
        confirmedPasses: rsvpStatus === 'confirmed' ? Number(confirmedPasses) : 0,
        dietaryRestrictions: finalDiet,
        confirmedRehearsalPhotoAttendance: selectedGuestForGuide?.isProtocolParticipant ? Boolean(confirmedRehearsalPhotos) : false,
        congratulationMessage: message,
      });

      if (result.success) {
        setSubmissionFeedback({
          type: 'success',
          text: result.message,
        });

        // Trigger Festive Confetti if confirmed!
        if (rsvpStatus === 'confirmed') {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#2D3748', '#D4AF37', '#8A9A86', '#C5A880'],
            });
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (err) {
      setSubmissionFeedback({
        type: 'error',
        text: 'Ocurrió un error al guardar en la nube de Firebase. Por favor intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp-section" className="py-12 sm:py-16 bg-[#EBEBEB] scroll-mt-16">
      <div className="w-full mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] text-xs font-semibold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#2D3748]" />
            <span>Confirmación de Asistencia</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2A26]">
            Confirmar Asistencia (RSVP)
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268] max-w-md mx-auto mt-2">
            Por favor confirma tu presencia antes del <span className="font-semibold text-[#2D3748]">{formatRsvpDeadline(settings.rsvpDeadline, settings.weddingDate)}</span> para coordinar banquetes y logística protocolar.
          </p>
        </div>

        {/* RSVP Card Form (Reflects Mockup: Confirmar Asistencia con campos y rosas) */}
        <div className="bg-[#EBEBEB] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] relative">
          
          {/* Active Guest Notice if protocol */}
          {selectedGuestForGuide?.isProtocolParticipant && (
            <div className="mb-6 p-3.5 rounded-xl bg-linear-to-r from-[#D4AF37]/15 to-[#FAF6EE] border border-[#D4AF37]/40 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold text-[#2D2A26]">
                  Invitado con Rol Protocolar: {selectedGuestForGuide.protocolRoleTitle}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#2D3748]">
                Pases: {selectedGuestForGuide.totalPasses}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Nombre Completo */}
            <div>
              <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider">
                Nombre Completo del Invitado(s) <span className="text-[#2D3748]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="rsvp-input-fullname"
                  required
                  value={fullName}
                  onChange={handleNameChange}
                  placeholder="Ej. Carlos Mendoza Garza"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 2. ¿Asistirás? (Radio / Pills) */}
            <div>
              <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider">
                ¿Asistirás a nuestra boda? <span className="text-[#2D3748]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="rsvp-status-yes"
                  onClick={() => setRsvpStatus('confirmed')}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    rsvpStatus === 'confirmed'
                      ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent shadow-xs ring-2 ring-[#d1d1d1]/20'
                      : 'bg-[#FAF8F5] text-[#524B42] border-[#D9CEBF] hover:bg-[#EFEAE2]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Sí, con mucho gusto!</span>
                </button>

                <button
                  type="button"
                  id="rsvp-status-no"
                  onClick={() => setRsvpStatus('declined')}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    rsvpStatus === 'declined'
                      ? 'bg-[#4A5568] text-[#2D3748] border-[#4A5568] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#7A7268] border-[#D9CEBF] hover:bg-[#EFEAE2]'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>No podré asistir</span>
                </button>
              </div>
            </div>

            {/* 3. Número de pases confirmados (solo si confirmed) */}
            {rsvpStatus === 'confirmed' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider flex items-center justify-between">
                    <span>Número de Pases Confirmados</span>
                    <span className="text-[11px] text-[#7A7268] font-normal">(Asignados: {maxPassesAvailable})</span>
                  </label>
                  <div className="relative">
                    <select
                      id="rsvp-select-passes"
                      value={confirmedPasses}
                      onChange={(e) => setConfirmedPasses(Number(e.target.value))}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30 appearance-none font-medium"
                    >
                      {Array.from({ length: Math.max(maxPassesAvailable, 4) }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Pase Confirmado' : 'Pases Confirmados'}
                        </option>
                      ))}
                    </select>
                    <Users className="w-4 h-4 text-[#9E9488] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Restricciones dietarias */}
                <div>
                  <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider">
                    Restricciones Alimentarias / Alergias
                  </label>
                  <div className="relative">
                    <select
                      id="rsvp-select-dietary"
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30 appearance-none"
                    >
                      <option value="Ninguna">Ninguna / Todo</option>
                      <option value="Vegetariana">Menú Vegetariano</option>
                      <option value="Vegana">Menú Vegano</option>
                      <option value="Sin Gluten (Celíaco)">Sin Gluten (Celíaco)</option>
                      <option value="Sin Lácteos">Intolerancia a Lácteos</option>
                      <option value="Alérgico a Mariscos / Frutos Secos">Alergia Mariscos/Frutos Secos</option>
                      <option value="Otro">Otro (Especificar)</option>
                    </select>
                    <Utensils className="w-4 h-4 text-[#9E9488] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Custom dietary field if selected Otro */}
            {dietaryRestrictions === 'Otro' && rsvpStatus === 'confirmed' && (
              <div className="animate-fadeIn">
                <input
                  type="text"
                  value={customDietary}
                  onChange={(e) => setCustomDietary(e.target.value)}
                  placeholder="Por favor detalla alergias o requerimientos específicos..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            )}

            {/* 5. Protocol Rehearsal / Photo check if protocol participant */}
            {selectedGuestForGuide?.isProtocolParticipant && rsvpStatus === 'confirmed' && (
              <div className="p-4 rounded-xl bg-[#8A9A86]/10 border border-[#8A9A86]/30 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="rsvp-check-rehearsal"
                  checked={confirmedRehearsalPhotos}
                  onChange={(e) => setConfirmedRehearsalPhotos(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#2D3748] mt-0.5 cursor-pointer accent-[#2D3748]"
                />
                <label htmlFor="rsvp-check-rehearsal" className="text-xs text-[#2D2A26] cursor-pointer">
                  <span className="font-bold">Confirmo mi asistencia al ensayo general y fotos previas</span> del cortejo protocolar según el horario indicado en mi guía ({selectedGuestForGuide.specialArrivalTime || '15:15 hrs'}).
                </label>
              </div>
            )}

            {/* 6. Mensaje de felicitación para los novios */}
            <div>
              <label className="block text-xs font-bold text-[#524B42] mb-1.5 uppercase tracking-wider flex items-center space-x-1">
                <MessageSquareHeart className="w-3.5 h-3.5 text-[#2D3748]" />
                <span>Mensaje de Felicitación o Deseos para los Novios</span>
              </label>
              <textarea
                id="rsvp-input-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí unas palabras para Sofía & Alejandro..."
                className="w-full p-3.5 text-sm rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submission Feedback Message */}
            {submissionFeedback && (
              <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
                submissionFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submissionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{submissionFeedback.text}</span>
              </div>
            )}

            {/* Submit Button (Neumorphic Style) */}
            <button
              type="submit"
              id="btn-submit-rsvp"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-sm transition-all duration-300 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4 text-gray-700" />
              <span>{isSubmitting ? 'Enviando Confirmación...' : 'Enviar Mi Confirmación'}</span>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};
