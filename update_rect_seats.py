import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    content = f.read()

# Update handleRectSeatsChange
old_func = """  const handleRectSeatsChange = (longSides: number, heads: number) => {
    if (!selectedElement) return;
    const totalCount = longSides * 2 + heads * 2;"""

new_func = """  const handleRectSeatsChange = (longSides: number, heads: number) => {
    if (!selectedElement) return;
    const actualHeadsCount = heads < 0 ? Math.abs(heads) : heads * 2;
    const totalCount = longSides * 2 + actualHeadsCount;"""

content = content.replace(old_func, new_func)

# Update UI for Cabeceras
old_ui = """                  <div className="grid grid-cols-3 gap-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }
                        className={`py-1 rounded-md text-xs font-semibold border cursor-pointer ${
                          (selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1) === head
                            ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent'
                            : 'bg-[#EBEBEB] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {head === 0 ? 'Sin cabeceras' : `${head} c/lado`}
                      </button>
                    ))}
                  </div>"""

new_ui = """                  <div className="grid grid-cols-3 gap-1 mb-1">
                    {[0, 1, 2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }
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
                  <div className="grid grid-cols-2 gap-1">
                    {[-1, -2].map((head) => (
                      <button
                        key={head}
                        type="button"
                        onClick={() =>
                          handleRectSeatsChange(selectedElement.seatsLongSide || 3, head)
                        }
                        className={`py-1 rounded-md text-[10px] font-semibold border cursor-pointer ${
                          (selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1) === head
                            ? 'bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] text-[#2D3748] border-transparent'
                            : 'bg-[#EBEBEB] text-[#2D2A26] border-[#D9CEBF] hover:bg-[#F3EFEA]'
                        }`}
                      >
                        {Math.abs(head)} a un lado
                      </button>
                    ))}
                  </div>"""

content = content.replace(old_ui, new_ui)

# Update span that shows current count
old_span = """                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsHead !== undefined ? selectedElement.seatsHead : 1}
                    </span>"""

new_span = """                    <span className="font-bold text-[#2D3748]">
                      {selectedElement.seatsHead === undefined ? 1 : 
                        selectedElement.seatsHead < 0 ? `${Math.abs(selectedElement.seatsHead)} (Un lado)` :
                        selectedElement.seatsHead === 0 ? '0' : `${selectedElement.seatsHead} c/lado`}
                    </span>"""

content = content.replace(old_span, new_span)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(content)

