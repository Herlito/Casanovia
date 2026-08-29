import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

# Add import for exportHTML
text = text.replace("import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon, Clock, Link2 } from 'lucide-react';", 
                    "import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon, Clock, Link2 } from 'lucide-react';\nimport { downloadHTML } from '../lib/exportHTML';")

old_export_btn = """        <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B3A4A] text-white rounded hover:bg-[#7a3240] transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Diseño</span>
        </button>"""

new_export_btn = """        <button onClick={() => downloadHTML(useEditorStore.getState().document)} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-[#8B3A4A] text-white rounded hover:bg-[#7a3240] transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Diseño</span>
        </button>"""

text = text.replace(old_export_btn, new_export_btn)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
