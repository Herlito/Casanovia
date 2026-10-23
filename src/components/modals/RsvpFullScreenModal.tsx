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
  X,
  CalendarCheck,
  Check,
  Music
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RsvpFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RsvpFullScreenModal: React.FC<RsvpFullScreenModalProps> = ({ isOpen, onClose }) => {
  const { 
    guests, 
    settings,
    submitGuestRsvp, 
    selectedGuestForGuide, 
    setSelectedGuestForGuide,
    addGuest,
    updateGuest,
    deleteGuest
  } = useWedding();

  const [fullName, setFullName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('confirmed');
  const [confirmedPasses, setConfirmedPasses] = useState<number>(2);
  const [maxPassesAvailable, setMaxPassesAvailable] = useState<number>(2);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('Ninguna');
  const [customDietary, setCustomDietary] = useState('');
  const [confirmedRehearsalPhotos, setConfirmedRehearsalPhotos] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [songSuggestion, setSongSuggestion] = useState('');
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Lock body scroll while modal is open & listen for ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync with selectedGuestForGuide when set elsewhere in the app
  useEffect(() => {
    if (selectedGuestForGuide) {
      setFullName(selectedGuestForGuide.fullName);
      setInvitationCode(selectedGuestForGuide.code || '');
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
  }, [selectedGuestForGuide, isOpen]);

  // Sync companionNames array when confirmedPasses or selectedGuestForGuide changes
  useEffect(() => {
    if (isOpen) {
      const neededCompanions = Math.max(0, confirmedPasses - 1);
      const existingComps = selectedGuestForGuide
        ? guests.filter(g => g.mainGuestId === selectedGuestForGuide.id)
        : [];

      setCompanionNames(prev => {
        const updated = [];
        for (let i = 0; i < neededCompanions; i++) {
          if (existingComps[i]) {
            updated.push(existingComps[i].fullName);
          } else if (prev[i] !== undefined) {
            updated.push(prev[i]);
          } else {
            updated.push('');
          }
        }
        return updated;
      });
    }
  }, [selectedGuestForGuide, confirmedPasses, guests, isOpen]);

  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  if (!isOpen || isDeadlinePassed) return null;

  // Filter guest suggestions for autocomplete
  const filteredSuggestions = searchQuery.trim().length >= 2 
    ? guests.filter(g => g.fullName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSelectGuest = (guest: typeof guests[0]) => {
    setSelectedGuestForGuide(guest);
    setFullName(guest.fullName);
    setInvitationCode(guest.code || '');
    setSearchQuery('');
    setShowSuggestions(false);
    setMaxPassesAvailable(guest.totalPasses || 2);
    setConfirmedPasses(guest.confirmedPasses || guest.totalPasses || 1);
    if (guest.rsvpStatus) {
      setRsvpStatus(guest.rsvpStatus);
    }
    if (guest.congratulationMessage) {
      setMessage(guest.congratulationMessage);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInvitationCode(val);
    
    if (val.trim()) {
      const matched = guests.find(g => g.code && g.code.trim().toLowerCase() === val.trim().toLowerCase());
      if (matched) {
        setSelectedGuestForGuide(matched);
        setFullName(matched.fullName);
        setMaxPassesAvailable(matched.totalPasses || 1);
        setConfirmedPasses(matched.confirmedPasses || matched.totalPasses || 1);
        if (matched.rsvpStatus) setRsvpStatus(matched.rsvpStatus);
      }
    } else {
      setSelectedGuestForGuide(null);
      setFullName('');
      setMaxPassesAvailable(2);
      setConfirmedPasses(2);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    setSearchQuery(val);
    setShowSuggestions(val.trim().length >= 2);
    
    // Auto-match guest from database
    const matched = guests.find(g => g.fullName.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      setSelectedGuestForGuide(matched);
      setInvitationCode(matched.code || '');
      setMaxPassesAvailable(matched.totalPasses || 2);
      setConfirmedPasses(matched.confirmedPasses || matched.totalPasses || 1);
      if (matched.rsvpStatus) setRsvpStatus(matched.rsvpStatus);
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

    // Verify companion names are provided and non-empty
    if (rsvpStatus === 'confirmed' && confirmedPasses > 1) {
      const neededCompanions = confirmedPasses - 1;
      for (let i = 0; i < neededCompanions; i++) {
        if (!companionNames[i] || !companionNames[i].trim()) {
          setSubmissionFeedback({
            type: 'error',
            text: `Por favor ingresa el nombre de todos los acompañantes asignados (Acompañante ${i + 1} es obligatorio).`,
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    setSubmissionFeedback(null);

    const finalDiet = dietaryRestrictions === 'Otro' ? customDietary : dietaryRestrictions;

    try {
      const fullCongratulation = songSuggestion.trim() 
        ? `${message ? message.trim() + '\n\n' : ''}🎵 Canción sugerida: ${songSuggestion.trim()}`
        : message.trim();

      const result = await submitGuestRsvp(invitationCode || fullName, {
        fullName: fullName.trim(),
        rsvpStatus,
        confirmedPasses: rsvpStatus === 'confirmed' ? Number(confirmedPasses) : 0,
        dietaryRestrictions: finalDiet,
        confirmedRehearsalPhotoAttendance: selectedGuestForGuide?.isProtocolParticipant ? Boolean(confirmedRehearsalPhotos) : false,
        congratulationMessage: fullCongratulation,
      });

      if (result.success) {
        // Save companions if any, and if confirmed
        if (rsvpStatus === 'confirmed' && result.guest) {
          const mainGuestId = result.guest.id;
          const existingComps = guests.filter(g => g.mainGuestId === mainGuestId);

          for (let i = 0; i < companionNames.length; i++) {
            const compName = companionNames[i]?.trim();
            if (compName) {
              if (existingComps[i]) {
                // Update existing companion name and sync status
                await updateGuest(existingComps[i].id, {
                  fullName: compName,
                  rsvpStatus: 'confirmed',
                  confirmedPasses: 1,
                  category: result.guest.category || 'invitado',
                  assignedTable: result.guest.assignedTable || 'Mesa por asignar'
                });
              } else {
                // Add new companion linked to this main guest
                await addGuest({
                  fullName: compName,
                  code: '',
                  category: result.guest.category || 'invitado',
                  isProtocolParticipant: false,
                  totalPasses: 1,
                  confirmedPasses: 1,
                  rsvpStatus: 'confirmed',
                  mainGuestId: mainGuestId,
                  assignedTable: result.guest.assignedTable || 'Mesa por asignar'
                });
              }
            }
          }

          // If there were more companions historically, delete the unused ones
          if (existingComps.length > companionNames.length) {
            for (let i = companionNames.length; i < existingComps.length; i++) {
              await deleteGuest(existingComps[i].id);
            }
          }
        } else if (rsvpStatus === 'declined' && result.guest) {
          // Sync decline to companions too
          const mainGuestId = result.guest.id;
          const existingComps = guests.filter(g => g.mainGuestId === mainGuestId);
          for (const comp of existingComps) {
            await updateGuest(comp.id, {
              rsvpStatus: 'declined',
              confirmedPasses: 0
            });
          }
        }

        setIsSuccess(true);
        setSubmissionFeedback({
          type: 'success',
          text: result.message,
        });

        // Trigger Festive Confetti if confirmed!
        if (rsvpStatus === 'confirmed') {
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#2D3748', '#D4AF37', '#8A9A86', '#C5A880'],
            });
          } catch (err) {
            // ignore
          }
        }
      } else {
        setSubmissionFeedback({
          type: 'error',
          text: result.message || 'Error al enviar la confirmación.',
        });
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
    <div 
      id="rsvp-fullscreen-modal"
      className="fixed inset-0 z-[1000] bg-[#EBEBEB] text-[#2D2A26] overflow-y-auto flex flex-col font-sans animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Sticky Top Bar (Neumorphic) */}
      <header className="sticky top-0 z-30 bg-[#EBEBEB]/95 backdrop-blur-md px-4 sm:px-6 py-2 border-b border-gray-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] relative flex items-center justify-center min-h-[56px]">
        {/* Centered title, icon & event name */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4 fill-[#2D3748] text-[#2D3748]" />
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-none">
              Confirmar Asistencia (RSVP)
            </h1>
          </div>
          <p className="text-[11px] font-medium text-gray-500 leading-none">
            {settings.coupleNames ? `Boda ${settings.coupleNames}` : 'Invitación Oficial'}
          </p>
        </div>

        {/* Close Button (Neumorphic - X icon only) */}
        <div className="absolute right-4 sm:right-8">
          <button
            type="button"
            id="btn-close-rsvp-fullscreen"
            onClick={onClose}
            className="p-3 rounded-2xl bg-[#EBEBEB] text-gray-700 transition-all duration-300 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl mx-auto">
          
          {/* Header Description */}
          <div className="text-center mb-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              ¡Estás invitado a nuestro Gran Día!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
              Favor de confirmar tu presencia antes del{' '}
              <span className="font-bold text-[#2D3748]">
                {formatRsvpDeadline(settings.rsvpDeadline, settings.weddingDate)}
              </span>{' '}
              para brindarte la atención que mereces.
            </p>
          </div>

          {/* Success State View */}
          {isSuccess ? (
            <div className="bg-[#EBEBEB] rounded-[2.5rem] p-8 sm:p-12 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {rsvpStatus === 'confirmed' ? '¡Asistencia Confirmada!' : 'Respuesta Registrada'}
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  {rsvpStatus === 'confirmed'
                    ? `Muchas gracias, ${fullName}. Tu asistencia (${confirmedPasses} ${confirmedPasses === 1 ? 'pase' : 'pases'}) ha sido confirmada en tiempo real.`
                    : `Gracias por notificarnos, ${fullName}. Lamentamos que no puedas asistir, pero llevaremos tu cariño en nuestros corazones.`}
                </p>
              </div>

              {message && (
                <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-xs text-gray-700 italic max-w-md mx-auto">
                  "{message}"
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-xs uppercase tracking-wider shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer"
                >
                  Volver a la Invitación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmissionFeedback(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-[#EBEBEB] text-gray-600 font-semibold text-xs transition-all hover:text-gray-900 cursor-pointer"
                >
                  Modificar otra respuesta
                </button>
              </div>
            </div>
          ) : (
            /* Neumorphic Form Container */
            <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 sm:p-10 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] relative">
              
              {/* Active Protocol Participant Notice */}
              {selectedGuestForGuide?.isProtocolParticipant && (
                <div className="mb-6 p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-bold text-gray-800">
                      Rol Protocolar: {selectedGuestForGuide.protocolRoleTitle}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 bg-[#EBEBEB] px-2.5 py-1 rounded-full shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]">
                    Pases Asignados: {selectedGuestForGuide.totalPasses}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Código de Invitación Input */}
                <div className="relative w-full sm:w-1/2 max-w-sm mx-auto text-center">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">
                    Código de Invitación (Manual o Impreso)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={invitationCode}
                      onChange={handleCodeChange}
                      placeholder=""
                      className="w-full px-5 py-4 text-sm font-medium rounded-2xl bg-white text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all uppercase text-center"
                    />
                    <Sparkles className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">
                    Si tienes un código, escríbelo aquí para cargar tus pases automáticamente.
                  </p>
                </div>

                {/* 1. Nombre Completo with live search suggestions */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Confirma tu nombre <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="rsvp-modal-input-fullname"
                      required
                      value={fullName}
                      onChange={handleNameChange}
                      onFocus={() => {
                        if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                      }}
                      placeholder="Confirma tu nombre"
                      className="w-full px-5 py-4 text-sm font-medium rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden focus:shadow-[inset_6px_6px_12px_#c8c8c8,inset_-6px_-6px_12px_#ffffff] transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 p-2 bg-[#EBEBEB] rounded-2xl shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-gray-200/50 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                        Sugerencias encontradas en la lista:
                      </p>
                      {filteredSuggestions.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleSelectGuest(g)}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/80 active:bg-gray-100 flex items-center justify-between text-xs transition-colors cursor-pointer"
                        >
                          <span className="font-bold text-gray-800">{g.fullName}</span>
                          <span className="text-[11px] text-gray-500">{g.totalPasses} {g.totalPasses === 1 ? 'pase' : 'pases'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. ¿Asistirás? (Radio buttons Neumorphic) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    ¿Asistirás a nuestra boda? <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="rsvp-modal-status-yes"
                      onClick={() => setRsvpStatus('confirmed')}
                      className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                        rsvpStatus === 'confirmed'
                          ? 'bg-[#EBEBEB] text-emerald-700 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
                          : 'bg-[#EBEBEB] text-gray-700 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff]'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${rsvpStatus === 'confirmed' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>¡Sí, con mucho gusto!</span>
                    </button>

                    <button
                      type="button"
                      id="rsvp-modal-status-no"
                      onClick={() => setRsvpStatus('declined')}
                      className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer ${
                        rsvpStatus === 'declined'
                          ? 'bg-[#EBEBEB] text-rose-700 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]'
                          : 'bg-[#EBEBEB] text-gray-700 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff]'
                      }`}
                    >
                      <XCircle className={`w-4 h-4 ${rsvpStatus === 'declined' ? 'text-rose-600' : 'text-gray-400'}`} />
                      <span>No podré asistir</span>
                    </button>
                  </div>
                </div>

                {/* 3. Passes & Dietary Restrictions (Only if confirmed) */}
                {rsvpStatus === 'confirmed' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    {/* Número de pases */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Pases Confirmados</span>
                        <span className="text-[10px] text-gray-400 font-normal">Máx: {maxPassesAvailable}</span>
                      </label>
                      <div className="relative">
                        <select
                          id="rsvp-modal-select-passes"
                          value={confirmedPasses}
                          onChange={(e) => setConfirmedPasses(Number(e.target.value))}
                          className="w-full px-4 py-3.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden appearance-none cursor-pointer"
                        >
                          {Array.from({ length: Math.max(maxPassesAvailable, 4) }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'Pase Confirmado' : 'Pases Confirmados'}
                            </option>
                          ))}
                        </select>
                        <Users className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Restricciones alimentarias */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Menú / Restricciones
                      </label>
                      <div className="relative">
                        <select
                          id="rsvp-modal-select-dietary"
                          value={dietaryRestrictions}
                          onChange={(e) => setDietaryRestrictions(e.target.value)}
                          className="w-full px-4 py-3.5 text-sm font-semibold rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden appearance-none cursor-pointer"
                        >
                          <option value="Ninguna">Menú Regular / Todo</option>
                          <option value="Vegetariana">Menú Vegetariano</option>
                          <option value="Vegana">Menú Vegano</option>
                          <option value="Sin Gluten (Celíaco)">Sin Gluten (Celíaco)</option>
                          <option value="Sin Lácteos">Intolerancia a Lácteos</option>
                          <option value="Alérgico a Mariscos / Frutos Secos">Alergia a Mariscos / Frutos Secos</option>
                          <option value="Otro">Otro requerimiento</option>
                        </select>
                        <Utensils className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Companion Name Inputs (Only if confirmedPasses > 1) */}
                    {confirmedPasses > 1 && (
                      <div className="col-span-1 sm:col-span-2 space-y-4 p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] animate-fadeIn mt-2">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span>Nombres de tus Acompañantes</span>
                        </p>
                        <div className="space-y-3">
                          {companionNames.map((name, index) => (
                            <div key={index} className="relative">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Acompañante {index + 1}
                              </label>
                              <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => {
                                  const updated = [...companionNames];
                                  updated[index] = e.target.value;
                                  setCompanionNames(updated);
                                }}
                                placeholder={`Escribe el nombre del acompañante ${index + 1}`}
                                className="w-full px-4 py-3 text-xs font-semibold rounded-xl bg-[#EBEBEB] text-gray-800 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] focus:outline-hidden focus:shadow-[inset_5px_5px_10px_#c8c8c8,inset_-5px_-5px_10px_#ffffff] transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Custom dietary field */}
                {dietaryRestrictions === 'Otro' && rsvpStatus === 'confirmed' && (
                  <div className="animate-fadeIn">
                    <input
                      type="text"
                      value={customDietary}
                      onChange={(e) => setCustomDietary(e.target.value)}
                      placeholder="Detalla alergias o especificaciones..."
                      className="w-full px-4 py-3 text-xs rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Protocol participant rehearsal checkbox */}
                {selectedGuestForGuide?.isProtocolParticipant && rsvpStatus === 'confirmed' && (
                  <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="rsvp-modal-check-rehearsal"
                      checked={confirmedRehearsalPhotos}
                      onChange={(e) => setConfirmedRehearsalPhotos(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#2D3748] mt-0.5 cursor-pointer accent-[#2D3748]"
                    />
                    <label htmlFor="rsvp-modal-check-rehearsal" className="text-xs text-gray-800 cursor-pointer leading-relaxed">
                      <span className="font-bold">Confirmo asistencia al ensayo y fotos del cortejo</span> según la guía protocolar ({selectedGuestForGuide.specialArrivalTime || 'Horario especial'}).
                    </label>
                  </div>
                )}

                {/* 5. Canción sugerida (opcional) */}
                {rsvpStatus === 'confirmed' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Music className="w-3.5 h-3.5 text-gray-500" />
                      <span>Canción que bailarás con nosotros (opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={songSuggestion}
                      onChange={(e) => setSongSuggestion(e.target.value)}
                      placeholder="Artista - Título de la canción"
                      className="w-full px-4 py-3 text-xs rounded-2xl bg-[#EBEBEB] text-gray-800 shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Feedback error or success */}
                {submissionFeedback && (
                  <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                    submissionFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {submissionFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{submissionFeedback.text}</span>
                  </div>
                )}

                {/* Submit button (Neumorphic) */}
                <button
                  type="submit"
                  id="btn-modal-submit-rsvp"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#EBEBEB] text-gray-900 font-bold text-sm transition-all duration-300 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4 text-gray-700" />
                  <span>{isSubmitting ? 'Registrando en la nube...' : 'Enviar'}</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
