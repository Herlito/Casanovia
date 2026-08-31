import re

with open('src/components/private/TimelineModule.tsx', 'r') as f:
    timeline_content = f.read()

# We need the table layout from TimelineModule.tsx
# It starts from {/* Event Block Main */} and ends just before }
match = re.search(r'\{/\* Event Block Main \*/\}(.*?)\{/\* Action Buttons \(Show on hover\) \*/\}', timeline_content, re.DOTALL)
event_block_main = match.group(1)

match = re.search(r'\{/\* Event Block Sub \*/\}(.*?)\</div>\s*</div>\s*\)\)', timeline_content, re.DOTALL)
event_block_sub = match.group(1)

# Now we construct the new print block
new_print_block = """          {/* SECTION 2: TIMELINE MINUTO A MINUTO (Table Layout) */}
          <div className="mb-6">
            <div className="item-listado print-avoid-break flex items-center justify-between bg-neutral-100 px-3 py-1.5 border-l-4 border-transparent mb-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                2. Cronograma Maestro (Minuto a Minuto del Día)
              </h2>
              <span className="text-[11px] font-semibold text-neutral-600 font-mono">
                {sortedTimeline.length} hitos programados
              </span>
            </div>

            <div className="bg-[#EBEBEB] font-['Nunito',sans-serif] text-black w-full overflow-hidden border border-black rounded-lg">
              {sortedTimeline.length === 0 ? (
                <div className="item-listado print-avoid-break p-4 text-center text-xs text-neutral-500 italic">
                  No se han registrado hitos en el cronograma de esta boda aún.
                </div>
              ) : (
                sortedTimeline.map((item, idx) => (
                  <div key={item.id || idx} className="item-listado print-avoid-break relative transition-colors" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    
                    {/* Event Block Main */}
                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] border-b border-black">
                      <div className="pt-3 pb-1 pr-3 border-r border-black flex flex-col justify-start items-end">
                        <span className="text-[17px] font-bold text-black text-right whitespace-nowrap">{item.time} hrs</span>
                      </div>
                      <div className="pt-3 pb-1 pl-3 pr-12 flex flex-col justify-start items-start relative">
                        <h3 className="text-[19px] font-bold text-black leading-snug w-full break-words">{item.title}</h3>
                        
                        {item.description && (
                          <div className="text-[15px] text-black leading-snug mt-1 w-full break-words whitespace-pre-wrap">
                            {item.description}
                          </div>
                        )}
                        
                        {item.dressOrItemsRequired && (
                          <div className="text-[15px] font-bold italic text-black leading-snug mt-1 w-full break-words whitespace-pre-wrap">
                            {item.dressOrItemsRequired}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Event Block Sub */}
                    <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] border-b border-black">
                      <div className="pt-0.5 pb-2 pr-3 flex flex-col justify-start items-end">
                        <span className="text-[14px] text-black text-right">{item.location || ''}</span>
                      </div>
                      <div className="pt-0.5 pb-2 pl-3 pr-2 flex flex-col justify-start items-start">
                        <span className="text-[15px] font-bold text-black">
                          {item.responsiblePerson ? (item.responsiblePerson) : 'Novios + Coordinación'}
                        </span>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>"""

with open('src/components/private/ProtocolPrintModal.tsx', 'r') as f:
    protocol_content = f.read()

# Replace SECTION 2 in ProtocolPrintModal
protocol_content = re.sub(
    r'\{\/\* SECTION 2: TIMELINE MINUTO A MINUTO[\s\S]*?\{\/\* SECTION 3: VENUES & LOGISTICS \*\/\}',
    new_print_block + '\n\n          {/* SECTION 3: VENUES & LOGISTICS */}',
    protocol_content
)

with open('src/components/private/ProtocolPrintModal.tsx', 'w') as f:
    f.write(protocol_content)

