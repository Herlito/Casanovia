import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { WeddingSettings, Wedding, AdditionalVenue, DressCodeColor } from '../../types';
import { formatWeddingDateCustom, sortWeddingsByDate, getDaysUntilWedding } from '../../lib/dateUtils';
import { formatCurrency, COUNTRY_CURRENCY_OPTIONS, getCurrencyOption, setActiveCurrencyCountry } from '../../lib/formatUtils';
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
  Globe,
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
  Paintbrush,
  MessageCircle,
  Eraser,
  Download,
  FileJson,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { ColorPickerWithImageModal } from "../modals/ColorPickerWithImageModal";
import { SubirWebModal } from "../modals/SubirWebModal";
import { getContrastRatio, getAccessibleTextColor } from '../../lib/themeUtils';
import { purgeResidualFilesFromHosting } from '../../services/hostingStorage';
import { downloadPackage } from '../../utils/downloadPackage';

const ensureSettingsDefaults = (s: WeddingSettings): WeddingSettings => {
  if (!s) return {} as WeddingSettings;
  return {
    ...s,
    ceremonyVenue: s.ceremonyVenue || { name: '', time: '', address: '', googleMapsUrl: '', wazeUrl: '' },
    receptionVenue: s.receptionVenue || { name: '', time: '', address: '', googleMapsUrl: '', wazeUrl: '' },
    bankDetails: s.bankDetails || { bankName: '', accountHolder: '', clabe: '', accountNumber: '', concept: '' },
  };
};

export const SettingsModule: React.FC = () => {
  const {
    appTheme, 
    settings, 
    updateSettings, 
    weddings,
    accessibleWeddings, 
    activeWeddingId, 
    selectWedding, 
    deleteWedding, 
    setShowNewWeddingModal,
    isLevel1Admin,
    isLevel3Planner,
    isPlannerOrAdmin,
    canEditActiveWedding,
    currentUser,
    currentWeddingTheme,
    applyWeddingColorsTheme,
    resetWeddingColorsTheme,
    clearWeddingData
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [formData, setFormData] = useState<WeddingSettings>(() => ensureSettingsDefaults(settings));
  const isLevel1To3 = (currentUser?.level >= 1 && currentUser?.level <= 3);
  const currentCurrencyOpt = getCurrencyOption(formData.countryCurrency);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState<string | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSubirWebModal, setShowSubirWebModal] = useState(false);
  const [showPurgeResidualsModal, setShowPurgeResidualsModal] = useState(false);
  const [isPurgingResiduals, setIsPurgingResiduals] = useState(false);
  const [purgeResultMsg, setPurgeResultMsg] = useState<{ type: 'success' | 'error'; message: string; count?: number } | null>(null);
  const [downloadTarGzStatus, setDownloadTarGzStatus] = useState<{ loading: boolean; text?: string; error?: string } | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  // Accordion state for venues inside Datos Principales del Evento
  const [isCeremonyExpanded, setIsCeremonyExpanded] = useState(false);
  const [isReceptionExpanded, setIsReceptionExpanded] = useState(false);
  const [isAdditionalVenuesExpanded, setIsAdditionalVenuesExpanded] = useState(false);

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
    setFormData(ensureSettingsDefaults(settings));
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
  const sortedWeddings: Wedding[] = sortWeddingsByDate(accessibleWeddings);

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

  const handleClearWedding = async () => {
    if (!isLevel1Admin) return;
    setIsClearing(true);
    try {
      await clearWeddingData();
      setShowClearModal(false);
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 5000);
    } catch (err) {
      console.error('Error al limpiar la boda:', err);
      setShowClearModal(false);
      alert('La boda se limpió en los datos locales.');
    } finally {
      setIsClearing(false);
    }
  };

  const handlePurgeResiduals = async () => {
    if (!isLevel1Admin) return;
    setIsPurgingResiduals(true);
    setPurgeResultMsg(null);
    try {
      const res = await purgeResidualFilesFromHosting();
      if (res.success) {
        setPurgeResultMsg({
          type: 'success',
          message: res.message,
          count: res.purgedCount
        });
      } else {
        setPurgeResultMsg({
          type: 'error',
          message: res.message || 'Error al conectar con el servidor para purgar archivos.'
        });
      }
    } catch (err: any) {
      setPurgeResultMsg({
        type: 'error',
        message: 'No se pudo completar la limpieza de archivos residuales.'
      });
    } finally {
      setIsPurgingResiduals(false);
    }
  };

  return (<>
    <div className="space-y-2 sm:space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
        <div>
          <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            Configuración
          </h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-wrap gap-2">


          {(canEditActiveWedding || isLevel1Admin) && (
            <button
              type="button"
              onClick={handleSubmit}
              className="p-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold hover:bg-[#EBEBEB] transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
              title={savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Cambios'}
              aria-label={savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Cambios'}
            >
              {savedSuccess ? <Check className="w-4 h-4 text-[#2D3748] shrink-0" /> : <Save className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Cambios'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification for Clear Wedding */}
      {clearSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center space-x-3 text-xs shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">¡Boda limpiada con éxito!</span>
            <span>Se eliminaron todos los registros e invitados dejándolos en blanco para llenar. Se conservaron el nombre del evento, la fecha, la ciudad y la fecha límite para confirmar asistencia.</span>
          </div>
        </div>
      )}

      {/* Purge Residuals Notification */}
      {purgeResultMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between space-x-3 text-xs shadow-xs animate-fadeIn ${
          purgeResultMsg.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${
              purgeResultMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
            }`} />
            <div>
              <span className="font-bold block">
                {purgeResultMsg.type === 'success' ? '¡Limpieza de Servidor Completada!' : 'Error de Limpieza'}
              </span>
              <span>{purgeResultMsg.message}</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setPurgeResultMsg(null)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Permission Warning for Level 2 users browsing another wedding */}
      {!canEditActiveWedding && !isLevel1Admin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-2">
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
              className="px-3 py-1.5 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] rounded-xl text-xs font-bold hover:bg-[#EBEBEB] transition-colors whitespace-nowrap flex items-center space-x-1 shrink-0"
            >
              <span>Ir a Mi Boda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Multi-Weddings Manager Section - ONLY visible to Administrator (Nivel 1, desaparece para niveles 2 y 3) */}
      {isLevel1Admin && (
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3" : "bg-[#EBEBEB] rounded-2xl px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif-display text-base font-bold text-[#2D2A26]">
                    Mis Eventos ({sortedWeddings.length})
                  </h3>
                  <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Ordenadas por fecha (más cercanas primero)
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-[#7A7268]">
                  Panel multi-boda sincronizado en tiempo real con Firebase Firestore.
                </p>
              </div>
            </div>

            {isLevel1Admin && (
              <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">

                <button
                  type="button"
                  id="btn-subirweb-settings"
                  onClick={() => setShowSubirWebModal(true)}
                  className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-blue-300/70"
                  title="Migrar datos (1-Clic) y sincronizar copias de seguridad JSON"
                >
                  <FileJson className="w-4 h-4 text-blue-600" />
                  <span>Migrar Datos (1-Clic)</span>
                </button>
                <button
                  type="button"
                  id="btn-direct-download-targz"
                  disabled={downloadTarGzStatus?.loading}
                  onClick={async () => {
                    await downloadPackage('SubirWeb_Actualizacion.tar.gz', (st) => {
                      setDownloadTarGzStatus(st);
                      if (!st.loading && !st.error) {
                        setTimeout(() => setDownloadTarGzStatus(null), 4000);
                      }
                    });
                  }}
                  className="px-3.5 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-emerald-300/70 disabled:opacity-75"
                  title="Descargar paquete de actualización SubirWeb_Actualizacion.tar.gz (~2.6 MB verificado)"
                >
                  {downloadTarGzStatus?.loading ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>
                    {downloadTarGzStatus?.loading
                      ? (downloadTarGzStatus.text || 'Descargando (2.6 MB)...')
                      : downloadTarGzStatus?.text
                      ? downloadTarGzStatus.text
                      : downloadTarGzStatus?.error
                      ? 'Reintentar Descarga'
                      : 'Descargar Actualización (.tar.gz)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewWeddingModal(true)}
                  className="px-4 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] rounded-xl text-xs font-bold hover:bg-[#EBEBEB] transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Evento</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {sortedWeddings.map((w, index) => {
              const isActive = w.id === activeWeddingId;
              const daysInfo = getDaysUntilWedding(w.weddingDate);
              const isClosest = index === 0;

              return (
                <div
                  key={w.id}
                  className={`p-2.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 sm:space-y-3 relative ${
                    isActive
                      ? 'border-amber-400/60 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-gray-900 shadow-xs ring-2 ring-amber-400/40'
                      : 'border-gray-200 bg-[#FAF8F5] text-gray-900 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                        <h4 translate="no" className="notranslate font-serif-display text-xs sm:text-base font-bold text-gray-900 line-clamp-1">
                          {w.coupleNames}
                        </h4>
                        {isActive && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                            Activa
                          </span>
                        )}
                        {isClosest && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>Próxima</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] sm:text-xs text-gray-600 flex items-center gap-1 mt-0.5 sm:mt-1">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 shrink-0" />
                        <span className="truncate">{w.locationSummary || 'Locación por definir'}</span>
                      </p>

                      <div className="mt-1.5 sm:mt-2.5 flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-900 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-gray-300 shadow-2xs">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700 shrink-0" />
                          <span className="text-gray-900 font-semibold truncate">{w.weddingDate ? formatWeddingDateCustom(w.weddingDate) : 'Pendiente'}</span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-2xs">
                          {daysInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#EFEAE2] text-[10px] sm:text-xs">
                    <span translate="no" className="notranslate text-[#8C8276] text-[10px] sm:text-[11px] truncate">
                      {w.guests?.length || 0} inv. • {w.tasks?.length || 0} tar.
                    </span>

                    <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => selectWedding(w.id)}
                          className="px-2 sm:px-3 py-1 bg-[#EBEBEB] border border-[#D9CEBF] text-[#2D2A26] rounded-lg font-semibold hover:bg-[#EFEAE2] transition-colors text-[10px] sm:text-xs cursor-pointer"
                        >
                          Abrir
                        </button>
                      )}

                      {(isLevel1Admin || isLevel3Planner) && weddings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar la boda de ${w.coupleNames}? Esta acción eliminará permanentemente sus datos de Firestore.`)) {
                              deleteWedding(w.id);
                            }
                          }}
                          className="p-1 sm:p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
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
      <form onSubmit={handleSubmit} className="space-y-3">
        
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] px-3 sm:px-5 py-4 sm:py-5 border border-transparent shadow-2xs space-y-4" : "bg-[#EBEBEB] rounded-2xl px-3 sm:px-5 py-4 sm:py-5 border border-transparent shadow-2xs space-y-4"}>
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#F0EAE1] gap-2">
            <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#2D2A26] flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[#2D3748] shrink-0" />
              <span>Datos Principales del Evento ({formData.coupleNames || settings.coupleNames})</span>
            </h3>

            {/* Check Invitación Virtual alineado a la derecha */}
            <label className="inline-flex items-center space-x-2 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#c8c8c8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all border border-transparent shrink-0">
              <input
                type="checkbox"
                checked={formData.hasVirtualInvitation === true}
                onChange={(e) => setFormData({
                  ...formData,
                  hasVirtualInvitation: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#2D3748] border-[#D9CEBF] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-[#2D2A26] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#2D3748]" />
                <span>Invitación virtual</span>
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs mb-2">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Tipo de Evento
              </label>
              <select
                value={formData.eventType || 'Boda'}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
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
            
            <div className="lg:col-span-3">
              <label className="block font-semibold text-[#524B42] mb-1">
                Frase de Invitación / Subtítulo
              </label>
              <input
                type="text"
                value={formData.romanticQuote || ''}
                onChange={(e) => setFormData({ ...formData, romanticQuote: e.target.value })}
                placeholder="Ej. Con la bendición de Dios y de nuestros padres..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Nombre del Evento
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
                Fecha del Evento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.weddingDate ? formData.weddingDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const existingTime = formData.weddingTime ? `${formData.weddingTime}:00` : (formData.weddingDate?.includes('T') ? formData.weddingDate.split('T')[1] : '12:00:00');
                    setFormData({
                      ...formData,
                      weddingDate: newDate ? `${newDate}T${existingTime}` : '',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-transparent bg-[#EBEBEB] font-medium text-[#2D2A26] focus:ring-2 focus:ring-[#d1d1d1]/20"
                />
              </div>
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
                Hora de Inicio General
              </label>
              <input
                type="text"
                value={formData.weddingTime}
                onChange={(e) => setFormData({ ...formData, weddingTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#2D3748] mb-1 flex items-center justify-between">
                <span>Fecha Límite para confirmar Asistencia</span>
                <span className="text-[10px] text-[#7A7268] font-normal">(Cierre RSVP)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.rsvpDeadline ? formData.rsvpDeadline.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-transparent bg-[#EBEBEB] font-medium text-[#2D2A26] focus:ring-2 focus:ring-[#d1d1d1]/20"
                />
              </div>
              <p className="text-[10px] text-[#7A7268] mt-1">
                Si la fecha actual supera este límite, se cerrará el RSVP y consulta de pase en la Web de Invitados.
              </p>
            </div>
          </div>

          {/* País y Tipo de Moneda del Evento & Presupuesto Total Real (Para todos los niveles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#F0EAE1]">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D9CEBF] space-y-1.5 shadow-2xs">
              <label className="block font-bold text-[#2D2A26] text-xs flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-700" />
                <span>País y Tipo de Moneda del Evento</span>
              </label>
              <p className="text-[10px] text-[#7A7268]">
                Define la moneda oficial y los formatos financieros para este evento:
              </p>
              <select
                value={formData.countryCurrency || 'PE'}
                onChange={(e) => {
                  const selectedCode = e.target.value;
                  setFormData({ ...formData, countryCurrency: selectedCode });
                  setActiveCurrencyCountry(selectedCode);
                }}
                disabled={!canEditActiveWedding && !isLevel1Admin}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] text-[#2D2A26] focus:ring-2 focus:ring-[#d1d1d1]/20 focus:border-transparent cursor-pointer disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                {COUNTRY_CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.flag} {opt.country} — {opt.currencyName} ({opt.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D9CEBF] space-y-1.5 shadow-2xs">
              <label className="block font-bold text-[#2D2A26] text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#2D3748]" />
                <span>Presupuesto Total Real ({currentCurrencyOpt.symbol}) *</span>
              </label>
              <p className="text-[10px] text-[#7A7268]">
                Monto presupuestario global asignado:
              </p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                  {currentCurrencyOpt.symbol}
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
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] font-bold text-sm text-[#2D2A26] focus:ring-2 focus:ring-[#d1d1d1]/20 focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-[#7A7268]">
                Vista previa: <span className="font-bold text-[#2D3748]">{formatCurrency(formData.totalRealBudget ?? 20000, 2, formData.countryCurrency)}</span>
              </p>
            </div>
          </div>

          {/* Fichas Plegables de Sedes */}
          <div className="space-y-3 pt-2 border-t border-[#F0EAE1]">
            {/* 1. Sede de la Ceremonia Religiosa (Plegable) */}
            <div className="rounded-2xl border border-gray-200 bg-[#FAF8F5] overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => setIsCeremonyExpanded(!isCeremonyExpanded)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left hover:bg-stone-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#2D3748] shrink-0">
                    <MapPin className="w-4 h-4 text-[#2D3748]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif-display text-sm font-bold text-[#2D2A26]">
                        Sede de la Ceremonia Religiosa
                      </h4>
                      {formData.hasReligiousCeremony === false ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Sin Boda Religiosa
                        </span>
                      ) : formData.ceremonyVenue?.name ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white border border-gray-300 text-gray-800 truncate max-w-[180px]">
                          {formData.ceremonyVenue.name}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-[#7A7268] truncate">
                      {formData.hasReligiousCeremony === false
                        ? 'Locación religiosa deshabilitada para este evento'
                        : (formData.ceremonyVenue?.address || 'Clic para expandir y configurar recinto, hora y mapa')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-semibold text-[#7A7268] hidden sm:inline">
                    {isCeremonyExpanded ? 'Ocultar' : 'Configurar'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] flex items-center justify-center text-[#2D3748]">
                    {isCeremonyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isCeremonyExpanded && (
                <div className="p-4 pt-1 sm:p-4 sm:pt-2 border-t border-gray-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#F0EAE1]">
                    <span className="text-xs text-[#7A7268]">
                      Ingresa los detalles de la iglesia, parroquia o templo:
                    </span>
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

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${formData.hasReligiousCeremony === false ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        placeholder="Ej. Parroquia Nuestra Señora del Pilar"
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
                        placeholder="Ej. 16:30"
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
                        placeholder="Ej. Av. Principal 123, Yanahuara"
                        className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#524B42] mb-1">Enlace de Google Maps / Waze</label>
                      <input
                        type="text"
                        value={formData.ceremonyVenue.googleMapsUrl || ''}
                        disabled={formData.hasReligiousCeremony === false}
                        onChange={(e) => setFormData({
                          ...formData,
                          ceremonyVenue: { ...formData.ceremonyVenue, googleMapsUrl: e.target.value }
                        })}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] disabled:bg-stone-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Sede de la Recepción & Fiesta (Plegable) */}
            <div className="rounded-2xl border border-gray-200 bg-[#FAF8F5] overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => setIsReceptionExpanded(!isReceptionExpanded)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left hover:bg-stone-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#D4AF37] shrink-0">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif-display text-sm font-bold text-[#2D2A26]">
                        Sede de la Recepción & Fiesta
                      </h4>
                      {formData.receptionVenue?.name && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white border border-gray-300 text-gray-800 truncate max-w-[180px]">
                          {formData.receptionVenue.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A7268] truncate">
                      {formData.receptionVenue?.address || 'Clic para expandir y configurar salón, hacienda, hora y mapa'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-semibold text-[#7A7268] hidden sm:inline">
                    {isReceptionExpanded ? 'Ocultar' : 'Configurar'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] flex items-center justify-center text-[#2D3748]">
                    {isReceptionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isReceptionExpanded && (
                <div className="p-4 pt-1 sm:p-4 sm:pt-2 border-t border-gray-200 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#524B42] mb-1">Nombre del Salón / Hacienda</label>
                      <input
                        type="text"
                        value={formData.receptionVenue.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          receptionVenue: { ...formData.receptionVenue, name: e.target.value }
                        })}
                        placeholder="Ej. Casona de Eventos Santa María"
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
                        placeholder="Ej. 18:00"
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
                        placeholder="Ej. Calle Los Sauces 450"
                        className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#524B42] mb-1">Enlace de Google Maps / Waze</label>
                      <input
                        type="text"
                        value={formData.receptionVenue.googleMapsUrl || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          receptionVenue: { ...formData.receptionVenue, googleMapsUrl: e.target.value }
                        })}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Sedes y Espacios Adicionales (Plegable) */}
            <div className="rounded-2xl border border-gray-200 bg-[#FAF8F5] overflow-hidden transition-all shadow-2xs">
              <button
                type="button"
                onClick={() => setIsAdditionalVenuesExpanded(!isAdditionalVenuesExpanded)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left hover:bg-stone-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#8A9A86] shrink-0">
                    <MapPinned className="w-4 h-4 text-[#8A9A86]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif-display text-sm font-bold text-[#2D2A26]">
                        Sedes y Espacios Adicionales
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white border border-gray-300 text-gray-800">
                        {(formData.additionalVenues || []).length} {formData.additionalVenues?.length === 1 ? 'sede' : 'sedes'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A7268] truncate">
                      Hoteles de preparación, locaciones para fotos, boda civil o after party
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-semibold text-[#7A7268] hidden sm:inline">
                    {isAdditionalVenuesExpanded ? 'Ocultar' : 'Administrar'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-[#EBEBEB] shadow-[2px_2px_5px_#d1d1d1,-2px_-2px_5px_#ffffff] flex items-center justify-center text-[#2D3748]">
                    {isAdditionalVenuesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isAdditionalVenuesExpanded && (
                <div className="p-4 pt-1 sm:p-4 sm:pt-2 border-t border-gray-200 space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EAE1]">
                    <p className="text-xs text-[#7A7268]">
                      Añade hoteles de preparación, locaciones para fotos, ceremonia civil o after party para asignar en el Cronograma.
                    </p>
                    {!showVenueForm && (
                      <button
                        type="button"
                        onClick={handleOpenAddVenue}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-[#2D3748] text-xs font-semibold hover:bg-[#EBEBEB] transition-all shadow-xs flex items-center space-x-1 self-start sm:self-auto cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Agregar Sede / Espacio</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Form */}
                  {showVenueForm && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-300 space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <h4 className="font-serif-display text-xs font-bold text-[#2D2A26] flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#2D3748]" />
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
                        className="space-y-3 text-xs"
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
                              Nombre del Recinto / Lugar <span className="text-[#2D3748]">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={venueDraft.name}
                              onChange={(e) => setVenueDraft({ ...venueDraft, name: e.target.value })}
                              placeholder="Ej. Hotel Casa Grande - Vallecito"
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#524B42] mb-1">
                              Tipo de Sede / Uso
                            </label>
                            <select
                              value={venueDraft.type}
                              onChange={(e) => setVenueDraft({ ...venueDraft, type: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
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
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#524B42] mb-1">Horario de Uso / Reserva</label>
                            <input
                              type="text"
                              value={venueDraft.time || ''}
                              onChange={(e) => setVenueDraft({ ...venueDraft, time: e.target.value })}
                              placeholder="Ej. 14:00 - 18:00 hrs"
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
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
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-[#524B42] mb-1">Notas o Indicaciones Especiales</label>
                            <input
                              type="text"
                              value={venueDraft.notes || ''}
                              onChange={(e) => setVenueDraft({ ...venueDraft, notes: e.target.value })}
                              placeholder="Ej. Suite Nupcial Piso 2, ingreso por puerta lateral"
                              className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#EBEBEB] focus:border-transparent focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-transparent">
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
                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] transition-colors cursor-pointer shadow-xs flex items-center space-x-1"
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
                    <div className="px-[2px] sm:px-1 py-3 sm:py-4 text-center rounded-2xl bg-[#FAF8F5] border border-dashed border-[#D9CEBF]">
                      <MapPin className="w-8 h-8 text-[#8C8276] mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-[#7A7268] font-medium">
                        No has registrado sedes adicionales todavía.
                      </p>
                      <p className="text-[11px] text-[#8C8276] mt-0.5">
                        Haz clic en "+ Agregar Sede / Espacio" para registrar hoteles, jardines o locaciones civiles.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.additionalVenues.map((venue) => (
                        <div
                          key={venue.id}
                          className="p-3.5 rounded-xl bg-[#FAF8F5] border border-gray-200 hover:border-amber-300 transition-all flex flex-col justify-between space-y-2.5 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-serif-display text-xs font-bold text-[#2D2A26] leading-snug truncate">
                                {venue.name}
                              </h4>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white border border-gray-300 text-gray-800 shrink-0">
                                {venue.type || 'Sede Adicional'}
                              </span>
                            </div>

                            {venue.address && (
                              <p className="text-[10px] text-[#6B6358] flex items-center space-x-1 truncate">
                                <MapPin className="w-3 h-3 text-[#8A9A86] shrink-0" />
                                <span className="truncate">{venue.address}</span>
                              </p>
                            )}

                            {venue.time && (
                              <p className="text-[10px] text-[#7A7268] flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-[#8C827A] shrink-0" />
                                <span>{venue.time}</span>
                              </p>
                            )}

                            {venue.notes && (
                              <p className="text-[10px] text-[#8C8276] italic line-clamp-2">
                                "{venue.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                            {venue.googleMapsUrl ? (
                              <a
                                href={venue.googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#2D3748] hover:underline flex items-center space-x-0.5 font-medium"
                              >
                                <span>Ver Mapa</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[9px] text-[#8C8276]">Sin enlace</span>
                            )}

                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditVenue(venue)}
                                className="p-1 text-[#7A7268] hover:text-[#2D3748] hover:bg-[#EBEBEB] rounded-md transition-colors cursor-pointer"
                                title="Editar Sede"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVenueItem(venue.id, venue.name)}
                                className="p-1 text-[#7A7268] hover:text-red-600 hover:bg-[#EBEBEB] rounded-md transition-colors cursor-pointer"
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
              )}
            </div>
          </div>
        </div>

                {/* 3. Gift Registry & Bank Details */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3" : "bg-[#EBEBEB] rounded-2xl px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              <span>Mesa de Regalos & Transferencias</span>
            </h3>

            {/* Checkbox Toggle para mostrar u ocultar la sección completa en la Web de Invitados */}
            <label className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] border border-transparent hover:bg-[#F3EFEA] cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                id="checkbox-show-gift-registry"
                checked={formData.showGiftRegistry !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  showGiftRegistry: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#2D3748] focus:ring-[#d1d1d1]/30 border-[#D9CEBF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2D2A26]">
                Mostrar sección en la Web de Invitados
              </span>
            </label>
          </div>

          <div className={`space-y-4 transition-opacity ${formData.showGiftRegistry === false ? 'opacity-60' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#524B42] mb-1 text-xs">Título de la Sección</label>
                <input
                  type="text"
                  value={formData.giftRegistryTitle || 'Mesa de Regalos & Transferencias'}
                  onChange={(e) => setFormData({
                    ...formData,
                    giftRegistryTitle: e.target.value
                  })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#524B42] mb-1 text-xs">Mensaje Descriptivo</label>
                <textarea
                  value={formData.giftRegistryMessage || 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle adicional con nosotros para nuestro nuevo hogar y luna de miel, ponemos a tu disposición nuestras opciones.'}
                  onChange={(e) => setFormData({
                    ...formData,
                    giftRegistryMessage: e.target.value
                  })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pb-2 border-b border-[#F0EAE1]">
              <h4 className="font-semibold text-sm text-[#2D2A26]">Datos Bancarios para Transferencias</h4>
              <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.showBankDetails !== false}
                  onChange={(e) => setFormData({
                    ...formData,
                    showBankDetails: e.target.checked
                  })}
                  className="w-4 h-4 rounded text-[#2D3748] border-[#D9CEBF]"
                />
                <span className="text-xs text-[#524B42]">Mostrar Datos Bancarios</span>
              </label>
            </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs transition-opacity ${
            formData.showBankDetails === false ? 'opacity-60' : 'opacity-100'
          }`}>
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">Banco</label>
              <input
                type="text"
                value={formData.bankDetails?.bankName || ''}
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
                value={formData.bankDetails?.accountHolder || ''}
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
                value={formData.bankDetails?.clabe || ''}
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
                value={formData.bankDetails?.accountNumber || ''}
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
                value={formData.bankDetails?.concept || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, concept: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5]"
              />
            </div>          </div>
        </div>
        </div>

        
        {/* Mensajes & Bendiciones de los Invitados */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3" : "bg-[#EBEBEB] rounded-2xl px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3"}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-[#2D3748]" />
              <span>Mensajes & Bendiciones de los Invitados</span>
            </h3>

            {/* Checkbox Toggle para mostrar u ocultar la sección en la Web de Invitados */}
            <label className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#EBEBEB] border border-transparent hover:bg-[#F3EFEA] cursor-pointer transition-colors select-none">
              <input
                type="checkbox"
                id="checkbox-show-wishes-wall"
                checked={formData.showWishesWall !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  showWishesWall: e.target.checked
                })}
                className="w-4 h-4 rounded text-[#2D3748] focus:ring-[#d1d1d1]/30 border-[#D9CEBF] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2D2A26]">
                Mostrar sección en la Web de Invitados
              </span>
            </label>
          </div>
          <p className="text-xs text-[#7A7268]">
            Habilita o deshabilita el muro de mensajes y buenos deseos donde los invitados confirmados pueden dejar sus dedicatorias para la pareja.
          </p>
        </div>

        {/* 4. Dress Code & Suggested Color Palette */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3" : "bg-[#EBEBEB] rounded-2xl px-[2px] sm:px-1 py-3 sm:py-4 border border-transparent shadow-2xs space-y-3"}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block font-semibold text-[#524B42] mb-1">
                Estilo / Título del Dress Code
              </label>
              <input
                type="text"
                value={formData.dressCodeStyle || ''}
                onChange={(e) => setFormData({ ...formData, dressCodeStyle: e.target.value })}
                placeholder="ej. Formal Rigurosa / Traje Oscuro y Vestido Largo"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20 font-serif font-bold text-[#2D2A26]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D3748] mb-1 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Regla de Oro (Colores Reservados)</span>
              </label>
              <input
                type="text"
                value={formData.forbiddenColorsNote || ''}
                onChange={(e) => setFormData({ ...formData, forbiddenColorsNote: e.target.value })}
                placeholder="Blanco, marfil y beige reservados para la novia."
                className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/40 focus:bg-[#EBEBEB] focus:ring-2 focus:ring-rose-300 text-rose-950 font-medium"
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
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:ring-2 focus:ring-[#d1d1d1]/20"
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
                      { name: 'Nuevo Color', hex: '#2D3748', description: 'Recomendación de vestimenta' }
                    ]
                  });
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#8A9A86] hover:bg-[#6E7E6A] text-[#2D3748] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Tono</span>
              </button>
            </div>

            {/* Colors list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.suggestedColors || []).map((col, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D9CEBF] flex items-center space-x-2 text-xs">
                  <div 
                    className="relative shrink-0 cursor-pointer"
                    onClick={() => setEditingColorIndex(idx)}
                    title="Seleccionar color o extraer desde imagen"
                  >
                    <div 
                      style={{ backgroundColor: col.hex }}
                      className="w-8 h-8 rounded-full border-2 border-transparent shadow-xs hover:scale-105 transition-transform"
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
                      className="w-full px-2 py-0.5 text-xs font-semibold rounded-md border border-[#D9CEBF] bg-[#EBEBEB]"
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
                      className="w-full px-2 py-0.5 text-[11px] text-[#524B42] rounded-md border border-[#D9CEBF] bg-[#EBEBEB]"
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
                    <Paintbrush className="w-4 h-4 text-[#2D3748]" />
                    <span>Aplicar Paleta a la Página de éste evento</span>
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
                      backgroundColor: formData.suggestedColors[0]?.hex || '#2D3748', 
                      color: getAccessibleTextColor(formData.suggestedColors[0]?.hex || '#2D3748') 
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
                    ✓ Contraste {getContrastRatio(formData.suggestedColors[0]?.hex || '#2D3748', getAccessibleTextColor(formData.suggestedColors[0]?.hex || '#2D3748')).toFixed(1)}:1 (Legible WCAG)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-transparent">
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
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-xs font-bold shadow-xs hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all cursor-pointer"
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
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#EBEBEB] hover:bg-[#EBEBEB] text-[#524B42] hover:text-[#2D2A26] border border-[#D9CEBF] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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

        {/* Admin Section: Mantenimiento de Boda Activa */}
        {isLevel1Admin && (
          <div className="mt-6 space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3 text-xs">
                <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                  <Eraser className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-gray-900 text-sm">Opción de Administrador: Limpiar evento actual</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Permite borrar todos los registros (invitados, cronograma, presupuesto, tareas, mesas de Asignación de Mesas, elementos de Plano Local y proveedores) para dejarlos en blanco y el lienzo vacío. Solo se conservarán el <strong>nombre del evento</strong>, la <strong>fecha</strong>, la <strong>ciudad</strong> y la <strong>fecha límite de confirmación</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-amber-800 font-bold text-xs transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer border border-amber-200/80"
              >
                <Eraser className="w-4 h-4" />
                <span>Limpiar Evento Actual</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] transition-all shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex items-center space-x-2 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-[#2D3748]" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? '¡Cambios Guardados en Firestore!' : 'Guardar Todos los Cambios'}</span>
          </button>
        </div>
      </form>
    </div>

    <ColorPickerWithImageModal 
      isOpen={editingColorIndex !== null}
      onClose={() => setEditingColorIndex(null)}
      initialHex={editingColorIndex !== null && formData.suggestedColors && formData.suggestedColors[editingColorIndex] ? formData.suggestedColors[editingColorIndex].hex : '#000000'}
      onColorChange={(hex) => {
        if (editingColorIndex !== null) {
          const updated = [...(formData.suggestedColors || [])];
          updated[editingColorIndex] = { ...updated[editingColorIndex], hex };
          setFormData({ ...formData, suggestedColors: updated });
        }
      }}
      colorName={editingColorIndex !== null && formData.suggestedColors && formData.suggestedColors[editingColorIndex] ? formData.suggestedColors[editingColorIndex].name : undefined}
    />

    {/* Modal de Confirmación: Limpiar Boda (Solo Administrador) */}
    {showClearModal && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsClearing(false);
            setShowClearModal(false);
          }
        }}
      >
        <div className="bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] border border-white/60 p-6 sm:p-8 max-w-lg w-full space-y-5 text-gray-900 relative">
          
          <div className="flex items-start justify-between pb-2 border-b border-gray-300/40 gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-rose-600 shrink-0">
                <Eraser className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-gray-900 leading-tight">
                  ¿Limpiar Evento y dejar registros en blanco?
                </h3>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mt-0.5">
                  Acción exclusiva de Administrador
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsClearing(false);
                setShowClearModal(false);
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed">
            Esta acción borrará permanentemente todos los datos de esta boda para que puedas volver a llenarlos desde cero.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] space-y-2 text-xs">
            <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Se borrarán todos los siguientes registros:
            </div>
            <ul className="text-gray-700 space-y-1 pl-1 text-[11px]">
              <li>• Lista de invitados y pases asignados</li>
              <li>• Cronograma y protocolo minuto a minuto</li>
              <li>• Presupuesto y gastos</li>
              <li>• Tareas y lista de verificación</li>
              <li>• Todas las mesas de Asignación de Mesas</li>
              <li>• Todo el Plano Local (el lienzo quedará completamente vacío)</li>
              <li>• Proveedores y cotizaciones</li>
              <li>• Sedes adicionales, datos bancarios y notas</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border border-emerald-300/60 space-y-1.5 text-xs text-emerald-950">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Solo se conservarán los siguientes datos:
            </div>
            <div className="text-[11px] text-gray-800 space-y-1">
              <div>✓ <strong>Nombre del Evento:</strong> {formData.coupleNames || settings.coupleNames}</div>
              <div>✓ <strong>Fecha:</strong> {formData.weddingDate || settings.weddingDate || 'Pendiente'}</div>
              <div>✓ <strong>Ciudad:</strong> {formData.locationSummary || settings.locationSummary || 'Pendiente'}</div>
              <div>✓ <strong>Fecha Límite para confirmar Asistencia:</strong> {formData.rsvpDeadline || settings.rsvpDeadline || 'No definida'}</div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsClearing(false);
                setShowClearModal(false);
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700 text-xs font-semibold hover:text-gray-900 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearWedding}
              className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-rose-600 hover:text-rose-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Eraser className="w-4 h-4" />
              <span>{isClearing ? 'Limpiando Boda...' : 'Sí, Limpiar Boda'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Modal de Confirmación: Purga de Archivos Residuales */}
    {showPurgeResidualsModal && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isPurgingResiduals) {
            setShowPurgeResidualsModal(false);
          }
        }}
      >
        <div className="bg-[#EBEBEB] rounded-[2.5rem] shadow-[12px_12px_24px_#c8c8c8,-12px_-12px_24px_#ffffff] border border-white/60 p-6 sm:p-8 max-w-lg w-full space-y-5 text-gray-900 relative">
          
          <div className="flex items-start justify-between pb-2 border-b border-gray-300/40 gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-gray-900 leading-tight">
                  Purga de Archivos Residuales
                </h3>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mt-0.5">
                  Limpieza y optimización del servidor
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={isPurgingResiduals}
              onClick={() => setShowPurgeResidualsModal(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed">
            Esta acción escaneará la base de datos y la carpeta de archivos de tu servidor para eliminar definitivamente todo el contenido de eventos que hayan sido borrados anteriormente.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] space-y-2 text-xs">
            <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              La purga incluye:
            </div>
            <ul className="text-gray-700 space-y-1.5 pl-1 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Archivos JSON de eventos eliminados en <code>data/weddings/</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Diseños publicados huérfanos en <code>data/weddingcraft/published/</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Planos de distribución y mesas residuales en <code>data/floor_plans/</code></span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Archivos temporales o respaldos obsoletos (<code>.tmp</code>, <code>.bak</code>)</span>
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border border-emerald-300/60 space-y-1 text-xs text-emerald-950">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía de Protección de Datos</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-normal">
              Tus eventos activos y sus listas de invitados, presupuestos y fotos cargadas están 100% protegidos y <strong>NO serán modificados ni eliminados</strong>.
            </p>
          </div>

          {purgeResultMsg && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
              purgeResultMsg.type === 'success' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{purgeResultMsg.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              disabled={isPurgingResiduals}
              onClick={() => setShowPurgeResidualsModal(false)}
              className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-gray-700 text-xs font-semibold hover:text-gray-900 transition-all cursor-pointer disabled:opacity-50"
            >
              Cerrar
            </button>

            <button
              type="button"
              disabled={isPurgingResiduals}
              onClick={handlePurgeResiduals}
              className="px-5 py-2.5 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-rose-700 hover:text-rose-800 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 border border-rose-300/80"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>{isPurgingResiduals ? 'Analizando y Limpiando Servidor...' : 'Sí, Borrar Archivos Residuales'}</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal para Descargar Paquete Completo SubirWeb para cPanel */}
    <SubirWebModal
      isOpen={showSubirWebModal}
      onClose={() => setShowSubirWebModal(false)}
    />
    </>
  );
};
