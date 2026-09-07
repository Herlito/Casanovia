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
  Loader2,
  FileText,
  RotateCcw
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
  const { appTheme } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [eventType, setEventType] = useState('Boda');
  const [coupleNames, setCoupleNames] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [locationSummary, setLocationSummary] = useState('');
  const [ceremonyVenueName, setCeremonyVenueName] = useState('');
  const [receptionVenueName, setReceptionVenueName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showNewWeddingModal) return null;

  const handleClearForm = () => {
    setCoupleNames('');
    setBrideName('');
    setGroomName('');
    setWeddingDate('');
    setLocationSummary('');
    setCeremonyVenueName('');
    setReceptionVenueName('');
  };

  const handleCreateEmpty = async () => {
    setIsSubmitting(true);
    try {
      await createNewWedding({
        eventType: eventType || 'Boda',
        coupleNames: coupleNames.trim() || 'Nuevo Evento',
        brideName: brideName.trim() || '',
        groomName: groomName.trim() || '',
        weddingDate: weddingDate.trim() || '',
        locationSummary: locationSummary.trim() || '',
        ceremonyVenueName: ceremonyVenueName.trim() || '',
        receptionVenueName: receptionVenueName.trim() || '',
        emptyFields: true,
      });
      setIsSubmitting(false);
      handleClearForm();
    } catch (err) {
      console.error('Error al crear evento vacío:', err);
      setIsSubmitting(false);
    }
  };

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
      handleClearForm();
    } catch (err) {
      console.error('Error al crear nueva boda:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] max-w-xl w-full overflow-hidden border border-transparent" : "bg-[#EBEBEB] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-transparent"}>
        
        {/* Modal Header */}
        <div className={isNeumorphic ? "p-6 relative text-gray-800" : "bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] p-6 relative"}>
          <button
            id="btn-cancel-wedding-modal-top"
            onClick={() => setShowNewWeddingModal(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#2D3748]/80 hover:text-[#2D3748] hover:bg-[#EBEBEB]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className={isNeumorphic ? "w-10 h-10 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center" : "w-10 h-10 rounded-xl bg-[#EBEBEB]/15 flex items-center justify-center"}>
              <PlusCircle className="w-6 h-6 text-[#2D3748]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block">
                {isLevel1Admin ? 'Nivel 1 • Super Administrador' : isLevel3Planner ? `Nivel 3 • Wedding Planner (${currentUser.username})` : currentUser.username}
              </span>
              <h3 className={`font-serif-display text-xl font-bold ${isNeumorphic ? "text-gray-900" : "text-[#2D3748]"}`}>
                Crear Nuevo Evento
              </h3>
            </div>
          </div>
          <p className="text-xs text-gray-600 font-normal">
            Puedes crear un evento con plantilla y datos demo preconfigurados, o crear con todos los campos vacíos sin datos ficticios.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Formulario de Registro</span>
            <button
              id="btn-clear-modal-fields"
              type="button"
              onClick={handleClearForm}
              className="inline-flex items-center space-x-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              title="Vaciar todos los campos del formulario"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Vaciar campos</span>
            </button>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tipo de Evento <span className="text-rose-500">*</span>
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-800 font-medium rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
            >
              <option value="Boda">Boda</option>
              <option value="Quinceañero">Quinceañero</option>
              <option value="Fiesta de Promoción">Fiesta de Promoción</option>
              <option value="Aniversario">Aniversario</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Baby Shower">Baby Shower</option>
              <option value="Graduación">Graduación</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre del Evento <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Heart className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                required
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                placeholder="Ej. Isabella & Sebastián"
                className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Novia/Anfitrión
              </label>
              <input
                type="text"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Isabella Gómez"
                className="w-full px-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Novio/Anfitrión
              </label>
              <input
                type="text"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Sebastián Ruiz"
                className="w-full px-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Fecha del Evento <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="datetime-local"
                  required
                  value={weddingDate ? weddingDate.slice(0, 16) : ''}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ciudad / Destino <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  value={locationSummary}
                  onChange={(e) => setLocationSummary(e.target.value)}
                  placeholder="Ej. San Miguel de Allende, Gto."
                  className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Lugar de Ceremonia
              </label>
              <div className="relative">
                <Church className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={ceremonyVenueName}
                  onChange={(e) => setCeremonyVenueName(e.target.value)}
                  placeholder="Parroquia San Miguel Arcángel"
                  className="w-full pl-9 pr-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Lugar de Recepción / Fiesta
              </label>
              <input
                type="text"
                value={receptionVenueName}
                onChange={(e) => setReceptionVenueName(e.target.value)}
                placeholder="Hacienda Las Trancas"
                className="w-full px-3 py-2 text-xs text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-transparent rounded-xl p-3.5 space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center space-x-1.5 text-gray-800 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Plantilla Demo Incluida (Opcional):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600">
              <li>Checklist de 6 Fases Cronológicas completas (12 meses hasta Post-Boda).</li>
              <li>Cronograma minuto a minuto personalizable y presupuesto inicial.</li>
              <li>Generador de códigos de pase y guía protocolar para cortejo y padrinos.</li>
            </ul>
            <p className="text-[10px] text-gray-500 italic pt-0.5">
              Si prefieres comenzar desde cero, usa el botón <strong>&quot;Crear con campos vacíos (Sin datos ficticios)&quot;</strong>.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/40">
            <button
              id="btn-cancel-wedding-modal"
              type="button"
              onClick={() => setShowNewWeddingModal(false)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-create-empty-wedding"
                type="button"
                onClick={handleCreateEmpty}
                disabled={isSubmitting}
                className={isNeumorphic
                  ? "w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] hover:text-gray-900 active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  : "w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-200 text-gray-800 text-xs font-bold hover:bg-stone-300 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                }
                title="Crear evento completamente en blanco, sin datos ni tareas ficticias"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-gray-600" />
                )}
                <span>Crear con campos vacíos (Sin datos ficticios)</span>
              </button>

              <button
                id="btn-create-template-wedding"
                type="submit"
                disabled={isSubmitting}
                className={isNeumorphic
                  ? "w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  : "w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D3748] text-white text-xs font-bold hover:bg-[#1a202c] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                }
                title="Crear evento utilizando la plantilla demo con tareas y registros de ejemplo"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando Evento...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Crear con Plantilla Demo</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
