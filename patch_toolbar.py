import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    text = f.read()

# Remove the title and badge from the top of the toolbar
header_title_block = """        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#8C8276] flex items-center space-x-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Mobiliario & Mesas</span>
          </h3>
          <span className="text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-full bg-rose-50 text-[#8B3A4A] border border-rose-200">
            {tables.length} {tables.length === 1 ? 'Mesa' : 'Mesas'}
          </span>
        </div>"""

text = text.replace(header_title_block, "")

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(text)
