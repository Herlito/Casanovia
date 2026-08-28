tail_content = """
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
"""

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'a') as f:
    f.write(tail_content)

print("Restored missing parts of FloorPlanToolbar!")
