import re

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'r') as f:
    code = f.read()

import_statement = "import { FurnitureSVGs } from './FurniturePaths';\n"
if "FurnitureSVGs" not in code:
    code = code.replace("import React,", import_statement + "import React,")

# Replace single_chair and chair_row rendering
old_chairs = """
        case 'single_chair':
        case 'chair_row': {
          const count = elem.type === 'single_chair' ? 1 : (elem.chairCount || 4);
          const chairW = elem.width / count;
          
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 4;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * chairW) + (chairW / 2);
            const w = chairW - 4;
            const h = elem.height - 4;
            const x = cx - w / 2;
            const y = -elem.height / 2 + 2;
            
            ctx.fillStyle = elem.color || '#FFFFFF';
            ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D9CEBF';
            ctx.lineWidth = 1.5;
            
            // Seat
            ctx.beginPath();
            ctx.roundRect(x + w*0.1, y + h*0.3, w*0.8, h*0.6, 4);
            ctx.fill();
            ctx.stroke();
            
            // Backrest
            ctx.beginPath();
            ctx.roundRect(x, y, w, h*0.4, 6);
            ctx.fill();
            ctx.stroke();
          }
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || (count === 1 ? 'Silla' : 'Fila'), 0, count === 1 ? 0 : -elem.height / 2 - 10);
          break;
        }
"""

new_chairs = """
        case 'single_chair':
        case 'chair_row': {
          const count = elem.type === 'single_chair' ? 1 : (elem.chairCount || 4);
          const chairW = elem.width / count;
          const svgData = FurnitureSVGs.silla;
          
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 4;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * chairW) + (chairW / 2);
            const w = chairW - 4;
            const h = elem.height - 4;
            
            ctx.save();
            ctx.translate(cx, 0); // Center of this specific chair
            
            // The SVG draws from 0,0 to width,height. So we scale and translate.
            const scaleX = w / svgData.width;
            const scaleY = h / svgData.height;
            ctx.scale(scaleX, scaleY);
            ctx.translate(-svgData.width / 2, -svgData.height / 2);
            
            const p = new Path2D(svgData.path);
            ctx.fillStyle = elem.color || '#FFFFFF';
            ctx.fill(p, 'evenodd');
            ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D9CEBF';
            // Need to divide line width by scale so it doesn't get huge or tiny
            ctx.lineWidth = 1.5 / Math.min(scaleX, scaleY); 
            ctx.stroke(p);
            
            ctx.restore();
          }
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || (count === 1 ? 'Silla' : 'Fila'), 0, count === 1 ? 0 : -elem.height / 2 - 10);
          break;
        }
"""

# Replace sofas rendering
old_sofas = """
        case 'armchair_luis_xv':
        case 'sofa_1_seat':
        case 'sofa_2_seat': {
          const count = (elem.type === 'sofa_2_seat' && elem.chairCount === undefined) ? 2 : (elem.chairCount || 1);
          const seatW = elem.width / count;
          const isLuisXV = elem.type === 'armchair_luis_xv';
          
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 6;
          
          ctx.fillStyle = elem.color || '#F0E6D2';
          ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D4A373';
          ctx.lineWidth = 2;
          
          for (let i = 0; i < count; i++) {
            const cx = -elem.width / 2 + (i * seatW) + (seatW / 2);
            const w = seatW - (count > 1 ? 0 : 4);
            const h = elem.height - 4;
            const x = cx - w / 2;
            const y = -elem.height / 2 + 2;
            
            if (isLuisXV) {
              // Ornate Backrest
              ctx.beginPath();
              ctx.moveTo(x + w*0.1, y + h*0.4);
              ctx.quadraticCurveTo(x + w/2, y - h*0.2, x + w*0.9, y + h*0.4);
              ctx.lineTo(x + w*0.8, y + h);
              ctx.lineTo(x + w*0.2, y + h);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              // Cushions
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.ellipse(x + w/2, y + h*0.6, w*0.35, h*0.2, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = elem.color || '#F0E6D2';
            } else {
              // Standard Sofa / Armchair
              ctx.beginPath();
              ctx.roundRect(x, y, w, h, 8);
              ctx.fill();
              ctx.stroke();
              
              // Inner cushion
              ctx.beginPath();
              ctx.roundRect(x + 4, y + h*0.2, w - 8, h*0.7, 4);
              ctx.stroke();
              
              // Armrests (only on outer edges if it's a multi-seat sofa)
              if (i === 0) { // Left armrest
                ctx.beginPath();
                ctx.roundRect(x, y + h*0.1, w*0.2, h*0.8, 4);
                ctx.stroke();
              }
              if (i === count - 1) { // Right armrest
                ctx.beginPath();
                ctx.roundRect(x + w*0.8, y + h*0.1, w*0.2, h*0.8, 4);
                ctx.stroke();
              }
            }
          }
          
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'Butaca', 0, 0);
          break;
        }
"""

new_sofas = """
        case 'armchair_luis_xv':
        case 'sofa_1_seat':
        case 'sofa_2_seat': {
          let svgData;
          if (elem.type === 'armchair_luis_xv') {
            svgData = FurnitureSVGs.armchair_luis_xv;
          } else if (elem.type === 'sofa_1_seat') {
            svgData = FurnitureSVGs.sofa_1_seat;
          } else {
            svgData = FurnitureSVGs.sofa_2_seat;
          }
          
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 6;
          
          ctx.save();
          // We scale the whole SVG to fit width and height of the element
          const scaleX = elem.width / svgData.width;
          const scaleY = elem.height / svgData.height;
          ctx.scale(scaleX, scaleY);
          ctx.translate(-svgData.width / 2, -svgData.height / 2);
          
          const p = new Path2D(svgData.path);
          ctx.fillStyle = elem.color || '#F0E6D2';
          ctx.fill(p, 'evenodd');
          ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D4A373';
          ctx.lineWidth = 2 / Math.min(scaleX, scaleY);
          ctx.stroke(p);
          
          ctx.restore();
          
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'Butaca', 0, -elem.height / 2 - 10);
          break;
        }
"""

code = code.replace(old_chairs.strip(), new_chairs.strip())
code = code.replace(old_sofas.strip(), new_sofas.strip())

with open('src/components/floorplan/FloorPlanCanvas.tsx', 'w') as f:
    f.write(code)

print("Canvas patched!")
