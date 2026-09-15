import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest } from '../../types';
import { isRsvpDeadlinePassed } from '../../lib/dateUtils';
import { 
  Search, 
  Crown, 
  Clock, 
  Camera, 
  Sparkles, 
  Shirt, 
  Flower2, 
  Milestone, 
  CheckCircle2, 
  UserCheck, 
  MapPin, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';

export const ProtocolPassLookup: React.FC = () => {
  const { 
    guests, 
    settings,
    findGuestByQuery, 
    updateGuest, 
    selectedGuestForGuide, 
    setSelectedGuestForGuide 
  } = useWedding();

  const isDeadlinePassed = isRsvpDeadlinePassed(settings.rsvpDeadline);

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  if (isDeadlinePassed) {
    return null;
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = findGuestByQuery(searchQuery);
    setSelectedGuestForGuide(matched || null);
    setHasSearched(true);
  };

  const handleSelectQuickGuest = (guest: Guest) => {
    setSelectedGuestForGuide(guest);
    setSearchQuery(guest.fullName);
    setHasSearched(true);
  };

  const handleConfirmProtocolAttendance = (guestId: string, confirmed: boolean) => {
    updateGuest(guestId, { confirmedRehearsalPhotoAttendance: confirmed });
    setSaveSuccessMessage(
      confirmed 
        ? '¡Excelente! Hemos confirmado tu asistencia al ensayo y sesión de fotos previas.' 
        : 'Hemos registrado tu aviso respecto al ensayo/fotos.'
    );
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const scrollToRsvp = () => {
    const el = document.getElementById('rsvp-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Sample quick buttons for testing
  const demoGuests = guests.slice(0, 5);

  return (
    <section id="protocol-lookup-section" className="py-12 sm:py-16 bg-[#EBEBEB] scroll-mt-20">
      <div className="w-full mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#8B6B23] text-xs font-semibold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>Pase Digital & Protocolo</span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2A26]">
            Consulta de Invitación & Guía Protocolar
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268] max-w-lg mx-auto mt-2">
            Ingresa tu nombre completo o código de pase para acceder a tu invitación digital, mesa asignada e indicaciones especiales si formas parte del cortejo o programa.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-[#EBEBEB] rounded-2xl p-4 sm:p-6 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] border border-transparent mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9488]" />
              <input
                type="text"
                id="input-guest-lookup"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasSearched(false);
                }}
                placeholder="Ej. Carlos Mendoza, Mariana Valenzuela, o código de pase..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[#D9CEBF] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/30 focus:border-transparent bg-[#FAF8F5] transition-all"
              />
            </div>
            <button
              type="submit"
              id="btn-search-guest"
              className="px-6 py-3 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] font-semibold text-sm rounded-xl hover:bg-[#EBEBEB] transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Consultar Mi Pase</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pickers */}
          <div className="mt-4 pt-3 border-t border-[#F2ECE3]">
            <span className="text-[11px] font-semibold text-[#8C8276] uppercase tracking-wider block mb-2">
              Perfiles de demostración rápida para probar la guía:
            </span>
            <div className="flex flex-wrap gap-2">
              {demoGuests.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectQuickGuest(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    selectedGuestForGuide?.id === g.id
                      ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent shadow-xs'
                      : 'bg-[#F7F3ED] text-[#524B42] border-[#E5DACD] hover:bg-[#EFE7DC]'
                  }`}
                >
                  <span className="font-medium">{g.fullName.split(' ')[0]}</span>
                  {g.protocolRoleTitle && (
                    <span className="opacity-80 text-[10px] ml-1">({g.protocolRoleTitle.split(' ')[0]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Display */}
        {hasSearched && !selectedGuestForGuide && (
          <div className="p-6 rounded-2xl bg-[#EBEBEB] border border-transparent text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
            <h3 className="font-serif-display text-lg font-bold text-[#2D2A26]">No encontramos una invitación con ese nombre</h3>
            <p className="text-xs text-[#7A7268] max-w-md mx-auto mt-1 mb-4">
              Por favor verifica la ortografía o intenta buscar usando tu primer nombre y apellido. También puedes registrarte directamente en el formulario de RSVP.
            </p>
            <button
              onClick={scrollToRsvp}
              className="px-5 py-2 text-xs font-semibold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 rounded-lg hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/20 transition-colors"
            >
              Ir a Confirmar Asistencia Directamente
            </button>
          </div>
        )}

        {/* Guest Found Card */}
        {selectedGuestForGuide && (
          <div className="space-y-6">
            
            {/* Success toast notification */}
            {saveSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            {/* A. PROTOCOL PARTICIPANT SPECIAL CARD ("Tu Guía Protocolar") */}
            {selectedGuestForGuide.isProtocolParticipant ? (
              <div className="rounded-2xl sm:rounded-3xl bg-linear-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE4] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] relative overflow-hidden">
                {/* Gold Ribbon Badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-linear-to-r from-[#D4AF37] to-[#C5A880] text-[#2D2A26] font-bold text-[10px] sm:text-xs px-4 py-1 rounded-bl-xl shadow-xs flex items-center space-x-1 uppercase tracking-wider">
                    <Crown className="w-3 h-3 text-[#2D2A26]" />
                    <span>Cortejo & Protocolo Oficial</span>
                  </div>
                </div>

                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DEC8]">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#8A9A86]/20 text-[#3C5038] text-xs font-semibold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#8A9A86]" />
                      <span>{selectedGuestForGuide.protocolRoleTitle || 'Participante Protocolar'}</span>
                    </div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                      {selectedGuestForGuide.fullName}
                    </h3>
                    <p className="text-xs text-[#7A7268] mt-0.5">
                      Código de Pase: <span className="font-mono font-bold text-[#2D3748]">{selectedGuestForGuide.code}</span> • Mesa: <span className="font-medium text-[#2D2A26]">{selectedGuestForGuide.assignedTable || 'Por asignar'}</span> • Pases: <span className="font-bold text-[#2D2A26]">{selectedGuestForGuide.totalPasses}</span>
                    </p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                      selectedGuestForGuide.rsvpStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : selectedGuestForGuide.rsvpStatus === 'declined'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {selectedGuestForGuide.rsvpStatus === 'confirmed' ? 'Asistencia Confirmada' : selectedGuestForGuide.rsvpStatus === 'declined' ? 'Declinada' : 'Pendiente de Confirmar'}
                    </span>
                  </div>
                </div>

                {/* PROTOCOL GUIDELINES GRID */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D3748] mb-4 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Tu Guía Protocolar Exclusiva para el Gran Día</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item 1: Arrival & Schedule */}
                    <div className="bg-[#EBEBEB] rounded-xl p-4 border border-[#EBDDC9] shadow-xs">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#2D2A26] mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>Horario Especial de Llegada</span>
                      </div>
                      <p className="text-xs text-[#2D3748] font-bold">
                        {selectedGuestForGuide.specialArrivalTime || '15:30 hrs'}
                      </p>
                      <p className="text-[11px] text-[#7A7268] mt-1">
                        Se solicita puntualidad estricta para coordinar la entrada solemne y colocación de distintivos.
                      </p>
                    </div>

                    {/* Item 2: Rehearsal & Photos */}
                    <div className="bg-[#EBEBEB] rounded-xl p-4 border border-[#EBDDC9] shadow-xs">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#2D2A26] mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-[#8A9A86]/20 text-[#3C5038] flex items-center justify-center">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span>Ensayo y Sesión Fotográfica Previa</span>
                      </div>
                      <p className="text-xs text-[#3C5038] font-semibold">
                        {selectedGuestForGuide.photoshootSchedule || 'Sábado 24 de Octubre, 15:45 hrs'}
                      </p>
                      <p className="text-[11px] text-[#7A7268] mt-1">
                        Ensayo general: {selectedGuestForGuide.rehearsalSchedule || 'Viernes 23 de Octubre, 17:00 hrs en Capilla'}
                      </p>
                    </div>

                    {/* Item 3: Dress Code & Accessories */}
                    <div className="bg-[#EBEBEB] rounded-xl p-4 border border-[#EBDDC9] shadow-xs">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#2D2A26] mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 text-[#8B6B23] flex items-center justify-center">
                          <Shirt className="w-4 h-4" />
                        </div>
                        <span>Indicación de Vestuario & Distintivo</span>
                      </div>
                      <p className="text-xs text-[#524B42]">
                        {selectedGuestForGuide.dressCodeNote || 'Etiqueta formal de acuerdo a la paleta protocolar.'}
                      </p>
                      {selectedGuestForGuide.accessoryAssigned && (
                        <div className="mt-2 pt-2 border-t border-[#F2ECE3] flex items-start space-x-1.5 text-[11px] text-[#2D3748] font-medium">
                          <Flower2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>{selectedGuestForGuide.accessoryAssigned}</span>
                        </div>
                      )}
                    </div>

                    {/* Item 4: Assigned Milestone */}
                    <div className="bg-[#EBEBEB] rounded-xl p-4 border border-[#EBDDC9] shadow-xs">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#2D2A26] mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-[#2C3E50]/10 text-[#2C3E50] flex items-center justify-center">
                          <Milestone className="w-4 h-4" />
                        </div>
                        <span>Hito Asignado en el Minuto a Minuto</span>
                      </div>
                      <p className="text-xs text-[#2C3E50] font-bold">
                        {selectedGuestForGuide.assignedMilestone || 'Participación activa en el cortejo principal'}
                      </p>
                      <p className="text-[11px] text-[#7A7268] mt-1">
                        El Maestro de Ceremonias y Wedding Planner te asistirán 5 minutos antes de este momento.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Rehearsal / Photo Attendance Confirmation */}
                  <div className="mt-5 p-4 rounded-xl bg-[#EBEBEB]/80 border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-left">
                      <CalendarCheck className="w-5 h-5 text-[#2D3748] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[#2D2A26]">
                          ¿Confirmas tu asistencia al ensayo y sesión de fotos previas?
                        </p>
                        <p className="text-[11px] text-[#7A7268]">
                          Estado actual: <span className="font-semibold text-[#2D3748]">{selectedGuestForGuide.confirmedRehearsalPhotoAttendance ? 'Sí asistiré al ensayo/fotos' : 'Pendiente de confirmar ensayo'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleConfirmProtocolAttendance(selectedGuestForGuide.id, true)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedGuestForGuide.confirmedRehearsalPhotoAttendance
                            ? 'bg-[#8A9A86] text-[#2D3748] shadow-xs'
                            : 'bg-[#EFEAE2] text-[#524B42] hover:bg-[#8A9A86]/20'
                        }`}
                      >
                        ✓ Sí, estaré puntual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmProtocolAttendance(selectedGuestForGuide.id, false)}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedGuestForGuide.confirmedRehearsalPhotoAttendance === false
                            ? 'bg-rose-600 text-[#2D3748]'
                            : 'bg-[#EFEAE2] text-[#7A7268] hover:bg-rose-50'
                        }`}
                      >
                        Avisar retraso
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer action to RSVP */}
                <div className="mt-6 pt-4 border-t border-[#E8DEC8] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-[#7A7268] text-center sm:text-left">
                    ¿Deseas actualizar el número de acompañantes o requerimientos alimentarios?
                  </p>
                  <button
                    onClick={scrollToRsvp}
                    className="px-5 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold rounded-xl hover:bg-[#EBEBEB] transition-colors shadow-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Completar Formulario de RSVP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* B. GENERAL GUEST CARD */
              <div className="rounded-2xl sm:rounded-3xl bg-[#EBEBEB] border border-transparent p-6 sm:p-8 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F2ECE3]">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8A9A86]/15 text-[#4A5D46] mb-2">
                      Invitación General
                    </span>
                    <h3 className="font-serif-display text-2xl font-bold text-[#2D2A26]">
                      {selectedGuestForGuide.fullName}
                    </h3>
                    <p className="text-xs text-[#7A7268] mt-1">
                      Código de Pase: <span className="font-mono font-bold text-[#2D3748]">{selectedGuestForGuide.code}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedGuestForGuide.rsvpStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedGuestForGuide.rsvpStatus === 'confirmed' ? 'Asistencia Confirmada' : 'Pendiente de Confirmar'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                    <span className="text-[11px] font-semibold text-[#8C8276] uppercase block">Pases Asignados</span>
                    <span className="text-lg font-serif-display font-bold text-[#2D2A26]">{selectedGuestForGuide.totalPasses} Persona(s)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                    <span className="text-[11px] font-semibold text-[#8C8276] uppercase block">Mesa Asignada</span>
                    <span className="text-lg font-serif-display font-bold text-[#2D2A26]">{selectedGuestForGuide.assignedTable || 'Mesa por definir'}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                    <span className="text-[11px] font-semibold text-[#8C8276] uppercase block">Restricciones Dietarias</span>
                    <span className="text-xs text-[#524B42] font-medium block mt-1">{selectedGuestForGuide.dietaryRestrictions || 'Ninguna especificada'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <button
                    onClick={scrollToRsvp}
                    className="px-6 py-2.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold rounded-xl hover:bg-[#EBEBEB] transition-colors flex items-center space-x-2"
                  >
                    <span>Actualizar Mi Asistencia (RSVP)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
