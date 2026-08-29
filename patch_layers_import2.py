import re

with open('src/WeddingCraft/components/LayersPanel.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { Layers, Image as ImageIcon, Type, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';", 
                    "import { Layers, Image as ImageIcon, Type, Eye, EyeOff, Lock, Unlock, Trash2, Clock, Link2 } from 'lucide-react';")

with open('src/WeddingCraft/components/LayersPanel.tsx', 'w') as f:
    f.write(text)
