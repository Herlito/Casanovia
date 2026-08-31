import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# 1. Remove subtitles and description in the header
header_regex = re.compile(
    r'<div className="space-y-1\.5 max-w-2xl">.*?<div className="flex items-center space-x-2">.*?Banquete & Protocolo Nupcial.*?</div>.*?<h2(.*?)</h2>.*?<p className="text-xs sm:text-sm text-gray-600 leading-relaxed">.*?Organiza los asientos del banquete.*?</p>\s*</div>',
    re.DOTALL
)
content = header_regex.sub(r'<div className="max-w-2xl">\n          <h2\1</h2>\n        </div>', content)

# 2. Change Action buttons wrapper and rearrange
buttons_block_regex = re.compile(
    r'\{\/\* Action Buttons \*\/\}\s*<div className="flex flex-wrap items-center gap-2\.5 shrink-0">.*?</div>\s*</div>\s*\{\/\* Auto Assign Notification Toast',
    re.DOTALL
)

buttons_html = """{/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSmartAutoAssign}
            className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
            title="Asigna automáticamente invitados sin mesa a los lugares libres"
          >
            <Wand2 className="w-4 h-4 text-gray-800" />
            <span className="hidden sm:inline">Auto-Distribuir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFloorPlanModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center space-x-1.5 cursor-pointer"
            title="Diseñador visual interactivo de planos en 2D con carga de PDF y asignación de asientos"
          >
            <MapIcon className="w-4 h-4 text-[#2D3748]" />
            <span className="hidden sm:inline">Diseñador 2D / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTableToEdit(null);
              setIsTableModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Mesa</span>
          </button>
        </div>
      </div>

      {/* Auto Assign Notification Toast"""

content = buttons_block_regex.sub(buttons_html, content)

# 3. Hide stats cards on mobile (hidden md:grid)
# The cards container has `className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"`
content = content.replace(
    'className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"',
    'className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"'
)

# 4. Remove "Seleccionar todos" text
# Let's find it.
seleccionar_todos_regex = re.compile(
    r'<span className="text-\[11px\] text-gray-500 font-medium">Seleccionar todos</span>',
    re.DOTALL
)
content = seleccionar_todos_regex.sub('', content)

# It might be slightly different, let's just do a string replace on 'Seleccionar todos' if there's no tag, but there probably is a span or button.
# If it's a span:
content = content.replace('<span className="text-[11px] font-medium text-gray-500 hidden sm:inline">Seleccionar todos</span>', '')
content = content.replace('Seleccionar todos', '') # Be careful, but let's see. Wait, "Seleccionar todos" might be inside a label or span.

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)

