import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingSettings, Wedding, AdditionalVenue, DressCodeColor } from '../../types';
import { formatWeddingDateCustom, sortWeddingsByDate, getDaysUntilWedding } from '../../lib/dateUtils';
import { formatCurrency } from '../../lib/formatUtils';
import { 
  Settings, 
  Save, 
  Heart, 
  MapPin, 
  CreditCard, 
  Check, 
  Phone, 
  Mail,
  Calendar,
  Layers,
  PlusCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Quote,
  Sparkles,
  Shirt,
  Palette,
  AlertCircle,
  Plus,
  Lock,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Coins,
  Edit,
  Building2,
  MapPinned,
  RotateCcw,
  CheckCircle2,
  Paintbrush
} from 'lucide-react';
import { getContrastRatio, getAccessibleTextColor } from '../../lib/themeUtils';

export const SettingsModule: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    weddings, 
    activeWeddingId, 
    selectWedding, 
    deleteWedding, 
    setShowNewWeddingModal,
    isLevel1Admin,
    isPlannerOrAdmin,
    canEditActiveWedding,
    currentUser,
    currentWeddingTheme,
    applyWeddingColorsTheme,
    resetWeddingColorsTheme
  } = useWedding();

  const [formData, setFormData] = useState<WeddingSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState<string | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  // Additional venues local management state
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [venueDraft, setVenueDraft] = useState<Omit<AdditionalVenue, 'id'>>({
    name: '',
    type: 'Hospedaje / Preparación',
    address: '',
    time: '',
    googleMapsUrl: '',
    wazeUrl: '',
    notes: '',
  });

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Handle adding or updating additional venue
  const handleOpenAddVenue = () => {
    setEditingVenueId(null);
    setVenueDraft({
      name: '',
      type: 'Hospedaje / Preparación',
      address: '',
      time: '',
      googleMapsUrl: '',
      wazeUrl: '',
      notes: '',
    });
    setShowVenueForm(true);
  };

  const handleOpenEditVenue = (venue: AdditionalVenue) => {
    setEditingVenueId(venue.id);
    setVenueDraft({
      name: venue.name,
      type: venue.type || 'Sede Adicional',
      address: venue.address || '',
      time: venue.time || '',
      googleMapsUrl: venue.googleMapsUrl || '',
      wazeUrl: venue.wazeUrl || '',
      notes: venue.notes || '',
    });
    setShowVenueForm(true);
  };

  const handleSaveVenueDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!venueDraft.name.trim()) return;

    const currentVenues = formData.additionalVenues || [];
    let updatedVenues: AdditionalVenue[];

    if (editingVenueId) {
      updatedVenues = currentVenues.map((v) =>
        v.id === editingVenueId
          ? { ...venueDraft, id: editingVenueId, name: venueDraft.name.trim() }
          : v
      );
    } else {
      const newVenue: AdditionalVenue = {
        ...venueDraft,
        id: `av-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        name: venueDraft.name.trim(),
      };
      updatedVenues = [...currentVenues, newVenue];
    }

    const updatedFormData = {
      ...formData,
      additionalVenues: updatedVenues,
    };

    setFormData(updatedFormData);
    setShowVenueForm(false);
    setEditingVenueId(null);
    setVenueDraft({
      name: '',
      type: 'Hospedaje / Preparación',
      address: '',
      time: '',
      googleMapsUrl: '',
      wazeUrl: '',
      notes: '',
    });

    try {
      await updateSettings({ additionalVenues: updatedVenues });
    } catch (err) {
      console.error('Error guardando sede adicional:', err);
    }
  };

  const handleDeleteVenueItem = async (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar la sede "${name}"?`)) {
      const updatedVenues = (formData.additionalVenues || []).filter((v) => v.id !== id);
      const updatedFormData = {
        ...formData,
        additionalVenues: updatedVenues,
      };
      setFormData(updatedFormData);
      try {
        await updateSettings({ additionalVenues: updatedVenues });
      } catch (err) {
        console.error('Error eliminando sede adicional:', err);
      }
    }
  };

  // Sort weddings by date with closest upcoming wedding first
  const sortedWeddings: Wedding[] = sortWeddingsByDate(weddings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditActiveWedding && !isLevel1Admin) {
      alert('No tienes permisos de edición para esta boda.');
      return;
    }
    await updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            {isPlannerOrAdmin ? 'Configuración & Gestión de Bodas' : 'Configuración de la Boda'}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7268]">
            {isPlannerOrAdmin 
              ? 'Edita los datos de la boda activa, sedes de ceremonia/recepción, código de vestimenta, paleta visual y finanzas.'
              : `Edita los datos de tu boda (${settings.coupleNames}), sedes de ceremonia/recepción, código de vestimenta, paleta visual y finanzas.`}
          </p>
        </div>

        {(canEditActiveWedding || isLevel1Admin) && (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#8B3A4A] text-white text-xs font-semibold hover:bg-[#6E2937] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Cambios'}</span>
          </button>
        )}
      </div>

      {/* Permission Warning for Level 2 users browsing another wedding */}
      {!canEditActiveWedding && !isLevel1Admin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold block">Modo Solo Lectura para esta Boda</span>
              <span>Tus permisos de edición corresponden a tu boda asignada. Los cambios en este formulario están bloqueados.</span>
            </div>
          </div>
          {currentUser.assignedWeddingIds && currentUser.assignedWeddingIds.length > 0 && (
            <button
              type="button"
              onClick={() => selectWedding(currentUser.assignedWeddingIds![0])}
              className="px-3 py-1.5 bg-[#8B3A4A] text-white rounded-xl text-xs font-bold hover:bg-[#6E2937] transition-colors whitespace-nowrap flex items-center space-x-1 shrink-0"
            >
              <span>Ir a Mi Boda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Multi-Weddings Manager Section - ONLY visible to Administrator and Wedding Planners */}
      {isPlannerOrAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8B3A4A]/10 text-[#8B3A4A] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
                    Bodas Activas en la Plataforma ({sortedWeddings.length})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Ordenadas por fecha (más cercanas primero)
                  </span>
                </div>
                <p className="text-xs text-[#7A7268]">
                  Panel multi-boda sincronizado en tiempo real con Firebase Firestore.
                </p>
              </div>
            </div>

            {isLevel1Admin && (
              <button
                type="button"
                onClick={() => setShowNewWeddingModal(true)}
                className="px-4 py-2 bg-[#8B3A4A] text-white rounded-xl text-xs font-bold hover:bg-[#6E2937] transition-all flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nueva Boda</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sortedWeddings.map((w, index) => {
              const isActive = w.id === activeWeddingId;
              const daysInfo = getDaysUntilWedding(w.weddingDate);
              const isClosest = index === 0;

              return (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative ${
                    isActive
                      ? 'border-[#8B3A4A] bg-[#8B3A4A]/5 shadow-xs ring-2 ring-[#8B3A4A]/20'
                      : 'border-[#E8DCCF] bg-[#FAF8F5] hover:border-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-serif-display text-base font-bold text-[#2D2A26]">
                          {w.coupleNames}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8B3A4A] text-white">
                            Boda Activa
                          </span>
                        )}
                        {isClosest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" />
                            <span>Más Próxima</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#7A7268] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#8C8276] shrink-0" />
                        <span className="truncate">{w.locationSummary || 'Locación por definir'}</span>
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B3A4A] bg-[#8B3A4A]/10 px-2 py-0.5 rounded-md border border-[#8B3A4A]/20">
                          <Calendar className="w-3 h-3" />
                          <span>{w.weddingDate ? formatWeddingDateCustom(w.weddingDate) : 'Fecha pendiente'}</span>
                        </span>
                        <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {daysInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EFEAE2] text-xs">
                    <span className="text-[#8C8276] text-[11px]">
                      {w.guests?.length || 0} invitados • {w.tasks?.length || 0} tareas
                    </span>

                    <div className="flex items-center space-x-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => selectWedding(w.id)}
                          className="px-3 py-1 bg-white border border-[#D9CEBF] text-[#2D2A26] rounded-lg font-semibold hover:bg-[#EFEAE2] transition-colors text-xs cursor-pointer"
                        >
                          Abrir Boda
                        </button>
                      )}

                      {isLevel1Admin && weddings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar la boda de ${w.coupleNames}? Esta acción eliminará permanentemente sus datos de Firestore.`)) {
                              deleteWedding(w.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar boda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Couple & Date Info */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <h3 className="font-serif-display text-lg font-bold text-[#2D2A26] flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#8B3A4A]" />
            <span>Datos Principales de los Novios ({settings.coupleNames})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Nombres de la Pareja
              </label>
              <input
                type="text"
                value={formData.coupleNames}
                onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Fecha del Evento (YYYY-MM-DDTHH:MM:SS)
              </label>
              <input
                type="text"
                value={formData.weddingDate}
                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Ciudad / Ubicación General
              </label>
              <input
                type="text"
                value={formData.locationSummary}
                onChange={(e) => setFormData({ ...formData, locationSummary: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Nombre de la Novia
              </label>
              <input
                type="text"
                value={formData.brideName || ''}
                onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Nombre del Novio
              </label>
              <input
                type="text"
                value={formData.groomName || ''}
                onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Hora de Inicio General
              </label>
              <input
                type="text"
                value={formData.weddingTime}
                onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#8B3A4A] mb-1 flex items-center justify-between">
                <span>Fecha Límite para confirmar Asistencia</span>
                <span className="text-[10px] text-[#7A7268] font-normal">(Cierre RSVP)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.rsvpDeadline ? formData.rsvpDeadline.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#8B3A4A]/40 bg-white font-medium text-[#2D2A26] focus:ring-2 focus:ring-[#8B3A4A]/20"
                />
              </div>
              <p className="text-[10px] text-[#7A7268] mt-1">
                Si la fecha actual supera este límite, se cerrará el RSVP y consulta de pase en la Web de Invitados.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Presupuesto & Finanzas Globales de la Boda (Moneda Oficial: S/.) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-[#8B3A4A]" />
              <span>Presupuesto & Finanzas de la Boda (Moneda: S/.)</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#8B3A4A] bg-[#8B3A4A]/10 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              Habilitado para Anfitrión, Wedding Planner & Administrador
            </span>
          </div>

          <p className="text-xs text-[#7A7268]">
            Configura el monto del presupuesto global real asignado para la celebración. Este valor en Soles Peruanos (S/.) se sincroniza en el panel de control novios, cálculos de anticipos y gráficos de gasto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] space-y-2">
              <label className="block font-bold text-[#2D2A26] text-xs">
                Presupuesto Total Real (S/.) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                  S/.
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.totalRealBudget ?? 20000}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    totalRealBudget: e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0)
                  })}
                  disabled={!canEditActiveWedding && !isLevel1Admin}
                  placeholder="20000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBF] bg-white font-bold text-sm text-[#2D2A26] focus:ring-2 focus:ring-[#8B3A4A]/20 focus:border-[#8B3A4A] disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-[#7A7268]">
                Vista previa: <span className="font-bold text-[#8B3A4A]">{formatCurrency(formData.totalRealBudget ?? 20000)}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1EA]/60 border border-[#E8DCCF] flex flex-col justify-center space-y-1.5 text-xs text-[#524B42]">
              <div className="flex items-center space-x-1.5 font-bold text-[#2D2A26]">
                <TrendingUp className="w-4 h-4 text-[#8B3A4A]" />
                <span>Impacto en la Planificación Financiera</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#7A7268]">
                El Presupuesto Total Real permite a los anfitriones y planners contrastar las cotizaciones estimadas y gastos reales liquidados con proveedores para asegurar que la boda se mantenga dentro del límite establecido.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Venues Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Ceremony Venue */}
          <div className={`rounded-2xl p-6 border transition-all shadow-2xs space-y-4 ${
            formData.hasReligiousCeremony === false 
              ? 'bg-stone-50/80 border-stone-300 opacity-90' 
              : 'bg-white border-[#E8DCCF]'
          }`}>
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#F0EAE1]">
              <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#8B3A4A]" />
                <span>Sede de la Ceremonia Religiosa</span>
              </h3>

              {/* Botón Sin Boda Religiosa / Habilitar Boda Religiosa */}
              {formData.hasReligiousCeremony === false ? (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasReligiousCeremony: true })}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Habilitar Boda Religiosa</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasReligiousCeremony: false })}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Deshabilita la ceremonia religiosa para esta boda. No se mostrará en la web de invitados ni en los hitos."
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sin boda Religiosa</span>
                </button>
              )}
            </div>

            {formData.hasReligiousCeremony === false && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="leading-relaxed">
                  <p className="font-bold">Ceremonia Religiosa Deshabilitada</p>
                  <p className="text-[11px] text-amber-800">
                    Esta locación está excluida para esta boda. No se mostrará en la web de invitados y no aparecerá como opción en Agregar/Editar Hito de la línea de tiempo.
                  </p>
                </div>
              </div>
            )}

            <div className={`space-y-3 text-xs ${formData.hasReligiousCeremony === false ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Nombre del Recinto</label>
                <input
                  type="text"
                  value={formData.ceremonyVenue.name}
                  disabled={formData.hasReligiousCeremony === false}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceremonyVenue: { ...formData.ceremonyVenue, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={formData.ceremonyVenue.address}
                  disabled={formData.hasReligiousCeremony === false}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceremonyVenue: { ...formData.ceremonyVenue, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Hora de la Ceremonia</label>
                <input
                  type="text"
                  value={formData.ceremonyVenue.time}
                  disabled={formData.hasReligiousCeremony === false}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceremonyVenue: { ...formData.ceremonyVenue, time: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Enlace de Google Maps / Waze</label>
                <input
                  type="text"
                  value={formData.ceremonyVenue.googleMapsUrl || formData.ceremonyVenue.mapUrl || ''}
                  disabled={formData.hasReligiousCeremony === false}
                  onChange={(e) => setFormData({
                    ...formData,
                    ceremonyVenue: { ...formData.ceremonyVenue, googleMapsUrl: e.target.value, mapUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Reception Venue */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>Sede de la Recepción & Fiesta</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Nombre del Salón / Hacienda</label>
                <input
                  type="text"
                  value={formData.receptionVenue.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    receptionVenue: { ...formData.receptionVenue, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={formData.receptionVenue.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    receptionVenue: { ...formData.receptionVenue, address: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Hora de Cóctel / Inicio</label>
                <input
                  type="text"
                  value={formData.receptionVenue.time}
                  onChange={(e) => setFormData({
                    ...formData,
                    receptionVenue: { ...formData.receptionVenue, time: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#524B42] mb-1">Enlace de Google Maps / Waze</label>
                <input
                  type="text"
                  value={formData.receptionVenue.mapUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    receptionVenue: { ...formData.receptionVenue, mapUrl: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 3.1 Additional Venues Management */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECE3]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#8A9A86]/15 text-[#8A9A86] flex items-center justify-center">
                <MapPinned className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
                  Sedes y Espacios Adicionales de la Boda
                </h3>
                <p className="text-xs text-[#7A7268]">
                  Añade hoteles de preparación, locaciones para fotos, ceremonia civil o after party. Aparecen disponibles en la selección de <span className="font-semibold text-[#8B3A4A]">Ubicación / Espacio</span> del Cronograma.
                </p>
              </div>
            </div>

            {!showVenueForm && (
              <button
                type="button"
                onClick={handleOpenAddVenue}
                className="px-4 py-2 rounded-xl bg-[#8B3A4A] text-white text-xs font-semibold hover:bg-[#6E2937] transition-all shadow-xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Sede / Espacio</span>
              </button>
            )}
          </div>

          {/* Inline Form to Add / Edit Venue */}
          {showVenueForm && (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCF] space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-2">
                <h4 className="font-serif-display text-sm font-bold text-[#2D2A26] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#8B3A4A]" />
                  <span>{editingVenueId ? 'Editar Sede / Espacio' : 'Nueva Sede / Espacio Adicional'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowVenueForm(false)}
                  className="text-xs text-[#7A7268] hover:text-[#2D2A26] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div 
                className="space-y-3.5 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    handleSaveVenueDraft();
                  }
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">
                      Nombre del Recinto / Lugar <span className="text-[#8B3A4A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={venueDraft.name}
                      onChange={(e) => setVenueDraft({ ...venueDraft, name: e.target.value })}
                      placeholder="Ej. Hotel Casa Grande - Vallecito, Jardines de Sabandía..."
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">
                      Tipo de Sede / Uso
                    </label>
                    <select
                      value={venueDraft.type}
                      onChange={(e) => setVenueDraft({ ...venueDraft, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    >
                      <option value="Hospedaje / Preparación">Hospedaje / Preparación (Getting Ready)</option>
                      <option value="Ceremonia Religiosa">Ceremonia Religiosa</option>
                      <option value="Ceremonia Civil">Ceremonia Civil</option>
                      <option value="Sesión de Fotos">Sesión de Fotos</option>
                      <option value="Recepción & Banquete">Recepción & Banquete</option>
                      <option value="Cóctel & Bienvenida">Cóctel & Bienvenida</option>
                      <option value="After Party / Tornaboda">After Party / Tornaboda</option>
                      <option value="Otro">Otro espacio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">Dirección Completa</label>
                    <input
                      type="text"
                      value={venueDraft.address || ''}
                      onChange={(e) => setVenueDraft({ ...venueDraft, address: e.target.value })}
                      placeholder="Ej. Calle Los Sauces 120, Vallecito, Arequipa"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">Horario de Uso / Reserva</label>
                    <input
                      type="text"
                      value={venueDraft.time || ''}
                      onChange={(e) => setVenueDraft({ ...venueDraft, time: e.target.value })}
                      placeholder="Ej. 14:00 - 18:00 hrs"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">Enlace Google Maps / Waze</label>
                    <input
                      type="text"
                      value={venueDraft.googleMapsUrl || ''}
                      onChange={(e) => setVenueDraft({ ...venueDraft, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#524B42] mb-1">Notas o Indicaciones Especiales</label>
                    <input
                      type="text"
                      value={venueDraft.notes || ''}
                      onChange={(e) => setVenueDraft({ ...venueDraft, notes: e.target.value })}
                      placeholder="Ej. Suite Nupcial Piso 2, ingreso por puerta lateral"
                      className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-white focus:border-[#8B3A4A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8DCCF]">
                  <button
                    type="button"
                    onClick={() => setShowVenueForm(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#7A7268] hover:bg-[#EFEAE2] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveVenueDraft()}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#8B3A4A] hover:bg-[#6E2937] transition-colors cursor-pointer shadow-xs flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingVenueId ? 'Actualizar Sede' : 'Guardar Sede'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Venues Grid / List */}
          {(!formData.additionalVenues || formData.additionalVenues.length === 0) ? (
            <div className="p-6 text-center rounded-2xl bg-[#FAF8F5] border border-dashed border-[#D9CEBF]">
              <MapPin className="w-8 h-8 text-[#8C8276] mx-auto mb-2 opacity-50" />
              <p className="text-xs text-[#7A7268] font-medium">
                No has registrado sedes adicionales todavía.
              </p>
              <p className="text-[11px] text-[#8C8276] mt-0.5">
                Haz clic en "+ Agregar Sede / Espacio" para registrar hoteles, jardines o locaciones civiles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {formData.additionalVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif-display text-sm font-bold text-[#2D2A26] leading-snug">
                        {venue.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#8B3A4A]/10 text-[#8B3A4A] shrink-0">
                        {venue.type || 'Sede Adicional'}
                      </span>
                    </div>

                    {venue.address && (
                      <p className="text-[11px] text-[#6B6358] flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-[#8A9A86] shrink-0" />
                        <span className="truncate">{venue.address}</span>
                      </p>
                    )}

                    {venue.time && (
                      <p className="text-[11px] text-[#7A7268] flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-[#8C827A] shrink-0" />
                        <span>{venue.time}</span>
                      </p>
                    )}

                    {venue.notes && (
                      <p className="text-[11px] text-[#8C8276] italic line-clamp-2">
                        "{venue.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCF]/60 text-xs">
                    {venue.googleMapsUrl ? (
                      <a
                        href={venue.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#8B3A4A] hover:underline flex items-center space-x-0.5 font-medium"
                      >
                        <span>Ver Mapa</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#8C8276]">Sin enlace</span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVenue(venue)}
                        className="p-1 text-[#7A7268] hover:text-[#8B3A4A] hover:bg-white rounded-md transition-colors cursor-pointer"
                        title="Editar Sede"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVenueItem(venue.id, venue.name)}
                        className="p-1 text-[#7A7268] hover:text-red-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                        title="Eliminar Sede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Bank Details */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span>Datos Bancarios para Transferencias & Mesa de Regalos</span>
            </h3>

            {/* Checkbox Toggle para mostrar u ocultar en la Web de Invitados */}
            <label className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DCCF] hover:bg-[#F3EFEA] cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                id="checkbox-show-bank-details"
                checked={formData.showBankDetails !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  showBankDetails: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#8B3A4A] focus:ring-[#8B3A4A]/30 border-[#D9CEBF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2D2A26]">
                Mostrar datos bancarios en la Web de Invitados
              </span>
            </label>
          </div>

          <p className="text-xs text-[#7A7268]">
            {formData.showBankDetails !== false 
              ? '✓ Los datos bancarios y número de cuenta están visibles para los invitados en la sección de Mesa de Regalos.' 
              : '✕ Los datos bancarios están ocultos en la Web de Invitados (solo se mostrarán las tiendas departamentales registradas).'}
          </p>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs transition-opacity ${
            formData.showBankDetails === false ? 'opacity-60' : 'opacity-100'
          }`}>
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">Banco</label>
              <input
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">Titulares de la Cuenta</label>
              <input
                type="text"
                value={formData.bankDetails.accountHolder}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountHolder: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">CLABE Interbancaria</label>
              <input
                type="text"
                value={formData.bankDetails.clabe}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, clabe: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">Número de Cuenta</label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#524B42] mb-1">Concepto Sugerido</label>
              <input
                type="text"
                value={formData.bankDetails.concept}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, concept: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>
        </div>

        {/* 4. Dress Code & Suggested Color Palette */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCCF] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <Shirt className="w-4 h-4 text-[#8A9A86]" />
              <span>Código de Vestimenta & Paleta Visual de Colores</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#3C5038] bg-[#8A9A86]/20 px-2.5 py-0.5 rounded-full">
              Protocolo de Invitados
            </span>
          </div>

          <p className="text-xs text-[#7A7268]">
            Define el estilo de vestimenta formal y la paleta interactiva de colores sugeridos que los invitados verán en la web pública.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Estilo / Título del Dress Code
              </label>
              <input
                type="text"
                value={formData.dressCodeStyle || ''}
                onChange={(e) => setFormData({ ...formData, dressCodeStyle: e.target.value })}
                placeholder="ej. Formal Rigurosa / Traje Oscuro y Vestido Largo"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20 font-serif font-bold text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#8B3A4A] mb-1 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Regla de Oro (Colores Reservados)</span>
              </label>
              <input
                type="text"
                value={formData.forbiddenColorsNote || ''}
                onChange={(e) => setFormData({ ...formData, forbiddenColorsNote: e.target.value })}
                placeholder="Blanco, marfil y beige reservados para la novia."
                className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/40 focus:bg-white focus:ring-2 focus:ring-rose-300 text-rose-950 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-[#524B42] mb-1">
                Descripción & Recomendaciones para Invitados
              </label>
              <textarea
                rows={2}
                value={formData.dressCodeDescription || ''}
                onChange={(e) => setFormData({ ...formData, dressCodeDescription: e.target.value })}
                placeholder="Para las damas sugerimos vestido largo en tonos de la paleta. Para los caballeros traje formal..."
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20"
              />
            </div>
          </div>

          {/* Color Palette List in Settings */}
          <div className="pt-3 border-t border-[#EFEAE2] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2D2A26] uppercase tracking-wider flex items-center space-x-1.5">
                <Palette className="w-4 h-4 text-[#D4AF37]" />
                <span>Paleta de Colores Sugeridos ({(formData.suggestedColors || []).length})</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const currentColors = formData.suggestedColors || [];
                  setFormData({
                    ...formData,
                    suggestedColors: [
                      ...currentColors,
                      { name: 'Nuevo Color', hex: '#8B3A4A', description: 'Recomendación de vestimenta' }
                    ]
                  });
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#8A9A86] hover:bg-[#6E7E6A] text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Tono</span>
              </button>
            </div>

            {/* Colors list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.suggestedColors || []).map((col, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] flex items-center space-x-2 text-xs">
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={col.hex.startsWith('#') && col.hex.length === 7 ? col.hex : '#8A9A86'}
                      onChange={(e) => {
                        const updated = [...(formData.suggestedColors || [])];
                        updated[idx] = { ...updated[idx], hex: e.target.value };
                        setFormData({ ...formData, suggestedColors: updated });
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                    />
                    <div 
                      style={{ backgroundColor: col.hex }}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-xs"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => {
                        const updated = [...(formData.suggestedColors || [])];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setFormData({ ...formData, suggestedColors: updated });
                      }}
                      placeholder="Nombre del Color"
                      className="w-full px-2 py-0.5 text-xs font-semibold rounded-md border border-[#D9CEBF] bg-white"
                    />
                    <input
                      type="text"
                      value={col.description}
                      onChange={(e) => {
                        const updated = [...(formData.suggestedColors || [])];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setFormData({ ...formData, suggestedColors: updated });
                      }}
                      placeholder="Recomendación"
                      className="w-full px-2 py-0.5 text-[11px] text-[#524B42] rounded-md border border-[#D9CEBF] bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = (formData.suggestedColors || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, suggestedColors: updated });
                    }}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Aplicar colores ahora / Restablecer Theme Engine Control */}
            <div className="mt-4 p-4 rounded-2xl bg-linear-to-r from-[#FAF7F2] to-[#F5EFE6] border border-[#E0D3C1] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">
                    <Paintbrush className="w-4 h-4 text-[#8B3A4A]" />
                    <span>Aplicar Paleta a la Página de esta Boda</span>
                  </h4>
                  <p className="text-[11px] text-[#685F54] mt-0.5">
                    Cambia la paleta de colores de la página solo para esta boda usando los tonos indicados con contraste y legibilidad garantizados.
                  </p>
                </div>

                {/* Theme Active Status */}
                <div>
                  {formData.customTheme?.enabled ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#3C5038]/10 text-[#3C5038] text-[11px] font-bold border border-[#3C5038]/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3C5038]" />
                      <span>Paleta Personalizada Activa</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#7A7268]/10 text-[#7A7268] text-[11px] font-medium border border-[#7A7268]/20">
                      <span>Paleta Original Casanovia</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Live Contrast Verification Preview */}
              {formData.suggestedColors && formData.suggestedColors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-[#685F54] font-medium">Previsualización de contraste:</span>
                  <div 
                    style={{ 
                      backgroundColor: formData.suggestedColors[0]?.hex || '#8B3A4A', 
                      color: getAccessibleTextColor(formData.suggestedColors[0]?.hex || '#8B3A4A') 
                    }}
                    className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] shadow-2xs"
                  >
                    Botones & Títulos: {formData.suggestedColors[0]?.name || 'Tono Primario'}
                  </div>
                  {formData.suggestedColors[1] && (
                    <div 
                      style={{ 
                        backgroundColor: formData.suggestedColors[1]?.hex, 
                        color: getAccessibleTextColor(formData.suggestedColors[1]?.hex) 
                      }}
                      className="px-2.5 py-0.5 rounded-md font-semibold text-[11px] shadow-2xs"
                    >
                      Acentos: {formData.suggestedColors[1]?.name}
                    </div>
                  )}
                  <span className="text-[#3C5038] font-medium text-[10px] bg-[#8A9A86]/20 px-2 py-0.5 rounded-md">
                    ✓ Contraste {getContrastRatio(formData.suggestedColors[0]?.hex || '#8B3A4A', getAccessibleTextColor(formData.suggestedColors[0]?.hex || '#8B3A4A')).toFixed(1)}:1 (Legible WCAG)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  id="btn-apply-wedding-theme"
                  disabled={isApplyingTheme}
                  onClick={async () => {
                    try {
                      setIsApplyingTheme(true);
                      const colorsToApply = formData.suggestedColors || [];
                      if (colorsToApply.length === 0) {
                        setThemeSuccessMsg('Agrega al menos un color antes de aplicar.');
                        setTimeout(() => setThemeSuccessMsg(null), 4000);
                        return;
                      }
                      const generated = await applyWeddingColorsTheme(colorsToApply);
                      setFormData(prev => ({
                        ...prev,
                        customTheme: generated
                      }));
                      setThemeSuccessMsg('¡Paleta de colores aplicada a la página pública de esta boda con contraste y legibilidad óptimos!');
                      setTimeout(() => setThemeSuccessMsg(null), 5000);
                    } catch (err) {
                      console.error('Error aplicando paleta:', err);
                    } finally {
                      setIsApplyingTheme(false);
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#8B3A4A] hover:bg-[#6E2937] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Aplicar colores ahora</span>
                </button>

                <button
                  type="button"
                  id="btn-reset-wedding-theme"
                  disabled={isApplyingTheme}
                  onClick={async () => {
                    try {
                      setIsApplyingTheme(true);
                      await resetWeddingColorsTheme();
                      setFormData(prev => ({
                        ...prev,
                        customTheme: undefined
                      }));
                      setThemeSuccessMsg('¡Colores restablecidos a la paleta original de Casanovia!');
                      setTimeout(() => setThemeSuccessMsg(null), 5000);
                    } catch (err) {
                      console.error('Error restableciendo paleta:', err);
                    } finally {
                      setIsApplyingTheme(false);
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#524B42] hover:text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#7A7268]" />
                  <span>Restablecer</span>
                </button>
              </div>

              {/* Feedback toast message */}
              {themeSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{themeSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Pie de Página, Frase Romántica y Contacto */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#8B3A4A]/20 bg-linear-to-b from-white to-[#FDFBF7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <Quote className="w-4 h-4 text-[#8B3A4A]" />
              <span>Pie de Página, Frase Romántica y Contactos</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#8B3A4A] bg-[#8B3A4A]/10 px-2.5 py-0.5 rounded-full">
              Visible en Web Invitados
            </span>
          </div>

          <p className="text-xs text-[#7A7268]">
            Personaliza el nombre de la pareja que firma el pie de página, el lema o frase de amor, el teléfono de coordinación y el correo de contacto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Nombres Pareja Pie de Página */}
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Firma / Nombres de la Pareja en Pie de Página
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.coupleNames}
                  onChange={(e) => setFormData({ ...formData, coupleNames: e.target.value })}
                  placeholder="ej. Zenaida & Ronald"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20 font-medium"
                />
              </div>
            </div>

            {/* Frase Romántica / Lema */}
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Frase Romántica / Lema de la Boda
              </label>
              <div className="relative">
                <Quote className="w-4 h-4 text-[#8B3A4A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.romanticQuote || ''}
                  onChange={(e) => setFormData({ ...formData, romanticQuote: e.target.value })}
                  placeholder='"El amor no se mira con los ojos, sino con el corazón."'
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20 italic"
                />
              </div>
            </div>

            {/* Teléfono Coordinación */}
            <div>
              <label className="block font-semibold text-[#524B42] mb-1 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Teléfono de Coordinación</span>
              </label>
              <input
                type="text"
                value={formData.generalContactPhone || ''}
                onChange={(e) => setFormData({ ...formData, generalContactPhone: e.target.value })}
                placeholder="ej. +52 81 0000 0000 o +51 987 654 321"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20"
              />
            </div>

            {/* Correo de Contacto */}
            <div>
              <label className="block font-semibold text-[#524B42] mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Correo Electrónico de Contacto</span>
              </label>
              <input
                type="email"
                value={formData.generalContactEmail || ''}
                onChange={(e) => setFormData({ ...formData, generalContactEmail: e.target.value })}
                placeholder="ej. boda.zenaida-ronald@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#8B3A4A]/20"
              />
            </div>
          </div>

          {/* Vista previa en tiempo real del pie de página */}
          <div className="mt-4 p-4 rounded-xl bg-[#2D2A26] text-white border border-[#443E38] text-center space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block font-semibold">
              Vista Previa del Pie de Página
            </span>
            <div className="font-script text-2xl text-[#D4AF37]">
              {formData.coupleNames || 'Nombres de los Novios'}
            </div>
            <p className="text-xs text-[#D9CEBF] italic font-editorial max-w-md mx-auto">
              {formData.romanticQuote || '"El amor no se mira con los ojos, sino con el corazón."'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#B8ADA0] pt-2 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                <span>Coordinación: {formData.generalContactPhone || '+52 81 0000 0000'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D4AF37]" />
                <span>{formData.generalContactEmail || 'boda@contacto.com'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#8B3A4A] text-white text-xs font-bold hover:bg-[#6E2937] transition-all shadow-md flex items-center space-x-2 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Todos los Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
