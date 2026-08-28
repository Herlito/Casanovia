const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

const additionalCases = `
      case 'single_chair':
        newElem = {
          id: newId,
          type: 'single_chair',
          name: 'Silla',
          x: spawnX,
          y: spawnY,
          width: 40,
          height: 40,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          zIndex: 8,
        };
        break;
      case 'chair_row':
        newElem = {
          id: newId,
          type: 'chair_row',
          name: 'Fila de Sillas',
          x: spawnX,
          y: spawnY,
          width: 160,
          height: 40,
          rotation: 0,
          chairCount: 4,
          seats: [],
          color: '#FFFFFF',
          zIndex: 8,
        };
        break;
      case 'armchair_luis_xv':
        newElem = {
          id: newId,
          type: 'armchair_luis_xv',
          name: 'Luis XV',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 50,
          rotation: 0,
          chairCount: 1,
          seats: [],
          color: '#F0E6D2',
          zIndex: 8,
        };
        break;
      case 'sofa_1_seat':
        newElem = {
          id: newId,
          type: 'sofa_1_seat',
          name: 'Butaca',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 60,
          rotation: 0,
          chairCount: 1,
          seats: [],
          color: '#F0E6D2',
          zIndex: 8,
        };
        break;
      case 'sofa_2_seat':
        newElem = {
          id: newId,
          type: 'sofa_2_seat',
          name: 'Butaca 2 Cuerpos',
          x: spawnX,
          y: spawnY,
          width: 120,
          height: 60,
          rotation: 0,
          chairCount: 2,
          seats: [],
          color: '#F0E6D2',
          zIndex: 8,
        };
        break;
`;

code = code.replace("      case 'text_label':", additionalCases + "      case 'text_label':");
fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
