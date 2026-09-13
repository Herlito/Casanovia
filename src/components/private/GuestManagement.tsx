import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, ProtocolCategory, RsvpStatus } from '../../types';
import { GuestModal } from './GuestModal';
import { GuestImportModal } from './GuestImportModal';
import { CompanionModal } from './CompanionModal';
import { GuestRoleCell, GuestCompanionCell, GuestRsvpCell } from './GuestTableCells';
import { sortGuestsWithCompanions } from './TableAssignmentModule';
import { exportGuestsToExcel, ROLE_LABEL_MAP } from '../../lib/excelUtils';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Crown, 
  Sparkles, 
  Edit, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MessageCircle, 
  Flower2,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Upload,
  Heart,
  Briefcase,
  User,
  ExternalLink,
  UtensilsCrossed,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  Ticket
} from 'lucide-react';

const ROLE_ICONS: Record<string, React.ElementType> = {
  anfitrion: Sparkles,
  invitado: User,
  familia_directa: Heart,
  wedding_planner: ShieldCheck,
  cortejo_honor: Crown,
  damita_honor: Sparkles,
  paje_honor: Crown,
  nino_boda: Heart,
  proveedor: Briefcase,
  programa_evento: Crown,
  invitado_general: User,
};

const ROLE_BADGES: Record<string, string> = {
  anfitrion: 'bg-purple-100 text-purple-800 border-purple-300',
  invitado: 'bg-stone-100 text-stone-700 border-stone-300',
  familia_directa: 'bg-amber-100 text-amber-900 border-amber-300',
  wedding_planner: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cortejo_honor: 'bg-rose-100 text-rose-800 border-rose-300',
  damita_honor: 'bg-pink-100 text-pink-800 border-pink-300',
  paje_honor: 'bg-sky-100 text-sky-800 border-sky-300',
  nino_boda: 'bg-teal-100 text-teal-800 border-teal-300',
  proveedor: 'bg-blue-100 text-blue-800 border-blue-300',
  programa_evento: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  invitado_general: 'bg-stone-100 text-stone-700 border-stone-300',
};

type SortField = 'name' | 'role' | 'table' | 'none';
type SortDirection = 'asc' | 'desc';

export const GuestManagement: React.FC = () => {
  const {
    appTheme, 
    guests, 
    addGuest, 
    updateGuest, 
    deleteGuest, 
    reorderGuests, 
    importGuests, 
    settings,
    canEditActiveWedding,
    canPrint
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [companionModalGuest, setCompanionModalGuest] = useState<Guest | null>(null);
  const [copiedCodeForGuest, setCopiedCodeForGuest] = useState<string | null>(null);

  // Toggle visibility of invitation codes
  const [showInviteCodes, setShowInviteCodes] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('casanovia_show_invite_codes');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleShowCodes = (checked: boolean) => {
    setShowInviteCodes(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casanovia_show_invite_codes', String(checked));
    }
  };

  // Mobile accordion state for guest cards
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);

  const toggleExpandGuest = (id: string) => {
    setExpandedGuestId((prev) => (prev === id ? null : id));
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUnlinkCompanion = async (companionGuest: Guest) => {
    try {
      const formerMainGuestId = companionGuest.mainGuestId;
      await updateGuest(companionGuest.id, {
        mainGuestId: undefined,
        assignedTable: 'Mesa por asignar',
      });
      if (formerMainGuestId) {
        const mainGuest = guests.find((g) => g.id === formerMainGuestId);
        if (mainGuest && (mainGuest.totalPasses || 1) > 1) {
          const remainingCompanions = guests.filter(
            (g) => g.mainGuestId === formerMainGuestId && g.id !== companionGuest.id
          );
          const newPasses = Math.max(1, remainingCompanions.length + 1);
          if (newPasses !== mainGuest.totalPasses) {
            await updateGuest(formerMainGuestId, { totalPasses: newPasses });
          }
        }
      }
      showToast(`"${companionGuest.fullName}" fue desvinculado(a) como acompañante.`);
    } catch (err) {
      console.error('Error desvinculando acompañante:', err);
      showToast('Error al desvincular acompañante');
    }
  };

  // Normalize categories
  const getNormalizedCategory = (cat: ProtocolCategory | string): ProtocolCategory => {
    if (cat === 'invitado_general') return 'invitado';
    if (cat === 'programa_evento') return 'cortejo_honor';
    return cat as ProtocolCategory;
  };

  const isUnassignedTable = (t?: string) => {
    if (!t) return true;
    const lower = t.trim().toLowerCase();
    return lower === '' || lower === 'mesa por asignar' || lower === 'sin asignar' || lower === 'sin mesa' || lower === 'por asignar';
  };

  // Filter & Sort logic
  const filteredGuests = useMemo(() => {
    const list = guests.filter((guest) => {
      const normCategory = getNormalizedCategory(guest.category);
      // Category filter (if 'by_table', do not filter out categories)
      if (categoryFilter !== 'all' && categoryFilter !== 'by_table') {
        if (categoryFilter === 'invitado' && (guest.category === 'invitado' || (guest.category as string) === 'invitado_general')) {
          // match
        } else if (categoryFilter === 'cortejo_honor' && (guest.category === 'cortejo_honor' || (guest.category as string) === 'programa_evento')) {
          // match
        } else if (guest.category !== categoryFilter) {
          return false;
        }
      }
      // RSVP filter
      if (rsvpFilter !== 'all' && guest.rsvpStatus !== rsvpFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = guest.fullName.toLowerCase().includes(q);
        const matchRole = guest.protocolRoleTitle?.toLowerCase().includes(q) || false;
        const matchCode = guest.code.toLowerCase().includes(q);
        const matchTable = guest.assignedTable?.toLowerCase().includes(q) || false;
        const matchPhone = guest.phone?.toLowerCase().includes(q) || false;
        return matchName || matchRole || matchCode || matchTable || matchPhone;
      }
      return true;
    });

    // Apply sorting
    const sorted = [...list].sort((a, b) => {
      // 1. Explicit column sort
      if (sortField === 'name') {
        const cmp = a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      if (sortField === 'role') {
        const roleA = a.protocolRoleTitle || ROLE_LABEL_MAP[getNormalizedCategory(a.category)] || a.category;
        const roleB = b.protocolRoleTitle || ROLE_LABEL_MAP[getNormalizedCategory(b.category)] || b.category;
        const cmp = roleA.localeCompare(roleB, 'es', { sensitivity: 'base' });
        if (cmp !== 0) return sortDirection === 'asc' ? cmp : -cmp;
        return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
      }

      if (sortField === 'table') {
        const tableA = a.assignedTable?.trim() || '';
        const tableB = b.assignedTable?.trim() || '';
        const unassignedA = isUnassignedTable(tableA);
        const unassignedB = isUnassignedTable(tableB);

        // Unassigned tables always go to the end
        if (unassignedA && !unassignedB) return 1;
        if (!unassignedA && unassignedB) return -1;
        if (unassignedA && unassignedB) {
          return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
        }

        const cmp = tableA.localeCompare(tableB, 'es', { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return sortDirection === 'asc' ? cmp : -cmp;
        return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
      }

      // 2. Default sorting when "Por Mesa" filter is active
      if (categoryFilter === 'by_table') {
        const tableA = a.assignedTable?.trim() || '';
        const tableB = b.assignedTable?.trim() || '';
        const unassignedA = isUnassignedTable(tableA);
        const unassignedB = isUnassignedTable(tableB);

        if (unassignedA && !unassignedB) return 1;
        if (!unassignedA && unassignedB) return -1;
        if (unassignedA && unassignedB) {
          return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
        }

        const cmp = tableA.localeCompare(tableB, 'es', { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) return cmp;
        return a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' });
      }

      return 0;
    });

    if (sortField === 'none') {
      return sortGuestsWithCompanions(sorted);
    }
    return sorted;
  }, [guests, categoryFilter, rsvpFilter, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('none');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenAddModal = () => {
    setEditingGuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setIsModalOpen(true);
  };

  const handleSaveGuest = async (guestData: any) => {
    if (editingGuest) {
      await updateGuest(editingGuest.id, guestData);
    } else {
      await addGuest(guestData);
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${name}" de la lista de invitados?`)) {
      try {
        await deleteGuest(id);
      } catch (err) {
        console.error('Error al eliminar invitado:', err);
      }
    }
  };

  const handleExportExcel = () => {
    exportGuestsToExcel(guests, settings.coupleNames);
  };

  const handleImportGuests = async (importedGuests: Guest[], mode: 'append' | 'replace') => {
    await importGuests(importedGuests, mode);
  };

  const copyGuestCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeForGuest(code);
    setTimeout(() => setCopiedCodeForGuest(null), 2000);
  };

  const generateWhatsappMessage = (guest: Guest) => {
    const webUrl = window.location.origin;
    let text = `¡Hola ${guest.fullName}! Te compartimos con mucho cariño la invitación oficial a nuestra boda (${settings.coupleNames}).`;
    
    if (guest.category === 'cortejo_honor' || guest.category === 'wedding_planner' || guest.category === 'anfitrion') {
      text += `\n\n✨ Como parte de nuestro equipo y ${guest.protocolRoleTitle || 'Cortejo de Honor'}, consulta tus indicaciones y horarios con tu código de pase: *${guest.code}* en: ${webUrl}`;
    } else {
      text += `\n\nPuedes consultar tus detalles de pase (*${guest.code}*) y confirmar tu asistencia en: ${webUrl}`;
    }
    
    const encoded = encodeURIComponent(text);
    const whatsappUrl = guest.phone 
      ? `https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
      
    window.open(whatsappUrl, '_blank');
  };

  // Metrics for all roles
  const countAnfitrion = guests.filter(g => g.category === 'anfitrion').length;
  const countInvitados = guests.filter(g => g.category === 'invitado' || (g.category as string) === 'invitado_general').length;
  const countFamilia = guests.filter(g => g.category === 'familia_directa').length;
  const countPlanner = guests.filter(g => g.category === 'wedding_planner').length;
  const countCortejo = guests.filter(g => g.category === 'cortejo_honor' || (g.category as string) === 'programa_evento').length;
  const countDamita = guests.filter(g => g.category === 'damita_honor').length;
  const countPaje = guests.filter(g => g.category === 'paje_honor').length;
  const countNino = guests.filter(g => g.category === 'nino_boda').length;
  const countProveedor = guests.filter(g => g.category === 'proveedor').length;

  // IMPORTANT: Companions (with mainGuestId) are NOT counted in the total/confirmed passes sum
  // because their passes are already included within their principal guest's quota.
  const primaryGuests = guests.filter(g => !g.mainGuestId);
  const totalPasses = primaryGuests.reduce((acc, g) => acc + (g.totalPasses || 1), 0);
  const confirmedPasses = primaryGuests.filter(g => g.rsvpStatus === 'confirmed').reduce((acc, g) => acc + (g.confirmedPasses || g.totalPasses || 1), 0);

  return (
    <div className="space-y-2 sm:space-y-3">
      
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
        <div>
          <h1 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2D2A26]">
            Lista de Invitados
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canEditActiveWedding && (
            <button
              type="button"
              id="btn-add-guest"
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Invitado</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Summary KPI Cards (Hidden on mobile) */}
      <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-9 gap-2">
        
        {/* 1. Anfitriones */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'anfitrion' ? 'all' : 'anfitrion')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'anfitrion'
              ? 'bg-purple-100 text-purple-950 border-purple-400 ring-2 ring-purple-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-purple-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Anfitriones</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countAnfitrion}</div>
          <div className="text-[9px] opacity-75 truncate">Novios / Anfitrión</div>
        </button>

        {/* 2. Invitados Generales */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'invitado' ? 'all' : 'invitado')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'invitado'
              ? 'bg-stone-200/90 text-stone-900 border-stone-400 ring-2 ring-stone-400/40 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff] font-bold'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Invitados</span>
            <User className="w-3.5 h-3.5 text-stone-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countInvitados}</div>
          <div className="text-[9px] opacity-75 truncate">Amigos y asistentes</div>
        </button>

        {/* 3. Familia Directa */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'familia_directa' ? 'all' : 'familia_directa')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'familia_directa'
              ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Familia</span>
            <Heart className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countFamilia}</div>
          <div className="text-[9px] opacity-75 truncate">Padres y hermanos</div>
        </button>

        {/* 4. Wedding Planner */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'wedding_planner' ? 'all' : 'wedding_planner')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'wedding_planner'
              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Planner</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countPlanner}</div>
          <div className="text-[9px] opacity-75 truncate">Dirección y staff</div>
        </button>

        {/* 5. Cortejo de Honor */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'cortejo_honor' ? 'all' : 'cortejo_honor')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'cortejo_honor'
              ? 'bg-rose-100 text-rose-950 border-rose-400 ring-2 ring-rose-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Cortejo</span>
            <Crown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countCortejo}</div>
          <div className="text-[9px] opacity-75 truncate">Padrinos y damas</div>
        </button>

        {/* 6. Damita de Honor */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'damita_honor' ? 'all' : 'damita_honor')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'damita_honor'
              ? 'bg-pink-100 text-pink-950 border-pink-400 ring-2 ring-pink-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-pink-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Damitas</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countDamita}</div>
          <div className="text-[9px] opacity-75 truncate">Cortejo infantil</div>
        </button>

        {/* 7. Paje de Honor */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'paje_honor' ? 'all' : 'paje_honor')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'paje_honor'
              ? 'bg-sky-100 text-sky-950 border-sky-400 ring-2 ring-sky-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-sky-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pajes</span>
            <Crown className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countPaje}</div>
          <div className="text-[9px] opacity-75 truncate">Arras y anillos</div>
        </button>

        {/* 8. Niño/a de Boda */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'nino_boda' ? 'all' : 'nino_boda')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'nino_boda'
              ? 'bg-teal-100 text-teal-950 border-teal-400 ring-2 ring-teal-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-teal-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Niños</span>
            <Heart className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countNino}</div>
          <div className="text-[9px] opacity-75 truncate">Menores de edad</div>
        </button>

        {/* 9. Proveedores */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'proveedor' ? 'all' : 'proveedor')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'proveedor'
              ? 'bg-blue-100 text-blue-950 border-blue-400 ring-2 ring-blue-300 shadow-[inset_2px_2px_5px_#c8c8c8,inset_-2px_-2px_5px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Proveedores</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base font-bold font-serif-display">{countProveedor}</div>
          <div className="text-[9px] opacity-75 truncate">Foto, DJ, banquetes</div>
        </button>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#EBEBEB] p-2.5 sm:p-3.5 rounded-2xl border border-transparent shadow-xs">
        {/* Mobile View: Search input + 3 icon-only buttons in one single row */}
        <div className="flex md:hidden items-center gap-1.5 w-full">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#8C8276] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden"
            />
          </div>

          {/* Filtrar Roles (Icon only, no text) */}
          <div className="relative shrink-0" title="Filtrar por Rol">
            <div
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                categoryFilter !== 'all'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-400'
                  : 'bg-[#FAF8F5] text-[#524B42] border-[#D9CEBF]'
              }`}
            >
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryFilter(val);
                if (val === 'by_table') {
                  setSortField('table');
                  setSortDirection('asc');
                }
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Filtrar Roles"
            >
              <option value="all">Todos los Roles ({guests.length})</option>
              <option value="by_table">🍽️ Por Mesa (Listar por mesas)</option>
              <option value="anfitrion">Anfitrión ({countAnfitrion})</option>
              <option value="invitado">Invitado ({countInvitados})</option>
              <option value="familia_directa">Familia Directa ({countFamilia})</option>
              <option value="wedding_planner">Wedding Planner ({countPlanner})</option>
              <option value="cortejo_honor">Cortejo de Honor ({countCortejo})</option>
              <option value="damita_honor">Damita de Honor ({countDamita})</option>
              <option value="paje_honor">Paje de Honor ({countPaje})</option>
              <option value="nino_boda">Niño/a de Boda ({countNino})</option>
              <option value="proveedor">Proveedor ({countProveedor})</option>
              {(settings.customGuestRoles || []).map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.label} ({guests.filter(g => g.category === cr.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar Estados RSVP (Icon only, no text) */}
          <div className="relative shrink-0" title="Filtrar por Estado RSVP">
            <div
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                rsvpFilter === 'confirmed'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                  : rsvpFilter === 'pending'
                  ? 'bg-amber-100 text-amber-600 border-amber-300 ring-1 ring-amber-400'
                  : rsvpFilter === 'declined'
                  ? 'bg-rose-100 text-rose-600 border-rose-300 ring-1 ring-rose-400'
                  : 'bg-[#FAF8F5] text-[#524B42] border-[#D9CEBF]'
              }`}
            >
              {rsvpFilter === 'confirmed' ? (
                <CheckCircle2 className="w-4 h-4" color="#059669" strokeWidth={2.5} />
              ) : rsvpFilter === 'pending' ? (
                <Clock className="w-4 h-4" color="#d97706" strokeWidth={2.5} />
              ) : rsvpFilter === 'declined' ? (
                <XCircle className="w-4 h-4" color="#e11d48" strokeWidth={2.5} />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Filtrar Estados RSVP"
            >
              <option value="all">Todos los Estados RSVP</option>
              <option value="confirmed">Confirmados ({confirmedPasses} pases)</option>
              <option value="pending">Pendientes</option>
              <option value="declined">Declinados</option>
            </select>
          </div>

          {/* Mostrar Códigos (Icon only, no text) */}
          <button
            type="button"
            onClick={() => handleToggleShowCodes(!showInviteCodes)}
            title={showInviteCodes ? "Ocultar códigos" : "Mostrar códigos"}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              showInviteCodes
                ? 'bg-stone-300/90 text-[#2D2A26] border-stone-400 ring-1 ring-stone-400'
                : 'bg-[#FAF8F5] text-stone-400 border-[#D9CEBF]'
            }`}
            aria-label="Mostrar u ocultar códigos"
          >
            <Ticket className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile active filters row (if active) */}
        {(categoryFilter !== 'all' || rsvpFilter !== 'all' || searchQuery) && (
          <div className="flex md:hidden items-center justify-between mt-2 pt-1.5 border-t border-stone-200/60 text-[11px] text-[#7A7268]">
            <span className="truncate">
              {categoryFilter !== 'all' && <span className="mr-2">Rol: {categoryFilter}</span>}
              {rsvpFilter !== 'all' && <span>RSVP: {rsvpFilter}</span>}
            </span>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setRsvpFilter('all');
                setSearchQuery('');
                setSortField('none');
                setSortDirection('asc');
              }}
              className="text-[#2D3748] font-bold underline cursor-pointer shrink-0 ml-2"
            >
              Limpiar
            </button>
          </div>
        )}

        {/* Desktop View: Full search + selects + checkboxes */}
        <div className="hidden md:flex items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, rol, mesa, código de pase o teléfono..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
            />
          </div>

          {/* Role & RSVP dropdowns */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#8C8276]" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryFilter(val);
                  if (val === 'by_table') {
                    setSortField('table');
                    setSortDirection('asc');
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-xs text-[#524B42] font-medium"
              >
                <option value="all">Todos los Roles ({guests.length})</option>
                <option value="by_table">🍽️ Por Mesa (Listar por mesas)</option>
                <option value="anfitrion">Anfitrión ({countAnfitrion})</option>
                <option value="invitado">Invitado ({countInvitados})</option>
                <option value="familia_directa">Familia Directa ({countFamilia})</option>
                <option value="wedding_planner">Wedding Planner ({countPlanner})</option>
                <option value="cortejo_honor">Cortejo de Honor ({countCortejo})</option>
                <option value="damita_honor">Damita de Honor ({countDamita})</option>
                <option value="paje_honor">Paje de Honor ({countPaje})</option>
                <option value="nino_boda">Niño/a de Boda ({countNino})</option>
                <option value="proveedor">Proveedor ({countProveedor})</option>
                {(settings.customGuestRoles || []).map((cr) => (
                  <option key={cr.id} value={cr.id}>
                    {cr.label} ({guests.filter(g => g.category === cr.id).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <select
                value={rsvpFilter}
                onChange={(e) => setRsvpFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-xs text-[#524B42] font-medium"
              >
                <option value="all">Todos los Estados RSVP</option>
                <option value="confirmed">Confirmados ({confirmedPasses} pases)</option>
                <option value="pending">Pendientes</option>
                <option value="declined">Declinados</option>
              </select>
            </div>

            <div className="flex items-center text-xs">
              <label
                htmlFor="filter-show-invite-codes"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-xs text-[#524B42] font-medium cursor-pointer hover:bg-white transition-colors select-none"
                title="Mostrar u ocultar los códigos de pase de los invitados"
              >
                <input
                  type="checkbox"
                  id="filter-show-invite-codes"
                  checked={showInviteCodes}
                  onChange={(e) => handleToggleShowCodes(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer accent-emerald-600"
                />
                <span className="font-semibold">Mostrar códigos</span>
              </label>
            </div>

            {(categoryFilter !== 'all' || rsvpFilter !== 'all' || searchQuery || sortField !== 'none') && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('all');
                  setRsvpFilter('all');
                  setSearchQuery('');
                  setSortField('none');
                  setSortDirection('asc');
                }}
                className="text-xs text-[#2D3748] font-semibold underline px-1 hover:text-[#2D3748] cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2A26] text-[#2D3748] px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-transparent animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#4A5568] shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-stone-400 hover:text-[#2D3748] text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table: Lista de Invitados */}
      <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-xl sm:rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-transparent shadow-xs overflow-hidden w-full" : "bg-[#EBEBEB] rounded-xl sm:rounded-2xl border border-transparent shadow-xs overflow-hidden w-full"}>
        
        {/* Table Title Bar */}
        <div className="bg-[#FAF8F5] px-3 sm:px-4 py-2 sm:py-2.5 border-b border-transparent flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-serif-display font-bold text-xs sm:text-sm text-[#2D2A26]">
              Registros en Lista ({filteredGuests.length} de {guests.length})
            </span>
            <span className="text-[11px] sm:text-xs text-[#7A7268]">
              • {confirmedPasses} de {totalPasses} pases asignados confirmados
            </span>
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-sm sm:text-base font-bold text-[#2D2A26] mb-1">
              No se encontraron invitados con estos criterios
            </h3>
            <p className="text-xs text-[#7A7268] mb-4">
              Ajusta los filtros o agrega nuevos invitados mediante el formulario o importación de Excel.
            </p>
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold hover:bg-[#EBEBEB] cursor-pointer"
              >
                + Agregar Invitado
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#EBEBEB] border border-[#D9CEBF] text-[#524B42] text-xs font-semibold hover:bg-[#FAF8F5] cursor-pointer"
              >
                Importar Excel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-transparent text-[#7A7268]">
                  <tr>
                    {/* 1. Invitado Sortable */}
                    <th className="py-2.5 px-4 font-semibold min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => handleSort('name')}
                        className="inline-flex items-center space-x-1.5 font-semibold text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer group select-none text-left"
                        title="Ordenar por nombre de invitado (A-Z / Z-A)"
                      >
                        <span>{showInviteCodes ? 'Invitado & Código' : 'Invitado'}</span>
                        <span className={`p-0.5 rounded transition-colors ${sortField === 'name' ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>
                    </th>

                    {/* 2. Mesa & Pases Sortable */}
                    <th className="py-2.5 px-4 font-semibold min-w-[130px]">
                      <button
                        type="button"
                        onClick={() => handleSort('table')}
                        className="inline-flex items-center space-x-1.5 font-semibold text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer group select-none text-left"
                        title="Ordenar por mesa asignada"
                      >
                        <span>Mesa & Pases</span>
                        <span className={`p-0.5 rounded transition-colors ${sortField === 'table' ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                          {sortField === 'table' ? (
                            sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>
                    </th>

                    {/* 3. Acompañante */}
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Acompañante</th>

                    {/* 4. RSVP */}
                    <th className="py-2.5 px-4 font-semibold text-center w-28">RSVP</th>

                    {/* 5. Acciones */}
                    <th className="py-2.5 px-4 font-semibold text-right w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {filteredGuests.map((guest) => {
                    const normCat = getNormalizedCategory(guest.category);
                    const customRoleObj = (settings.customGuestRoles || []).find((cr) => cr.id === guest.category);
                    const Icon = ROLE_ICONS[normCat] || (customRoleObj ? Sparkles : User);
                    const roleLabel = customRoleObj ? customRoleObj.label : (ROLE_LABEL_MAP[normCat] || guest.category);

                    // Calculate companions linked to this guest or sharing table
                    const isCompanionOfSomeone = !!guest.mainGuestId;
                    const mainGuest = isCompanionOfSomeone ? guests.find((g) => g.id === guest.mainGuestId) || null : null;
                    const linkedCompanions = guests.filter((g) => g.mainGuestId === guest.id);

                    return (
                      <tr
                        key={guest.id}
                        className="hover:bg-[#FAF8F5]/80 transition-colors"
                      >
                        {/* 1. Nombre & Pase con Ícono de Rol al lado izquierdo */}
                        <td className="py-2.5 px-4 align-middle min-w-[200px]">
                          <div className="flex items-center space-x-2.5">
                            {/* Role Icon replacing dots */}
                            <GuestRoleCell
                              guest={guest}
                              roleLabel={roleLabel}
                              protocolRoleTitle={guest.protocolRoleTitle}
                              Icon={Icon}
                            />
                            <div>
                              <div className="font-bold text-sm text-[#2D2A26] whitespace-nowrap">
                                {guest.fullName}
                              </div>
                              {showInviteCodes && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => copyGuestCode(guest.code)}
                                    title="Copiar código de pase"
                                    className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#2D3748] bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] px-1.5 py-0.5 rounded-md border border-transparent transition-colors cursor-pointer"
                                  >
                                    <span>{guest.code}</span>
                                    {copiedCodeForGuest === guest.code && (
                                      <span className="text-[9px] text-emerald-700 font-bold ml-1">¡Copiado!</span>
                                    )}
                                  </button>
                                  {guest.phone && (
                                    <span className="text-[11px] text-[#7A7268]">{guest.phone}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Mesa & Pases */}
                        <td className="py-2.5 px-4 align-middle min-w-[130px]">
                          <div className="font-semibold text-[#2D2A26]">
                            {guest.assignedTable || 'Mesa por asignar'}
                          </div>
                          <div className="text-[11px] text-[#7A7268] mt-0.5">
                            {isCompanionOfSomeone && mainGuest ? (
                              <span className="text-stone-500 italic">
                                (Pase de {mainGuest.fullName})
                              </span>
                            ) : (
                              <>
                                <span>{guest.totalPasses || 1} {guest.totalPasses === 1 ? 'pase' : 'pases'}</span>
                                {guest.rsvpStatus === 'confirmed' && (
                                  <span className="text-emerald-700 font-medium ml-1">
                                    ({guest.confirmedPasses || guest.totalPasses} conf.)
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* 3. Acompañante (Icon only, actions on hover/click) */}
                        <td className="py-2.5 px-3 align-middle text-center w-28">
                          <GuestCompanionCell
                            guest={guest}
                            linkedCompanions={linkedCompanions}
                            isCompanionOfSomeone={isCompanionOfSomeone}
                            mainGuest={mainGuest}
                            onOpenAssignCompanion={() => setCompanionModalGuest(guest)}
                            onUnlinkCompanion={handleUnlinkCompanion}
                          />
                        </td>

                        {/* 4. Estado RSVP - Single icon with popover options */}
                        <td className="py-2.5 px-4 align-middle text-center">
                          <GuestRsvpCell
                            guest={guest}
                            canEdit={canEditActiveWedding}
                            onUpdateStatus={(newStatus) => {
                              updateGuest(guest.id, {
                                rsvpStatus: newStatus,
                                confirmedPasses:
                                  newStatus === 'confirmed'
                                    ? guest.confirmedPasses || guest.totalPasses || 1
                                    : 0,
                              });
                            }}
                            size="md"
                          />
                        </td>

                        {/* 5. Acciones: Editar, WhatsApp, Eliminar */}
                        <td className="py-2.5 px-4 align-middle text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {canEditActiveWedding && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(guest)}
                                className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EBEBEB] text-[#524B42] hover:text-[#2D3748] border border-[#D9CEBF] hover:border-transparent transition-all cursor-pointer shadow-2xs"
                                title="Editar invitado / Asignar acompañante"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => generateWhatsappMessage(guest)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                              title="Enviar invitación por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {canEditActiveWedding && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGuest(guest.id, guest.fullName)}
                                className="p-1.5 rounded-lg text-[#8C8276] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar invitado"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion View (Fichas Desplegables, 100% width, optimized for phone screen) */}
            <div className="md:hidden block w-full divide-y divide-[#EAE3D7]">
              {filteredGuests.map((guest) => {
                const normCat = getNormalizedCategory(guest.category);
                const customRoleObj = (settings.customGuestRoles || []).find((cr) => cr.id === guest.category);
                const Icon = ROLE_ICONS[normCat] || (customRoleObj ? Sparkles : User);
                const roleLabel = customRoleObj ? customRoleObj.label : (ROLE_LABEL_MAP[normCat] || guest.category);

                const isCompanionOfSomeone = !!guest.mainGuestId;
                const mainGuest = isCompanionOfSomeone ? guests.find((g) => g.id === guest.mainGuestId) || null : null;
                const linkedCompanions = guests.filter((g) => g.mainGuestId === guest.id);
                const isExpanded = expandedGuestId === guest.id;

                return (
                  <div key={guest.id} className="w-full bg-[#FAF8F5] transition-colors">
                    {/* Ficha Cabecera: Role Icon + Nombre + Mesa + Status badge + Chevron */}
                    <div
                      onClick={() => toggleExpandGuest(guest.id)}
                      className="w-full py-2.5 px-3 flex items-center justify-between gap-2 cursor-pointer select-none active:bg-[#F3EFE9] transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        {/* Role Icon replacing dots */}
                        <GuestRoleCell
                          guest={guest}
                          roleLabel={roleLabel}
                          protocolRoleTitle={guest.protocolRoleTitle}
                          Icon={Icon}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-[#2D2A26] truncate">
                              {guest.fullName}
                            </span>
                            {showInviteCodes && guest.assignedTable && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/90 text-stone-700 font-medium shrink-0">
                                {guest.assignedTable}
                              </span>
                            )}
                          </div>
                          {showInviteCodes && (
                            <div className="flex items-center space-x-2 text-[10px] text-stone-500 font-mono mt-0.5">
                              <span className="font-semibold text-emerald-800">{guest.code}</span>
                              {guest.phone && <span>• {guest.phone}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Quick RSVP indicator and Chevron */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {guest.rsvpStatus === 'confirmed' && (
                          <CheckCircle2 className="w-4 h-4 shrink-0" color="#059669" strokeWidth={2.6} />
                        )}
                        {guest.rsvpStatus === 'declined' && (
                          <XCircle className="w-4 h-4 shrink-0" color="#e11d48" strokeWidth={2.6} />
                        )}
                        {guest.rsvpStatus === 'pending' && (
                          <Clock className="w-4 h-4 shrink-0" color="#d97706" strokeWidth={2.6} />
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#2D3748]' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Ficha Desplegable (Detalle con Acompañante, RSVP y Acciones) */}
                    {isExpanded && (
                      <div className="px-3 py-2 bg-[#F5EFE6]/90 border-t border-[#EAE3D7] space-y-2 text-xs">
                        {/* Mesa & Pases */}
                        <div className="flex items-center justify-between text-[11px] text-[#524B42]">
                          <div>
                            {showInviteCodes ? (
                              <>
                                <span>Mesa: </span>
                                <span className="font-bold text-[#2D2A26]">
                                  {guest.assignedTable || 'Por asignar'}
                                </span>
                              </>
                            ) : null}
                          </div>
                          <div>
                            <span>Pases: </span>
                            <span className="font-bold text-[#2D2A26]">
                              {guest.totalPasses || 1}
                            </span>
                            {guest.rsvpStatus === 'confirmed' && (
                              <span className="text-emerald-700 font-medium ml-1">
                                ({guest.confirmedPasses || guest.totalPasses} conf.)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de Acompañante, RSVP y Acciones */}
                        <div className="pt-2 border-t border-[#EAE3D7]/70 flex flex-col gap-2">
                          {/* Acompañante row */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              Acompañante:
                            </span>
                            <GuestCompanionCell
                              guest={guest}
                              linkedCompanions={linkedCompanions}
                              isCompanionOfSomeone={isCompanionOfSomeone}
                              mainGuest={mainGuest}
                              onOpenAssignCompanion={() => setCompanionModalGuest(guest)}
                              onUnlinkCompanion={handleUnlinkCompanion}
                            />
                          </div>

                          {/* RSVP Buttons row - Single Icon with popover */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              RSVP:
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <GuestRsvpCell
                                guest={guest}
                                canEdit={canEditActiveWedding}
                                onUpdateStatus={(newStatus) => {
                                  updateGuest(guest.id, {
                                    rsvpStatus: newStatus,
                                    confirmedPasses:
                                      newStatus === 'confirmed'
                                        ? guest.confirmedPasses || guest.totalPasses || 1
                                        : 0,
                                  });
                                }}
                                size="sm"
                              />
                            </div>
                          </div>

                          {/* Acciones row */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                              Acciones:
                            </span>
                            <div className="flex items-center space-x-1.5">
                              {canEditActiveWedding && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(guest);
                                  }}
                                  className="p-1.5 rounded-lg bg-white hover:bg-[#EBEBEB] text-[#524B42] hover:text-[#2D3748] border border-[#D9CEBF] transition-all cursor-pointer shadow-2xs"
                                  title="Editar invitado"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateWhatsappMessage(guest);
                                }}
                                className="p-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 border border-[#D9CEBF] hover:border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                                title="Enviar invitación por WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              {canEditActiveWedding && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGuest(guest.id, guest.fullName);
                                  }}
                                  className="p-1.5 rounded-lg bg-white text-rose-600 hover:bg-rose-50 border border-[#D9CEBF] transition-colors cursor-pointer shadow-2xs"
                                  title="Eliminar invitado"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* Bottom Actions: Exportar Excel & Importar Datos */}
      {(canPrint || canEditActiveWedding) && (
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-transparent p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" : "bg-[#EBEBEB] rounded-2xl border border-transparent p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"}>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#2D2A26] flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-[#2D3748]" />
              <span>Herramientas de Exportación e Importación de Datos</span>
            </h3>
            <p className="text-xs text-[#7A7268]">
              Descarga la base de datos completa de invitados con sus códigos de pase, mesas y roles, o carga un archivo masivo en formato Excel (.xlsx) o CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Botón Exportar a Excel */}
            {canPrint && (
              <button
                type="button"
                id="btn-export-excel"
                onClick={handleExportExcel}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-emerald-50 text-[#2D2A26] hover:text-emerald-900 border border-[#D9CEBF] hover:border-emerald-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Descargar lista completa en formato Excel (.xlsx)"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Exportar Excel</span>
              </button>
            )}

            {/* Botón Importar Datos Excel/CSV */}
            {canEditActiveWedding && (
              <button
                type="button"
                id="btn-import-excel"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-blue-50 text-[#2D2A26] hover:text-blue-900 border border-[#D9CEBF] hover:border-blue-300 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Cargar invitados masivamente desde archivo Excel o CSV"
              >
                <Upload className="w-4 h-4 text-blue-700" />
                <span>Importar Datos</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guest Edit/Add Modal */}
      <GuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuest(null);
        }}
        onSave={handleSaveGuest}
        guestToEdit={editingGuest}
      />

      {/* Excel / CSV Import Modal */}
      <GuestImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportGuests}
        currentCount={guests.length}
        coupleNames={settings.coupleNames}
      />

      {/* Direct Companion Modal from Table */}
      {companionModalGuest && (
        <CompanionModal
          isOpen={!!companionModalGuest}
          onClose={() => setCompanionModalGuest(null)}
          primaryGuestName={companionModalGuest.fullName}
          primaryGuestId={companionModalGuest.id}
          initialTotalPasses={companionModalGuest.totalPasses}
          currentTable={
            companionModalGuest.assignedTable && companionModalGuest.assignedTable !== 'Mesa por asignar'
              ? companionModalGuest.assignedTable
              : 'Mesa por asignar'
          }
          excludeGuestId={companionModalGuest.id}
          onPassesChange={(newPasses) => {
            setCompanionModalGuest((prev) => (prev ? { ...prev, totalPasses: newPasses } : null));
          }}
          onTableChange={(newTable) => {
            if (!companionModalGuest.assignedTable || companionModalGuest.assignedTable === 'Mesa por asignar') {
              updateGuest(companionModalGuest.id, { assignedTable: newTable });
            }
          }}
          onCompanionAdded={(compName) => {
            // Context will automatically synchronize table between host and companions
          }}
        />
      )}

      {/* Floating Action Button (FAB) at the bottom of the page */}
      {canEditActiveWedding && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
          <button
            type="button"
            onClick={handleOpenAddModal}
            id="fab-add-guest"
            className="group flex items-center space-x-2.5 px-5 py-3.5 rounded-full bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-sm font-semibold shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] hover:shadow-xl shadow-[#d1d1d1]/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-transparent backdrop-blur-xs"
          >
            <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
            <span className="tracking-wide">Nuevo Invitado</span>
          </button>
        </div>
      )}

    </div>
  );
};
