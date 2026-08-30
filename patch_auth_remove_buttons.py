import re

with open('src/components/modals/AuthModal.tsx', 'r') as f:
    text = f.read()

# I want to remove this block:
block_to_remove = """<div className="pt-2 border-t border-[#EFEAE2] space-y-2">                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">                  <button                    type="button"                    onClick={() => handleSelectQuickUser(LEVEL_1_USER.username)}                    className="flex items-center space-x-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer text-left"                    title="Cargar usuario Herly Lizarazo"                  >                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />                    <div className="text-left truncate">                      <span className="block truncate font-bold text-[11px]">Herly Lizarazo</span>                      <span className="text-[9px] text-emerald-700 block">Nv 1 (Super Admin)</span>                    </div>                  </button>                  <button                    type="button"                    onClick={() => handleSelectQuickUser('Zenaida Anahua')}                    className="flex items-center space-x-1.5 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer text-left"                    title="Cargar usuario Zenaida Anahua"                  >                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />                    <div className="text-left truncate">                      <span className="block truncate font-bold text-[11px]">Zenaida Anahua</span>                      <span className="text-[9px] text-purple-700 block">Nv 2 (Novia)</span>                    </div>                  </button>                </div>              </div>"""

text = text.replace(block_to_remove, '')

with open('src/components/modals/AuthModal.tsx', 'w') as f:
    f.write(text)
