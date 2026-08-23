import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  PlusCircle, 
  Heart, 
  Calendar, 
  MapPin, 
  Church, 
  Sparkles, 
  X, 
  Check, 
  Loader2 
} from 'lucide-react';

export const NewWeddingModal: React.FC = () => {
  const { 
    showNewWeddingModal, 
    setShowNewWeddingModal, 
    createNewWedding, 
    isLevel1Admin,
    isLevel3Planner,
    currentUser
  } = useWedding();

  const [coupleNames, setCoupleNames] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('2027-03-20T18:00:00');
  const [locationSummary, setLocationSummary] = useState('');
  const [ceremonyVenueName, setCeremonyVenueName] = useState('');
  const [receptionVenueName, setReceptionVenueName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showNewWeddingModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim() || !locationSummary.trim()) return;

    setIsSubmitting(true);
    try {
      await createNewWedding({
        coupleNames: coupleNames.trim(),
        brideName: brideName.trim() || coupleNames.split('&')[0]?.trim() || 'Novia',
        groomName: groomName.trim() || coupleNames.split('&')[1]?.trim() || 'Novio',
        weddingDate: weddingDate || new Date().toISOString(),
        locationSummary: locationSummary.trim(),
        ceremonyVenueName: ceremonyVenueName.trim() || 'Capilla / Parroquia Principal',
        receptionVenueName: receptionVenueName.trim() || 'Salón / Jardín de Eventos',
      });
      setIsSubmitting(false);
      // Reset form
      setCoupleNames('');
      setBrideName('');
      setGroomName('');
      setLocationSummary('');
      setCeremonyVenueName('');
      setReceptionVenueName('');
    } catch (err) {
      console.error('Error al crear nueva boda:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8DCCF]">
        
        {/* Modal Header */}
        <div className="bg-[#8B3A4A] text-white p-6 relative">
          <button
            onClick={() => setShowNewWeddingModal(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#E8DCCF] uppercase block">
                {isLevel1Admin ? 'Nivel 1 • Super Administrador' : isLevel3Planner ? `Nivel 3 • Wedding Planner (${currentUser.username})` : currentUser.username}
              </span>
              <h3 className="font-serif-display text-xl font-bold text-white">
                Crear Nueva Boda
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#E8DCCF] font-light">
            Se creará un nuevo paquete de boda en Firestore con la lista maestra de 6 fases y cronograma inicial listo para editar.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold text-[#524B42] mb-1">
              Nombres de los Novios <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Heart className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8276]" />
              <input
                type="text"
                required
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="Ej. Isabella & Sebastián"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Nombre de la Novia
              </label>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Isabella Gómez"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Nombre del Novio
              </label>
              <input
                type="text"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Sebastián Ruiz"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Fecha del Evento <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                <input
                  type="datetime-local"
                  required
                  value={weddingDate.slice(0, 16)}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Ciudad / Destino <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                <input
                  type="text"
                  required
                  value={locationSummary}
                  onChange={(e) => setLocationSummary(e.target.value)}
                  placeholder="Ej. San Miguel de Allende, Gto."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Lugar de Ceremonia
              </label>
              <div className="relative">
                <Church className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                <input
                  type="text"
                  value={ceremonyVenueName}
                  onChange={(e) => setCeremonyVenueName(e.target.value)}
                  placeholder="Parroquia San Miguel Arcángel"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524B42] mb-1">
                Lugar de Recepción / Fiesta
              </label>
              <input
                type="text"
                value={receptionVenueName}
                onChange={(e) => setReceptionVenueName(e.target.value)}
                placeholder="Hacienda Las Trancas"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E8DCCF] rounded-xl p-3.5 space-y-1.5 text-xs text-[#6B6358]">
            <div className="flex items-center space-x-1.5 text-[#8B3A4A] font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-configuración Inteligente Incluida:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Checklist de 6 Fases Cronológicas completas (12 meses hasta Post-Boda).</li>
              <li>Cronograma minuto a minuto personalizable.</li>
              <li>Control de presupuesto con categorías de la industria.</li>
              <li>Generador de códigos de pase y guía protocolar para cortejo y padrinos.</li>
            </ul>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E8DCCF]">
            <button
              type="button"
              onClick={() => setShowNewWeddingModal(false)}
              className="px-4 py-2 text-xs font-semibold text-[#6B6358] hover:bg-[#EFEAE2] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando Boda en Firestore...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Boda y Abrir Panel</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
