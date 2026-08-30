import re

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'r') as f:
    text = f.read()

# 1. Remove "Haz clic para colocar"
old_click = "{!isTablesCollapsed && <span className=\"text-[9px] text-[#8C8276]\">Haz clic para colocar</span>}"
text = text.replace(old_click, "")

# 2. Change padding/spacing for the blue bars (side paddings)
text = text.replace('className="p-3 space-y-3"', 'className="px-[2px] py-3 space-y-3"')

# 3. Change gap between cards (magenta gap)
text = text.replace('className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5"', 'className="space-y-[2px] max-h-[280px] overflow-y-auto pr-0.5"')

# 4. Refactor the table cards structure
old_card = """                    <div
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
                    </div>"""

new_card = """                    <div
                      key={tbl.id}
                      onClick={() => onAddTableFromWedding && onAddTableFromWedding(tbl)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 group shadow-2xs ${
                        isPlaced
                          ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                          : isHonor
                          ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                          : 'bg-white border-[#E8DCCF] hover:border-[#8B3A4A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {/* Row 1: Name */}
                      <div className="flex items-center space-x-1 w-full">
                        <span className="font-bold text-[11px] truncate text-[#2D2A26]">
                          {tbl.name}
                        </span>
                        {isHonor && (
                          <span className="text-[8px] bg-[#8B3A4A] text-white px-1 rounded-sm font-bold">
                            HONOR
                          </span>
                        )}
                      </div>

                      {/* Row 2: Icon, Zone/Pax, Action */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                              isRect
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-rose-50 border-rose-200 text-[#8B3A4A]'
                            }`}
                          >
                            {isRect ? <Square className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </div>
                          
                          <div className="flex flex-wrap items-center space-x-1 text-[9px] text-[#7A7268] min-w-0">
                            <span className="truncate max-w-[80px]">{tbl.zone || 'Salón Principal'}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#8B3A4A]">
                              {seatedCount}/{tbl.capacity} pax
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center ml-1.5">
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
                    </div>"""

text = text.replace(old_card, new_card)

with open('src/components/floorplan/FloorPlanToolbar.tsx', 'w') as f:
    f.write(text)
