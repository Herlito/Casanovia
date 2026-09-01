import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    content = f.read()

# Using regex to replace the entire rectangular_table settings block.
start_marker = "{selectedElement.type === 'rectangular_table' && ("
end_marker = "{/* Diámetro / Dimensiones */}"

pattern = re.escape(start_marker) + r".*?" + re.escape(end_marker)

def replace_rect_settings(match):
    return """{selectedElement.type === 'rectangular_table' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                      Sillas por Lado Largo
                    </label>
                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsLongSide === undefined ? 3 : 
                        selectedElement.seatsLongSide < 0 ? `${Math.abs(selectedElement.seatsLongSide)} (Un lado)` :
                        selectedElement.seatsLongSide === 0 ? '0' : `${selectedElement.seatsLongSide} c/lado`}
                    </span>
                  </div>
                  <input
                    type="range"
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
                    className="w-full accent-[#2D3748] cursor-pointer mb-2"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    {[-1, -2].map((longSide) => (
                      <button
                        key={longSide}
                        type="button"
                        onClick={() => handleRectSeatsChange(longSide, 0)}
                        className={`py-1 rounded-md text-[10px] font-semibold border cursor-pointer ${
                          selectedElement.seatsLongSide === longSide
                            ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent'
                            : 'bg-[#EBEBEB] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {Math.abs(longSide)} a un lado
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#8C8276] uppercase">
                      Sillas en Cabeceras
                    </label>
                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsHead === undefined ? 1 : 
                        selectedElement.seatsHead < 0 ? `${Math.abs(selectedElement.seatsHead)} (Un lado)` :
                        selectedElement.seatsHead === 0 ? '0' : `${selectedElement.seatsHead} c/lado`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() => {
                          const currentLong = selectedElement.seatsLongSide !== undefined ? selectedElement.seatsLongSide : 3;
                          handleRectSeatsChange(currentLong === 0 && head === 0 ? 1 : currentLong, head);
                        }}
                        className={`py-1 rounded-md text-[10px] font-semibold border cursor-pointer ${
                          (selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1) === head
                            ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent'
                            : 'bg-[#EBEBEB] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {head === 0 ? 'Sin cabeceras' : `${head} c/lado`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Diámetro / Dimensiones */}"""

new_content = re.sub(pattern, replace_rect_settings, content, flags=re.DOTALL)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(new_content)
