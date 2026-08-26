import React from 'react';
import {
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
  Layers,
  Sliders,
  ChevronDown,
  Plus
} from 'lucide-react';
import { FloorPlanElement, FloorPlanElementType, FloorPlanSeat } from '../../types';

interface FloorPlanToolbarProps {
  selectedElement: FloorPlanElement | null;
  onAddElement: (type: FloorPlanElementType) => void;
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
  onAddElement,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
}) => {
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

  return (
    <div className="w-72 bg-[#FAF8F5] border-r border-[#E8DCCF] flex flex-col h-full overflow-y-auto text-[#2D2A26] select-none text-xs">
      {/* 1. Element Palette Header */}
      <div className="p-3.5 border-b border-[#E8DCCF] bg-white sticky top-0 z-10">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#8C8276] flex items-center justify-between">
          <span>Elementos & Mobiliario</span>
          <Plus className="w-3.5 h-3.5 text-[#8B3A4A]" />
        </h3>
      </div>

      <div className="p-3 space-y-3">
        {/* Mesas Principales */}
        <div>
          <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
            Mesas de Banquete
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
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
              onClick={() => onAddElement('rectangular_table')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] hover:border-[#8B3A4A] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#B45309] flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-105 transition-transform">
                <Square className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">Mesa Imperial</div>
                <span className="text-[9px] text-[#8C8276]">Rectangular</span>
              </div>
            </button>
          </div>
        </div>

        {/* Estructuras & Escenario */}
        <div>
          <span className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider block mb-1.5">
            Estructuras & Entretenimiento
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onAddElement('stage')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-800 text-white flex items-center justify-center shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Escenario</span>
            </button>

            <button
              onClick={() => onAddElement('dance_floor')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Pista de Baile</span>
            </button>

            <button
              onClick={() => onAddElement('bar')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-900 text-amber-100 flex items-center justify-center shrink-0">
                <Wine className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Barra Bar</span>
            </button>

            <button
              onClick={() => onAddElement('dj_booth')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-900 text-sky-200 flex items-center justify-center shrink-0">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Cabina DJ</span>
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
              onClick={() => onAddElement('cake_table')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Cake className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Mesa Torta</span>
            </button>

            <button
              onClick={() => onAddElement('lounge')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Armchair className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Zona Lounge</span>
            </button>

            <button
              onClick={() => onAddElement('entrance')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <DoorOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Entrada</span>
            </button>

            <button
              onClick={() => onAddElement('photo_booth')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Camera className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Foto Booth</span>
            </button>

            <button
              onClick={() => onAddElement('text_label')}
              className="col-span-2 flex items-center space-x-2 p-2 rounded-xl bg-white hover:bg-[#F3EFEA] border border-[#E8DCCF] text-left transition-colors shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                <Type className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[11px] truncate">Etiqueta de Texto</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Inspector de Propiedades del Objeto Seleccionado */}
      <div className="border-t border-[#E8DCCF] bg-white p-3.5 flex-1 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#8C8276] flex items-center justify-between">
          <span>Propiedades del Objeto</span>
          <Sliders className="w-3.5 h-3.5 text-[#8B3A4A]" />
        </h3>

        {selectedElement ? (
          <div className="space-y-3">
            {/* Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-[#8C8276] uppercase mb-1">
                Nombre / Identificador
              </label>
              <input
                type="text"
                value={selectedElement.name}
                onChange={(e) => onUpdateElement(selectedElement.id, { name: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9CEBF] rounded-lg text-xs font-semibold focus:outline-hidden focus:border-[#8B3A4A]"
              />
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
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }
                        className={`py-1 rounded-md text-xs font-semibold border ${
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
            <div className="pt-2 border-t border-[#E8DCCF] space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() =>
                    onUpdateElement(selectedElement.id, {
                      isLocked: !selectedElement.isLocked,
                    })
                  }
                  className={`flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    selectedElement.isLocked
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-[#FAF8F5] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                  }`}
                >
                  {selectedElement.isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-[#8C8276]" />
                      <span>Bloquear</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onDuplicateElement(selectedElement.id)}
                  className="flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[#2D2A26] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  <span>Duplicar</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onBringToFront(selectedElement.id)}
                  className="py-1 px-2 rounded-lg bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[11px] font-medium text-[#2D2A26] transition-colors cursor-pointer"
                >
                  Traer al Frente
                </button>
                <button
                  onClick={() => onSendToBack(selectedElement.id)}
                  className="py-1 px-2 rounded-lg bg-white hover:bg-[#F3EFEA] border border-[#D9CEBF] text-[11px] font-medium text-[#2D2A26] transition-colors cursor-pointer"
                >
                  Enviar al Fondo
                </button>
              </div>

              <button
                onClick={() => onDeleteElement(selectedElement.id)}
                className="w-full py-1.5 mt-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Elemento</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-[#8C8276] space-y-1">
            <p className="text-xs">Selecciona un elemento en el plano para editar sus medidas, asientos o colores.</p>
          </div>
        )}
      </div>
    </div>
  );
};
