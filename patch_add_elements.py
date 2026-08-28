import re

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'r') as f:
    code = f.read()

new_cases = """
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
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'chair_row':
        newElem = {
          id: newId,
          type: 'chair_row',
          name: 'Fila de Sillas',
          x: spawnX,
          y: spawnY,
          width: 200,
          height: 40,
          rotation: 0,
          chairCount: 5,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'armchair_luis_xv':
        newElem = {
          id: newId,
          type: 'armchair_luis_xv',
          name: 'Sillón Luis XV',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'sofa_1_seat':
        newElem = {
          id: newId,
          type: 'sofa_1_seat',
          name: 'Butaca (1 Cpo)',
          x: spawnX,
          y: spawnY,
          width: 60,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
      case 'sofa_2_seat':
        newElem = {
          id: newId,
          type: 'sofa_2_seat',
          name: 'Butaca (2 Cpos)',
          x: spawnX,
          y: spawnY,
          width: 120,
          height: 60,
          rotation: 0,
          seats: [],
          color: '#FFFFFF',
          textColor: '#2D2A26',
          zIndex: 6,
        };
        break;
"""

code = code.replace("      default:\n        newElem = {", new_cases + "      default:\n        newElem = {")

with open('src/components/floorplan/FloorPlanDesignerModal.tsx', 'w') as f:
    f.write(code)
print("Patched handleAddElement")
