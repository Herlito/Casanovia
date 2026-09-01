import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

# 1. Remove MODO SEGURO
content = re.sub(r'\{eventData\?\.isReadOnly && \(\s*<div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">\s*<AlertCircle className="w-3.5 h-3.5 text-amber-600" />\s*<span className="text-\[10px\] font-bold text-amber-700 uppercase tracking-wider">Modo Seguro \(Read-Only\)</span>\s*</div>\s*\)', '', content)

# 2. Only icons with visible colors for action buttons
# Guardar Borrador
content = re.sub(r'<button className="flex items-center space-x-1\.5 px-3 py-1\.5 text-xs font-semibold bg-\[#EBEBEB\] border border-\[#D9CEBF\] rounded hover:bg-\[#F3EFEA\] transition-colors">\s*<Save className="w-3\.5 h-3\.5 text-\[#524B42\]" />\s*<span>Guardar Borrador</span>\s*</button>',
                 '<button className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Guardar Borrador"><Save className="w-4 h-4 text-emerald-600" /></button>', content)

# Nueva Plantilla
content = re.sub(r'<button\s*onClick=\{([^}]+)\}\s*className="flex items-center space-x-1\.5 px-3 py-1\.5 text-xs font-semibold bg-\[#EBEBEB\] border border-\[#D9CEBF\] rounded hover:bg-\[#F3EFEA\] transition-colors"\s*>\s*<FilePlus className="w-3\.5 h-3\.5 text-\[#524B42\]" />\s*<span>Nueva Plantilla</span>\s*</button>',
                 '<button onClick={\\1} className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Nueva Plantilla"><FilePlus className="w-4 h-4 text-blue-600" /></button>', content)

# Guardar Plantilla
content = re.sub(r'<button\s*onClick=\{([^}]+)\}\s*className="flex items-center space-x-1\.5 px-3 py-1\.5 text-xs font-semibold bg-\[#EBEBEB\] border border-\[#D9CEBF\] rounded hover:bg-\[#F3EFEA\] transition-colors"\s*>\s*<Save className="w-3\.5 h-3\.5 text-\[#524B42\]" />\s*<span>Guardar Plantilla</span>\s*</button>',
                 '<button onClick={\\1} className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] border border-[#D9CEBF] rounded hover:bg-[#F3EFEA] transition-colors" title="Guardar Plantilla"><Save className="w-4 h-4 text-emerald-600" /></button>', content)

# Exportar Diseño
content = re.sub(r'<button onClick=\{([^}]+)\} className="flex items-center space-x-1\.5 px-3 py-1\.5 text-xs font-semibold bg-\[#EBEBEB\] shadow-\[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff\] text-\[#2D3748\] rounded hover:bg-\[#7a3240\] transition-colors">\s*<Download className="w-3\.5 h-3\.5" />\s*<span>Exportar Diseño</span>\s*</button>',
                 '<button onClick={\\1} className="flex items-center justify-center w-8 h-8 bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] rounded hover:bg-[#7a3240] transition-colors group" title="Exportar Diseño"><Download className="w-4 h-4 text-purple-600 group-hover:text-white" /></button>', content)


# Now, remove the tools part if we are moving them to LeftSidebar.
# The tools part is inside <div className="flex items-center space-x-2"> ... </div>
# Wait, maybe it's better to extract them fully and just leave history buttons.
# But for now, let's keep them in Toolbar just to be safe? No, the user explicitly asked to move the tools marked with magenta to the green rectangle (left side).
# So let's extract them. I'll do this in a separate step.

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)
