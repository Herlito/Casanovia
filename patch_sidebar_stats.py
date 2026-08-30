import re

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    text = f.read()

# Remove capacity
capacity_str = """          <span className="text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Capacidad: {totalTableCapacity} sillas
          </span>"""
text = text.replace(capacity_str, "")

# Remove stats block
stats_block = """        {/* Stats summary bar */}
        <div className="grid grid-cols-2 gap-1.5 text-center">
          <div className="p-1.5 bg-[#FAF8F5] rounded-lg border border-[#E8DCCF]">
            <span className="text-[10px] text-[#8C8276] block">Asientos en Plano</span>
            <span className="font-bold text-[#8B3A4A] text-sm">{assignedCount}</span>
          </div>
          <div className="p-1.5 bg-[#FAF8F5] rounded-lg border border-[#E8DCCF]">
            <span className="text-[10px] text-[#8C8276] block">Sin Asignar</span>
            <span className="font-bold text-amber-700 text-sm">{unassignedCount}</span>
          </div>
        </div>"""
text = text.replace(stats_block, "")

# Remove dietary restrictions from the guest card
dietary_str = """                        {guest.dietaryRestrictions && (
                          <span className="text-emerald-700 font-medium flex items-center shrink-0">
                            <Utensils className="w-2.5 h-2.5 mr-0.5" />
                            {guest.dietaryRestrictions}
                          </span>
                        )}"""
text = text.replace(dietary_str, "")


with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(text)
