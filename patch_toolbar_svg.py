import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

old_input = """             <input 
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
             />"""

new_input = """             <input 
               type="file"
               accept="image/png, image/jpeg, image/webp, image/svg+xml"
               className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   if (file.size > 5 * 1024 * 1024) {
                     alert("La imagen excede los 5MB");
                     return;
                   }
                   const isSvg = file.type === 'image/svg+xml';
                   
                   const reader = new FileReader();
                   reader.onload = (ev) => {
                     const result = ev.target?.result as string;
                     let src = result;
                     let svgText = '';
                     
                     if (isSvg) {
                       svgText = result;
                       src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));
                     }
                     
                     const img = new Image();
                     img.onload = () => {
                       addElement({
                         type: 'image',
                         content: { src, originalSrc: src, isSvg, svgText, naturalWidth: img.width, naturalHeight: img.height },
                         style: { maskId: null, frameId: null, objectFit: 'cover', cropX: 0, cropY: 0, cropScale: 1, fill: isSvg ? '#000000' : undefined, filters: { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, blur: 0, sepia: 0 } },
                         transform: { x: 50, y: 50, width: Math.min(img.width, 200), height: Math.min(img.height, 200 * (img.height / img.width)), rotation: 0, scaleX: 1, scaleY: 1 },
                         zIndex: 15,
                         locked: false,
                         visible: true
                       });
                     };
                     img.src = src;
                   };
                   
                   if (isSvg) {
                     reader.readAsText(file);
                   } else {
                     reader.readAsDataURL(file);
                   }
                 }
                 e.target.value = '';
               }}
             />"""

text = text.replace(old_input, new_input)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
