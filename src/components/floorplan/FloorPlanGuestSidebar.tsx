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
    <div className="w-[50vw] sm:max-w-none sm:w-80 bg-[#FAF8F5] border-l border-[#E8DCCF] flex flex-col h-full overflow-hidden text-[#2D2A26] select-none text-xs">
      

      {/* Search & Filters */}
      <div className="p-3 border-b border-[#E8DCCF] bg-[#FAF8F5] space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8276]" />
          <input
            type="text"
            placeholder="Buscar por nombre, mesa o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#D9CEBF] rounded-lg text-xs focus:outline-hidden focus:border-[#8B3A4A]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C8276] hover:text-[#2D2A26]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#E8DCCF]/50 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-[#8B3A4A] shadow-2xs' : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            Todos ({totalGuests})
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={`py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'unassigned' ? 'bg-white text-amber-800 shadow-2xs' : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            Libres ({unassignedCount})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'assigned' ? 'bg-white text-[#8B3A4A] shadow-2xs' : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            Asignados ({assignedCount})
          </button>
        </div>
      </div>

      {/* Guest Cards List */}
      <div className="flex-1 px-[2px] py-2 overflow-y-auto space-y-[2px]">
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
                className={`px-2 py-[2px] rounded-xl border transition-all cursor-grab active:cursor-grabbing bg-white shadow-2xs hover:shadow-xs group ${
                  isAssigned
                    ? 'border-emerald-200 hover:border-emerald-400'
                    : 'border-[#E8DCCF] hover:border-[#8B3A4A]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-start space-x-2 min-w-0 flex-1">
                    <GripVertical className="w-3.5 h-3.5 text-[#D9CEBF] group-hover:text-[#8B3A4A] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs truncate text-[#2D2A26]">
                          {guest.fullName}
                        </span>
                      </div>

                      {/* Wedding assigned table and group */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-[#8C8276]">
                        {guest.assignedTable && (
                          <span className="font-semibold text-[#8B3A4A] bg-rose-50 px-1 rounded truncate max-w-[150px]">
                            {guest.assignedTable}
                          </span>
                        )}
                        {guest.protocolRoleTitle && (
                          <span className="truncate max-w-[110px] text-stone-600">
                            {guest.protocolRoleTitle}
                          </span>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* RSVP Indicator & Unassign */}
                  <div className="shrink-0 flex items-center space-x-1">
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
                        className="p-0.5 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Desasignar asiento"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-[#8C8276] space-y-2">
            <p className="text-xs">No se encontraron invitados con los filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Quick Help Footer */}
      <div className="p-2.5 bg-white border-t border-[#E8DCCF] text-[10px] text-[#8C8276] flex items-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#8B3A4A] shrink-0" />
        <span>Arrastra cualquier invitado directamente sobre una silla en el plano para asignarlo.</span>
      </div>
    </div>
  );
};
