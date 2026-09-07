import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { TimelineMilestone } from '../../types';
import { MilestoneModal } from './MilestoneModal';
import { ProtocolPrintModal } from './ProtocolPrintModal';
import { formatAltibajas, extractContactPersonOnly } from '../../lib/formatUtils';
import { formatTimingHeaderDate, sortTimelineMilestones, parseMilestoneTimeToMinutes } from '../../lib/dateUtils';
import { 
  Plus, 
  Printer, 
  MapPin, 
  User, 
  Sparkles, 
  Edit, 
  Trash2, 
  Star,
  LayoutList,
  Columns,
  BookmarkCheck
} from 'lucide-react';

// Delicate line-art vector icons inspired directly by timming.jfif
const TimingIcons = {
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="m12 3 1.8 5.4a1 1 0 0 0 .6.6L19.8 11l-5.4 1.8a1 1 0 0 0-.6.6L12 19l-1.8-5.4a1 1 0 0 0-.6-.6L4.2 11l5.4-1.8a1 1 0 0 0 .6-.6L12 3Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M5 17v2" />
      <path d="M6 18H4" />
    </svg>
  ),
  HeartsCouple: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M16.5 4.5a4.5 4.5 0 0 0-6.36 0L9.5 5.14 8.86 4.5a4.5 4.5 0 0 0-6.36 6.36L9.5 17.86l7-7a4.5 4.5 0 0 0 0-6.36Z" />
      <path d="m15 11 3.5 3.5a3 3 0 1 1-4.24 4.24L13.5 18" />
    </svg>
  ),
  EnvelopeHeart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="M12 11.2a1.8 1.8 0 0 0-1.27-.5 1.8 1.8 0 0 0-1.27 3.07L12 16.3l2.54-2.53a1.8 1.8 0 0 0-1.27-3.07 1.8 1.8 0 0 0-1.27.5Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  ),
  Bouquet: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M12 7.5a3.5 3.5 0 1 0-3.5-3.5c0 1.93 1.57 3.5 3.5 3.5Z" />
      <path d="M7.5 11a3 3 0 1 0-3-3c0 1.66 1.34 3 3 3Z" />
      <path d="M16.5 11a3 3 0 1 0-3-3c0 1.66 1.34 3 3 3Z" />
      <path d="m10 12-4 8" />
      <path d="m14 12 4 8" />
      <path d="m12 12v9" />
      <path d="M9 16c1.5.5 4.5.5 6 0" />
    </svg>
  ),
  MusicNotes: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M9 9l12-2" />
      <path d="m3 4 1 1-1 1" />
      <path d="m4 10 1 1-1 1" />
    </svg>
  ),
  WeddingRings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <circle cx="8" cy="14" r="5" />
      <circle cx="15" cy="12" r="5" />
      <path d="m7.5 9 1-2.5 2 1" />
      <path d="M8.5 6.5 10 8" />
      <path d="m16 7 .5-1.5 1.5.5" />
    </svg>
  ),
  ToastGlasses: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M7 3v6a4 4 0 0 0 4 4v7" />
      <path d="M5 20h6" />
      <path d="M17 3v6a4 4 0 0 1-4 4" />
      <path d="M13 13v7" />
      <path d="M11 20h6" />
      <path d="M3 3h8" />
      <path d="M13 3h8" />
      <path d="m12 6 .5-1.5" />
    </svg>
  ),
  CameraPhotos: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
      <path d="M18 10h.01" />
    </svg>
  ),
  ChurchArch: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M12 2v4" />
      <path d="M10 4h4" />
      <path d="m12 6 6 4v10H6V10z" />
      <path d="M10 20v-5a2 2 0 0 1 4 0v5" />
    </svg>
  ),
  FeastUtensils: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#2D3748]">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  RibbonBow: () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 sm:w-24 sm:h-24 text-[#2D3748]/70 pointer-events-none">
      {/* Center knot */}
      <circle cx="50" cy="40" r="5.5" className="fill-[#2D3748]/10 stroke-[#2D3748]" />
      {/* Left Loop */}
      <path d="M46 38 C32 20 16 30 22 46 C26 56 42 45 46 42 Z" className="stroke-[#2D3748]" />
      <path d="M28 35 C32 38 38 40 44 40" className="stroke-[#2D3748]/60" />
      {/* Right Loop */}
      <path d="M54 38 C68 20 84 30 78 46 C74 56 58 45 54 42 Z" className="stroke-[#2D3748]" />
      <path d="M72 35 C68 38 62 40 56 40" className="stroke-[#2D3748]/60" />
      {/* Left trailing ribbon */}
      <path d="M47 45 C38 60 42 75 32 90 C30 93 26 92 28 88 C32 75 32 62 45 47" className="stroke-[#2D3748]" />
      {/* Right trailing ribbon */}
      <path d="M53 45 C62 60 58 75 68 90 C70 93 74 92 72 88 C68 75 68 62 55 47" className="stroke-[#2D3748]" />
    </svg>
  ),
};

const renderDescriptionWithMentions = (text?: string) => {
  if (!text) return null;
  const parts = text.split(/(@[\wÀ-ÿ&.'-]+(?:\s+[\wÀ-ÿ&.'-]+)*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={i}
          className="font-semibold text-[#2D3748] bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/80 text-[11px] sm:text-xs inline-block my-0.5 mx-0.5"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export const TimelineModule: React.FC = () => {
  const {
    appTheme, 
    timeline, 
    settings, 
    addMilestone, 
    updateMilestone, 
    deleteMilestone,
    canEditActiveWedding,
    canPrint
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'editorial' | 'cards' | 'protocol'>('editorial');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  const filteredTimeline = useMemo(() => {
    let list = timeline;
    if (viewMode === 'protocol') {
      list = list.filter((m) => Boolean(m.isProtocolCrucial));
    }
    if (categoryFilter !== 'all') {
      list = list.filter((m) => m.category === categoryFilter);
    }
    return sortTimelineMilestones(list);
  }, [timeline, categoryFilter, viewMode]);

  const handleOpenAdd = () => {
    setEditingMilestone(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: TimelineMilestone) => {
    setEditingMilestone(m);
    setIsModalOpen(true);
  };

  const handleSaveMilestone = async (data: any) => {
    try {
      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, data);
      } else {
        await addMilestone(data);
      }
    } catch (err) {
      console.error('Error al guardar hito del cronograma:', err);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Deseas eliminar "${title}" del cronograma?`)) {
      deleteMilestone(id);
    }
  };

  // Match icon smartly based on title, category, and description
  const resolveMilestoneIcon = (item: TimelineMilestone) => {
    const text = `${item.category} ${item.title} ${item.description}`.toLowerCase();

    if (text.includes('brindis') || text.includes('coctel') || text.includes('cóctel') || text.includes('champagne') || text.includes('trago') || text.includes('bar')) {
      return <TimingIcons.ToastGlasses />;
    }
    if (text.includes('música') || text.includes('musica') || text.includes('baile') || text.includes('fiesta') || text.includes('dj') || text.includes('show') || text.includes('vals')) {
      return <TimingIcons.MusicNotes />;
    }
    if (text.includes('ceremonia') || text.includes('iglesia') || text.includes('boda') || text.includes('alianzas') || text.includes('anillos') || text.includes('civil') || text.includes('matrimonio')) {
      return <TimingIcons.WeddingRings />;
    }
    if (text.includes('foto') || text.includes('sesión') || text.includes('sesion') || text.includes('video') || text.includes('cámara') || text.includes('camara')) {
      return <TimingIcons.CameraPhotos />;
    }
    if (text.includes('ramo') || text.includes('flores') || text.includes('damitas') || text.includes('vestir') || text.includes('vestido') || text.includes('novia') || text.includes('bouq')) {
      return <TimingIcons.Bouquet />;
    }
    if (text.includes('invit') || text.includes('carta') || text.includes('llegada') || text.includes('saludo') || text.includes('mesa')) {
      return <TimingIcons.EnvelopeHeart />;
    }
    if (text.includes('alimento') || text.includes('comida') || text.includes('cena') || text.includes('almuerzo') || text.includes('banquete') || text.includes('buffet') || text.includes('torta') || text.includes('pastel')) {
      return <TimingIcons.FeastUtensils />;
    }
    if (text.includes('novio') || text.includes('amor') || text.includes('pareja') || text.includes('desfile')) {
      return <TimingIcons.HeartsCouple />;
    }
    if (text.includes('prepar') || text.includes('maquillaje') || text.includes('peinado') || text.includes('beauty') || text.includes('inaugur') || text.includes('inicio')) {
      return <TimingIcons.Sparkles />;
    }
    return <TimingIcons.Sparkles />;
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'preparacion':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FDF3D6] text-[#8C6415]">Preparación</span>;
      case 'ceremonia':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#EAE8FE] text-[#4F46E5]">Ceremonia Religiosa</span>;
      case 'ceremonia_civil':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#E0F2FE] text-[#0284C7]">Ceremonia Civil</span>;
      case 'coctel':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#DCFCE7] text-[#16A34A]">Cóctel</span>;
      case 'sesion_fotos':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FFE4E6] text-[#E11D48]">Sesión de Fotos</span>;
      case 'recepcion':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#DBEAFE] text-[#2563EB]">Recepción</span>;
      case 'servir_alimentos':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FFEDD5] text-[#D97706]">Servir Alimentos</span>;
      case 'saludo_mesas':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#CCFBF1] text-[#0D9488]">Saludo mesa x mesa</span>;
      case 'protocolo':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FCE7F3] text-[#BE185D]">Protocolo y Brindis</span>;
      case 'baile_novios_familia':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE]">Baile Novios y Familia</span>;
      case 'fiesta':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#FAE8FF] text-[#A21CAF]">Fiesta y Baile</span>;
      default:
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800">General</span>;
    }
  };

  const categoriesFilterList: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los Momentos' },
    { id: 'preparacion', label: 'Preparación' },
    { id: 'ceremonia', label: 'Ceremonia Religiosa' },
    { id: 'ceremonia_civil', label: 'Ceremonia Civil' },
    { id: 'sesion_fotos', label: 'Sesión de Fotos' },
    { id: 'coctel', label: 'Cóctel' },
    { id: 'recepcion', label: 'Recepción' },
    { id: 'servir_alimentos', label: 'Servir Alimentos' },
    { id: 'saludo_mesas', label: 'Saludo mesa x mesa' },
    { id: 'protocolo', label: 'Protocolo y Brindis' },
    { id: 'baile_novios_familia', label: 'Baile Novios y Familia' },
    { id: 'fiesta', label: 'Fiesta y Baile' },
  ];

  const timingHeaderTitle = formatTimingHeaderDate(settings.weddingDate);
  const eventName = settings.coupleNames?.trim() || 
    (settings.brideName && settings.groomName ? `${settings.brideName} & ${settings.groomName}` : 'Nuestro Evento');

  return (
    <div className="space-y-6">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Programa Principal
          </h2>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="bg-[#EBEBEB] p-1 rounded-xl border border-[#D9CEBF] flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('editorial')}
              title="Vista Editorial Timing"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'editorial'
                  ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                  : 'text-[#524B42] hover:text-[#2D3748]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Estilo Timing</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Vista Texto"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                  : 'text-[#524B42] hover:text-[#2D3748]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Texto</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('protocol')}
              title="Vista Protocolo (Hitos marcados para el protocolo)"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'protocol'
                  ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs font-bold'
                  : 'text-[#524B42] hover:text-[#2D3748]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-[#2D3748]" />
              <span>Protocolo</span>
            </button>
          </div>

          {canPrint && (
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              id="btn-export-protocol-sheet"
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#EBEBEB] text-[#524B42] border border-[#D9CEBF] text-xs font-semibold hover:bg-[#EBEBEB] hover:text-[#2D3748] transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#2D3748]" />
              <span className="hidden sm:inline">Exportar Cronograma (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}

          {canEditActiveWedding && (
            <button
              type="button"
              onClick={handleOpenAdd}
              id="btn-add-milestone"
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold hover:bg-[#EBEBEB] transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir Hito</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Badges */}
      <div className="flex overflow-x-auto pb-2 gap-2 text-xs border-b border-transparent">
        {categoriesFilterList.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategoryFilter(item.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === item.id
                ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-xs'
                : 'bg-[#F2ECE3] text-[#524B42] hover:bg-[#E8DCCF]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredTimeline.length === 0 && (
        <div className={isNeumorphic ? "text-center py-16 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-dashed border-[#D9CEBF] p-6" : "text-center py-16 bg-[#EBEBEB] rounded-3xl border border-dashed border-[#D9CEBF] p-6"}>
          <Sparkles className="w-10 h-10 text-[#2D3748]/40 mx-auto mb-3" />
          <h3 className="font-serif-display text-lg font-bold text-[#2D2A26]">
            {viewMode === 'protocol' ? 'No hay hitos en el subgrupo de protocolo' : 'No hay hitos en esta categoría'}
          </h3>
          <p className="text-xs text-[#7A7268] mt-1 mb-4">
            {viewMode === 'protocol'
              ? 'Edita un hito y activa la casilla "Hito de Protocolo" para incluirlo en este subgrupo.'
              : 'Selecciona otra categoría o añade un nuevo momento para tu cronograma.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-semibold hover:bg-[#EBEBEB] transition-colors cursor-pointer"
          >
            + Añadir Primer Hito
          </button>
        </div>
      )}

      {/* 1. EDITORIAL TIMMING VIEW (Inspired by timming.jfif aesthetic with site colors) */}
      {viewMode === 'editorial' && filteredTimeline.length > 0 && (
        <div className="relative bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#F5EFE6] rounded-3xl px-5 sm:px-10 lg:px-12 pt-3 sm:pt-4 pb-6 sm:pb-8 border border-transparent shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden">
          
          {/* Top Decorative Ribbon / Bow Illustration */}
          <div className="absolute top-1.5 right-2 sm:top-2.5 sm:right-5 pointer-events-none opacity-85">
            <TimingIcons.RibbonBow />
          </div>

          {/* Editorial Script Header: Reduced vertical space above and below, font of title preserved */}
          <div className="relative z-10 mb-3 sm:mb-4 text-left pr-16 sm:pr-24">
            <h3 className="font-script text-3xl sm:text-4xl md:text-5xl text-[#2D3748] tracking-wide drop-shadow-2xs">
              Timing de {eventName}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A7268] mt-0.5 font-arapey italic">
              Programa Oficial Minuto a Minuto
            </p>
          </div>

          {/* Central Vertical Spine Timeline */}
          <div className="relative z-10 max-w-4xl mx-auto">
            
            {/* The Continuous Vertical Connecting Axis */}
            <div className="absolute left-[88px] sm:left-[145px] md:left-[165px] top-3 bottom-6 w-[2px] bg-gradient-to-b from-[#D4AF37]/80 via-[#2D3748]/50 to-[#D4AF37]/80" />

            <div className="space-y-2 sm:space-y-2.5">
              {filteredTimeline.map((item, idx) => {
                const nextItem = filteredTimeline[idx + 1];
                let durationText: string | null = null;
                if (nextItem && item.time && nextItem.time) {
                  const min1 = parseMilestoneTimeToMinutes(item.time);
                  const min2 = parseMilestoneTimeToMinutes(nextItem.time);
                  const diff = min2 - min1;
                  if (diff > 0) {
                    durationText = `${diff} mins`;
                  }
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveMilestoneId(activeMilestoneId === item.id ? null : item.id)}
                    className="group relative flex items-start transition-colors duration-200 cursor-pointer rounded-xl py-1 px-2 -mx-2 hover:bg-white"
                  >
                    
                    {/* Left Column: Icon + Time + Action buttons underneath */}
                    <div className="w-[95px] sm:w-[150px] md:w-[170px] pr-2.5 sm:pr-5 shrink-0 flex flex-col items-end pt-0.5">
                      
                      <div className="flex items-center justify-end space-x-1.5 sm:space-x-2.5">
                        {/* Delicate Line-Art Icon */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EBEBEB]/80 border border-transparent shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {resolveMilestoneIcon(item)}
                        </div>

                        {/* Time Label: Aboreto uppercase style with Work Sans units */}
                        <span className="font-aboreto text-xs sm:text-sm text-[#2D2A26] tracking-wider whitespace-nowrap font-normal">
                          {item.time} <span className="font-work-sans text-[10px] sm:text-[11px] font-normal tracking-wide lowercase">hs</span>
                        </span>
                      </div>

                      {/* Botones de Editar y Borrar Hito DEBAJO de la hora (visibles al pasar el mouse o al hacer click) */}
                      {canEditActiveWedding && (
                        <div 
                          className={`mt-0.5 flex items-center justify-end space-x-1 transition-all duration-200 font-work-sans ${
                            activeMilestoneId === item.id
                              ? 'opacity-100 translate-y-0 pointer-events-auto'
                              : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-[#EBEBEB] border border-transparent text-[#6B6358] hover:text-[#2D3748] hover:bg-[#FAF8F5] text-[9px] font-semibold shadow-2xs transition-all cursor-pointer tracking-wider uppercase"
                            title="Editar Hito"
                          >
                            <Edit className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id, item.title);
                            }}
                            className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-[#EBEBEB] border border-rose-200 text-rose-600 hover:text-[#2D3748] hover:bg-rose-600 text-[9px] font-semibold shadow-2xs transition-all cursor-pointer tracking-wider uppercase"
                            title="Borrar Hito"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span className="hidden sm:inline">Borrar</span>
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Center Horizontal Cross-Tick Marker */}
                    <div className="relative flex items-center justify-center shrink-0 w-0 z-10 pt-1.5 sm:pt-2">
                      <div className="w-4 sm:w-6 h-[2px] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] group-hover:bg-[#D4AF37] transition-colors -ml-[8px] sm:-ml-[12px] shadow-2xs" />
                    </div>

                    {/* Right Column: Title, Description, Responsible Person & Meta */}
                    <div className="pl-3.5 sm:pl-6 flex-1 min-w-0">
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                            {/* Moment Title in ABORETO - reduced 1 point */}
                            <h4 className="font-aboreto text-xs sm:text-sm md:text-[15px] text-[#2D2A26] uppercase tracking-wider leading-tight group-hover:text-[#2D3748] transition-colors font-normal">
                              {item.title}
                            </h4>

                            {durationText && (
                              <span className="font-work-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#2D2A26] bg-[#EDE8E1] border border-[#C8BFAF] px-1.5 py-0.5 rounded-md shadow-2xs">
                                {durationText}
                              </span>
                            )}

                            {item.isProtocolCrucial && (
                              <span className="font-work-sans inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-[#D4AF37]/20 text-[#8B6B23] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                                <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                                <span>Crucial</span>
                              </span>
                            )}
                          </div>

                          {/* Responsible Person / "A cargo de..." in Arapey Italic with tight interlinear space */}
                          {item.responsiblePerson && (
                            <p className="text-xs sm:text-[13px] text-[#524B42] mt-0.5 font-arapey italic leading-tight">
                              <span className="text-[#7A7268]">A cargo de </span>
                              <strong className="font-medium text-[#2D2A26] group-hover:text-[#2D3748] transition-colors not-italic font-arapey text-xs sm:text-sm">
                                {formatAltibajas(extractContactPersonOnly(item.responsiblePerson))}
                              </strong>
                            </p>
                          )}
                        </div>

                        {/* Category Badge in Work Sans */}
                        <div className="font-work-sans flex items-center space-x-2 shrink-0 self-start sm:self-center tracking-wide">
                          {getCategoryBadge(item.category)}
                        </div>
                      </div>

                    {/* Description in Arapey Italic with tight interlinear space and line height */}
                    {item.description && (
                      <p className="text-xs sm:text-[13px] text-[#5C554B] mt-0.5 leading-tight font-arapey italic">
                        {renderDescriptionWithMentions(item.description)}
                      </p>
                    )}

                    {/* Location & Dress/Items Badges in Work Sans & Arapey (rendered only if present) */}
                    {(item.location || item.dressOrItemsRequired) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 pt-0.5 border-t border-[#EAE3D9]/60 text-[10px] sm:text-[11px] font-work-sans">
                        {item.location && (
                          <span className="inline-flex items-center space-x-1 text-[#6B6358] bg-[#EBEBEB]/80 px-1.5 py-0.5 rounded-md border border-[#D9CEBF] tracking-wide uppercase text-[9px] sm:text-[10px]">
                            <MapPin className="w-2.5 h-2.5 text-[#8A9A86] shrink-0" />
                            <span className="font-medium truncate max-w-[240px] sm:max-w-none">{item.location}</span>
                          </span>
                        )}

                        {item.dressOrItemsRequired && (
                          <span className="inline-flex items-center space-x-1 text-[#8B6B23] bg-[#FFFDF5] px-1.5 py-0.5 rounded-md border border-[#D4AF37]/40 font-arapey italic text-[11px] sm:text-xs">
                            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37] shrink-0" />
                            <span className="truncate max-w-[240px] sm:max-w-none">{item.dressOrItemsRequired}</span>
                          </span>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

            {/* Bottom Footer (Wedding Timing label removed) */}
            <div className="pt-4 sm:pt-6 mt-6 border-t border-transparent/60 flex items-center justify-end">
              <span className="text-xs sm:text-sm text-[#8C8276] font-arapey italic">
                {filteredTimeline.length} momentos programados
              </span>
            </div>

          </div>
        </div>
      )}

      {/* 2. DETAILED CARD / PROTOCOLO VIEW (Alternative Toggle) */}
      {(viewMode === 'cards' || viewMode === 'protocol') && filteredTimeline.length > 0 && (
        <div className="bg-[#EBEBEB] print:bg-white text-black w-full overflow-hidden">
          {/* Header with gray bg */}
          <div className="bg-[#f0f0f0] print:bg-white px-3 py-1.5 border-b border-black flex items-center justify-between">
            <span className="font-['Raleway',sans-serif] text-[17px] font-normal text-black tracking-wide uppercase">
              {viewMode === 'protocol'
                ? `Protocolo de Boda (${filteredTimeline.length} hitos)`
                : (categoriesFilterList.find(c => c.id === categoryFilter)?.label || 'Preparación')}
            </span>
            {viewMode === 'protocol' && (
              <span className="text-xs text-gray-700 font-sans">
                Subgrupo de hitos de protocolo
              </span>
            )}
          </div>

          {/* Timeline Items */}
          {filteredTimeline.map((item, idx) => (
            <div key={item.id} className="relative group hover:bg-gray-50 transition-colors">
              
              {/* Event Block Main */}
              <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] border-b border-black">
                <div className="pt-2.5 pb-1 pr-3 border-r border-black flex flex-col justify-start items-end">
                  <span className="font-['Raleway',sans-serif] text-[16px] font-normal text-black text-right whitespace-nowrap leading-tight">{item.time} hrs</span>
                </div>
                <div className="pt-2.5 pb-1 pl-3 pr-12 flex flex-col justify-start items-start relative">
                  <h3 className="font-['Raleway',sans-serif] text-[17px] font-normal text-black leading-tight w-full break-words uppercase tracking-wide">{item.title}</h3>
                  
                  {item.description && (
                    <div className="font-['Abel',sans-serif] text-[15px] font-normal text-black leading-tight mt-1 w-full break-words whitespace-pre-wrap">
                      {item.description}
                    </div>
                  )}
                  
                  {item.dressOrItemsRequired && (
                    <div className="font-['Abel',sans-serif] text-[14px] font-normal italic text-black leading-tight mt-1 w-full break-words whitespace-pre-wrap">
                      {item.dressOrItemsRequired}
                    </div>
                  )}
                  
                  {/* Action Buttons (Show on hover) */}
                  {canEditActiveWedding && (
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 no-print">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-[#EBEBEB] border border-gray-200 hover:bg-gray-100 rounded text-gray-600 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] cursor-pointer"
                        title="Editar Hito"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 bg-[#EBEBEB] border border-red-200 hover:bg-red-50 rounded text-red-600 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] cursor-pointer"
                        title="Eliminar Hito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Event Block Sub */}
              <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] border-b border-black">
                <div className="pt-0.5 pb-2 pr-3 flex flex-col justify-start items-end">
                  <span className="font-['Raleway',sans-serif] text-[14px] font-normal text-black text-right leading-tight">{item.location || ''}</span>
                </div>
                <div className="pt-0.5 pb-2 pl-3 pr-2 flex flex-col justify-start items-start">
                  <span className="font-['Raleway',sans-serif] text-[14px] font-normal text-black leading-tight">
                    {item.responsiblePerson ? extractContactPersonOnly(item.responsiblePerson) : 'Novios + Coordinación'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMilestone}
        milestoneToEdit={editingMilestone}
      />

      {/* Printable Protocol Modal */}
      <ProtocolPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Floating Action Button (FAB) at the bottom of the page */}
      {canEditActiveWedding && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
          <button
            type="button"
            onClick={handleOpenAdd}
            id="fab-add-milestone"
            className="group flex items-center space-x-2.5 px-5 py-3.5 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-sm font-semibold shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] hover:shadow-xl shadow-[#d1d1d1]/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-transparent backdrop-blur-xs"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
            <span className="tracking-wide">Añadir Hito</span>
          </button>
        </div>
      )}

    </div>
  );
};

