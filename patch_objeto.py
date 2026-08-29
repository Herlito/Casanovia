import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

text = text.replace("Clock, Link2 } from 'lucide-react';", "Clock, Link2, Shapes } from 'lucide-react';")

# Locate the Image button container
start_img = text.find('<div className="relative">\n             <input \n               type="file"')

# Replace the specific block of tools
tools_block_start = text.find('        {/* Tools */}')
tools_block_end = text.find('        {selectedElementIds.length === 1 && (')

tools_block = text[tools_block_start:tools_block_end]

# Modify the image input to NOT accept SVG directly if we want a separate button, or just leave it and add a new one.
# The user wants "Agrega un boton para importar "objetos" que serán archivos .svg, con la opcion de modificar su color."

objeto_button = """          <div className="relative">
             <input 
               type="file" 
               accept="image/svg+xml,.svg" 
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   if (file.size > 2 * 1024 * 1024) {
                     alert("El SVG excede los 2MB");
                     return;
                   }
                   const reader = new FileReader();
                   reader.onload = (ev) => {
                     const svgText = ev.target?.result as string;
                     const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
                     
                     const img = new Image();
                     img.onload = () => {
                       addElement({
                         type: 'image',
                         content: { src, originalSrc: src, isSvg: true, svgText, naturalWidth: img.width, naturalHeight: img.height },
                         style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: '#8B3A4A', filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                         transform: { x: 50, y: 50, width: Math.min(img.width, 150), height: Math.min(img.height, 150 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                         zIndex: 15,
                         locked: false,
                         visible: true
                       });
                     };
                     img.src = src;
                   };
                   reader.readAsText(file);
                 }
                 e.target.value = '';
               }}
             />
             <button className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold hover:bg-[#F3EFEA] rounded border border-transparent">
               <Shapes className="w-3.5 h-3.5 text-[#8B3A4A]" />
               <span>Objeto</span>
             </button>
          </div>
"""

# Insert objeto_button after the image button block
img_btn_end = tools_block.find('<span>Imagen</span>\n             </button>\n          </div>') + len('<span>Imagen</span>\n             </button>\n          </div>')

new_tools_block = tools_block[:img_btn_end] + "\n" + objeto_button + tools_block[img_btn_end:]

text = text[:tools_block_start] + new_tools_block + text[tools_block_end:]

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
