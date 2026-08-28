const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanCanvas.tsx', 'utf8');

const shapesCode = `
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
              
              // Seat cushion
              ctx.beginPath();
              ctx.ellipse(cx, y + h*0.6, w*0.4, h*0.3, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
              
              // Armrests
              ctx.beginPath();
              ctx.ellipse(x + w*0.15, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.ellipse(x + w*0.85, y + h*0.5, w*0.1, h*0.2, 0, 0, 2*Math.PI);
              ctx.fill();
              ctx.stroke();
            } else {
              // Standard Sofa/Armchair
              // Main body
              ctx.beginPath();
              ctx.roundRect(x, y, w, h, 8);
              ctx.fill();
              ctx.stroke();
              
              // Cushion
              ctx.beginPath();
              ctx.roundRect(x + w*0.1, y + h*0.2, w*0.8, h*0.7, 4);
              ctx.fill();
              ctx.stroke();
              
              // Armrests (only on edges if multiple seats, or both if single)
              if (i === 0) { // Left arm
                ctx.beginPath();
                ctx.roundRect(x, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
              if (i === count - 1) { // Right arm
                ctx.beginPath();
                ctx.roundRect(x + w*0.85, y + h*0.1, w*0.15, h*0.8, 4);
                ctx.fill();
                ctx.stroke();
              }
            }
          }
          
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#5A3E2B';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = isLuisXV ? '⚜️' : '🛋️';
          ctx.fillText(elem.name ? \`\${icon} \${elem.name}\` : icon, 0, 0);
          break;
        }
`;

code = code.replace(/        case 'single_chair': \{[\s\S]*?case 'text_label': \{/, shapesCode + "        case 'text_label': {");
fs.writeFileSync('src/components/floorplan/FloorPlanCanvas.tsx', code);
