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
  AlertCircle,
  Palette,
  Maximize2
} from 'lucide-react';
import { FloorPlanElement, FloorPlanElementType, FloorPlanSeat, WeddingTable, Guest } from '../../types';
import { extractTableNumber, isGuestAssignedToTable, normalizeTableText, isColorDark, getContrastTextColor } from './floorPlanSyncUtils';

interface FloorPlanToolbarProps {
  selectedElement: FloorPlanElement | null;
  tables?: WeddingTable[];
  guests?: Guest[];
  elements?: FloorPlanElement[];
  canvasBackgroundColor?: string;
  onChangeCanvasBackgroundColor?: (color: string) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  onChangeCanvasDimensions?: (width: number, height: number) => void;
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
  // Blancos y Neutros
  { name: 'Blanco Puro', bg: '#FFFFFF', text: '#1F2937' },
  { name: 'Marfil Suave', bg: '#FAF8F5', text: '#2D2A26' },
  { name: 'Perla / Lino', bg: '#F3F4F6', text: '#1F2937' },
  { name: 'Arena / Avena', bg: '#E5E0D8', text: '#374151' },
  { name: 'Gris Plata', bg: '#9CA3AF', text: '#111827' },
  { name: 'Gris Grafito', bg: '#4B5563', text: '#FFFFFF' },
  { name: 'Negro Ébano', bg: '#111827', text: '#FFFFFF' },

  // Maderas, Dorados y Cobre
  { name: 'Dorado Champán', bg: '#FEF3C7', text: '#92400E' },
  { name: 'Oro Real', bg: '#F59E0B', text: '#FFFFFF' },
  { name: 'Madera Cálida', bg: '#F0E6D2', text: '#5A3E2B' },
  { name: 'Roble Natural', bg: '#D4B996', text: '#45220B' },
  { name: 'Nogal Clásico', bg: '#8B5E3C', text: '#FFFFFF' },
  { name: 'Terracota Cálido', bg: '#C25E37', text: '#FFFFFF' },
  { name: 'Cobre Oscuro', bg: '#78350F', text: '#FFFFFF' },

  // Rosas, Pasteles, Rojos y Vinos
  { name: 'Rojo Alfombra', bg: '#DC2626', text: '#FFFFFF' },
  { name: 'Rojo Rubí', bg: '#B91C1C', text: '#FFFFFF' },
  { name: 'Rosa Nude', bg: '#FDF2F4', text: '#881337' },
  { name: 'Rosa Blush', bg: '#FCE7F3', text: '#831843' },
  { name: 'Rosa Palo', bg: '#F472B6', text: '#FFFFFF' },
  { name: 'Coral Suave', bg: '#FCA5A5', text: '#7F1D1D' },
  { name: 'Borgoña Marca', bg: '#881337', text: '#FFFFFF' },
  { name: 'Marsala Profundo', bg: '#4C0519', text: '#FFFFFF' },

  // Azules, Celestes y Noches
  { name: 'Azul Hielo', bg: '#E0F2FE', text: '#0369A1' },
  { name: 'Azul Serenidad', bg: '#93C5FD', text: '#1E3A8A' },
  { name: 'Azul Real', bg: '#2563EB', text: '#FFFFFF' },
  { name: 'Azul Marino', bg: '#1E3A8A', text: '#FFFFFF' },
  { name: 'Azul Noche', bg: '#0F172A', text: '#FFFFFF' },

  // Verdes, Eucalipto y Olivo
  { name: 'Verde Menta', bg: '#D1FAE5', text: '#065F46' },
  { name: 'Verde Salvia', bg: '#A7F3D0', text: '#064E3B' },
  { name: 'Verde Eucalipto', bg: '#6EE7B7', text: '#064E3B' },
  { name: 'Verde Olivo', bg: '#65A30D', text: '#FFFFFF' },
  { name: 'Verde Esmeralda', bg: '#047857', text: '#FFFFFF' },
  { name: 'Verde Bosque', bg: '#064E3B', text: '#FFFFFF' },

  // Lavandas y Púrpuras
  { name: 'Lavanda Suave', bg: '#EDE9FE', text: '#5B21B6' },
  { name: 'Malva / Lila', bg: '#C4B5FD', text: '#4C1D95' },
  { name: 'Violeta Fiesta', bg: '#7C3AED', text: '#FFFFFF' },
];

export const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  selectedElement,
  tables = [],
  guests = [],
  elements = [],
  canvasBackgroundColor = '#EBEBEB',
  onChangeCanvasBackgroundColor,
  canvasWidth,
  canvasHeight,
  onChangeCanvasDimensions,
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

  const isSelectedTable = selectedElement?.type === 'round_table' || selectedElement?.type === 'rectangular_table';

  const isDuplicateName = useMemo(() => {
    if (!selectedElement || !isSelectedTable || !selectedElement.name) return false;
    const currentNorm = normalizeTableText(selectedElement.name);
    return (elements || []).some(
      (e) =>
        e.id !== selectedElement.id &&
        (e.type === 'round_table' || e.type === 'rectangular_table') &&
        normalizeTableText(e.name) === currentNorm
    );
  }, [selectedElement, isSelectedTable, elements]);

  const isDuplicateNumber = useMemo(() => {
    if (!selectedElement || !isSelectedTable || selectedElement.tableNumber === undefined) return false;
    return (elements || []).some(
      (e) =>
        e.id !== selectedElement.id &&
        (e.type === 'round_table' || e.type === 'rectangular_table') &&
        (e.tableNumber === selectedElement.tableNumber || extractTableNumber(e.name) === selectedElement.tableNumber)
    );
  }, [selectedElement, isSelectedTable, elements]);

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
    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
    const actualLongCount = longSides < 0 ? Math.abs(longSides) : longSides * 2;
    const totalCount = actualLongCount + actualHeadsCount;
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
    <div className="w-[50vw] sm:max-w-none sm:w-80 bg-[#EBEBEB] border-r border-transparent flex flex-col h-full overflow-y-auto text-gray-800 select-none text-xs">
      {/* 1. Element Palette Header & Mode Tabs */}
      <div className="p-3 bg-[#EBEBEB] sticky top-0 z-10 space-y-2">

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#EBEBEB] rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] gap-1">
          <button
            type="button"
            onClick={() => setToolbarTab('wedding_tables')}
            className={`py-1.5 px-0.5 sm:px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border-none ${
              toolbarTab === 'wedding_tables'
                ? 'bg-[#EBEBEB] text-gray-900 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-gray-700" />
            <span className="hidden sm:inline">Mesas Principales</span>
          </button>
          <button
            type="button"
            onClick={() => setToolbarTab('furniture')}
            className={`py-1.5 px-0.5 sm:px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 border-none ${
              toolbarTab === 'furniture'
                ? 'bg-[#EBEBEB] text-gray-900 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="w-3 h-3 text-gray-700" />
            <span className="hidden sm:inline">Mobiliario Libre</span>
          </button>
        </div>
      </div>

      <div className="px-3 py-3 space-y-3">
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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block group-hover:text-gray-800 transition-colors">
                  Mesas Registradas ({filteredWeddingTables.length})
                </span>
                {isTablesCollapsed ? (
                  <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-gray-800" />
                ) : (
                  <ChevronUp className="w-3 h-3 text-gray-500 group-hover:text-gray-800" />
                )}
              </div>
              
            </div>

            {!isTablesCollapsed && (
              <>
                {/* Search filter for wedding tables */}
                {tables.length > 4 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mesa o zona..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs placeholder-gray-400 text-gray-800 border-none focus:outline-hidden"
                />
              </div>
            )}

            {filteredWeddingTables.length === 0 ? (
              <div className="p-4 text-center rounded-3xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-500 space-y-1">
                <UtensilsCrossed className="w-6 h-6 mx-auto text-gray-400" />
                <p className="text-xs font-semibold text-gray-700">No hay mesas registradas</p>
                <p className="text-[10px]">Crea mesas en la sección MESAS o usa Mobiliario Libre.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-0.5">
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
                      className={`p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col gap-1.5 group border-none ${
                        isPlaced
                          ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                          : 'bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                      }`}
                    >
                      {/* Row 1: Name */}
                      <div className="flex items-center space-x-1 w-full">
                        <span className="font-bold text-[11px] truncate text-gray-900">
                          {tbl.name}
                        </span>
                        {isHonor && (
                          <span className="text-[8px] bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] text-rose-600 px-1.5 py-0.5 rounded-md font-bold">
                            HONOR
                          </span>
                        )}
                      </div>

                      {/* Row 2: Icon, Zone/Pax, Action */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700"
                          >
                            {isRect ? <Square className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </div>
                          
                          <div className="flex flex-wrap items-center space-x-1 text-[9px] text-gray-500 min-w-0">
                            <span className="truncate max-w-[80px]">{tbl.zone || 'Salón Principal'}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-800">
                              {seatedCount}/{tbl.capacity} pax
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center ml-1.5">
                          {isPlaced ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-[#EBEBEB] shadow-[inset_1px_1px_2px_#d1d1d1,inset_-1px_-1px_2px_#ffffff] px-2 py-0.5 rounded-md flex items-center justify-center" title="En plano">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="text-[10px] font-bold text-gray-800 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] px-2.5 py-1 rounded-xl transition-all border-none cursor-pointer"
                            >
                              + Colocar
                            </button>
                          )}
                        </div>
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
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Mesas Genéricas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement('round_table')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Circle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Mesa Redonda</div>
                    <span className="text-[9px] text-gray-500">2 a 12 sillas</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('rectangular_table')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Square className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Mesa Rectangular</div>
                    <span className="text-[9px] text-gray-500">Imperial</span>
                  </div>
                </button>
              </div>
            </div>

            
            {/* Asientos & Butacas */}
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Asientos & Butacas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement('single_chair')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Silla Individual</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('chair_row')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Fila de Sillas</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('armchair_luis_xv')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Sillón Luis XV</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_1_seat')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Butaca (1 Cuerpo)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onAddElement('sofa_2_seat')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[11px] truncate text-gray-900">Butaca (2 Cuerpos)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Escenario & Entretenimiento */}
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Escenario & Fiesta
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement('stage')}
                  className="flex flex-col items-center p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-center transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center mb-1">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[10px] truncate w-full text-gray-800">Escenario</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('dance_floor')}
                  className="flex flex-col items-center p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-center transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[10px] truncate w-full text-gray-800">Pista Baile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('dj_booth')}
                  className="flex flex-col items-center p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-center transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-indigo-700 flex items-center justify-center mb-1">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[10px] truncate w-full text-gray-800">Cabina DJ</span>
                </button>
              </div>
            </div>

            {/* Servicios & Decoración */}
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Zonas & Servicios
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement('bar')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center shrink-0">
                    <Wine className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Barra Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('cake_table')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-700 flex items-center justify-center shrink-0">
                    <Cake className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Mesa Torta</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('lounge')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-purple-700 flex items-center justify-center shrink-0">
                    <Armchair className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Zona Lounge</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('entrance')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-amber-700 flex items-center justify-center shrink-0">
                    <DoorOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Entrada</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('photo_booth')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-blue-700 flex items-center justify-center shrink-0">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Foto Booth</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement('text_label')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-700 flex items-center justify-center shrink-0">
                    <Type className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[11px] truncate text-gray-800">Texto / Zona</span>
                </button>

                <button
                  type="button"
                  id="btn-add-rug"
                  onClick={() => onAddElement('rug')}
                  className="flex items-center space-x-2 p-2 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c8c8c8,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-left transition-all group cursor-pointer border-none"
                  title="Agregar Alfombra rectangular (roja por defecto)"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-rose-600 flex items-center justify-center shrink-0">
                    <span className="w-4 h-2.5 rounded-xs bg-red-600 border border-red-700/60 shadow-xs inline-block" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-[11px] truncate text-gray-800 block">Alfombra</span>
                    <span className="text-[9px] text-red-600 font-semibold block">Roja (rectang.)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          2. INSPECTOR DE PROPIEDADES DEL OBJETO SELECCIONADO
         ======================================================== */}
      <div className="bg-[#EBEBEB] p-3.5 flex-1 space-y-3 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.03)]">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center justify-between">
          <span className="hidden sm:inline truncate">Propiedades del Objeto</span><span className="sm:hidden truncate">Propiedades</span>
          <Sliders className="w-3.5 h-3.5 text-gray-700" />
        </h3>

        {selectedElement ? (
          <div className="space-y-3">
            {/* Bloqueo / Desbloqueo del Objeto */}
            <div
              id="element-lock-control"
              className={`p-3 rounded-2xl transition-all ${
                selectedElement.isLocked
                  ? 'bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] border border-amber-300/80'
                  : 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      selectedElement.isLocked
                        ? 'bg-amber-500 text-white shadow-[2px_2px_5px_#d97706]'
                        : 'bg-[#EBEBEB] text-gray-600 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]'
                    }`}
                  >
                    {selectedElement.isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold text-gray-800 leading-tight truncate">
                      {selectedElement.isLocked ? 'Objeto Bloqueado' : 'Objeto Desbloqueado'}
                    </span>
                    <span className="block text-[9px] text-gray-500 truncate">
                      {selectedElement.isLocked
                        ? 'Inmóvil y protegido de cambios'
                        : 'Permite mover y modificar'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-toggle-element-lock"
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      isLocked: !selectedElement.isLocked,
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border-none shrink-0 ${
                    selectedElement.isLocked
                      ? 'bg-[#EBEBEB] text-amber-900 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                      : 'bg-[#EBEBEB] text-gray-700 shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c8c8c8,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                  }`}
                  title={
                    selectedElement.isLocked
                      ? 'Desbloquear objeto para moverlo y cambiar sus propiedades'
                      : 'Bloquear objeto para fijar su posición y evitar cambios'
                  }
                >
                  {selectedElement.isLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Desbloquear</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-gray-600" />
                      <span>Bloquear</span>
                    </>
                  )}
                </button>
              </div>

              {selectedElement.isLocked && (
                <div className="mt-2.5 pt-2 border-t border-amber-300/60 flex items-start space-x-1.5 text-[10px] text-amber-900 leading-snug">
                  <Lock className="w-3 h-3 shrink-0 mt-0.5 text-amber-700" />
                  <span>
                    Este objeto está bloqueado: no se puede mover de su lugar ni modificar sus propiedades mientras permanezca con candado.
                  </span>
                </div>
              )}
            </div>

            {/* Quick Link to Registered Table (MESAS) */}
            {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
              <div className={`p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] space-y-1.5 ${selectedElement.isLocked ? 'opacity-60' : ''}`}>
                <label className="block text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <LinkIcon className="w-3 h-3 text-gray-700" />
                    <span>Vincular a Mesa Registrada</span>
                  </span>
                  <span className="text-[9px] text-gray-500 font-normal">Sincroniza invitados</span>
                </label>

                <select
                  disabled={selectedElement.isLocked}
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
                  className="w-full px-3 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs font-semibold text-gray-800 border-none focus:outline-hidden cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
            <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                  Nombre / Identificador
                </label>
                <div className="flex items-center space-x-1.5" title="Color del texto del objeto">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Color Texto:</span>
                  <div className="relative">
                    <input
                      type="color"
                      disabled={selectedElement.isLocked}
                      value={selectedElement.textColor || (isColorDark(selectedElement.color) ? '#FFFFFF' : '#1F2937')}
                      onChange={(e) => onUpdateElement(selectedElement.id, { textColor: e.target.value })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div 
                      style={{ backgroundColor: selectedElement.textColor || (isColorDark(selectedElement.color) ? '#FFFFFF' : '#1F2937') }}
                      className={`w-5 h-5 rounded-lg shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] border border-gray-300 transition-transform ${selectedElement.isLocked ? 'cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  disabled={selectedElement.isLocked}
                  value={selectedElement.name}
                  onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                  className={`w-full px-3 py-2 bg-[#EBEBEB] rounded-2xl text-xs font-semibold focus:outline-hidden disabled:cursor-not-allowed ${
                    isDuplicateName
                      ? 'shadow-[inset_3px_3px_6px_#fca5a5,inset_-3px_-3px_6px_#ffffff] text-rose-900 border border-rose-400'
                      : 'shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 border-none'
                  }`}
                />
              </div>
              {/* Quick text color chips for fast high-contrast selection */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[9px] text-gray-400 uppercase font-semibold mr-0.5">Texto:</span>
                {[
                  { name: 'Blanco', color: '#FFFFFF' },
                  { name: 'Carbón', color: '#1F2937' },
                  { name: 'Dorado', color: '#D97706' },
                  { name: 'Vino', color: '#9F1239' },
                  { name: 'Azul', color: '#1E40AF' },
                  { name: 'Esmeralda', color: '#047857' },
                ].map((tc) => (
                  <button
                    key={tc.color}
                    type="button"
                    disabled={selectedElement.isLocked}
                    title={`Texto ${tc.name}`}
                    onClick={() => onUpdateElement(selectedElement.id, { textColor: tc.color })}
                    style={{ backgroundColor: tc.color }}
                    className={`w-4 h-4 rounded-full border border-gray-300 shadow-[1px_1px_2px_#d1d1d1,-1px_-1px_2px_#ffffff] transition-transform disabled:cursor-not-allowed ${
                      !selectedElement.isLocked ? 'hover:scale-125 cursor-pointer' : ''
                    } ${
                      (selectedElement.textColor === tc.color || (!selectedElement.textColor && tc.color === (isColorDark(selectedElement.color) ? '#FFFFFF' : '#1F2937')))
                        ? 'ring-2 ring-gray-700 ring-offset-1 ring-offset-[#EBEBEB]'
                        : ''
                    }`}
                  />
                ))}
              </div>
              {isDuplicateName && (
                <div className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Nombre duplicado: no se permiten nombres repetidos.</span>
                </div>
              )}
            </div>

            {/* Número de Mesa si aplica */}
            {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
              <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Número de Mesa
                </label>
                <input
                  type="number"
                  disabled={selectedElement.isLocked}
                  min="1"
                  max="99"
                  value={selectedElement.tableNumber || ''}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    onUpdateElement(selectedElement.id, {
                      tableNumber: isNaN(parsed) ? undefined : parsed,
                    });
                  }}
                  className={`w-full px-3 py-2 bg-[#EBEBEB] rounded-2xl text-xs font-semibold focus:outline-hidden disabled:cursor-not-allowed ${
                    isDuplicateNumber
                      ? 'shadow-[inset_3px_3px_6px_#fca5a5,inset_-3px_-3px_6px_#ffffff] text-rose-900 border border-rose-400'
                      : 'shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] text-gray-800 border-none'
                  }`}
                />
                {isDuplicateNumber && (
                  <div className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Número {selectedElement.tableNumber} ya está en uso por otra mesa.</span>
                  </div>
                )}
              </div>
            )}
            {/* Slider de Asientos para Mesa Redonda */}
            {selectedElement.type === 'round_table' && (
              <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Número de Asientos
                  </label>
                  <span className="font-bold text-gray-800 bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] px-2 py-0.5 rounded-xl">
                    {selectedElement.seats.length} sillas
                  </span>
                </div>
                <input
                  type="range"
                  disabled={selectedElement.isLocked}
                  min="2"
                  max="12"
                  step="1"
                  value={selectedElement.seats.length}
                  onChange={(e) => handleSeatCountChange(parseInt(e.target.value))}
                  className="w-full accent-gray-700 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[9px] text-gray-500 px-1">
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
              <div className={`space-y-3 ${selectedElement.isLocked ? 'opacity-60' : ''}`}>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">
                      Sillas por Lado Largo
                    </label>
                    <span className="font-bold text-gray-800">
                      {selectedElement.seatsLongSide === undefined ? 3 : 
                        selectedElement.seatsLongSide < 0 ? `${Math.abs(selectedElement.seatsLongSide)} (Solo frente)` :
                        selectedElement.seatsLongSide === 0 ? '0' : `${selectedElement.seatsLongSide} c/lado`}
                    </span>
                  </div>
                  <input
                    type="range"
                    disabled={selectedElement.isLocked}
                    min="0"
                    max="8"
                    step="1"
                    value={Math.abs(selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const isOneSidedLong = selectedElement.seatsLongSide !== undefined && selectedElement.seatsLongSide < 0;
                      handleRectSeatsChange(
                        val * (isOneSidedLong && val !== 0 ? -1 : 1),
                        selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1
                      );
                    }}
                    className="w-full accent-gray-700 cursor-pointer mb-2 disabled:cursor-not-allowed"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {[-1, -2].map((longSide) => (
                      <button
                        key={longSide}
                        type="button"
                        disabled={selectedElement.isLocked}
                        onClick={() => handleRectSeatsChange(longSide, 0)}
                        className={`py-1.5 rounded-xl text-[10px] font-semibold border-none transition-all disabled:cursor-not-allowed ${
                          !selectedElement.isLocked ? 'cursor-pointer' : ''
                        } ${
                          selectedElement.seatsLongSide === longSide
                            ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                            : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-700'
                        }`}
                      >
                        {Math.abs(longSide)} (Solo frente)
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">
                      Sillas en Cabeceras
                    </label>
                    <span className="font-bold text-gray-800">
                      {selectedElement.seatsHead === undefined ? 1 : 
                        selectedElement.seatsHead < 0 ? `${Math.abs(selectedElement.seatsHead)} (Un lado)` :
                        selectedElement.seatsHead === 0 ? '0' : `${selectedElement.seatsHead} c/lado`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mb-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        disabled={selectedElement.isLocked}
                        onClick={() => {
                          const currentLong = selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3;
                          handleRectSeatsChange(currentLong === 0 && head === 0 ? 1 : currentLong, head);
                        }}
                        className={`py-1.5 rounded-xl text-[10px] font-semibold border-none transition-all disabled:cursor-not-allowed ${
                          !selectedElement.isLocked ? 'cursor-pointer' : ''
                        } ${
                          (selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1) === head
                            ? 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-900 font-bold'
                            : 'bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] text-gray-700'
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
              <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Diámetro (px)
                  </label>
                  <span className="font-mono text-gray-800">
                    {(selectedElement.radius || 60) * 2}px
                  </span>
                </div>
                <input
                  type="range"
                  disabled={selectedElement.isLocked}
                  min="60"
                  max="240"
                  step="5"
                  value={(selectedElement.radius || 60) * 2}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      radius: parseInt(e.target.value) / 2,
                    })
                  }
                  className="w-full accent-gray-700 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-2 ${selectedElement.isLocked ? 'opacity-60' : ''}`}>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    disabled={selectedElement.isLocked}
                    min="30"
                    max="600"
                    value={selectedElement.width}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        width: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs font-mono text-gray-800 border-none focus:outline-hidden disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    disabled={selectedElement.isLocked}
                    min="30"
                    max="600"
                    value={selectedElement.height}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        height: parseInt(e.target.value) || 50,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs font-mono text-gray-800 border-none focus:outline-hidden disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Lista de Invitados Asignados a esta Mesa */}
            {(selectedElement.type === 'round_table' || selectedElement.type === 'rectangular_table') && (
              <div className="pt-2 border-t border-gray-300/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-600" />
                    <span>
                      Invitados en Mesa ({selectedElement.seats?.filter((s) => Boolean(s.guestId)).length || 0} / {selectedElement.seats?.length || 0})
                    </span>
                  </label>
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {selectedElement.seats && selectedElement.seats.length > 0 ? (
                    selectedElement.seats.map((seat) => {
                      const guestObj = guests?.find((g) => g.id === seat.guestId);
                      return (
                        <div
                          key={seat.id}
                          className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all ${
                            seat.guestId
                              ? 'bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] text-gray-800'
                              : 'bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] text-gray-400 italic'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {seat.seatNumber}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-[11px] text-gray-800">
                                {seat.guestName || 'Asiento Disponible'}
                              </p>
                              {guestObj?.protocolRoleTitle && (
                                <p className="text-[9px] text-[#8C8276] truncate">
                                  {guestObj.protocolRoleTitle}
                                </p>
                              )}
                            </div>
                          </div>
                          {seat.guestId && !selectedElement.isLocked && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSeats = selectedElement.seats.map((s) =>
                                  s.id === seat.id
                                    ? {
                                        ...s,
                                        guestId: undefined,
                                        guestName: undefined,
                                        guestInitials: undefined,
                                        guestPhone: undefined,
                                        dietaryRequirement: undefined,
                                      }
                                    : s
                                );
                                onUpdateElement(selectedElement.id, { seats: updatedSeats });
                              }}
                              className="text-[10px] text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                              title="Desasignar asiento"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">No hay asientos configurados.</p>
                  )}
                </div>

                {(() => {
                  if (!guests) return null;
                  const matchingGuests = guests.filter((g) => {
                    if (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar')) return false;
                    return isGuestAssignedToTable(g.assignedTable, selectedElement.name, selectedElement.tableNumber);
                  });
                  const seatedIds = new Set(selectedElement.seats?.filter((s) => Boolean(s.guestId)).map((s) => s.guestId));
                  const unseatedGuests = matchingGuests.filter((g) => !seatedIds.has(g.id));
                  if (unseatedGuests.length === 0) return null;
                  return (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-900 space-y-1 mt-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{unseatedGuests.length} invitado(s) en lista exceden capacidad:</span>
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        {unseatedGuests.map((ug) => (
                          <li key={ug.id} className="truncate">{ug.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}
            {(selectedElement.type === 'chair_row' || selectedElement.type === 'armchair_luis_xv' || selectedElement.type === 'sofa_1_seat' || selectedElement.type === 'sofa_2_seat') && (
              <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                  Cantidad de Asientos
                </label>
                <input
                  type="number"
                  disabled={selectedElement.isLocked}
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
                  className="w-full px-3 py-2 bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-xs font-mono text-gray-800 border-none focus:outline-hidden disabled:cursor-not-allowed"
                />
              </div>
            )}
            {/* Rotación */}
            <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Rotación
                </label>
                <span className="font-mono text-gray-800">
                  {selectedElement.rotation || 0}°
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  disabled={selectedElement.isLocked}
                  min="0"
                  max="359"
                  value={selectedElement.rotation || 0}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      rotation: parseInt(e.target.value),
                    })
                  }
                  className="flex-1 accent-gray-700 cursor-pointer disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={selectedElement.isLocked}
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      rotation: ((selectedElement.rotation || 0) + 45) % 360,
                    })
                  }
                  className={`p-2 bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-xl text-gray-700 border-none disabled:cursor-not-allowed ${!selectedElement.isLocked ? 'cursor-pointer' : ''}`}
                  title="Girar +45°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Color del Elemento */}
            <div className={selectedElement.isLocked ? 'opacity-60' : ''}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                  Color de Superficie
                </label>
                <span className="text-[9px] font-mono font-semibold text-gray-500">
                  {selectedElement.color || '#FFFFFF'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedElement.isLocked}
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        color: col.bg,
                        textColor: col.text,
                      })
                    }
                    style={{ backgroundColor: col.bg }}
                    title={col.name}
                    className={`w-6 h-6 rounded-full shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] transition-transform border border-gray-200/50 disabled:cursor-not-allowed ${
                      !selectedElement.isLocked ? 'hover:scale-110 cursor-pointer' : ''
                    } ${
                      selectedElement.color?.toLowerCase() === col.bg.toLowerCase()
                        ? 'ring-2 ring-gray-700 ring-offset-2 ring-offset-[#EBEBEB] scale-110'
                        : ''
                    }`}
                  />
                ))}
              </div>

              {/* Selector de color personalizado / libre */}
              <div className="mt-3 pt-2.5 border-t border-gray-300/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-gray-600">
                  <Palette className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Personalizado:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative shrink-0" title="Seleccionar cualquier color en la paleta">
                    <input
                      type="color"
                      disabled={selectedElement.isLocked}
                      value={selectedElement.color?.startsWith('#') ? selectedElement.color : '#FFFFFF'}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const dark = isColorDark(newColor);
                        onUpdateElement(selectedElement.id, {
                          color: newColor,
                          textColor: dark ? '#FFFFFF' : '#1F2937',
                        });
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div
                      style={{ backgroundColor: selectedElement.color || '#FFFFFF' }}
                      className={`w-7 h-7 rounded-xl shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] border border-gray-300 transition-transform ${!selectedElement.isLocked ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}`}
                    />
                  </div>
                  <input
                    type="text"
                    disabled={selectedElement.isLocked}
                    value={selectedElement.color || '#FFFFFF'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const dark = isColorDark(val);
                      onUpdateElement(selectedElement.id, {
                        color: val,
                        textColor: dark ? '#FFFFFF' : '#1F2937',
                      });
                    }}
                    placeholder="#FFFFFF"
                    maxLength={9}
                    className="w-20 px-2 py-1 bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-xl text-[11px] font-mono font-bold text-gray-800 border-none uppercase focus:outline-hidden disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            {/* Acciones de Objeto */}
            <div className="pt-4 flex space-x-2">
              <button
                type="button"
                disabled={selectedElement.isLocked}
                onClick={() => onDuplicateElement(selectedElement.id)}
                className={`flex-1 py-2.5 bg-[#EBEBEB] text-gray-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center border-none ${
                  selectedElement.isLocked
                    ? 'opacity-50 cursor-not-allowed shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                    : 'shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer'
                }`}
                title={selectedElement.isLocked ? 'Desbloquea el objeto para duplicarlo' : 'Duplicar objeto'}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Duplicar
              </button>
              <button
                type="button"
                disabled={selectedElement.isLocked}
                onClick={() => onDeleteElement(selectedElement.id)}
                className={`flex-1 py-2.5 bg-[#EBEBEB] text-rose-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center border-none ${
                  selectedElement.isLocked
                    ? 'opacity-50 cursor-not-allowed shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                    : 'shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer'
                }`}
                title={selectedElement.isLocked ? 'Desbloquea el objeto para eliminarlo' : 'Eliminar objeto'}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Eliminar
              </button>
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                disabled={selectedElement.isLocked}
                onClick={() => onBringToFront(selectedElement.id)}
                className={`flex-1 py-2 bg-[#EBEBEB] text-gray-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center border-none ${
                  selectedElement.isLocked
                    ? 'opacity-50 cursor-not-allowed shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                    : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer'
                }`}
                title={selectedElement.isLocked ? 'Desbloquea el objeto para cambiar orden' : 'Traer al Frente'}
              >
                <ArrowUpToLine className="w-3.5 h-3.5 mr-1" />
                Frente
              </button>
              <button
                type="button"
                disabled={selectedElement.isLocked}
                onClick={() => onSendToBack(selectedElement.id)}
                className={`flex-1 py-2 bg-[#EBEBEB] text-gray-700 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center border-none ${
                  selectedElement.isLocked
                    ? 'opacity-50 cursor-not-allowed shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff]'
                    : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] cursor-pointer'
                }`}
                title={selectedElement.isLocked ? 'Desbloquea el objeto para cambiar orden' : 'Enviar al Fondo'}
              >
                <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
                Fondo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Propiedades del Lienzo */}
            <div className="p-3.5 bg-[#EBEBEB] rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-700 shrink-0">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Color del Lienzo</h4>
                  <span className="text-[10px] text-gray-500">Color de fondo del espacio de trabajo</span>
                </div>
              </div>

              {/* Color Swatch & Custom Hex Input */}
              <div className="flex items-center space-x-3">
                <label className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] cursor-pointer hover:scale-105 transition-transform overflow-hidden border border-gray-300/40 shrink-0">
                  <span
                    className="w-7 h-7 rounded-xl shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)]"
                    style={{ backgroundColor: canvasBackgroundColor }}
                  />
                  <input
                    type="color"
                    value={canvasBackgroundColor}
                    onChange={(e) => onChangeCanvasBackgroundColor?.(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title="Elegir color personalizado para el lienzo"
                  />
                </label>
                <div className="flex-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Código Hex</span>
                  <input
                    type="text"
                    value={canvasBackgroundColor}
                    onChange={(e) => onChangeCanvasBackgroundColor?.(e.target.value)}
                    className="w-full text-xs font-mono font-bold text-gray-800 bg-[#EBEBEB] rounded-xl px-2.5 py-1.5 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border-none focus:outline-hidden"
                    placeholder="#EBEBEB"
                  />
                </div>
              </div>

              {/* Paleta rápida de colores para el lienzo */}
              <div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Colores Sugeridos</span>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { color: '#EBEBEB', label: 'Gris Neumórfico' },
                    { color: '#FFFFFF', label: 'Blanco Puro' },
                    { color: '#FAF8F5', label: 'Marfil Suave' },
                    { color: '#F3F4F6', label: 'Perla / Lino' },
                    { color: '#E5E0D8', label: 'Arena / Avena' },
                    { color: '#FEF3C7', label: 'Champán Cálido' },
                    { color: '#DC2626', label: 'Rojo Alfombra' },
                    { color: '#B91C1C', label: 'Rojo Carmesí' },
                    { color: '#1E293B', label: 'Pizarra Oscura' },
                    { color: '#1F2937', label: 'Gris Grafito' },
                    { color: '#0F172A', label: 'Azul Noche' },
                    { color: '#111827', label: 'Negro Ébano' },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => onChangeCanvasBackgroundColor?.(preset.color)}
                      className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center cursor-pointer border-none ${
                        canvasBackgroundColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.35)] ring-2 ring-gray-800 scale-105'
                          : 'shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dimensiones del Lienzo */}
            {canvasWidth && canvasHeight && onChangeCanvasDimensions && (
              <div className="p-3.5 bg-[#EBEBEB] rounded-2xl shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-[#EBEBEB] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-700 shrink-0">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-800">Tamaño del Lienzo</h4>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-500 font-semibold block mb-0.5">Ancho (px)</span>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={(e) => onChangeCanvasDimensions(Number(e.target.value) || 1600, canvasHeight)}
                      className="w-full text-xs font-bold text-gray-800 bg-[#EBEBEB] rounded-xl px-2 py-1.5 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border-none focus:outline-hidden text-center"
                    />
                  </div>
                  <span className="text-gray-400 font-bold pt-3.5">×</span>
                  <div className="flex-1">
                    <span className="text-[9px] text-gray-500 font-semibold block mb-0.5">Alto (px)</span>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={(e) => onChangeCanvasDimensions(canvasWidth, Number(e.target.value) || 1200)}
                      className="w-full text-xs font-bold text-gray-800 bg-[#EBEBEB] rounded-xl px-2 py-1.5 shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] border-none focus:outline-hidden text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-4 px-2 text-gray-500 text-xs">
              Selecciona una mesa u objeto en el plano para editar sus medidas, rotación, bloqueo o color.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
