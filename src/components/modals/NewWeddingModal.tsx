import React, { useState } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  PlusCircle, 
  Heart, 
  Calendar, 
  MapPin, 
  Church, 
  X, 
  Loader2,
  RotateCcw
} from 'lucide-react';

export const NewWeddingModal: React.FC = () => {
  const { 
    showNewWeddingModal, 
    setShowNewWeddingModal, 
    createNewWedding, 
    setViewMode,
    isLevel1Admin,
    isLevel3Planner,
    isLevel4Free,
    currentUser
  } = useWedding();
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [eventType, setEventType] = useState('Boda');
  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [locationSummary, setLocationSummary] = useState('');
  const [ceremonyVenueName, setCeremonyVenueName] = useState('');
  const [receptionVenueName, setReceptionVenueName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showNewWeddingModal) return null;

  const handleClearForm = () => {
    setCoupleNames('');
    setWeddingDate('');
    setLocationSummary('');
    setCeremonyVenueName('');
    setReceptionVenueName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim() || !locationSummary.trim()) return;

    setIsSubmitting(true);
    try {
      await createNewWedding({
        eventType: eventType || 'Boda',
        coupleNames: coupleNames.trim(),
        brideName: '',
        groomName: '',
        weddingDate: weddingDate.trim() || '',
        locationSummary: locationSummary.trim(),
        ceremonyVenueName: ceremonyVenueName.trim() || '',
        receptionVenueName: receptionVenueName.trim() || '',
        emptyFields: true,
      });
      setIsSubmitting(false);
      handleClearForm();
      setShowNewWeddingModal(false);
      setViewMode('new_wedding_tasks');
    } catch (err) {
      console.error('Error al crear nuevo evento:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] max-w-xl w-full overflow-hidden border border-gray-300/40">
        
        {/* Modal Header */}
        <div className="p-6 relative text-gray-800 border-b border-gray-300/60">
          <button
            id="btn-cancel-wedding-modal-top"
            onClick={() => setShowNewWeddingModal(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 hover:text-gray-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-gray-600 uppercase block">
                {isLevel1Admin ? 'Nivel 1 • Super Administrador' : isLevel3Planner ? `Nivel 3 • Wedding Planner (${currentUser.username})` : currentUser.username}
              </span>
              <h3 className="font-serif-display text-xl font-bold text-gray-900">
                Crear Nuevo Evento
              </h3>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            Se creará un evento con todos los registros vacios para que puedas personalizar totalmente
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Formulario de Registro</span>
            <button
              id="btn-clear-modal-fields"
              type="button"
              onClick={handleClearForm}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold text-gray-700 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] hover:text-gray-900 transition-all cursor-pointer"
              title="Vaciar todos los campos del formulario"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar campos</span>
            </button>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tipo de Evento <span className="text-rose-600">*</span>
            </label>
            <select
              value={isLevel4Free ? 'Boda' : eventType}
              onChange={(e) => setEventType(e.target.value)}
              disabled={isLevel4Free}
              className={`w-full px-4 py-2.5 text-xs text-gray-900 font-medium rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none ${isLevel4Free ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="Boda">Boda</option>
              {!isLevel4Free && (
                <>
                  <option value="Quinceañero">Quinceañero</option>
                  <option value="Fiesta de Promoción">Fiesta de Promoción</option>
                  <option value="Aniversario">Aniversario</option>
                  <option value="Corporativo">Corporativo</option>
                  <option value="Baby Shower">Baby Shower</option>
                  <option value="Graduación">Graduación</option>
                  <option value="Otro">Otro</option>
                </>
              )}
            </select>
            {isLevel4Free && (
              <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                Plan Novia Free: Exclusivo para bodas (otros tipos de evento bloqueados).
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nombre del Evento <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Heart className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                required
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="Ej. Isabella & Sebastián"
                className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-900 font-medium placeholder:text-gray-500 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Fecha del Evento <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="datetime-local"
                  required
                  value={weddingDate ? weddingDate.slice(0, 16) : ''}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-900 font-medium placeholder:text-gray-500 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Ciudad / Destino <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={locationSummary}
                  onChange={(e) => setLocationSummary(e.target.value)}
                  placeholder="Ej. San Miguel de Allende, Gto."
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-900 font-medium placeholder:text-gray-500 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Lugar de Ceremonia
              </label>
              <div className="relative">
                <Church className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={ceremonyVenueName}
                  onChange={(e) => setCeremonyVenueName(e.target.value)}
                  placeholder="Parroquia San Miguel Arcángel"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-gray-900 font-medium placeholder:text-gray-500 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Lugar de Recepción / Fiesta
              </label>
              <input
                type="text"
                value={receptionVenueName}
                onChange={(e) => setReceptionVenueName(e.target.value)}
                placeholder="Hacienda Las Trancas"
                className="w-full px-4 py-2.5 text-xs text-gray-900 font-medium placeholder:text-gray-500 rounded-xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-300/60">
            <button
              id="btn-cancel-wedding-modal"
              type="button"
              onClick={() => setShowNewWeddingModal(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-700 hover:text-gray-900 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>

            <button
              id="btn-submit-new-wedding"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-900 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              title="Crear Evento"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-800" />
                  <span>Creando Evento...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 text-gray-800" />
                  <span>Crear Evento</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
