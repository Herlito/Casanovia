import React, { useState, useMemo } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { Guest, WeddingTable, GUEST_ROLES_CONFIG, ProtocolCategory, RsvpStatus } from '../../types';
import { TableModal } from './TableModal';
import { TableSeatingPrintModal } from './TableSeatingPrintModal';
import { formatAltibajas } from '../../lib/formatUtils';
import { getGuestGroupInfo, checkTableCapacityForGroup } from '../floorplan/floorPlanSyncUtils';
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
  AlertTriangle,
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
    appTheme, 
    guests = [], 
    tables = [], 
    updateGuest, 
    addTable, 
    updateTables, 
    updateTable, 
    deleteTable, 
    batchAssignGuestsToTable,
    batchUpdateGuests,
    setShowFloorPlanModal,
    settings,
    canEditActiveWedding,
    canPrint
  } = useWedding();
  const isNeumorphic = appTheme === 'neumorphic';

  // State
  const [activeGuestTab, setActiveGuestTab] = useState<'unassigned' | 'all'>('unassigned');
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [targetBatchTable, setTargetBatchTable] = useState<string>('');
  const [showGuestDirectory, setShowGuestDirectory] = useState(false);

  // Drag and Drop & Toast states
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'error' | 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4500);
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

  const hasUnassignedGuests = unassignedGuests.length > 0;
  const shouldShowGuestPanel = hasUnassignedGuests || showGuestDirectory;

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
    if (!target) return;

    if (target.rsvpStatus !== 'confirmed') {
      showToast(`Solo se puede asignar mesa a invitados confirmados. Por favor confirma la asistencia de "${target.fullName}" primero.`, 'warning');
      return;
    }

    if (tableName && tableName !== 'Mesa por asignar') {
      const targetTable = tables.find(
        (t) => (t?.name || '').trim().toLowerCase() === tableName.trim().toLowerCase()
      );
      if (targetTable) {
        const occData = tableOccupancyMap.get(tableName.trim().toLowerCase()) || { guests: [], totalPasses: 0 };
        const capacityCheck = checkTableCapacityForGroup(
          targetTable.name,
          targetTable.capacity || 10,
          occData.totalPasses,
          target,
          guests
        );
        if (!capacityCheck.canFit) {
          showToast(capacityCheck.warningMessage || 'La mesa sobrepasa su capacidad.', 'error');
          return;
        }
      }
    }

    await updateGuest(guestId, { assignedTable: tableName });
  };

  // Quick Action: Unassign single guest
  const handleUnassignGuest = async (guestId: string) => {
    const target = guests.find((g) => g.id === guestId);
    await updateGuest(guestId, { assignedTable: 'Mesa por asignar' });
    if (target) {
      showToast(`"${formatAltibajas(target.fullName)}" desasignado(a) de la mesa.`, 'info');
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
      showToast(`Solo se puede asignar mesa a invitados confirmados. Por favor confirma a "${formatAltibajas(draggedGuest.fullName)}" primero.`, 'warning');
      setDraggedGuestId(null);
      return;
    }

    // Verificar si la mesa destino existe y tiene capacidad para el invitado y su(s) acompañante(s)
    const targetTable = tables.find(
      (t) => (t?.name || '').trim().toLowerCase() === targetTableName.trim().toLowerCase()
    );

    if (targetTable) {
      const occData = tableOccupancyMap.get(targetTableName.trim().toLowerCase()) || { guests: [], totalPasses: 0 };
      const currentOccupied = occData.totalPasses;
      const capacityCheck = checkTableCapacityForGroup(
        targetTable.name,
        targetTable.capacity || 10,
        currentOccupied,
        draggedGuest,
        guests
      );

      // Si no cabe el invitado con su(s) acompañante(s), no permitir la asignación y avisar
      if (!capacityCheck.canFit) {
        showToast(
          capacityCheck.warningMessage || `La mesa "${targetTable.name}" sobrepasa su capacidad.`,
          'error'
        );
        setDraggedGuestId(null);
        return;
      }
    }

    // Identificar el grupo completo (titular + acompañantes)
    const groupInfo = getGuestGroupInfo(draggedGuest, guests);
    await updateGuest(draggedGuest.id, { assignedTable: targetTableName });
    
    const count = groupInfo.requiredSeats;
    const companionCount = count - 1;
    showToast(
      `¡"${formatAltibajas(draggedGuest.fullName)}"${companionCount > 0 ? ` y ${companionCount === 1 ? 'su acompañante' : `${companionCount} acompañantes`}` : ''} asignado(s) a "${targetTableName}"!`,
      'success'
    );
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

  // Random Auto-Distribute to fill available seats up to capacity
  const handleSmartAutoAssign = async () => {
    if (!tables || tables.length === 0) {
      setAutoAssignMessage('Por favor crea al menos una mesa antes de auto-asignar.');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3500);
      return;
    }

    const isUnassigned = (g: Guest) => {
      if (!g) return false;
      const t = (g.assignedTable || '').trim().toLowerCase();
      return t === '' || t === 'mesa por asignar' || t === 'sin asignar' || t === 'sin mesa' || t.includes('por asignar');
    };

    // 1. Calculate current capacity per table based on tableOccupancyMap
    const tableState = tables.map((t) => {
      const occ = tableOccupancyMap.get(t.name.trim().toLowerCase())?.totalPasses || 0;
      return {
        id: t.id,
        name: t.name,
        capacity: t.capacity,
        available: Math.max(0, t.capacity - occ),
      };
    });

    const totalAvailableSeats = tableState.reduce((sum, t) => sum + t.available, 0);
    if (totalAvailableSeats <= 0) {
      setAutoAssignMessage('No hay asientos disponibles en las mesas creadas.');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3500);
      return;
    }

    // 2. Identify unassigned guests
    const unassignedList = guests.filter(isUnassigned);
    if (unassignedList.length === 0) {
      setAutoAssignMessage('¡Todos los invitados ya tienen una mesa asignada!');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3000);
      return;
    }

    // 3. Build group units (each party consists of a primary guest and any registered companions)
    interface GuestGroup {
      primary: Guest;
      companions: Guest[];
      requiredSeats: number;
    }

    const processedGuestIds = new Set<string>();
    const groups: GuestGroup[] = [];

    // Group unassigned primary guests first with their unassigned companions
    unassignedList.forEach((g) => {
      if (processedGuestIds.has(g.id)) return;

      if (!g.mainGuestId) {
        const companions = unassignedList.filter((c) => c.mainGuestId === g.id && c.id !== g.id);
        companions.forEach((c) => processedGuestIds.add(c.id));
        processedGuestIds.add(g.id);

        const passes = Math.max(
          1 + companions.length,
          g.confirmedPasses || 0,
          g.totalPasses || 1
        );

        groups.push({
          primary: g,
          companions,
          requiredSeats: passes,
        });
      }
    });

    // Handle any remaining unassigned companions (e.g. whose primary is already assigned or orphan companions)
    unassignedList.forEach((g) => {
      if (processedGuestIds.has(g.id)) return;
      processedGuestIds.add(g.id);

      // If main guest already has a table with space, try to keep them together
      if (g.mainGuestId) {
        const main = guests.find((m) => m.id === g.mainGuestId);
        if (main && main.assignedTable && !isUnassigned(main)) {
          const mainTbl = tableState.find((t) => t.name.trim().toLowerCase() === main.assignedTable.trim().toLowerCase());
          if (mainTbl && mainTbl.available > 0) {
            mainTbl.available -= 1;
            groups.push({
              primary: g,
              companions: [],
              requiredSeats: 0,
            });
            return;
          }
        }
      }

      groups.push({
        primary: g,
        companions: [],
        requiredSeats: Math.max(1, g.confirmedPasses || 0, g.totalPasses || 1),
      });
    });

    // 4. Randomize the groups completely (Fisher-Yates shuffle) for aleatory distribution
    for (let i = groups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [groups[i], groups[j]] = [groups[j], groups[i]];
    }

    const guestTableAssignmentMap = new Map<string, string>();
    let assignedPeopleCount = 0;

    // Pre-seat any companions joining already assigned main guests
    groups.forEach((grp) => {
      if (grp.requiredSeats === 0 && grp.primary.mainGuestId) {
        const main = guests.find((m) => m.id === grp.primary.mainGuestId);
        if (main && main.assignedTable && !isUnassigned(main)) {
          guestTableAssignmentMap.set(grp.primary.id, main.assignedTable);
          assignedPeopleCount += 1;
        }
      }
    });

    const pendingGroups = groups.filter((grp) => !guestTableAssignmentMap.has(grp.primary.id));

    // 5. Fill tables up to capacity occupying available seats
    for (const table of tableState) {
      if (table.available <= 0) continue;

      let madeAssignment = true;
      while (madeAssignment && table.available > 0 && pendingGroups.length > 0) {
        madeAssignment = false;

        // Try to find a group that fits perfectly (requiredSeats === table.available)
        let groupIdx = pendingGroups.findIndex((g) => g.requiredSeats === table.available);
        
        // If not found, find any group that fits within remaining table seats
        if (groupIdx === -1) {
          groupIdx = pendingGroups.findIndex((g) => g.requiredSeats <= table.available);
        }

        if (groupIdx !== -1) {
          const group = pendingGroups.splice(groupIdx, 1)[0];
          
          guestTableAssignmentMap.set(group.primary.id, table.name);
          group.companions.forEach((c) => {
            guestTableAssignmentMap.set(c.id, table.name);
          });

          table.available -= group.requiredSeats;
          assignedPeopleCount += 1 + group.companions.length;
          madeAssignment = true;
        }
      }
    }

    // If there are still pending groups and any table has available seats left, fill those remaining seats
    if (pendingGroups.length > 0) {
      for (const table of tableState) {
        if (table.available <= 0) continue;
        while (table.available > 0 && pendingGroups.length > 0) {
          const group = pendingGroups.shift()!;
          guestTableAssignmentMap.set(group.primary.id, table.name);
          group.companions.forEach((c) => {
            guestTableAssignmentMap.set(c.id, table.name);
          });
          const seatsUsed = Math.min(table.available, group.requiredSeats);
          table.available -= seatsUsed;
          assignedPeopleCount += 1 + group.companions.length;
        }
      }
    }

    if (guestTableAssignmentMap.size === 0) {
      setAutoAssignMessage('No fue posible asignar invitados a las mesas disponibles.');
      setShowAutoAssignSuccess(true);
      setTimeout(() => setShowAutoAssignSuccess(false), 3000);
      return;
    }

    // Apply all assignments in a single batch update
    const today = new Date().toISOString().split('T')[0];
    const updatedGuests = guests.map((g) => {
      const assignedTable = guestTableAssignmentMap.get(g.id);
      if (assignedTable) {
        return {
          ...g,
          assignedTable,
          rsvpStatus: (g.rsvpStatus === 'declined' ? 'confirmed' : g.rsvpStatus || 'confirmed') as RsvpStatus,
          confirmedPasses: g.confirmedPasses || g.totalPasses || 1,
          updatedAt: today,
        };
      }
      return g;
    });

    await batchUpdateGuests(updatedGuests);

    setAutoAssignMessage(`¡Se han auto-distribuido aleatoriamente ${assignedPeopleCount} personas ocupando los asientos disponibles!`);
    setShowAutoAssignSuccess(true);
    setTimeout(() => setShowAutoAssignSuccess(false), 4500);
  };

  // Quick Preset: Generate default tables
  const handleCreateDefaultTableBatch = async (count: number, capacity: number) => {
    const existingCount = tables.length;
    const newTables = [];
    for (let i = 1; i <= count; i++) {
      const num = existingCount + i;
      newTables.push({
        id: `tbl-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
        name: `Mesa ${num}`,
        capacity: capacity,
        shape: 'round' as const,
        zone: 'Salón Principal',
        notes: `Mesa estándar para ${capacity} personas`,
      });
    }
    await updateTables([...tables, ...newTables]);
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

  const renderTablesSection = () => (
    <div className="space-y-4">
      {/* Controls Bar: Zones Filter, Presets & Guest Toggle */}
      <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-4 sm:p-5 border border-transparent shadow-xs flex flex-wrap items-center justify-between gap-3" : "bg-[#EBEBEB] rounded-3xl p-4 sm:p-5 border border-transparent shadow-xs flex flex-wrap items-center justify-between gap-3"}>
        
        {/* Zone Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#524B42] flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#2D3748]" />
            <span>Zona:</span>
          </span>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] text-[#2D2A26] focus:bg-[#EBEBEB] cursor-pointer font-medium"
          >
            <option value="all">Todas las zonas ({tables.length} mesas)</option>
            {allZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Quick Presets Menu & Guest Panel Toggle */}
        <div className="flex items-center space-x-2 text-xs flex-wrap gap-2">
          {!hasUnassignedGuests && (
            <button
              type="button"
              onClick={() => setShowGuestDirectory((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                showGuestDirectory
                  ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748]'
                  : 'bg-[#FAF8F5] border border-[#D9CEBF] text-[#524B42] hover:bg-[#F0EAE1]'
              }`}
              title="Abrir o cerrar directorio de invitados"
            >
              <Users className="w-3.5 h-3.5 text-[#2D3748]" />
              <span>{showGuestDirectory ? 'Ocultar panel de invitados' : `Ver todos los invitados (${guests.length})`}</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-[#7A7268] hidden sm:inline">Presets rápidos:</span>
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

      </div>

      {/* Tables Cards Grid: 4 cols on PC, 3 on tablet, 2 on mobile when guest panel is hidden */}
      <div className={`grid gap-3 sm:gap-4 ${
        shouldShowGuestPanel 
          ? 'grid-cols-2 md:grid-cols-2' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {filteredTables.map((table) => {
          const occData = tableOccupancyMap.get((table?.name || '').trim().toLowerCase()) || { guests: [], totalPasses: 0 };
          const seatedGuests = occData.guests;
          const assignedGuestCount = seatedGuests.length;
          const isOverCapacity = assignedGuestCount > table.capacity;
          const isFull = assignedGuestCount === table.capacity;
          const availableSeats = Math.max(0, table.capacity - assignedGuestCount);
          const fillPct = table.capacity > 0 ? Math.min(100, Math.round((assignedGuestCount / table.capacity) * 100)) : 0;
          const isDragOver = dragOverTableId === table.id;

          const draggedGuestObj = draggedGuestId ? guests.find((g) => g.id === draggedGuestId) : null;
          const draggedGroupInfo = draggedGuestObj ? getGuestGroupInfo(draggedGuestObj, guests) : null;
          const isOverCapacityForDragged = draggedGroupInfo ? draggedGroupInfo.requiredSeats > availableSeats : false;

          return (
            <div
              key={table.id}
              onDragOver={(e) => {
                if (!canEditActiveWedding) return;
                e.preventDefault();
                setDragOverTableId(table.id);
              }}
              onDragLeave={() => {
                if (!canEditActiveWedding) return;
                setDragOverTableId((prev) => (prev === table.id ? null : prev));
              }}
              onDrop={(e) => {
                if (!canEditActiveWedding) return;
                handleDropOnTable(e, table.name);
              }}
              className={`bg-[#EBEBEB] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border shadow-xs space-y-2 sm:space-y-2.5 transition-all flex flex-col justify-between ${
                isDragOver
                  ? isOverCapacityForDragged
                    ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/70 shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] scale-[1.01]'
                    : 'border-emerald-400 ring-2 ring-emerald-300 bg-emerald-50/60 shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] scale-[1.01]'
                  : 'border-transparent hover:shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]'
              }`}
            >
              {/* Top Bar: Table Info & Actions */}
              <div className="space-y-1.5">
                {/* Visual drag-over capacity feedback banner */}
                {isDragOver && (
                  isOverCapacityForDragged ? (
                    <div className="bg-rose-100 border border-rose-300 text-rose-900 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Sobrepasa capacidad ({availableSeats} libres / {draggedGroupInfo?.requiredSeats} nec.)</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Soltar ({draggedGroupInfo?.requiredSeats} lugar{draggedGroupInfo?.requiredSeats === 1 ? '' : 'es'})</span>
                    </div>
                  )
                )}

                <h3 className="font-serif-display font-bold text-sm sm:text-base text-[#2D2A26] leading-snug break-words">
                  {table.name}
                </h3>

                {/* Zone & Status Row (at the same height) */}
                <div className="flex items-center justify-between gap-1.5 min-h-[20px]">
                  {table.zone ? (
                    <span className="text-[10px] sm:text-[11px] text-[#8C8276] flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-[#2D3748] shrink-0" />
                      <span className="truncate">{table.zone}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-[11px] text-stone-400 italic">Sin zona</span>
                  )}

                  {/* Status / Availability Badge */}
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold shrink-0 shadow-2xs ${
                    isOverCapacity
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : isFull
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-[#2D3748]'
                  }`}>
                    {isOverCapacity ? 'Llena+' : isFull ? 'Completa' : `${availableSeats} disp.`}
                  </span>
                </div>

                {/* Occupancy Progress bar */}
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverCapacity ? 'bg-rose-500' : isFull ? 'bg-amber-500' : 'bg-[#D4AF37]'
                    }`}
                    style={{ width: `${Math.min(100, fillPct)}%` }}
                  />
                </div>
              </div>

              {/* Seated Guests List */}
              <div className="my-1.5 flex-1">
                {seatedGuests.length === 0 ? (
                  <div className="py-5 text-center text-[#8C8276] border border-dashed border-[#D9CEBF] rounded-xl text-[11px] flex flex-col items-center justify-center space-y-1">
                    <Users className="w-4 h-4 opacity-40" />
                    <span>Mesa disponible</span>
                  </div>
                ) : (
                  <ul className="space-y-1 max-h-52 overflow-y-auto pr-0.5 custom-scrollbar">
                    {seatedGuests.map((guest, idx) => {
                      const isCompanion = Boolean(guest.mainGuestId);
                      const mainGuest = isCompanion ? guests.find((g) => g.id === guest.mainGuestId) : null;

                      return (
                        <li
                          key={guest.id}
                          draggable={canEditActiveWedding}
                          onDragStart={(e) => {
                            if (!canEditActiveWedding) return;
                            e.dataTransfer.setData('text/plain', guest.id);
                            setDraggedGuestId(guest.id);
                          }}
                          onDragEnd={() => {
                            setDraggedGuestId(null);
                            setDragOverTableId(null);
                          }}
                          className="py-0.5 px-1 rounded-md flex items-center justify-between text-[10px] sm:text-[11px] gap-1 group hover:bg-[#FAF6F0] transition-colors cursor-grab active:cursor-grabbing border border-transparent hover:border-transparent/60 leading-tight"
                        >
                          <div className="min-w-0 flex-1 flex items-center space-x-1 sm:space-x-1.5 flex-nowrap">
                            {canEditActiveWedding && (
                              <GripVertical className="w-3 h-3 text-stone-300 group-hover:text-stone-500 shrink-0 -ml-0.5" />
                            )}
                            <span className="text-[8px] sm:text-[9px] font-bold text-[#8C8276] w-3 sm:w-3.5 shrink-0">{idx + 1}.</span>
                            <span className="font-medium text-[#2D2A26] truncate text-[10px] sm:text-[11px]">
                              {formatAltibajas(guest.fullName)}
                            </span>

                            {/* Botón 'quitar mesa' SOLO ÍCONO al final del nombre */}
                            {canEditActiveWedding && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnassignGuest(guest.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-600 hover:text-[#2D3748] hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded transition-all cursor-pointer inline-flex items-center justify-center shrink-0 shadow-2xs"
                                title="Quitar de esta mesa"
                              >
                                <UserMinus className="w-2.5 h-2.5" />
                              </button>
                            )}

                            {/* Número de pases / Acompañante */}
                            {isCompanion ? (
                              <span 
                                className="text-[8px] sm:text-[9px] px-1 py-0 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-medium leading-tight"
                                title={mainGuest ? `Acompañante de ${formatAltibajas(mainGuest.fullName)}` : 'Acompañante'}
                              >
                                Acomp.
                              </span>
                            ) : (
                              <span className="text-[8px] sm:text-[9px] px-1 py-0 rounded bg-[#EBEBEB] text-[#7A7268] shrink-0 font-medium whitespace-nowrap leading-tight">
                                {guest.confirmedPasses || guest.totalPasses || 1} p.
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
              <div className="pt-2 border-t border-[#F0EAE1] flex flex-wrap sm:flex-nowrap items-center justify-between text-xs gap-1">
                <div className="flex items-center space-x-2">
                  {canEditActiveWedding && (
                    <button
                      type="button"
                      onClick={() => {
                        setTableToEdit(table);
                        setIsTableModalOpen(true);
                      }}
                      className="text-[#7A7268] hover:text-[#2D2A26] font-semibold flex items-center space-x-1 cursor-pointer text-[11px] sm:text-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}

                  {canEditActiveWedding && seatedGuests.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleClearTable(table.name)}
                      className="text-stone-400 hover:text-rose-700 font-medium text-[10px] sm:text-[11px] cursor-pointer"
                      title="Desasignar todos los comensales"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {/* Bottom-Right: Capacity / Occupancy count */}
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold border ${
                    isOverCapacity
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : isFull
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-[#FAF8F5] text-[#524B42] border-transparent'
                  }`}>
                    {assignedGuestCount} / {table.capacity} <span className="hidden sm:inline">Asientos</span>
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className={isNeumorphic ? "text-center py-12 px-6 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] border border-transparent shadow-xs space-y-3" : "text-center py-12 px-6 bg-[#EBEBEB] rounded-3xl border border-transparent shadow-xs space-y-3"}>
          <UtensilsCrossed className="w-10 h-10 text-[#2D3748] mx-auto" />
          <h3 className="font-serif-display font-bold text-lg text-[#2D2A26]">
            No hay mesas registradas en esta zona
          </h3>
          <p className="text-xs text-[#7A7268] max-w-md mx-auto">
            Crea tu primera mesa de banquete o genera un lote automático con las herramientas rápidas.
          </p>
          {canEditActiveWedding && (
            <button
              type="button"
              onClick={() => {
                setTableToEdit(null);
                setIsTableModalOpen(true);
              }}
              className="px-4 py-2 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] text-xs font-bold rounded-xl hover:bg-[#EBEBEB] transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Mesa</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          HEADER STATION
         ======================================================== */}
      <div className="bg-[#EBEBEB] rounded-[2.5rem] p-6 text-gray-800 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-gray-800" />
            <span>Asignación de Mesas</span>
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          {canEditActiveWedding && (
            <button
              type="button"
              onClick={handleSmartAutoAssign}
              className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Asigna automáticamente invitados sin mesa a los lugares libres"
            >
              <Wand2 className="w-4 h-4 text-gray-800" />
              <span className="hidden sm:inline">Auto-Distribuir</span>
            </button>
          )}

          {canPrint && (
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFloorPlanModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-1.5 cursor-pointer"
            title="Diseñador visual interactivo de planos en 2D con carga de PDF y asignación de asientos"
          >
            <MapIcon className="w-4 h-4 text-[#2D3748]" />
            <span className="hidden sm:inline">Plano Local</span>
          </button>

          {canEditActiveWedding && (
            <button
              type="button"
              onClick={() => {
                setTableToEdit(null);
                setIsTableModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Mesa</span>
            </button>
          )}
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
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Cantidad de Mesas */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 border border-transparent shadow-2xs space-y-2" : "bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-transparent shadow-2xs space-y-2"}>
          <div className="flex items-center justify-between text-[#8C8276]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cantidad de Mesas</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#2D3748] flex items-center justify-center">
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
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 border border-transparent shadow-2xs space-y-2" : "bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-transparent shadow-2xs space-y-2"}>
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
              className="bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Invitados Asignados */}
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 border border-transparent shadow-2xs space-y-2" : "bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-transparent shadow-2xs space-y-2"}>
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
            : 'bg-[#FFFDFB] border-transparent'
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
        <div className={isNeumorphic ? "bg-[#EBEBEB] rounded-[2rem] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] p-4 sm:p-5 border border-transparent shadow-2xs space-y-2" : "bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-transparent shadow-2xs space-y-2"}>
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
          MAIN WORKSPACE: GUEST DIRECTORY & SEATING TABLES
         ======================================================== */}
      {shouldShowGuestPanel ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN (LG: 5 COLS): GUEST SELECTION & BATCH ASSIGN
           ======================================================== */}
        <div className={isNeumorphic ? "lg:col-span-5 bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-5 sm:p-6 border border-transparent shadow-xs space-y-4" : "lg:col-span-5 bg-[#EBEBEB] rounded-3xl p-5 sm:p-6 border border-transparent shadow-xs space-y-4"}>
          
          {/* Guest Tabs & Header */}
          <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3 gap-2">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setActiveGuestTab('unassigned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeGuestTab === 'unassigned'
                    ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                    : 'bg-[#EBEBEB] text-[#7A7268] hover:text-[#2D2A26]'
                }`}
              >
                <span>Sin Mesa</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeGuestTab === 'unassigned' ? 'bg-[#EBEBEB]/20 text-[#2D3748]' : 'bg-amber-100 text-amber-900 font-bold'
                }`}>
                  {unassignedGuests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuestTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeGuestTab === 'all'
                    ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] shadow-2xs'
                    : 'bg-[#EBEBEB] text-[#7A7268] hover:text-[#2D2A26]'
                }`}
              >
                <span>Todos</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeGuestTab === 'all' ? 'bg-[#EBEBEB]/20 text-[#2D3748]' : 'bg-stone-200 text-stone-700'
                }`}>
                  {guests.length}
                </span>
              </button>
            </div>

            
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
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#D9CEBF] bg-[#FAF8F5] focus:bg-[#EBEBEB] focus:outline-hidden focus:ring-2 focus:ring-[#d1d1d1]/20"
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
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] border-transparent font-bold'
                    : 'bg-[#EBEBEB] text-[#524B42] border-transparent hover:bg-[#EAE4DC]'
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
                      ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] text-[#2D3748] border-transparent font-bold'
                      : 'bg-[#FAF8F5] text-[#7A7268] border-transparent hover:bg-[#EAE4DC]'
                  }`}
                >
                  {role.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Floating / Sticky Batch Assignment Action Bar */}
          {canEditActiveWedding && selectedGuestIds.length > 0 && (
            <div className="p-3 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] rounded-2xl space-y-2 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-gray-800" />
                  <span>{selectedGuestIds.length} invitados seleccionados</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedGuestIds([])}
                  className="text-[11px] text-stone-300 hover:text-[#2D3748] underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={targetBatchTable}
                  onChange={(e) => setTargetBatchTable(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#EBEBEB] text-[#2D2A26] border border-transparent focus:outline-hidden font-medium"
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
                  className="px-3 py-1.5 bg-[#F7E7CE] text-[#2D3748] font-bold text-xs rounded-xl hover:bg-[#EBEBEB] transition-colors cursor-pointer disabled:opacity-50"
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
                    className="text-xs text-[#2D3748] font-bold hover:underline cursor-pointer"
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

                const isDraggable = canEditActiveWedding && guest.rsvpStatus === 'confirmed';

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
                        ? 'bg-[#FAF3F5] border-transparent ring-1 ring-[#d1d1d1]/20' 
                        : 'bg-[#FFFDFB] border-transparent hover:border-[#D9CEBF]'
                    }`}
                  >
                    {/* Top Row: Checkbox, Name, Role */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {isDraggable && (
                          <GripVertical className="w-3.5 h-3.5 text-stone-300 hover:text-stone-500 shrink-0" />
                        )}
                        {canEditActiveWedding && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectGuest(guest.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded text-[#2D3748] focus:ring-[#d1d1d1] border-[#D9CEBF] cursor-pointer"
                          />
                        )}
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
                    {isSelected && canEditActiveWedding && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE1] gap-2">
                      {isAssigned ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-semibold text-[#2D3748] flex items-center space-x-1 truncate">
                            <Armchair className="w-3 h-3" />
                            <span className="truncate">{guest.assignedTable}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleUnassignGuest(guest.id); }}
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
                            onClick={(e) => { e.stopPropagation(); updateGuest(guest.id, {
                              rsvpStatus: 'confirmed',
                              confirmedPasses: guest.confirmedPasses || guest.totalPasses || 1,
                            }); }}
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
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2.5 py-1 rounded-lg border border-[#D9CEBF] bg-[#FAF8F5] text-[#2D2A26] focus:bg-[#EBEBEB] cursor-pointer font-medium"
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
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN (LG: 7 COLS): TABLES GRID & SEATING CARDS
           ======================================================== */}
        <div className="lg:col-span-7">
          {renderTablesSection()}
        </div>

      </div>
    ) : (
      <div className="w-full">
        {renderTablesSection()}
      </div>
    )}

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
                await deleteTable(tableToEdit.id);
                setIsTableModalOpen(false);
                setTableToEdit(null);
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
        <div
          className={`fixed bottom-6 right-6 z-50 text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-2.5 transition-all max-w-md animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-900/10'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-amber-900/10'
              : toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-900/10'
              : 'bg-[#2D2A26] border-neutral-700 text-white shadow-black/20'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : toastMessage.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
          )}
          <span className="leading-snug">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-current opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};
