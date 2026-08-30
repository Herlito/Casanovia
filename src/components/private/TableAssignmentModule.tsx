import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, WeddingTable, GUEST_ROLES_CONFIG, ProtocolCategory, RsvpStatus } from '../../types';
import { TableModal } from './TableModal';
import { TableSeatingPrintModal } from './TableSeatingPrintModal';
import { formatAltibajas } from '../../lib/formatUtils';
import { 
  UtensilsCrossed, 
  Users, 
  Plus, 
  Printer, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  MapPin, 
  Layers, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Share2,
  Armchair,
  LayoutGrid,
  ListFilter,
  GripVertical,
  Map as MapIcon
} from 'lucide-react';

export function sortGuestsWithCompanions(guestList: Guest[]): Guest[] {
  if (!guestList || !Array.isArray(guestList)) return [];
  const result: Guest[] = [];
  const visited = new Set<string>();

  // 1. First iterate over primary guests (those without mainGuestId)
  const primaryGuests = guestList.filter((g) => g && !g.mainGuestId);

  primaryGuests.forEach((primary) => {
    if (!primary || !primary.id) return;
    result.push(primary);
    visited.add(primary.id);

    // Find all companions of this primary guest in the current guestList
    const companions = guestList.filter((c) => c && c.mainGuestId === primary.id && !visited.has(c.id));
    companions.forEach((comp) => {
      if (comp && comp.id) {
        result.push(comp);
        visited.add(comp.id);
      }
    });
  });

  // 2. Add any remaining guests (e.g. companions whose primary guest is not in this list, or standalone guests)
  guestList.forEach((g) => {
    if (g && g.id && !visited.has(g.id)) {
      result.push(g);
      visited.add(g.id);
    }
  });

  return result;
}

export const TableAssignmentModule: React.FC = () => {
  const { 
    guests = [], 
    tables = [], 
    updateGuest, 
    addTable, 
    updateTable, 
    deleteTable, 
    batchAssignGuestsToTable,
    setShowFloorPlanModal,
    settings 
  } = useWedding();

  // State
  const [activeGuestTab, setActiveGuestTab] = useState<'unassigned' | 'all'>('unassigned');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [targetBatchTable, setTargetBatchTable] = useState<string>('');

  // Drag and Drop & Toast states
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<WeddingTable | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showAutoAssignSuccess, setShowAutoAssignSuccess] = useState(false);
  const [autoAssignMessage, setAutoAssignMessage] = useState('');

  // Extract all distinct zones from tables
  const allZones = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(tables)) {
      tables.forEach((t) => {
        if (t && t.zone) set.add(t.zone);
      });
    }
    return Array.from(set);
  }, [tables]);

  // Compute table occupancies
  // RULE: Primary guests (without mainGuestId) provide the passes count (which includes themselves and their companions).
  // Companions (with mainGuestId) are listed at the table, but their individual pass is NOT added to the table sum
  // to avoid double counting, because the titular guest already includes both.
  const tableOccupancyMap = useMemo(() => {
    const map = new Map<string, { guests: Guest[]; totalPasses: number }>();
    
    // Initialize for all defined tables
    if (Array.isArray(tables)) {
      tables.forEach((t) => {
        if (t && t.name) {
          map.set((t.name || '').trim().toLowerCase(), { guests: [], totalPasses: 0 });
        }
      });
    }

    // Populate with guests
    if (Array.isArray(guests)) {
      guests.forEach((g) => {
        if (g && g.assignedTable && typeof g.assignedTable === 'string' && g.assignedTable.trim() !== '' && !g.assignedTable.toLowerCase().includes('por asignar')) {
          const key = g.assignedTable.trim().toLowerCase();
          const current = map.get(key) || { guests: [], totalPasses: 0 };
          current.guests.push(g);
          map.set(key, current);
        }
      });
    }

    // Calculate effective passes per table and order so each primary guest is followed by their companion(s)
    map.forEach((data) => {
      data.totalPasses = data.guests.reduce((acc, g) => {
        if (!g) return acc;
        // Companions with a mainGuestId are already covered by their titular guest's passes
        if (g.mainGuestId) {
          return acc;
        }
        return acc + (g.confirmedPasses || g.totalPasses || 1);
      }, 0);
      data.guests = sortGuestsWithCompanions(data.guests);
    });

    return map;
  }, [tables, guests]);

  // Global metrics
  const totalGuestsCount = (guests || []).length; // All individuals (titulares + acompañantes)
  const primaryGuests = useMemo(() => (guests || []).filter((g) => g && !g.mainGuestId), [guests]);
  const totalGuestsPasses = useMemo(() => {
    return primaryGuests.reduce((acc, g) => acc + (g?.confirmedPasses || g?.totalPasses || 1), 0);
  }, [primaryGuests]);
  
  const assignedGuests = useMemo(() => {
    return (guests || []).filter((g) => g && g.assignedTable && g.assignedTable.trim() !== '' && !g.assignedTable.toLowerCase().includes('por asignar'));
  }, [guests]);

  const unassignedGuests = useMemo(() => {
    return (guests || []).filter((g) => g && (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar')));
  }, [guests]);

  // Total passes assigned across all active tables
  const assignedPassesCount = useMemo(() => {
    let total = 0;
    tableOccupancyMap.forEach((data) => {
      total += data.totalPasses;
    });
    return total;
  }, [tableOccupancyMap]);

  const totalTableCapacity = useMemo(() => {
    return (tables || []).reduce((acc, t) => acc + (t?.capacity || 0), 0);
  }, [tables]);

  const remainingFreeSeats = Math.max(0, totalTableCapacity - assignedPassesCount);
  const occupancyPercentage = totalTableCapacity > 0 ? Math.min(100, Math.round((assignedPassesCount / totalTableCapacity) * 100)) : 0;

  // Filtered Guests in Left Panel
  const filteredGuests = useMemo(() => {
    let list = activeGuestTab === 'unassigned' ? unassignedGuests : (guests || []);
    list = (list || []).filter(Boolean);

    if (guestSearchQuery && guestSearchQuery.trim()) {
      const q = guestSearchQuery.toLowerCase();
      list = list.filter((g) => 
        (g.fullName && g.fullName.toLowerCase().includes(q)) ||
        (g.phone && g.phone.toLowerCase().includes(q)) ||
        (g.assignedTable && g.assignedTable.toLowerCase().includes(q)) ||
        (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== 'all') {
      list = list.filter((g) => g.category === roleFilter);
    }

    if (rsvpFilter !== 'all') {
      list = list.filter((g) => g.rsvpStatus === rsvpFilter);
    }

    return sortGuestsWithCompanions(list);
  }, [activeGuestTab, unassignedGuests, guests, guestSearchQuery, roleFilter, rsvpFilter]);

  // Filtered Tables in Right Panel
  const filteredTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    let list = [...tables].filter(Boolean);
    if (zoneFilter !== 'all') {
      list = list.filter((t) => t && t.zone === zoneFilter);
    }
    // Ordenar mesas por "Nombre o Número de Mesa" en orden alfabético
    return list.sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'es', { numeric: true, sensitivity: 'base' }));
  }, [tables, zoneFilter]);

  // Quick Action: Assign single guest (SOLO SI ESTÁ CONFIRMADO)
  const handleAssignSingleGuest = async (guestId: string, tableName: string) => {
    if (!tableName) return;
    const target = guests.find((g) => g.id === guestId);
    if (target && target.rsvpStatus !== 'confirmed') {
      alert(`Solo se puede asignar mesa a invitados confirmados. Por favor confirma la asistencia de "${target.fullName}" primero.`);
      return;
    }
    await updateGuest(guestId, { assignedTable: tableName });
  };

  // Quick Action: Unassign single guest
  const handleUnassignGuest = async (guestId: string) => {
    const target = guests.find((g) => g.id === guestId);
    await updateGuest(guestId, { assignedTable: 'Mesa por asignar' });
    if (target) {
      showToast(`"${formatAltibajas(target.fullName)}" desasignado(a) de la mesa.`);
    }
  };

  // Drag & Drop: Asignar invitado y acompañantes a una mesa soltando en la ficha
  const handleDropOnTable = async (e: React.DragEvent, targetTableName: string) => {
    e.preventDefault();
    setDragOverTableId(null);

    const guestId = e.dataTransfer.getData('text/plain') || draggedGuestId;
    if (!guestId) {
      setDraggedGuestId(null);
      return;
    }

    const draggedGuest = guests.find((g) => g.id === guestId);
    if (!draggedGuest) {
      setDraggedGuestId(null);
      return;
    }

    if (draggedGuest.assignedTable === targetTableName) {
      setDraggedGuestId(null);
      return;
    }

    // Validar confirmación de asistencia
    if (draggedGuest.rsvpStatus !== 'confirmed') {
      showToast(`Solo se puede asignar mesa a invitados confirmados. Por favor confirma a "${formatAltibajas(draggedGuest.fullName)}" primero.`);
      setDraggedGuestId(null);
      return;
    }

    // Identificar el grupo (titular + acompañantes)
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

    await updateGuest(draggedGuest.id, { assignedTable: targetTableName });
    
    const count = groupToMove.length;
    showToast(`¡"${formatAltibajas(draggedGuest.fullName)}"${count > 1 ? ` y ${count - 1} acompañante(s)` : ''} asignado(s) a "${targetTableName}"!`);
    setDraggedGuestId(null);
  };

  // Batch Selection Helpers
  const toggleSelectGuest = (id: string) => {
    setSelectedGuestIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisibleGuests = () => {
    if (selectedGuestIds.length === filteredGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(filteredGuests.map((g) => g.id));
    }
  };

  const handleApplyBatchAssign = async () => {
    if (!targetBatchTable || selectedGuestIds.length === 0) return;
    
    // Validar que los invitados seleccionados estén confirmados
    const unconfirmedSelected = guests.filter(
      (g) => selectedGuestIds.includes(g.id) && g.rsvpStatus !== 'confirmed'
    );

    if (unconfirmedSelected.length > 0) {
      const confirmAction = window.confirm(
        `Hay ${unconfirmedSelected.length} invitado(s) seleccionado(s) sin confirmar asistencia.\n\n` +
        `Solo se puede asignar mesa a invitados confirmados.\n\n` +
        `¿Deseas confirmar automáticamente su asistencia y asignarlos a "${targetBatchTable}"?`
      );

      if (confirmAction) {
        // Confirmar a los no confirmados antes de asignar
        for (const unconfirmed of unconfirmedSelected) {
          await updateGuest(unconfirmed.id, {
            rsvpStatus: 'confirmed',
            confirmedPasses: unconfirmed.confirmedPasses || unconfirmed.totalPasses || 1,
          });
        }
      } else {
        // Filtrar y asignar únicamente a los que ya estaban confirmados
        const onlyConfirmedIds = selectedGuestIds.filter(
          (id) => !unconfirmedSelected.some((u) => u.id === id)
        );
        if (onlyConfirmedIds.length === 0) {
          alert('No se asignaron mesas porque ningún invitado seleccionado estaba confirmado.');
          return;
        }
        await batchAssignGuestsToTable(onlyConfirmedIds, targetBatchTable);
        setSelectedGuestIds([]);
        setTargetBatchTable('');
        return;
      }
    }

    await batchAssignGuestsToTable(selectedGuestIds, targetBatchTable);
    setSelectedGuestIds([]);
    setTargetBatchTable('');
  };

  // Smart Auto-Assign
  const handleSmartAutoAssign = async () => {
    // Unassigned primary guests
    const unassignedPrimary = guests.filter(
      (g) => !g.mainGuestId && (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar'))
    );

    // Unassigned companions
    const unassignedCompanions = guests.filter(
      (g) => g.mainGuestId && (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar'))
    );

    if (unassignedPrimary.length === 0 && unassignedCompanions.length === 0) {
      setAutoAssignMessage('¡Todos los invitados ya tienen una mesa asignada!');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3000);
      return;
    }

    if (tables.length === 0) {
      setAutoAssignMessage('Por favor crea al menos una mesa antes de auto-asignar.');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3500);
      return;
    }

    // Group available tables and their remaining capacity
    const tableCapacities = tables.map((t) => {
      const occ = tableOccupancyMap.get(t.name.trim().toLowerCase())?.totalPasses || 0;
      return {
        table: t,
        available: Math.max(0, t.capacity - occ),
      };
    });

    let assignedCount = 0;

    // Group unassigned by category for affinity seating (Family together, Cortejo together, Friends together)
    const sortedUnassigned = [...unassignedPrimary].sort((a, b) => {
      if (a.category === 'anfitrion' || a.category === 'cortejo_honor') return -1;
      if (b.category === 'anfitrion' || b.category === 'cortejo_honor') return 1;
      if (a.category === 'familia_directa') return -1;
      if (b.category === 'familia_directa') return 1;
      return 0;
    });

    for (const guest of sortedUnassigned) {
      const passes = guest.confirmedPasses || guest.totalPasses || 1;
      // Find a table with enough space
      const availableTable = tableCapacities.find((tc) => tc.available >= passes);

      if (availableTable) {
        // Assign primary guest
        await updateGuest(guest.id, { assignedTable: availableTable.table.name });
        
        // Also assign any accompanying guests linked to this primary guest
        const companions = unassignedCompanions.filter((c) => c.mainGuestId === guest.id);
        for (const comp of companions) {
          await updateGuest(comp.id, { assignedTable: availableTable.table.name });
        }
        
        availableTable.available -= passes;
        assignedCount += 1 + companions.length;
      }
    }

    // If there are any standalone companions whose main guests were already assigned, place them in the same table as their main guest
    for (const comp of unassignedCompanions) {
      if (comp.mainGuestId) {
        const main = guests.find((g) => g.id === comp.mainGuestId);
        if (main && main.assignedTable && !main.assignedTable.toLowerCase().includes('por asignar')) {
          await updateGuest(comp.id, { assignedTable: main.assignedTable });
          assignedCount += 1;
        }
      }
    }

    setAutoAssignMessage(`¡Se han asignado ${assignedCount} personas a mesas con espacio disponible!`);
    setShowAutoAssignSuccess(true);
    setTimeout(() => setShowAutoAssignSuccess(false), 4000);
  };

  // Quick Preset: Generate default tables
  const handleCreateDefaultTableBatch = async (count: number, capacity: number) => {
    const existingCount = tables.length;
    for (let i = 1; i <= count; i++) {
      const num = existingCount + i;
      await addTable({
        name: `Mesa ${num}`,
        capacity: capacity,
        shape: 'round',
        zone: 'Salón Principal',
        notes: `Mesa estándar para ${capacity} personas`,
      });
    }
  };

  // Clear all guests from a specific table
  const handleClearTable = async (tableName: string) => {
    if (!window.confirm(`¿Deseas desasignar a todos los comensales de "${tableName}"?`)) return;
    const guestsInTable = guests.filter(
      (g) => g.assignedTable && g.assignedTable.trim().toLowerCase() === tableName.trim().toLowerCase()
    );
    if (guestsInTable.length > 0) {
      const ids = guestsInTable.map((g) => g.id);
      await batchAssignGuestsToTable(ids, 'Mesa por asignar');
    }
  };

  const getRoleBadge = (category: string) => {
    const role = GUEST_ROLES_CONFIG.find((r) => r.id === category);
    return role ? (
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${role.badgeClass}`}>
        {role.shortLabel}
      </span>
    ) : (
      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
        Invitado
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          HEADER STATION
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#6B2D38] via-[#7D3442] to-[#8B3A4A] rounded-3xl p-6 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-[#F7E7CE]">
              Banquete & Protocolo Nupcial
            </span>
            <span className="text-[10px] font-semibold text-stone-200">
              {settings.coupleNames}
            </span>
          </div>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-[#F7E7CE]" />
            <span>Asignación de Mesas a los Invitados</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            Organiza los asientos del banquete, distribuye a los comensales por afinidad o familia y genera el plano oficial para el servicio de recepción.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowFloorPlanModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#F7E7CE] hover:bg-white text-[#54212C] text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            title="Diseñador visual interactivo de planos en 2D con carga de PDF y asignación de asientos"
          >
            <MapIcon className="w-4 h-4 text-[#8B3A4A]" />
            <span className="hidden sm:inline">Diseñador 2D / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTableToEdit(null);
              setIsTableModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all border border-white/30 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Mesa</span>
          </button>

          <button
            type="button"
            onClick={handleSmartAutoAssign}
            className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
            title="Asigna automáticamente invitados sin mesa a los lugares libres"
          >
            <Wand2 className="w-4 h-4 text-[#F7E7CE]" />
            <span className="hidden sm:inline">Auto-Distribuir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Auto Assign Notification Toast */}
      {showAutoAssignSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center space-x-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{autoAssignMessage}</span>
        </div>
      )}

      {/* ========================================================
          METRICS & CAPACITY OVERVIEW CARDS
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Cantidad de Mesas */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cantidad de Mesas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#8B3A4A] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
              {tables.length}
            </span>
            <span className="text-xs text-[#7A7268]">
              {tables.length === 1 ? 'mesa total' : 'mesas totales'}
            </span>
          </div>
          <p className="text-[11px] text-[#7A7268]">
            {tables.filter(t => (tableOccupancyMap.get((t?.name || '').trim().toLowerCase())?.totalPasses || 0) >= (t?.capacity || 10)).length} llenas • {tables.filter(t => (tableOccupancyMap.get((t?.name || '').trim().toLowerCase())?.totalPasses || 0) < (t?.capacity || 10)).length} con lugares
          </p>
        </div>

        {/* Card 2: Total Capacidad */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Capacidad Total</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
              {totalTableCapacity}
            </span>
            <span className="text-xs text-[#7A7268]">asientos habilitados</span>
          </div>
          <div className="w-full bg-[#E8DCCF]/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#8B3A4A] h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Invitados Asignados */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Invitados con Mesa</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif-display text-2xl sm:text-3xl font-bold text-emerald-800">
              {assignedGuests.length}
            </span>
            <span className="text-xs text-[#7A7268]">de {totalGuestsCount} personas ({assignedPassesCount} pases)</span>
          </div>
          <p className="text-[11px] text-[#7A7268]">
            {occupancyPercentage}% de la capacidad ocupada
          </p>
        </div>

        {/* Card 4: Por Asignar */}
        <div className={`rounded-2xl p-4 sm:p-5 border shadow-2xs space-y-2 ${
          unassignedGuests.length > 0 
            ? 'bg-amber-50/70 border-amber-200' 
            : 'bg-[#FFFDFB] border-[#E8DCCF]'
        }`}>
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sin Mesa Asignada</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              unassignedGuests.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {unassignedGuests.length > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`font-serif-display text-2xl sm:text-3xl font-bold ${
              unassignedGuests.length > 0 ? 'text-amber-900' : 'text-emerald-800'
            }`}>
              {unassignedGuests.length}
            </span>
            <span className="text-xs text-[#7A7268]">invitados pendientes</span>
          </div>
          <p className="text-[11px] text-[#7A7268]">
            {unassignedGuests.length === 0 ? '✓ Todos los invitados tienen mesa' : 'Selecciona o auto-asigna sus lugares'}
          </p>
        </div>

        {/* Card 5: Asientos Libres */}
        <div className="bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#E8DCCF] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Asientos Disponibles</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D2A26]">
              {remainingFreeSeats}
            </span>
            <span className="text-xs text-[#7A7268]">lugares libres restantes</span>
          </div>
          <p className="text-[11px] text-[#7A7268]">
            Listo para recepcionar confirmaciones
          </p>
        </div>

      </div>

      {/* ========================================================
          MAIN 2-COLUMN WORKSPACE: GUEST DIRECTORY & SEATING TABLES
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (LG: 5 COLS): GUEST SELECTION & BATCH ASSIGN
           ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DCCF] shadow-xs space-y-4">
          
          {/* Guest Tabs & Header */}
          <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3 gap-2">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setActiveGuestTab('unassigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeGuestTab === 'unassigned'
                    ? 'bg-[#8B3A4A] text-white shadow-2xs'
                    : 'bg-[#F7F3EE] text-[#7A7268] hover:text-[#2D2A26]'
                }`}
              >
                <span>Sin Mesa</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeGuestTab === 'unassigned' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'
                }`}>
                  {unassignedGuests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuestTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeGuestTab === 'all'
                    ? 'bg-[#8B3A4A] text-white shadow-2xs'
                    : 'bg-[#F7F3EE] text-[#7A7268] hover:text-[#2D2A26]'
                }`}
              >
                <span>Todos</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeGuestTab === 'all' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}>
                  {guests.length}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSelectAllVisibleGuests}
              className="text-[11px] font-semibold text-[#8B3A4A] hover:underline cursor-pointer flex items-center space-x-1"
            >
              {selectedGuestIds.length === filteredGuests.length && filteredGuests.length > 0 ? (
                <span>Deseleccionar</span>
              ) : (
                <span>Seleccionar todos</span>
              )}
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C8276] absolute left-3 top-2.5" />
              <input
                type="text"
                value={guestSearchQuery}
                onChange={(e) => setGuestSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código o mesa..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B3A4A]/20"
              />
              {guestSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGuestSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#8C8276] hover:text-[#2D2A26] text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Role Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  roleFilter === 'all'
                    ? 'bg-[#2D2A26] text-white border-[#2D2A26]'
                    : 'bg-[#F7F3EE] text-[#524B42] border-[#E8DCCF] hover:bg-[#EAE4DC]'
                }`}
              >
                Todos
              </button>
              {GUEST_ROLES_CONFIG.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setRoleFilter(role.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
                    roleFilter === role.id
                      ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] font-semibold'
                      : 'bg-[#FAF8F5] text-[#7A7268] border-[#E8DCCF] hover:bg-[#EAE4DC]'
                  }`}
                >
                  {role.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Floating / Sticky Batch Assignment Action Bar */}
          {selectedGuestIds.length > 0 && (
            <div className="p-3 bg-[#6B2D38] text-white rounded-2xl space-y-2 shadow-md animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#F7E7CE]" />
                  <span>{selectedGuestIds.length} invitados seleccionados</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGuestIds([])}
                  className="text-[11px] text-stone-300 hover:text-white underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={targetBatchTable}
                  onChange={(e) => setTargetBatchTable(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white text-[#2D2A26] border border-white/20 focus:outline-hidden font-medium"
                >
                  <option value="">Seleccionar mesa de destino...</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} (Capacidad: {t.capacity})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleApplyBatchAssign}
                  disabled={!targetBatchTable}
                  className="px-3 py-1.5 bg-[#F7E7CE] text-[#54212C] font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            </div>
          )}

          {/* Guest List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D9CEBF] space-y-2">
                <Users className="w-8 h-8 text-[#8C8276] mx-auto" />
                <p className="text-xs font-semibold text-[#524B42]">
                  {activeGuestTab === 'unassigned' 
                    ? '¡Excelente! No hay invitados pendientes de asignar mesa.' 
                    : 'No se encontraron invitados con los filtros aplicados.'}
                </p>
                {activeGuestTab === 'unassigned' && (
                  <button
                    type="button"
                    onClick={() => setActiveGuestTab('all')}
                    className="text-xs text-[#8B3A4A] font-bold hover:underline cursor-pointer"
                  >
                    Ver todos los invitados
                  </button>
                )}
              </div>
            ) : (
              filteredGuests.map((guest) => {
                const isSelected = selectedGuestIds.includes(guest.id);
                const isAssigned = guest.assignedTable && guest.assignedTable.trim() !== '' && !guest.assignedTable.toLowerCase().includes('por asignar');
                const isCompanion = Boolean(guest.mainGuestId);
                const mainGuest = isCompanion ? guests.find((g) => g.id === guest.mainGuestId) : null;

                const isDraggable = guest.rsvpStatus === 'confirmed';

                return (
                  <div
                    key={guest.id}
                    draggable={isDraggable}
                    onDragStart={(e) => {
                      if (!isDraggable) return;
                      e.dataTransfer.setData('text/plain', guest.id);
                      setDraggedGuestId(guest.id);
                    }}
                    onDragEnd={() => {
                      setDraggedGuestId(null);
                      setDragOverTableId(null);
                    }}
                    className={`p-3 rounded-2xl border transition-all space-y-2 ${
                      isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      isSelected 
                        ? 'bg-[#FAF3F5] border-[#8B3A4A] ring-1 ring-[#8B3A4A]/20' 
                        : 'bg-[#FFFDFB] border-[#E8DCCF] hover:border-[#D9CEBF]'
                    }`}
                  >
                    {/* Top Row: Checkbox, Name, Role */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {isDraggable && (
                          <GripVertical className="w-3.5 h-3.5 text-stone-300 hover:text-stone-500 shrink-0" />
                        )}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectGuest(guest.id)}
                          className="w-4 h-4 rounded text-[#8B3A4A] focus:ring-[#8B3A4A] border-[#D9CEBF] cursor-pointer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-[#2D2A26] truncate">
                            {formatAltibajas(guest.fullName)}
                          </h4>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            {isCompanion ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border bg-emerald-50 text-emerald-800 border-emerald-200">
                                Acompañante
                              </span>
                            ) : (
                              getRoleBadge(guest.category)
                            )}
                            <span className="text-[10px] text-[#8C8276]">
                              {isCompanion ? (
                                <span title="El pase ya está contabilizado en la cuota del invitado titular">
                                  {mainGuest ? `de ${formatAltibajas(mainGuest.fullName).split(' ')[0]} • ` : ''}Pase incluido
                                </span>
                              ) : (
                                `${guest.confirmedPasses || guest.totalPasses || 1} ${((guest.confirmedPasses || guest.totalPasses || 1) === 1) ? 'pase' : 'pases'}`
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RSVP Badge */}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        guest.rsvpStatus === 'confirmed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : guest.rsvpStatus === 'declined' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {guest.rsvpStatus === 'confirmed' ? '✓ Confirmado' : guest.rsvpStatus === 'declined' ? '✕ Declinado' : '⏳ Pendiente'}
                      </span>
                    </div>

                    {/* Dietary Restriction if any */}
                    {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Ninguna' && (
                      <div className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        🍽️ Dieta: {guest.dietaryRestrictions}
                      </div>
                    )}

                    {/* Assignment Action Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1] gap-2">
                      {isAssigned ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-[#8B3A4A] flex items-center space-x-1 truncate">
                            <Armchair className="w-3 h-3" />
                            <span className="truncate">{guest.assignedTable}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleUnassignGuest(guest.id)}
                            className="text-[10px] text-rose-700 hover:text-rose-900 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
                            title="Quitar de esta mesa"
                          >
                            ✕ Quitar
                          </button>
                        </div>
                      ) : guest.rsvpStatus !== 'confirmed' ? (
                        <div className="flex items-center justify-between w-full bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1 text-[11px] text-amber-900">
                          <span className="flex items-center space-x-1 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Solo confirmados pueden asignar mesa</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => updateGuest(guest.id, {
                              rsvpStatus: 'confirmed',
                              confirmedPasses: guest.confirmedPasses || guest.totalPasses || 1,
                            })}
                            className="font-bold text-emerald-800 hover:text-emerald-950 underline hover:no-underline ml-2 cursor-pointer whitespace-nowrap"
                            title="Confirmar asistencia para habilitar asignación"
                          >
                            Confirmar RSVP
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 w-full">
                          <select
                            value=""
                            onChange={(e) => handleAssignSingleGuest(guest.id, e.target.value)}
                            className="w-full text-xs px-2.5 py-1 rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] text-[#2D2A26] focus:bg-white cursor-pointer font-medium"
                          >
                            <option value="">Asignar a Mesa... ▼</option>
                            {[...tables]
                              .filter(Boolean)
                              .sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'es', { numeric: true, sensitivity: 'base' }))
                              .map((t) => {
                                const occ = tableOccupancyMap.get((t?.name || '').trim().toLowerCase())?.totalPasses || 0;
                                return (
                                  <option key={t.id} value={t.name}>
                                    {t.name} ({occ}/{t.capacity} lugares)
                                  </option>
                                );
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN (LG: 7 COLS): TABLES GRID & SEATING CARDS
           ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Controls Bar: Zones Filter & Presets */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8DCCF] shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Zone Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#524B42] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Zona:</span>
              </span>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-[#2D2A26] focus:bg-white cursor-pointer font-medium"
              >
                <option value="all">Todas las zonas ({tables.length} mesas)</option>
                {allZones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Quick Presets Menu */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[11px] text-[#7A7268]">Presets rápidos:</span>
              <button
                type="button"
                onClick={() => handleCreateDefaultTableBatch(5, 10)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#D9CEBF] text-[#524B42] hover:bg-[#F0EAE1] transition-colors cursor-pointer text-[11px] font-medium"
              >
                +5 Mesas de 10
              </button>
              <button
                type="button"
                onClick={() => handleCreateDefaultTableBatch(10, 10)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#D9CEBF] text-[#524B42] hover:bg-[#F0EAE1] transition-colors cursor-pointer text-[11px] font-medium"
              >
                +10 Mesas de 10
              </button>
            </div>

          </div>

          {/* Tables Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTables.map((table) => {
              const occData = tableOccupancyMap.get((table?.name || '').trim().toLowerCase()) || { guests: [], totalPasses: 0 };
              const seatedGuests = occData.guests;
              const totalSeatedPasses = occData.totalPasses;
              const isOverCapacity = totalSeatedPasses > table.capacity;
              const isFull = totalSeatedPasses === table.capacity;
              const availableSeats = Math.max(0, table.capacity - totalSeatedPasses);
              const fillPct = table.capacity > 0 ? Math.min(100, Math.round((totalSeatedPasses / table.capacity) * 100)) : 0;
              const isDragOver = dragOverTableId === table.id;

              return (
                <div
                  key={table.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTableId(table.id);
                  }}
                  onDragLeave={() => {
                    setDragOverTableId((prev) => (prev === table.id ? null : prev));
                  }}
                  onDrop={(e) => handleDropOnTable(e, table.name)}
                  className={`bg-white rounded-3xl p-4 border shadow-xs space-y-2.5 transition-all flex flex-col justify-between ${
                    isDragOver
                      ? 'border-[#8B3A4A] ring-2 ring-[#8B3A4A]/40 bg-[#FFF8F9] shadow-lg scale-[1.01]'
                      : 'border-[#E8DCCF] hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Table Info & Actions */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif-display font-bold text-base text-[#2D2A26] leading-snug break-words">
                      {table.name}
                    </h3>

                    {/* Zone & Status Row (at the same height) */}
                    <div className="flex items-center justify-between gap-2 min-h-[20px]">
                      {table.zone ? (
                        <span className="text-[11px] text-[#8C8276] flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#8B3A4A] shrink-0" />
                          <span>{table.zone}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Sin zona asignada</span>
                      )}

                      {/* Status / Availability Badge */}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 shadow-2xs ${
                        isOverCapacity
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isFull
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {availableSeats > 0 ? (
                          `+${availableSeats} libres`
                        ) : isOverCapacity ? (
                          `⚠️ Sobrecupo (+${totalSeatedPasses - table.capacity})`
                        ) : (
                          'Mesa completa'
                        )}
                      </span>
                    </div>

                    {/* Fill Progress Bar */}
                    <div className="w-full bg-[#F0EAE1] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOverCapacity
                            ? 'bg-rose-500'
                            : isFull
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Seated Guests List with ultra-compact line spacing & Drag and Drop without forced scrollbar */}
                  <div className="flex-1 min-h-[70px]">
                    {seatedGuests.length === 0 ? (
                      <div className={`h-full min-h-[85px] py-2.5 flex flex-col items-center justify-center text-center p-3 rounded-2xl border border-dashed transition-colors space-y-1 ${
                        isDragOver
                          ? 'bg-[#FDF2F4] border-[#8B3A4A] text-[#8B3A4A]'
                          : 'bg-[#FAF8F5] border-[#D9CEBF] text-[#8C8276]'
                      }`}>
                        <Armchair className="w-4 h-4" />
                        <span className="text-[11px] font-medium">
                          {isDragOver ? 'Suelta aquí para asignar a esta mesa' : `Mesa vacía (${table.capacity} lugares libres)`}
                        </span>
                        <span className="text-[9px]">Arrastra invitados aquí o desde la lista izquierda</span>
                      </div>
                    ) : (
                      <ul className="space-y-0.5">
                        {seatedGuests.map((guest, idx) => {
                          const isCompanion = Boolean(guest.mainGuestId);
                          const mainGuest = isCompanion ? guests.find((g) => g.id === guest.mainGuestId) : null;

                          return (
                            <li 
                              key={guest.id} 
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', guest.id);
                                setDraggedGuestId(guest.id);
                              }}
                              onDragEnd={() => {
                                setDraggedGuestId(null);
                                setDragOverTableId(null);
                              }}
                              className="py-0.5 px-1 rounded-md flex items-center justify-between text-[11px] gap-1 group hover:bg-[#FAF6F0] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-[#E8DCCF]/60 leading-tight"
                            >
                              <div className="min-w-0 flex-1 flex items-center space-x-1.5 flex-nowrap">
                                <GripVertical className="w-3 h-3 text-stone-300 group-hover:text-stone-500 shrink-0 -ml-0.5" />
                                <span className="text-[9px] font-bold text-[#8C8276] w-3.5 shrink-0">{idx + 1}.</span>
                                <span className="font-medium text-[#2D2A26] truncate text-[11px]">
                                  {formatAltibajas(guest.fullName)}
                                </span>

                                {/* Botón 'quitar mesa' SOLO ÍCONO al final del nombre */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnassignGuest(guest.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded transition-all cursor-pointer inline-flex items-center justify-center shrink-0 shadow-2xs"
                                  title="Quitar de esta mesa"
                                >
                                  <UserMinus className="w-2.5 h-2.5" />
                                </button>

                                {/* Número de pases / Acompañante sin titular+acom */}
                                {isCompanion ? (
                                  <span 
                                    className="text-[9px] px-1 py-0 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-medium leading-tight"
                                    title={mainGuest ? `Acompañante de ${formatAltibajas(mainGuest.fullName)}` : 'Acompañante'}
                                  >
                                    Acompañante
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1 py-0 rounded bg-[#F7F3EE] text-[#7A7268] shrink-0 font-medium whitespace-nowrap leading-tight">
                                    {guest.confirmedPasses || guest.totalPasses || 1} {((guest.confirmedPasses || guest.totalPasses || 1) === 1) ? 'pase' : 'pases'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Ninguna' && (
                                  <span className="text-[9px] bg-amber-50 text-amber-900 px-1 py-0 rounded border border-amber-200 font-semibold" title={guest.dietaryRestrictions}>
                                    🍽️
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Table Footer Controls */}
                  <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTableToEdit(table);
                          setIsTableModalOpen(true);
                        }}
                        className="text-[#7A7268] hover:text-[#2D2A26] font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {seatedGuests.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearTable(table.name)}
                          className="text-stone-400 hover:text-rose-700 font-medium text-[11px] cursor-pointer"
                          title="Desasignar todos los comensales"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>

                    {/* Bottom-Right: Capacity / Occupancy count (trasladado según flecha azul) */}
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isOverCapacity
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isFull
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-[#FAF8F5] text-[#524B42] border-[#E8DCCF]'
                      }`}>
                        {totalSeatedPasses} / {table.capacity} Asientos
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-[#E8DCCF] shadow-xs space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-[#8B3A4A] mx-auto" />
              <h3 className="font-serif-display font-bold text-lg text-[#2D2A26]">
                No hay mesas registradas en esta zona
              </h3>
              <p className="text-xs text-[#7A7268] max-w-md mx-auto">
                Crea tu primera mesa de banquete o genera un lote automático con las herramientas rápidas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTableToEdit(null);
                  setIsTableModalOpen(true);
                }}
                className="px-4 py-2 bg-[#8B3A4A] text-white text-xs font-bold rounded-xl hover:bg-[#6E2937] transition-all cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Mesa</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Table Edit / Create Modal */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setTableToEdit(null);
        }}
        tableToEdit={tableToEdit}
        onSave={async (data) => {
          if (tableToEdit) {
            await updateTable(tableToEdit.id, data);
          } else {
            await addTable(data);
          }
        }}
        onDelete={
          tableToEdit
            ? async () => {
                if (window.confirm(`¿Seguro que deseas eliminar "${tableToEdit.name}"? Los comensales asignados pasarán a estado "Sin mesa".`)) {
                  await deleteTable(tableToEdit.id);
                  setIsTableModalOpen(false);
                  setTableToEdit(null);
                }
              }
            : undefined
        }
      />

      {/* Protocol Print Sheet Modal */}
      <TableSeatingPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        tables={tables}
        guests={guests}
      />

      {/* Floating Instant Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2A26] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 animate-bounce flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
