import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpToLine,
  ArrowDownToLine,
  Circle,
  Square,
  Music,
  Sparkles,
  Wine,
  Radio,
  DoorOpen,
  Cake,
  Armchair,
  Camera,
  Type,
  Lock,
  Unlock,
  Copy,
  Trash2,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Layers,
  Sliders,
  Plus,
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Search,
  ExternalLink,
  Link as LinkIcon,
  Tag,
  AlertCircle
} from 'lucide-react';
import { FloorPlanElement, FloorPlanElementType, FloorPlanSeat, WeddingTable, Guest } from '../../types';
import { extractTableNumber, isGuestAssignedToTable } from './floorPlanSyncUtils';

interface FloorPlanToolbarProps {
  selectedElement: FloorPlanElement | null;
  tables?: WeddingTable[];
  guests?: Guest[];
  elements?: FloorPlanElement[];
  onAddElement: (type: FloorPlanElementType) => void;
  onAddTableFromWedding?: (table: WeddingTable) => void;
  onLinkTableToElement?: (elementId: string, table: WeddingTable) => void;
  onUpdateElement: (id: string, updates: Partial<FloorPlanElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

const PRESET_COLORS = [
  { name: 'Blanco Puro', bg: '#FFFFFF', text: '#2D2A26' },
  { name: 'Marfil Suave', bg: '#FAF8F5', text: '#2D2A26' },
  { name: 'Rosa Nude', bg: '#FDF2F4', text: '#8B3A4A' },
  { name: 'Dorado Champán', bg: '#FEF9EE', text: '#B45309' },
  { name: 'Borgoña Marca', bg: '#8B3A4A', text: '#FFFFFF' },
  { name: 'Madera Cálida', bg: '#F0E6D2', text: '#5A3E2B' },
  { name: 'Azul Noche', bg: '#1E293B', text: '#FFFFFF' },
  { name: 'Verde Eucalipto', bg: '#ECFDF5', text: '#065F46' },
  { name: 'Gris Grafito', bg: '#374151', text: '#FFFFFF' },
];

export const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  selectedElement,
  tables = [],
  guests = [],
  elements = [],
  onAddElement,
  onAddTableFromWedding,
  onLinkTableToElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
}) => {
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [toolbarTab, setToolbarTab] = useState<'wedding_tables' | 'furniture'>('wedding_tables');
  const [isTablesCollapsed, setIsTablesCollapsed] = useState(false);

  // Contraer "Mesas Registradas" automáticamente cuando se selecciona un objeto
  useEffect(() => {
    if (selectedElement) {
      setIsTablesCollapsed(true);
    }
  }, [selectedElement]);


  // Compute table occupancy for the wedding tables
  const tableOccupancyMap = useMemo(() => {
    const map = new Map<string, { guestCount: number; guests: Guest[] }>();
    (tables || []).forEach((t) => {
      if (t && t.name) {
        const seated = (guests || []).filter(
          (g) => g && isGuestAssignedToTable(g.assignedTable, t.name, extractTableNumber(t.name) ?? undefined)
        );
        const totalPasses = seated.reduce((acc, g) => {
          if (!g || g.mainGuestId) return acc;
          return acc + (g.confirmedPasses || g.totalPasses || 1);
        }, 0);
        map.set(t.name.trim().toLowerCase(), { guestCount: totalPasses, guests: seated });
      }
    });
    return map;
  }, [tables, guests]);

  // Check which tables are placed on canvas
  const placedTableNames = useMemo(() => {
    const set = new Set<string>();
    (elements || []).forEach((e) => {
      if (e.name) {
        set.add(e.name.trim().toLowerCase());
      }
      if (e.id.startsWith('elem_table_')) {
        const tblId = e.id.replace('elem_table_', '');
        const found = (tables || []).find((t) => t.id === tblId);
        if (found) set.add(found.name.trim().toLowerCase());
      }
    });
    return set;
  }, [elements, tables]);

  // Filter wedding tables
  const filteredWeddingTables = useMemo(() => {
    let list = [...(tables || [])].filter(Boolean);
    if (tableSearchQuery.trim()) {
      const q = tableSearchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.zone && t.zone.toLowerCase().includes(q)) ||
          (t.shape && t.shape.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'es', { numeric: true, sensitivity: 'base' }));
  }, [tables, tableSearchQuery]);

  // Update seats array when seat count changes for round tables
  const handleSeatCountChange = (newCount: number) => {
    if (!selectedElement) return;
    const currentSeats = selectedElement.seats || [];
    let updatedSeats: FloorPlanSeat[] = [...currentSeats];

    if (newCount > currentSeats.length) {
      // Add seats
      for (let i = currentSeats.length + 1; i <= newCount; i++) {
        updatedSeats.push({
          id: `seat_${selectedElement.id}_${i}_${Date.now()}`,
          seatNumber: i,
        });
      }
    } else if (newCount < currentSeats.length) {
      // Trim seats from end
      updatedSeats = updatedSeats.slice(0, newCount);
    }

    onUpdateElement(selectedElement.id, {
      seatCount: newCount,
      seats: updatedSeats,
    });
  };

  // Update seats array for rectangular tables
  const handleRectSeatsChange = (longSides: number, heads: number) => {
    if (!selectedElement) return;
    const totalCount = longSides * 2 + heads * 2;
    const currentSeats = selectedElement.seats || [];
    let updatedSeats: FloorPlanSeat[] = [...currentSeats];

    if (totalCount > currentSeats.length) {
      for (let i = currentSeats.length + 1; i <= totalCount; i++) {
        updatedSeats.push({
          id: `seat_${selectedElement.id}_${i}_${Date.now()}`,
          seatNumber: i,
        });
      }
    } else {
      updatedSeats = updatedSeats.slice(0, totalCount);
    }

    onUpdateElement(selectedElement.id, {
      seatsLongSide: longSides,
      seatsHead: heads,
      seatCount: totalCount,
      seats: updatedSeats,
    });
  };

  // Seated guests on currently selected element
  const selectedElementSeatedGuests = useMemo(() => {
    if (!selectedElement || !selectedElement.seats) return [];
    return selectedElement.seats.filter((s) => s.guestName);
  }, [selectedElement]);

  return (
    <div className="w-full sm:w-80 bg-[#FAF8F5] border-r border-[#E8DCCF] flex flex-col h-full overflow-y-auto text-[#2D2A26] select-none text-xs">
      {/* 1. Element Palette Header & Mode Tabs */}
      <div className="p-3 border-b border-[#E8DCCF] bg-white sticky top-0 z-10 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#8C8276] flex items-center space-x-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Mobiliario & Mesas</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#8B3A4A] border border-rose-200">
            {tables.length} {tables.length === 1 ? 'Mesa' : 'Mesas'}
          </span>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-0.5 bg-[#FAF8F5] rounded-xl border border-[#E8DCCF]">
          <button
            type="button"
            onClick={() => setToolbarTab('wedding_tables')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              toolbarTab === 'wedding_tables'
                ? 'bg-white text-[#8B3A4A] shadow-2xs font-bold'
                : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#8B3A4A]" />
            <span>Mesas Principales</span>
          </button>
          <button
            type="button"
            onClick={() => setToolbarTab('furniture')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              toolbarTab === 'furniture'
                ? 'bg-white text-[#8B3A4A] shadow-2xs font-bold'
                : 'text-[#8C8276] hover:text-[#2D2A26]'
            }`}
          >
            <Layers className="w-3 h-3 text-[#8B3A4A]" />
            <span>Mobiliario Libre</span>
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* ========================================================
            TAB 1: MESAS DE BODA (REGISTRADAS EN SECCIÓN MESAS)
           ======================================================== */}
        {toolbarTab === 'wedding_tables' && (
          <div className="space-y-2.5">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setIsTablesCollapsed(!isTablesCollapsed)}
            >
              <div className="flex items-center space-x-1">
                <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block group-hover:text-[#2D2A26] transition-colors">
                  Mesas Registradas ({filteredWeddingTables.length})
                </span>
                {isTablesCollapsed ? (
                  <ChevronDown className="w-3 h-3 text-[#8C8276] group-hover:text-[#2D2A26]" />
                ) : (
                  <ChevronUp className="w-3 h-3 text-[#8C8276] group-hover:text-[#2D2A26]" />
                )}
              </div>
              {!isTablesCollapsed && <span className="text-[9px] text-[#8C8276]">Haz clic para colocar</span>}
            </div>

            {!isTablesCollapsed && (
              <>
                {/* Search filter for wedding tables */}
                {tables.length > 4 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8276]" />
                <input
                  type="text"
                  placeholder="Buscar mesa o zona..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#E8DCCF] rounded-xl text-xs placeholder-[#8C8276] focus:outline-hidden focus:border-[#8B3A4A]"
                />
              </div>
            )}

            {filteredWeddingTables.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-white border border-[#E8DCCF] text-[#8C8276] space-y-1">
                <UtensilsCrossed className="w-6 h-6 mx-auto text-[#8C8276]/60" />
                <p className="text-xs font-semibold">No hay mesas registradas</p>
                <p className="text-[10px]">Crea mesas en la sección MESAS o usa Mobiliario Libre.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
                {filteredWeddingTables.map((tbl) => {
                  const isPlaced = placedTableNames.has(tbl.name.trim().toLowerCase());
                  const occ = tableOccupancyMap.get(tbl.name.trim().toLowerCase());
                  const seatedCount = occ?.guestCount || 0;
                  const isRect =
                    tbl.shape === 'rectangular' || tbl.shape === 'imperial' || tbl.shape === 'square';
                  const isHonor =
                    tbl.name.toLowerCase().includes('honor') ||
                    tbl.name.toLowerCase().includes('novios') ||
                    tbl.name.toLowerCase().includes('principal');

                  return (
                    <div
                      key={tbl.id}
                      onClick={() => onAddTableFromWedding && onAddTableFromWedding(tbl)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between group shadow-2xs ${
                        isPlaced
                          ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                          : isHonor
                          ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                          : 'bg-white border-[#E8DCCF] hover:border-[#8B3A4A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isRect
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-rose-50 border-rose-200 text-[#8B3A4A]'
                          }`}
                        >
                          {isRect ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-[11px] truncate text-[#2D2A26]">
                              {tbl.name}
                            </span>
                            {isHonor && (
                              <span className="text-[8px] bg-[#8B3A4A] text-white px-1 rounded-sm font-bold">
                                HONOR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5 text-[9px] text-[#7A7268]">
                            <span>{tbl.zone || 'Salón Principal'}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#8B3A4A]">
                              {seatedCount}/{tbl.capacity} pax
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-1 ml-1.5">
                        {isPlaced ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md flex items-center justify-center" title="En plano">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-[10px] font-bold text-[#8B3A4A] bg-white border border-[#8B3A4A]/30 px-2 py-0.5 rounded-lg group-hover:bg-[#8B3A4A] group-hover:text-white transition-colors"
                          >
                            + Colocar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: MOBILIARIO LIBRE (ELEMENTOS GENÉRICOS)
           ======================================================== */}
        {toolbarTab === 'furniture' && (
          <div className="space-y-3">
            {/* Mesas Principales */}
            <div>
              <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
                Mesas Genéricas
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddElement('round_table')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#8B3A4A] flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-105 transition-transform">
                    <Circle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Mesa Redonda</div>
                    <span className="text-[9px] text-[#8C8276]">2 a 12 sillas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('rectangular_table')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                    <Square className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Mesa Rectangular</div>
                    <span className="text-[9px] text-[#8C8276]">Imperial</span>
                  </div>
                </button>
              </div>
            </div>

            
            {/* Asientos & Butacas */}
            <div>
              <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
                Asientos & Butacas
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddElement('single_chair')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Silla Individual</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('chair_row')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Fila de Sillas</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('armchair_luis_xv')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Sillón Luis XV</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_1_seat')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Butaca (1 Cuerpo)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_2_seat')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate">Butaca (2 Cuerpos)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Escenario & Entretenimiento */}
            <div>
              <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
                Escenario & Fiesta
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddElement('stage')}
                  className="flex flex-col items-center p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-center transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-[#2D2A26] flex items-center justify-center mb-1">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[10px] truncate w-full">Escenario</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('dance_floor')}
                  className="flex flex-col items-center p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-center transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[10px] truncate w-full">Pista Baile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('dj_booth')}
                  className="flex flex-col items-center p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-center transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[10px] truncate w-full">Cabina DJ</span>
                </button>
              </div>
            </div>

            {/* Servicios & Decoración */}
            <div>
              <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
                Zonas & Servicios
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAddElement('bar')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Wine className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Barra Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('cake_table')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Cake className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Mesa Torta</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('lounge')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Armchair className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Zona Lounge</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('entrance')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <DoorOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Entrada</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('photo_booth')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Foto Booth</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('text_label')}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Type className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-[11px] truncate">Texto / Zona</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          2. INSPECTOR DE PROPIEDADES DEL OBJETO SELECCIONADO
         ======================================================== */}
      <div className="border-t border-[#E8DCCF] bg-white p-3.5 flex-1 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#8C8276] flex items-center justify-between">
          <span>Propiedades del Objeto</span>
          <Sliders className="w-3.5 h-3.5 text-[#8B3A4A]" />
        </h3>

        {selectedElement ? (
          <div className="space-y-3">
            {/* Quick Link to Registered Table (MESAS) */}
            {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
              <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCCF] space-y-1.5">
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <LinkIcon className="w-3 h-3 text-[#8B3A4A]" />
                    <span>Vincular a Mesa Registrada</span>
                  </span>
                  <span className="text-[9px] text-[#8B3A4A] font-normal">Sincroniza invitados</span>
                </label>

                <select
                  value={
                    tables.find(
                      (t) =>
                        t.name.trim().toLowerCase() === selectedElement.name.trim().toLowerCase() ||
                        `elem_table_${t.id}` === selectedElement.id
                    )?.id || ''
                  }
                  onChange={(e) => {
                    const targetTable = tables.find((t) => t.id === e.target.value);
                    if (targetTable && onLinkTableToElement) {
                      onLinkTableToElement(selectedElement.id, targetTable);
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-white border border-[#D9CEBF] rounded-lg text-xs font-semibold text-[#2D2A26] focus:outline-hidden focus:border-[#8B3A4A]"
                >
                  <option value="">Seleccionar mesa de la boda... ▼</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shape === 'round' ? 'Redonda' : 'Imperial'}, {t.capacity} pax)
                    </option>
                  ))}
                </select>
              </div>
            )}

                        {/* Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                Nombre / Identificador
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#8B3A4A]"
                />
                <div className="relative shrink-0" title="Color del texto">
                  <input
                    type="color"
                    value={selectedElement.textColor || '#2D2A26'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value })}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div 
                    style={{ backgroundColor: selectedElement.textColor || '#2D2A26' }}
                    className="w-7 h-7 rounded-lg border border-[#D9CEBF] shadow-xs hover:scale-105 transition-transform mt-0.5"
                  />
                </div>
              </div>
            </div>


            {/* Número de Mesa si aplica */}
            {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                  Número de Mesa
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={selectedElement.tableNumber || ''}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      tableNumber: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#8B3A4A]"
                />
              </div>
            )}
            {/* Slider de Asientos para Mesa Redonda */}
            {selectedElement.type === 'round_table' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                    Número de Asientos
                  </label>
                  <span className="font-bold text-[#8B3A4A] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {selectedElement.seats.length} sillas
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={selectedElement.seats.length}
                  onChange={(e) => handleSeatCountChange(parseInt(e.target.value))}
                  className="w-full accent-[#8B3A4A] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#8C8276] px-1">
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                  <span>12</span>
                </div>
              </div>
            )}
            {/* Configuración de Asientos para Mesa Rectangular */}
            {selectedElement.type === 'rectangular_table' && (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                      Sillas por Lado Largo
                    </label>
                    <span className="font-bold text-[#8B3A4A]">
                      {selectedElement.seatsLongSide || 3}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={selectedElement.seatsLongSide || 3}
                    onChange={(e) =>
                      handleRectSeatsChange(
                        parseInt(e.target.value),
                        selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1
                      )
                    }
                    className="w-full accent-[#8B3A4A] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                      Sillas en Cabeceras
                    </label>
                    <span className="font-bold text-[#8B3A4A]">
                      {selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }
                        className={`py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                          (selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1) === head
                            ? 'bg-[#8B3A4A] text-white border-[#8B3A4A]'
                            : 'bg-white text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {head === 0 ? 'Sin cabeceras' : `${head} c/lado`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Diámetro / Dimensiones */}
            {selectedElement.type === 'round_table' || selectedElement.type === 'cake_table' ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                    Diámetro (px)
                  </label>
                  <span className="font-mono text-[#8B3A4A]">
                    {(selectedElement.radius || 60) * 2}px
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  step="5"
                  value={(selectedElement.radius || 60) * 2}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      radius: parseInt(e.target.value) / 2,
                    })
                  }
                  className="w-full accent-[#8B3A4A] cursor-pointer"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={selectedElement.width}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        width: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={selectedElement.height}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        height: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-2 py-1 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            )}
            {(selectedElement.type === 'chair_row' || selectedElement.type === 'armchair_luis_xv' || selectedElement.type === 'sofa_1_seat' || selectedElement.type === 'sofa_2_seat') && (
              <div>
                <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                  Cantidad de Asientos
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={selectedElement.chairCount || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    const baseWidths: Record<string, number> = {
                      chair_row: 40,
                      armchair_luis_xv: 60,
                      sofa_1_seat: 60,
                      sofa_2_seat: 60
                    };
                    const baseW = baseWidths[selectedElement.type] || 40;
                    onUpdateElement(selectedElement.id, {
                      chairCount: val,
                      width: baseW * val
                    });
                  }}
                  className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-mono"
                />
              </div>
            )}
            {/* Rotación */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                  Rotación
                </label>
                <span className="font-mono text-[#8B3A4A]">
                  {selectedElement.rotation || 0}°
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={selectedElement.rotation || 0}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      rotation: parseInt(e.target.value),
                    })
                  }
                  className="flex-1 accent-[#8B3A4A] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      rotation: ((selectedElement.rotation || 0) + 45) % 360,
                    })
                  }
                  className="p-1.5 bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#D9CEBF] rounded-lg cursor-pointer text-[#8B3A4A]"
                  title="Girar +45°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Color del Elemento */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1.5">
                Color de Superficie
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        color: col.bg,
                        textColor: col.text,
                      })
                    }
                    style={{ backgroundColor: col.bg }}
                    title={col.name}
                    className={`w-6 h-6 rounded-full border shadow-2xs transition-transform hover:scale-110 cursor-pointer ${
                      selectedElement.color === col.bg
                        ? 'ring-2 ring-[#8B3A4A] ring-offset-1 border-[#8B3A4A]'
                        : 'border-[#D9CEBF]'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Acciones de Objeto */}
            <div className="pt-4 border-t border-[#E8DCCF] flex space-x-2">
              <button
                type="button"
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="flex-1 py-2 bg-white border border-[#D9CEBF] hover:bg-[#F3EFEA] hover:border-[#8B3A4A] text-[#2D2A26] rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Duplicar
              </button>
              <button
                type="button"
                onClick={() => onDeleteElement(selectedElement.id)}
                className="flex-1 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Eliminar
              </button>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => onBringToFront(selectedElement.id)}
                className="flex-1 py-1.5 bg-white border border-[#D9CEBF] hover:bg-[#F3EFEA] text-[#2D2A26] rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                title="Traer al Frente"
              >
                <ArrowUpToLine className="w-3.5 h-3.5 mr-1" />
                Frente
              </button>
              <button
                type="button"
                onClick={() => onSendToBack(selectedElement.id)}
                className="flex-1 py-1.5 bg-white border border-[#D9CEBF] hover:bg-[#F3EFEA] text-[#2D2A26] rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center cursor-pointer"
                title="Enviar al Fondo"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
                Fondo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[#8C8276] text-xs">
            Selecciona un elemento en el lienzo para editar sus propiedades.
          </div>
        )}
      </div>
    </div>
  );
}
