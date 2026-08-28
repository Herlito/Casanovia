const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanCanvas.tsx', 'utf8');

const newCases = `
        case 'single_chair': {
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 4;
          ctx.fillStyle = elem.color || '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(-elem.width / 2, -elem.height / 2, elem.width, elem.height, 6);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D9CEBF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'Silla', 0, 0);
          break;
        }
        case 'chair_row': {
          const count = elem.chairCount || 4;
          const chairW = elem.width / count;
          
          ctx.shadowColor = 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = 4;
          
          for (let i = 0; i < count; i++) {
            ctx.fillStyle = elem.color || '#FFFFFF';
            ctx.beginPath();
            const cx = -elem.width / 2 + (i * chairW) + (chairW / 2);
            ctx.roundRect(cx - chairW/2 + 2, -elem.height / 2 + 2, chairW - 4, elem.height - 4, 4);
            ctx.fill();
            ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D9CEBF';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          ctx.shadowColor = 'transparent';
          
          ctx.fillStyle = elem.textColor || '#2D2A26';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.name || 'Fila', 0, -elem.height / 2 - 10);
          break;
        }
        case 'armchair_luis_xv':
        case 'sofa_1_seat':
        case 'sofa_2_seat': {
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 6;
          ctx.fillStyle = elem.color || '#F0E6D2';
          ctx.beginPath();
          ctx.roundRect(-elem.width / 2, -elem.height / 2, elem.width, elem.height, 12);
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.strokeStyle = isSelected ? '#8B3A4A' : '#D4A373';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.fillStyle = elem.textColor || '#5A3E2B';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = elem.type === 'armchair_luis_xv' ? '⚜️' : '🛋️';
          ctx.fillText(elem.name ? \`\${icon} \${elem.name}\` : icon, 0, 0);
          break;
        }
`;

code = code.replace("case 'text_label':", newCases + "        case 'text_label':");

// Replace literal fill styles with elem.textColor fallback
code = code.replace(/ctx\.fillStyle = '#2D2A26';(\s*ctx\.font = 'bold 13px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#2D2A26';$1");
code = code.replace(/ctx\.fillStyle = '#5C5449';(\s*ctx\.font = '500 10px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#5C5449';$1");
code = code.replace(/ctx\.fillStyle = '#FFFFFF';(\s*ctx\.font = 'bold 14px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#FFFFFF';$1");
code = code.replace(/ctx\.fillStyle = '#2D2A26';(\s*ctx\.font = 'bold 14px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#2D2A26';$1");
code = code.replace(/ctx\.fillStyle = '#8B3A4A';(\s*ctx\.font = 'bold 14px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#8B3A4A';$1");
code = code.replace(/ctx\.fillStyle = '#5A3E2B';(\s*ctx\.font = 'bold 14px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#5A3E2B';$1");
code = code.replace(/ctx\.fillStyle = '#2D2A26';(\s*ctx\.font = 'bold 16px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#2D2A26';$1");
code = code.replace(/ctx\.fillStyle = '#FFFFFF';(\s*ctx\.font = 'bold 12px sans-serif';)/g, "ctx.fillStyle = elem.textColor || '#FFFFFF';$1");
code = code.replace(/ctx\.fillStyle = elem\.color \? '#FFFFFF' : '#2D2A26';(\s*ctx\.font = 'bold 18px sans-serif';)/g, "ctx.fillStyle = elem.textColor || (elem.color ? '#FFFFFF' : '#2D2A26');$1");

fs.writeFileSync('src/components/floorplan/FloorPlanCanvas.tsx', code);
