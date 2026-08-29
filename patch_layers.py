import re

with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

# Add imports
text = text.replace("import { Layers, Type, Image as ImageIcon, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';",
                    "import { Layers, Type, Image as ImageIcon, Eye, EyeOff, Lock, Unlock, Trash2, Clock, Link2 } from 'lucide-react';")

geticon_old = """  const getIcon = (type: string) => {
    switch(type) {
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };"""

geticon_new = """  const getIcon = (type: string) => {
    switch(type) {
      case 'text': return <Type className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'countdown-widget': return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case 'interactive-button': return <Link2 className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };"""

text = text.replace(geticon_old, geticon_new)

label_old = """                {el.type === 'text' ? (el.content.text || 'Texto') : 'Elemento'}"""
label_new = """                {el.type === 'text' ? (el.content.text || 'Texto') : el.type === 'countdown-widget' ? 'Cuenta Regresiva' : el.type === 'interactive-button' ? 'Botón Ubicación' : el.type === 'image' ? 'Imagen' : 'Forma'}"""

text = text.replace(label_old, label_new)

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)
