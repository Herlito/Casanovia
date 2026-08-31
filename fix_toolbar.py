import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Music, useEditorStore } from '../store/useEditorStore';", "import { useEditorStore } from '../store/useEditorStore';")
content = content.replace("import { Music, downloadHTML } from '../lib/exportHTML';", "import { downloadHTML } from '../lib/exportHTML';")
content = content.replace("import { Music, Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon, Clock, Link2, Shapes } from 'lucide-react';", "import { Music, Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon, Clock, Link2, Shapes } from 'lucide-react';")

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(content)

