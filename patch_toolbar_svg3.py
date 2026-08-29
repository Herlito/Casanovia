import re

with open('src/WeddingCraft/components/Toolbar.tsx', 'r') as f:
    text = f.read()

# Let's extract the exact substring for the file input
start_idx = text.find('<input\n                type="file"\n                accept="image/png')
if start_idx == -1:
    start_idx = text.find('<input')
    # Find the input tag that contains type="file"
    
import ast

def replace_between(text, start_str, end_str, replacement):
    start = text.find(start_str)
    end = text.find(end_str, start) + len(end_str)
    return text[:start] + replacement + text[end:]
    
start_str = '             <input\n                type="file"'
end_str = '             />\n             <button className="flex items-center'

replacement = """             <input
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
                   const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
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
             />\n             <button className="flex items-center"""

text = replace_between(text, start_str, end_str, replacement)

with open('src/WeddingCraft/components/Toolbar.tsx', 'w') as f:
    f.write(text)
