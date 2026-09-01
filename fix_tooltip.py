import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    content = f.read()

tooltip_old = r'<div className="flex items-center justify-between font-bold border-b border-stone-700/80 pb-1 mb-1">.*?Toca o haz clic en un asiento para asignar\.\s*</p>\s*\)}'
tooltip_new = """{hoveredSeat.seat.guestId ? (
            <>
              <div className="border-b border-stone-700/80 pb-1.5 mb-1.5">
                <p className="font-bold text-white truncate text-[12px]">{hoveredSeat.seat.guestName}</p>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-amber-400">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md">
                  Asignado
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between font-bold border-b border-stone-700/80 pb-1.5 mb-1.5">
                <span className="text-amber-400">Asiento #{hoveredSeat.seat.seatNumber}</span>
                <span className="text-[10px] text-stone-400">
                  Disponible
                </span>
              </div>
              <p className="text-[10px] text-stone-300">
                Toca o haz clic en un asiento para asignar.
              </p>
            </>
          )}"""

content = re.sub(tooltip_old, tooltip_new, content, flags=re.DOTALL)

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(content)
