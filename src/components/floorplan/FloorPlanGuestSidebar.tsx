import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Utensils,
  UserCheck,
  UserX,
  GripVertical,
  X,
  Sparkles
} from 'lucide-react';
import { Guest, FloorPlanElement } from '../../types';

interface FloorPlanGuestSidebarProps {
  guests: Guest[];
  elements: FloorPlanElement[];
  onUnassignGuest: (guestId: string) => void;
  onDragStartGuest: (guest: Guest) => void;
  onDragEndGuest: () => void;
  onFocusTable?: (elementId: string) => void;
}

type GuestFilter = 'all' | 'unassigned' | 'assigned';

export const FloorPlanGuestSidebar: React.FC<FloorPlanGuestSidebarProps> = ({
  guests,
  elements,
  onUnassignGuest,
  onDragStartGuest,
  onDragEndGuest,
  onFocusTable,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<GuestFilter>('all');

  // Build mapping of guestId -> { elementId, tableName, tableNumber, seatNumber }
  const guestSeatMap = useMemo(() => {
    const map = new Map<
      string,
      { elementId: string; tableName: string; tableNumber?: number; seatNumber: number }
    >();

    elements.forEach((elem) => {
      if (elem.seats) {
        elem.seats.forEach((seat) => {
          if (seat.guestId) {
            map.set(seat.guestId, {
              elementId: elem.id,
              tableName: elem.name || `Mesa ${elem.tableNumber || ''}`,
              tableNumber: elem.tableNumber,
              seatNumber: seat.seatNumber,
            });
          }
        });
      }
    });

    return map;
  }, [elements]);

  // Seating statistics
  const totalGuests = guests.length;
  const assignedCount = guests.filter((g) => guestSeatMap.has(g.id)).length;
  const unassignedCount = totalGuests - assignedCount;

  const totalTableCapacity = useMemo(() => {
    return elements
      .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
      .reduce((acc, e) => acc + (e.seats?.length || e.seatCount || 0), 0);
  }, [elements]);

  // Filtered guest list
  const filteredGuests = useMemo(() => {
    return guests.filter((guest) => {
      const isAssigned = guestSeatMap.has(guest.id);
      if (filter === 'unassigned' && isAssigned) return false;
      if (filter === 'assigned' && !isAssigned) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = guest.fullName.toLowerCase().includes(term);
        const matchesTable = (guest.assignedTable || '').toLowerCase().includes(term);
        const matchesRole = (guest.protocolRoleTitle || guest.category || '').toLowerCase().includes(term);
        const matchesDiet = (guest.dietaryRestrictions || '').toLowerCase().includes(term);
        return matchesName || matchesTable || matchesRole || matchesDiet;
      }
      return true;
    });
  }, [guests, guestSeatMap, filter, searchTerm]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, guest: Guest) => {
    e.dataTransfer.setData('application/json', JSON.stringify(guest));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStartGuest(guest);
  };

  return (
    <div className="w-[50vw] sm:max-w-none sm:w-80 bg-[#EBEBEB] border-l border-transparent flex flex-col h-full overflow-hidden text-gray-800 select-none text-xs">
      

      {/* Search & Filters */}
      <div className="p-3 bg-[#EBEBEB] space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, mesa o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs placeholder-gray-400 text-gray-800 border-none focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#EBEBEB] p-1 rounded-2xl shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-[11px] font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              filter === 'all'
                ? 'bg-[#EBEBEB] text-gray-900 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Todos ({totalGuests})
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              filter === 'unassigned'
                ? 'bg-[#EBEBEB] text-amber-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Libres ({unassignedCount})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              filter === 'assigned'
                ? 'bg-[#EBEBEB] text-emerald-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Asignados ({assignedCount})
          </button>
        </div>
      </div>

      {/* Guest Cards List */}
      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2">
        {filteredGuests.length > 0 ? (
          filteredGuests.map((guest) => {
            const assignment = guestSeatMap.get(guest.id);
            const isAssigned = !!assignment;
            const passes = guest.confirmedPasses || guest.totalPasses || 1;

            return (
              <div
                key={guest.id}
                draggable
                onDragStart={(e) => handleDragStart(e, guest)}
                onDragEnd={onDragEndGuest}
                className={`p-2.5 rounded-2xl transition-all cursor-grab active:cursor-grabbing bg-[#EBEBEB] group border-none ${
                  isAssigned
                    ? 'shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                    : 'shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-start space-x-2 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs truncate text-gray-900">
                          {guest.fullName}
                        </span>
                      </div>

                      {/* Wedding assigned table and group */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-500">
                        {guest.assignedTable && (
                          <span className="font-semibold text-gray-700 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] px-1.5 py-0.5 rounded-lg truncate max-w-[140px]">
                            {guest.assignedTable}
                          </span>
                        )}
                        {guest.protocolRoleTitle && (
                          <span className="truncate max-w-[110px] text-gray-500">
                            {guest.protocolRoleTitle}
                          </span>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* RSVP Indicator & Unassign */}
                  <div className="shrink-0 flex items-center space-x-1.5">
                    {guest.rsvpStatus === 'confirmed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"  />
                    ) : guest.rsvpStatus === 'declined' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-500"  />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500"  />
                    )}
                    
                    {isAssigned && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnassignGuest(guest.id);
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded-full bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] active:shadow-[inset_1px_1px_2px_#d1d1d1,inset_-1px_-1px_2px_#ffffff] transition-all cursor-pointer border-none"
                        title="Desasignar asiento"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-gray-500 space-y-2">
            <p className="text-xs">No se encontraron invitados con los filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Quick Help Footer */}
      <div className="p-3 bg-[#EBEBEB] text-[10px] text-gray-500 flex items-center space-x-1.5 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.03)]">
        <Sparkles className="w-3.5 h-3.5 text-gray-700 shrink-0" />
        <span>Toca o haz clic en cualquier asiento del plano para asignarle un invitado.</span>
      </div>
    </div>
  );
};
