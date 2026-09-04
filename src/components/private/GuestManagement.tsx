import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, ProtocolCategory, RsvpStatus } from '../../types';
import { GuestModal } from './GuestModal';
import { GuestImportModal } from './GuestImportModal';
import { CompanionModal } from './CompanionModal';
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
  GripVertical
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
  cortejo_honor: 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748] border-transparent',
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

  // Drag and Drop state
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [dragOverGuestId, setDragOverGuestId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDragStart = (e: React.DragEvent, guest: Guest) => {
    setDraggedGuestId(guest.id);
    e.dataTransfer.setData('text/plain', guest.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetGuest: Guest) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverGuestId !== targetGuest.id) {
      setDragOverGuestId(targetGuest.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverGuestId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetGuest: Guest) => {
    e.preventDefault();
    setDragOverGuestId(null);
    if (!draggedGuestId || draggedGuestId === targetGuest.id) {
      setDraggedGuestId(null);
      return;
    }

    const draggedGuest = guests.find((g) => g.id === draggedGuestId);
    if (!draggedGuest) {
      setDraggedGuestId(null);
      return;
    }

    // Identificar todos los miembros del grupo del invitado arrastrado (titular + acompañantes)
    let groupToMove: Guest[] = [];
    if (draggedGuest.mainGuestId) {
      const main = guests.find((g) => g.id === draggedGuest.mainGuestId);
      if (main) {
        groupToMove = [main, ...guests.filter((g) => g.mainGuestId === main.id)];
      } else {
        groupToMove = [draggedGuest];
      }
    } else {
      groupToMove = [draggedGuest, ...guests.filter((g) => g.mainGuestId === draggedGuest.id)];
    }

    const groupCount = groupToMove.length;
    const targetTable = targetGuest.assignedTable || 'Mesa por asignar';
    const currentTable = draggedGuest.assignedTable || 'Mesa por asignar';

    // Si el destino tiene una mesa diferente a la actual, trasladar el grupo completo a esa mesa
    if (targetTable !== currentTable && targetTable !== 'Mesa por asignar') {
      await updateGuest(draggedGuest.id, { assignedTable: targetTable });
      showToast(`¡"${draggedGuest.fullName}"${groupCount > 1 ? ` y ${groupCount - 1} acompañante(s)` : ''} trasladado(s) a "${targetTable}"!`);
    } else {
      // Reordenar posición en la lista manteniendo a los acompañantes juntos
      const currentList = [...guests];
      const groupIds = new Set(groupToMove.map((g) => g.id));
      const listWithoutGroup = currentList.filter((g) => !groupIds.has(g.id));
      const targetIdx = listWithoutGroup.findIndex((g) => g.id === targetGuest.id);

      let reordered: Guest[] = [];
      if (targetIdx === -1) {
        reordered = [...listWithoutGroup, ...groupToMove];
      } else {
        reordered = [
          ...listWithoutGroup.slice(0, targetIdx),
          ...groupToMove,
          ...listWithoutGroup.slice(targetIdx),
        ];
      }

      await reorderGuests(reordered);
      showToast(`¡Posición de "${draggedGuest.fullName}"${groupCount > 1 ? ' y sus acompañantes' : ''} actualizada!`);
    }

    setDraggedGuestId(null);
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

  const handleDeleteGuest = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a "${name}" de la lista de invitados?`)) {
      deleteGuest(id);
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
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
            Lista de Invitados
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {canPrint && (
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#EBEBEB] border border-[#D9CEBF] hover:bg-[#FAF8F5] text-[#524B42] text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Exportar base de datos a Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}

          {canEditActiveWedding && (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#EBEBEB] border border-[#D9CEBF] hover:bg-[#FAF8F5] text-[#524B42] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Importar invitados desde Excel o CSV"
              >
                <Upload className="w-3.5 h-3.5 text-[#2D3748]" />
                <span className="hidden sm:inline">Importar</span>
              </button>

              <button
                type="button"
                id="btn-add-guest"
                onClick={handleOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] hover:bg-[#EBEBEB] text-[#2D3748] text-xs font-bold shadow-xs hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo Invitado</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        
        {/* 1. Anfitriones */}
        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === 'anfitrion' ? 'all' : 'anfitrion')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            categoryFilter === 'anfitrion'
              ? 'bg-purple-700 text-[#2D3748] border-purple-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-purple-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Anfitriones</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
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
              ? 'bg-stone-800 text-[#2D3748] border-stone-900 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Invitados</span>
            <User className="w-3.5 h-3.5 text-stone-400" />
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
              ? 'bg-amber-700 text-[#2D3748] border-amber-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Familia</span>
            <Heart className="w-3.5 h-3.5 text-amber-400" />
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
              ? 'bg-emerald-700 text-[#2D3748] border-emerald-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Planner</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
              ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-[#2D3748] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Cortejo</span>
            <Crown className="w-3.5 h-3.5 text-rose-300" />
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
              ? 'bg-pink-700 text-[#2D3748] border-pink-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-pink-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Damitas</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
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
              ? 'bg-sky-700 text-[#2D3748] border-sky-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-sky-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Pajes</span>
            <Crown className="w-3.5 h-3.5 text-sky-400" />
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
              ? 'bg-teal-700 text-[#2D3748] border-teal-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-teal-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Niños</span>
            <Heart className="w-3.5 h-3.5 text-teal-400" />
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
              ? 'bg-blue-700 text-[#2D3748] border-blue-800 shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]'
              : 'bg-[#EBEBEB] text-[#2D2A26] border-transparent hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Proveedores</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-300" />
          </div>
          <div className="text-base font-bold font-serif-display">{countProveedor}</div>
          <div className="text-[9px] opacity-75 truncate">Foto, DJ, banquetes</div>
        </button>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#EBEBEB] p-3.5 sm:p-4 rounded-2xl border border-transparent shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, rol, mesa, código de pase o teléfono..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
          />
        </div>

        {/* Role & RSVP dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
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

      {/* Floating Toast Notification for Drag & Drop actions */}
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
      <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] border border-transparent shadow-xs overflow-hidden" : "bg-[#EBEBEB] rounded-2xl border border-transparent shadow-xs overflow-hidden"}>
        
        {/* Table Title Bar */}
        <div className="bg-[#FAF8F5] px-4 py-3 border-b border-transparent flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-serif-display font-bold text-sm text-[#2D2A26]">
              Registros en Lista ({filteredGuests.length} de {guests.length})
            </span>
            <span className="text-xs text-[#7A7268]">
              • {confirmedPasses} de {totalPasses} pases asignados confirmados
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#7A7268]">
            <span className="hidden sm:inline">💡 Arrastra invitados para reordenar o cambiar de mesa • Acompañantes se trasladan automáticamente</span>
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif-display text-base font-bold text-[#2D2A26] mb-1">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-transparent text-[#7A7268]">
                <tr>
                  {/* Drag Handle Header */}
                  <th className="w-8 py-3 px-2 text-center" title="Arrastra para reordenar o mover de mesa">
                    <span className="sr-only">Mover</span>
                  </th>

                  {/* 1. Invitado & Código Sortable */}
                  <th className="py-3 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center space-x-1.5 font-semibold text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer group select-none text-left"
                      title="Ordenar por nombre de invitado (A-Z / Z-A)"
                    >
                      <span>Invitado & Código</span>
                      <span className={`p-0.5 rounded transition-colors ${sortField === 'name' ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 2. Rol en la Boda Sortable */}
                  <th className="py-3 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('role')}
                      className="inline-flex items-center space-x-1.5 font-semibold text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer group select-none text-left"
                      title="Ordenar por rol o cargo en la boda"
                    >
                      <span>Rol en la Boda</span>
                      <span className={`p-0.5 rounded transition-colors ${sortField === 'role' ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                        {sortField === 'role' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 3. Mesa & Pases Sortable */}
                  <th className="py-3 px-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort('table')}
                      className="inline-flex items-center space-x-1.5 font-semibold text-[#524B42] hover:text-[#2D3748] transition-colors cursor-pointer group select-none text-left"
                      title="Ordenar por mesa asignada (mesas ordenadas alfabéticamente)"
                    >
                      <span>Mesa & Pases</span>
                      <span className={`p-0.5 rounded transition-colors ${sortField === 'table' ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/10 text-[#2D3748]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                        {sortField === 'table' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 4. Acompañante(s) */}
                  <th className="py-3 px-4 font-semibold">Acompañante(s) de Mesa</th>

                  {/* 5. RSVP */}
                  <th className="py-3 px-4 font-semibold text-center">RSVP</th>

                  {/* 6. Acciones */}
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filteredGuests.map((guest) => {
                  const normCat = getNormalizedCategory(guest.category);
                  const customRoleObj = (settings.customGuestRoles || []).find((cr) => cr.id === guest.category);
                  const Icon = ROLE_ICONS[normCat] || (customRoleObj ? Sparkles : User);
                  const badgeStyle = customRoleObj
                    ? (customRoleObj.badgeClass || 'bg-stone-100 text-stone-700 border-stone-200')
                    : (ROLE_BADGES[normCat] || 'bg-stone-100 text-stone-700 border-stone-200');
                  const roleLabel = customRoleObj ? customRoleObj.label : (ROLE_LABEL_MAP[normCat] || guest.category);

                  // Calculate companions linked to this guest or sharing table
                  const tableNorm = guest.assignedTable?.trim().toLowerCase();
                  const isCompanionOfSomeone = !!guest.mainGuestId;
                  const mainGuest = isCompanionOfSomeone ? guests.find((g) => g.id === guest.mainGuestId) : null;
                  
                  const linkedCompanions = guests.filter((g) => g.mainGuestId === guest.id);
                  const maxAllowedCompanions = Math.max(0, (guest.totalPasses || 1) - 1);

                  const isBeingDragged = draggedGuestId === guest.id;
                  const isDragTarget = dragOverGuestId === guest.id && draggedGuestId !== guest.id;

                  return (
                    <tr
                      key={guest.id}
                      draggable={canEditActiveWedding}
                      onDragStart={(e) => canEditActiveWedding && handleDragStart(e, guest)}
                      onDragOver={(e) => canEditActiveWedding && handleDragOver(e, guest)}
                      onDragLeave={canEditActiveWedding ? handleDragLeave : undefined}
                      onDrop={(e) => canEditActiveWedding && handleDrop(e, guest)}
                      className={`transition-colors ${canEditActiveWedding ? 'cursor-move' : ''} ${
                        isBeingDragged
                          ? 'opacity-40 bg-[#F5EBE6]'
                          : isDragTarget
                          ? 'bg-[#FAF3F5] ring-2 ring-[#d1d1d1] ring-inset'
                          : 'hover:bg-[#FAF8F5]/80'
                      }`}
                    >
                      {/* Drag Handle */}
                      <td className={`py-3 px-2 text-center align-middle text-stone-300 ${canEditActiveWedding ? 'hover:text-[#2D3748] cursor-grab active:cursor-grabbing' : 'opacity-30 cursor-default'}`}>
                        <GripVertical className="w-4 h-4 mx-auto" />
                      </td>
                      
                      {/* 1. Nombre & Pase */}
                      <td className="py-3 px-4 align-top">
                        <div className="font-bold text-sm text-[#2D2A26]">
                          {guest.fullName}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => copyGuestCode(guest.code)}
                            title="Copiar código de pase"
                            className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#2D3748] bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/5 hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748]/15 px-1.5 py-0.5 rounded-md border border-transparent transition-colors cursor-pointer"
                          >
                            <span>{guest.code}</span>
                            {copiedCodeForGuest === guest.code && (
                              <span className="text-[9px] text-emerald-700 font-bold ml-1">¡Copiado!</span>
                            )}
                          </button>
                          
                          {isCompanionOfSomeone && mainGuest && (
                            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center space-x-1 font-medium" title={`Acompañante vinculado a ${mainGuest.fullName}`}>
                              <span>Acomp. de:</span>
                              <strong className="truncate max-w-[110px]">{mainGuest.fullName}</strong>
                            </span>
                          )}

                          {guest.phone && (
                            <span className="text-[11px] text-[#7A7268]">{guest.phone}</span>
                          )}
                        </div>
                      </td>

                      {/* 2. Rol en la Boda */}
                      <td className="py-3 px-4 align-top">
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold mb-1 shadow-xs ${badgeStyle}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{roleLabel}</span>
                        </div>
                        {guest.protocolRoleTitle && (
                          <div className="text-[11px] text-[#524B42] font-medium line-clamp-1">
                            {guest.protocolRoleTitle}
                          </div>
                        )}
                      </td>

                      {/* 3. Mesa & Pases */}
                      <td className="py-3 px-4 align-top">
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

                      {/* 4. Acompañante(s) asignados */}
                      <td className="py-3 px-4 align-top max-w-xs">
                        {isCompanionOfSomeone ? (
                          <div className="text-[11px] text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-2 space-y-0.5">
                            <span className="font-medium text-stone-500 block text-[10px] uppercase">Acompañante Vinculado</span>
                            <div className="flex items-center space-x-1 text-emerald-800 font-semibold">
                              <User className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">Sigue a {mainGuest?.fullName || 'su titular'}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 block">
                              Mesa: <strong>{guest.assignedTable || 'Mesa por asignar'}</strong>
                            </span>
                          </div>
                        ) : linkedCompanions.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-[11px] text-emerald-800 font-medium">
                                <Users className="w-3.5 h-3.5" />
                                <span>{linkedCompanions.length} de {maxAllowedCompanions} acomp.:</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCompanionModalGuest(guest)}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors flex items-center space-x-0.5 cursor-pointer active:scale-95"
                                title="Asignar o registrar otro acompañante"
                              >
                                <UserPlus className="w-2.5 h-2.5" />
                                <span>+ Acomp.</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {linkedCompanions.map((comp) => (
                                <span
                                  key={comp.id}
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-md text-[11px] font-medium text-stone-700 hover:border-emerald-300 transition-colors"
                                  title={`${comp.fullName} (${comp.assignedTable || 'Mesa por asignar'})`}
                                >
                                  <User className="w-2.5 h-2.5 text-stone-400" />
                                  <span className="truncate max-w-[120px]">{comp.fullName}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCompanionModalGuest(guest)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-[#2D3748] border border-emerald-300 hover:border-emerald-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer group active:scale-95"
                            title={`Asignar acompañante para ${guest.fullName}`}
                          >
                            <UserPlus className="w-3.5 h-3.5 text-emerald-700 group-hover:text-[#2D3748] transition-colors" />
                            <span>Asignar Acompañante</span>
                          </button>
                        )}
                      </td>

                      {/* 5. Estado RSVP - Icon buttons without text */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="inline-flex items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#D9CEBF] gap-1 shadow-2xs">
                          {/* Confirmar */}
                          <button
                            type="button"
                            disabled={!canEditActiveWedding}
                            onClick={() => {
                              if (!canEditActiveWedding) return;
                              updateGuest(guest.id, {
                                rsvpStatus: 'confirmed',
                                confirmedPasses: guest.confirmedPasses || guest.totalPasses || 1,
                              });
                            }}
                            title={canEditActiveWedding ? "Confirmado (Asiste)" : "Estado: Confirmado"}
                            className={`p-1.5 rounded-lg transition-all ${
                              canEditActiveWedding ? 'cursor-pointer' : 'cursor-default'
                            } ${
                              guest.rsvpStatus === 'confirmed'
                                ? 'bg-emerald-600 text-[#2D3748] shadow-xs scale-105'
                                : 'text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Pendiente */}
                          <button
                            type="button"
                            disabled={!canEditActiveWedding}
                            onClick={() => {
                              if (!canEditActiveWedding) return;
                              updateGuest(guest.id, {
                                rsvpStatus: 'pending',
                                confirmedPasses: 0,
                              });
                            }}
                            title={canEditActiveWedding ? "Pendiente" : "Estado: Pendiente"}
                            className={`p-1.5 rounded-lg transition-all ${
                              canEditActiveWedding ? 'cursor-pointer' : 'cursor-default'
                            } ${
                              guest.rsvpStatus === 'pending'
                                ? 'bg-amber-500 text-[#2D3748] shadow-xs scale-105'
                                : 'text-stone-400 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {/* Declinado */}
                          <button
                            type="button"
                            disabled={!canEditActiveWedding}
                            onClick={() => {
                              if (!canEditActiveWedding) return;
                              updateGuest(guest.id, {
                                rsvpStatus: 'declined',
                                confirmedPasses: 0,
                              });
                            }}
                            title={canEditActiveWedding ? "Declinado (No asiste)" : "Estado: Declinado"}
                            className={`p-1.5 rounded-lg transition-all ${
                              canEditActiveWedding ? 'cursor-pointer' : 'cursor-default'
                            } ${
                              guest.rsvpStatus === 'declined'
                                ? 'bg-rose-600 text-[#2D3748] shadow-xs scale-105'
                                : 'text-stone-400 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* 6. Acciones: Editar, WhatsApp, Eliminar (Iconos limpios sin texto) */}
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1">
                          
                          {/* Botón Editar Invitado (Icon only) */}
                          {canEditActiveWedding && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(guest)}
                              className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-[#524B42] hover:text-[#2D3748] border border-[#D9CEBF] hover:border-transparent transition-all cursor-pointer shadow-2xs"
                              title="Editar invitado / Asignar acompañante"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* WhatsApp / Compartir */}
                          <button
                            type="button"
                            onClick={() => generateWhatsappMessage(guest)}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                            title="Enviar invitación por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Eliminar */}
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
          currentTable={
            companionModalGuest.assignedTable && companionModalGuest.assignedTable !== 'Mesa por asignar'
              ? companionModalGuest.assignedTable
              : 'Mesa por asignar'
          }
          excludeGuestId={companionModalGuest.id}
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

    </div>
  );
};
