import re

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'r') as f:
    text = f.read()

old_details = """                      {/* Wedding assigned table and group */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-[#8C8276]">
                        {guest.assignedTable && (
                          <span className="font-semibold text-[#8B3A4A] bg-rose-50 px-1 rounded truncate max-w-[150px]">
                            {guest.assignedTable}
                          </span>
                        )}
                        {guest.protocolRoleTitle && (
                          <span className="truncate max-w-[110px] text-stone-600">
                            {guest.protocolRoleTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* RSVP Indicator & Unassign */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {guest.rsvpStatus === 'confirmed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"  />
                    ) : guest.rsvpStatus === 'declined' ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-500"  />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-500"  />
                    )}
                    
                    {isAssigned && ("""

new_details = """                      {/* Wedding assigned table and group */}
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-[10px] text-[#8C8276]">
                        {guest.rsvpStatus === 'confirmed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0"  />
                        ) : guest.rsvpStatus === 'declined' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0"  />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0"  />
                        )}
                        {guest.assignedTable && (
                          <span className="truncate max-w-[150px]">
                            {guest.assignedTable}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Unassign */}
                  <div className="shrink-0 flex items-center h-full mt-0.5">
                    {isAssigned && ("""

text = text.replace(old_details, new_details)

with open('src/components/floorplan/FloorPlanGuestSidebar.tsx', 'w') as f:
    f.write(text)
