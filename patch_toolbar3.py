import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

text = text.replace("import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown } from 'lucide-react';", "import { Undo2, Redo2, Download, Save, Type, Square, AlertCircle, LayoutTemplate, ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';")

image_btn = """          <button onClick={handleAddRectangle} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Square className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Forma</span>
          </button>
          
          <div className="relative">
             <input 
               type="file" 
               accept="image/png, image/jpeg, image/webp" 
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   if (file.size > 5 * 1024 * 1024) {
                     alert("La imagen excede los 5MB");
                     return;
                   }
                   const reader = new FileReader();
                   reader.onload = (ev) => {
                     const src = ev.target?.result as string;
                     const img = new Image();
                     img.onload = () => {
                       addElement({
                         type: 'image',
                         content: { src, originalSrc: src, naturalWidth: img.width, naturalHeight: img.height },
                         style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                         transform: { x: 50, y: 50, width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                         zIndex: 15,
                         locked: false,
                         visible: true
                       });
                     };
                     img.src = src;
                   };
                   reader.readAsDataURL(file);
                 }
                 e.target.value = '';
               }}
             />
             <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
               <ImageIcon className="w-3.5 h-3.5 text-[#8B3A4A]" />
               <span>Imagen</span>
             </button>
          </div>
"""
text = text.replace("""          <button onClick={handleAddRectangle} className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
            <Square className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Forma</span>
          </button>""", image_btn)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
