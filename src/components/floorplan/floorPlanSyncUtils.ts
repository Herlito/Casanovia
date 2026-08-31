import { WeddingTable, Guest, FloorPlanElement, FloorPlanSeat, FloorPlanElementType } from '../../types';
import { sortGuestsWithCompanions } from '../private/TableAssignmentModule';

/**
 * Normalizes string for matching table names and numbers
 */
export function normalizeTableText(text?: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Extracts table number from a table string (e.g. "Mesa 3", "Mesa 03 (Familia)", "3")
 */
export function extractTableNumber(text?: string): number | null {
  if (!text) return null;
  const match =
    text.match(/mesa\s*#?\s*(\d+)/i) ||
    text.match(/table\s*#?\s*(\d+)/i) ||
    text.match(/^#?\s*(\d+)/) ||
    text.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Checks if a guest's assignedTable string matches a given table definition
 */
export function isGuestAssignedToTable(
  guestTable?: string,
  targetTableName?: string,
  targetTableNumber?: number
): boolean {
  if (!guestTable || !targetTableName) return false;

  const gNorm = normalizeTableText(guestTable);
  const tNorm = normalizeTableText(targetTableName);

  // Direct normalized exact match
  if (gNorm === tNorm) return true;

  // Number based match if both have identifiable numbers
  const gNum = extractTableNumber(guestTable);
  const tNum = targetTableNumber ?? extractTableNumber(targetTableName);
  if (gNum !== null && tNum !== null && gNum === tNum) {
    return true;
  }

  // Prefix match (e.g. "Mesa 1" matches "Mesa 1 (Mesa de Honor)" or vice versa)
  if (gNorm.startsWith(tNorm) || tNorm.startsWith(gNorm)) {
    return true;
  }

  // Check if principal / honor table
  const isGHonor = gNorm.includes('honor') || gNorm.includes('principal') || gNorm.includes('novios');
  const isTHonor = tNorm.includes('honor') || tNorm.includes('principal') || tNorm.includes('novios');
  if (isGHonor && isTHonor) return true;

  return false;
}

/**
 * Generates and populates seats for a specific table given the wedding guest list
 */
export function buildTableSeats(
  elementId: string,
  tableName: string,
  tableNumber: number | undefined,
  tableCapacity: number,
  allGuests: Guest[]
): { seats: FloorPlanSeat[]; seatCount: number } {
  // 1. Find all guests assigned to this table
  const matchingGuests = allGuests.filter((g) => {
    if (!g.assignedTable || g.assignedTable.trim() === '' || g.assignedTable.toLowerCase().includes('por asignar')) {
      return false;
    }
    return isGuestAssignedToTable(g.assignedTable, tableName, tableNumber);
  });

  // 2. Sort primary guests with their registered companion records
  const orderedGuests = sortGuestsWithCompanions(matchingGuests);

  // 3. Build seat objects
  const seats: FloorPlanSeat[] = [];
  let seatNumberCounter = 1;

  // Track explicit companion records to avoid duplicate synthesized companion seats
  const registeredCompanionIds = new Set(
    allGuests.filter((g) => Boolean(g.mainGuestId)).map((g) => g.id)
  );

  orderedGuests.forEach((guest) => {
    const isExplicitCompanion = Boolean(guest.mainGuestId);

    // Initials (2 letters)
    const initials = guest.fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'IN';

    // Add main seat for this guest
    seats.push({
      id: `seat_${elementId}_${seatNumberCounter}`,
      seatNumber: seatNumberCounter,
      guestId: guest.id,
      guestName: guest.fullName,
      guestInitials: initials,
      guestPhone: guest.phone,
      dietaryRequirement: guest.dietaryRestrictions,
      companionCount: guest.confirmedPasses || guest.totalPasses || 1,
    });
    seatNumberCounter++;

    // If primary guest has multiple passes (e.g. 2 or 3) and companions are NOT already separate guest records
    if (!isExplicitCompanion) {
      const extraPasses = (guest.confirmedPasses || guest.totalPasses || 1) - 1;
      const explicitCompanionsForThisGuest = allGuests.filter(
        (g) => g.mainGuestId === guest.id && matchingGuests.some((mg) => mg.id === g.id)
      ).length;

      const unrepresentedPasses = Math.max(0, extraPasses - explicitCompanionsForThisGuest);

      for (let p = 1; p <= unrepresentedPasses; p++) {
        seats.push({
          id: `seat_${elementId}_${seatNumberCounter}`,
          seatNumber: seatNumberCounter,
          guestId: `${guest.id}_comp_${p}`,
          guestName: `Acompañante (${guest.fullName})`,
          guestInitials: 'AC',
          guestPhone: guest.phone,
          dietaryRequirement: guest.dietaryRestrictions,
          companionCount: 1,
        });
        seatNumberCounter++;
      }
    }
  });

  // 4. Fill remaining empty seats up to the table capacity
  const targetTotalSeats = Math.max(tableCapacity || 8, seats.length);
  while (seats.length < targetTotalSeats) {
    seats.push({
      id: `seat_${elementId}_${seatNumberCounter}`,
      seatNumber: seatNumberCounter,
    });
    seatNumberCounter++;
  }

  return {
    seats,
    seatCount: seats.length,
  };
}

/**
 * Builds or synchronizes the complete floor plan elements based on the current wedding tables and guests
 */
export function buildFloorPlanFromWedding(
  tables: WeddingTable[],
  guests: Guest[],
  existingElements?: FloorPlanElement[]
): FloorPlanElement[] {
  // If we have existing elements, preserve their positions, colors, custom shapes, and non-table items
  if (existingElements && existingElements.length > 0) {
    const existingTableElements = existingElements.filter(
      (e) => e.type === 'round_table' || e.type === 'rectangular_table'
    );
    const nonTableElements = existingElements.filter(
      (e) => e.type !== 'round_table' && e.type !== 'rectangular_table'
    );

    const updatedElements: FloorPlanElement[] = [...nonTableElements];
    const processedWeddingTableIds = new Set<string>();

    // 1. Update existing table elements with fresh seat assignments
    existingTableElements.forEach((elem, idx) => {
      // Find corresponding wedding table
      const matchedTable = tables.find(
        (t) =>
          t.id === elem.id.replace('elem_table_', '') ||
          isGuestAssignedToTable(t.name, elem.name, elem.tableNumber)
      );

      const tableCap = matchedTable?.capacity || elem.seatCount || elem.seats?.length || 8;
      const tName = matchedTable?.name || elem.name || `Mesa ${elem.tableNumber || idx + 1}`;
      const tNum = matchedTable ? (extractTableNumber(matchedTable.name) ?? elem.tableNumber ?? (idx + 1)) : (elem.tableNumber ?? (idx + 1));
      const isRect = matchedTable 
        ? (matchedTable.shape === 'rectangular' || matchedTable.shape === 'imperial' || matchedTable.shape === 'square')
        : (elem.type === 'rectangular_table');

      if (matchedTable) {
        processedWeddingTableIds.add(matchedTable.id);
      }

      const { seats, seatCount } = buildTableSeats(
        elem.id,
        tName,
        tNum,
        tableCap,
        guests
      );

      updatedElements.push({
        ...elem,
        type: isRect ? 'rectangular_table' : 'round_table',
        name: tName,
        tableNumber: tNum,
        seatCount,
        seatsLongSide: isRect ? (elem.seatsLongSide || Math.max(2, Math.floor((seatCount - 2) / 2))) : undefined,
        seatsHead: isRect ? (elem.seatsHead !== undefined ? elem.seatsHead : 1) : undefined,
        seats,
      });
    });

    // 2. Add any new wedding tables that were not in existingElements
    const missingTables = tables.filter((t) => !processedWeddingTableIds.has(t.id));
    if (missingTables.length > 0) {
      let spawnY = 700;
      missingTables.forEach((tbl, mIdx) => {
        const elemId = `elem_table_${tbl.id || Date.now() + '_' + mIdx}`;
        const tNum = extractTableNumber(tbl.name) || existingTableElements.length + mIdx + 1;
        const isRect =
          tbl.shape === 'rectangular' || tbl.shape === 'imperial' || tbl.shape === 'square';

        const { seats, seatCount } = buildTableSeats(
          elemId,
          tbl.name,
          tNum,
          tbl.capacity || 10,
          guests
        );

        const newElem: FloorPlanElement = {
          id: elemId,
          type: isRect ? 'rectangular_table' : 'round_table',
          name: tbl.name,
          tableNumber: tNum,
          x: 250 + (mIdx % 4) * 220,
          y: spawnY + Math.floor(mIdx / 4) * 180,
          width: isRect ? 180 : 130,
          height: isRect ? 100 : 130,
          radius: isRect ? undefined : 65,
          rotation: 0,
          seatCount,
          seatsLongSide: isRect ? Math.max(2, Math.floor((seatCount - 2) / 2)) : undefined,
          seatsHead: isRect ? 1 : undefined,
          seats,
          color: '#FFFFFF',
          textColor: '#2D2A26',
        };

        updatedElements.push(newElem);
      });
    }

    return updatedElements;
  }

  // If no existing elements, generate a fresh, balanced layout from wedding tables and guests
  const elements: FloorPlanElement[] = [];

  // 1. Stage / Escenario (Top Center)
  elements.push({
    id: 'elem_stage_main',
    type: 'stage',
    name: 'Escenario & Orquesta',
    x: 650,
    y: 110,
    width: 320,
    height: 70,
    rotation: 0,
    seats: [],
    color: '#2D2A26',
    textColor: '#FFFFFF',
    zIndex: 1,
  });

  // 2. Cabina DJ (Top Left)
  elements.push({
    id: 'elem_dj_booth',
    type: 'dj_booth',
    name: 'Cabina DJ Live Audio',
    x: 280,
    y: 110,
    width: 140,
    height: 60,
    rotation: 0,
    seats: [],
    color: '#1E293B',
    textColor: '#63B3ED',
    zIndex: 1,
  });

  // 3. Barra de Coctelería (Top Right)
  elements.push({
    id: 'elem_bar_main',
    type: 'bar',
    name: 'Barra Libre & Cócteles',
    x: 1020,
    y: 110,
    width: 180,
    height: 65,
    rotation: 0,
    seats: [],
    color: '#3D2B1F',
    textColor: '#E5B869',
    zIndex: 1,
  });

  // 4. Pista de Baile (Center)
  elements.push({
    id: 'elem_dance_floor',
    type: 'dance_floor',
    name: 'Pista de Baile Principal',
    x: 650,
    y: 330,
    width: 340,
    height: 220,
    rotation: 0,
    seats: [],
    color: '#F0E6D2',
    textColor: '#5A3E2B',
    zIndex: 1,
  });

  // 5. Torta Nupcial & Dulces (Mid Left)
  elements.push({
    id: 'elem_cake_table',
    type: 'cake_table',
    name: 'Mesa de Torta & Dulces',
    x: 150,
    y: 330,
    width: 80,
    height: 80,
    radius: 40,
    rotation: 0,
    seats: [],
    color: '#FFF1F2',
    textColor: '#9F1239',
    zIndex: 1,
  });

  // 6. Photo Booth (Mid Right)
  elements.push({
    id: 'elem_photo_booth',
    type: 'photo_booth',
    name: 'Cabina de Fotos & Recuerdos',
    x: 1150,
    y: 330,
    width: 130,
    height: 85,
    rotation: 0,
    seats: [],
    color: '#E0F2FE',
    textColor: '#0369A1',
    zIndex: 1,
  });

  // 7. Entrada Principal (Bottom Center)
  elements.push({
    id: 'elem_entrance',
    type: 'entrance',
    name: 'Acceso Invitados & Recepción',
    x: 650,
    y: 920,
    width: 220,
    height: 50,
    rotation: 0,
    seats: [],
    color: '#FEF3C7',
    textColor: '#92400E',
    zIndex: 1,
  });

  // 8. Generate Banquet Tables from wedding's tables
  // Fallback to table names from guests if tables array is empty
  const activeTablesList: WeddingTable[] =
    tables && tables.length > 0
      ? tables
      : Array.from(
          new Set(
            guests
              .map((g) => g.assignedTable)
              .filter(
                (t): t is string =>
                  Boolean(t) && t.trim() !== '' && !t.toLowerCase().includes('por asignar')
              )
          )
        ).map((tName, i) => ({
          id: `tbl-gen-${i + 1}`,
          name: tName,
          capacity: 10,
          shape: tName.toLowerCase().includes('honor') || tName.toLowerCase().includes('principal') ? 'imperial' : 'round',
        }));

  // Identify Presidential / Honor Table vs Guest Tables
  const honorTable = activeTablesList.find(
    (t) =>
      t.name.toLowerCase().includes('honor') ||
      t.name.toLowerCase().includes('principal') ||
      t.name.toLowerCase().includes('novios') ||
      t.shape === 'imperial'
  );

  const regularTables = activeTablesList.filter((t) => t !== honorTable);

  // Position Honor Table right in front of dance floor facing the room
  if (honorTable) {
    const elemId = `elem_table_${honorTable.id}`;
    const tNum = extractTableNumber(honorTable.name) || 1;
    const { seats, seatCount } = buildTableSeats(
      elemId,
      honorTable.name,
      tNum,
      honorTable.capacity || 10,
      guests
    );

    elements.push({
      id: elemId,
      type: 'rectangular_table',
      name: honorTable.name,
      tableNumber: tNum,
      x: 650,
      y: 530,
      width: 240,
      height: 95,
      rotation: 0,
      seatCount,
      seatsLongSide: Math.max(3, Math.floor((seatCount - 2) / 2)),
      seatsHead: 1,
      seats,
      color: '#FFFFFF',
      textColor: '#2D3748',
      zIndex: 2,
    });
  }

  // Layout regular guest tables symmetrically around the dance floor and lower ballroom
  // Left Column & Right Column positions
  const tablePositions = [
    { x: 340, y: 330 }, // Left side of dance floor
    { x: 960, y: 330 }, // Right side of dance floor
    { x: 340, y: 530 }, // Lower Left
    { x: 960, y: 530 }, // Lower Right
    { x: 340, y: 730 }, // Bottom Left 1
    { x: 550, y: 730 }, // Bottom Center-Left
    { x: 750, y: 730 }, // Bottom Center-Right
    { x: 960, y: 730 }, // Bottom Right 1
    { x: 200, y: 530 }, // Far Left
    { x: 1100, y: 530 }, // Far Right
    { x: 200, y: 730 }, // Far Bottom Left
    { x: 1100, y: 730 }, // Far Bottom Right
  ];

  regularTables.forEach((tbl, idx) => {
    const elemId = `elem_table_${tbl.id}`;
    const tNum = extractTableNumber(tbl.name) || idx + (honorTable ? 2 : 1);
    const isRect = tbl.shape === 'rectangular' || tbl.shape === 'imperial' || tbl.shape === 'square';
    const pos = tablePositions[idx % tablePositions.length];
    const offsetCol = Math.floor(idx / tablePositions.length);
    const finalX = pos.x + offsetCol * 30;
    const finalY = pos.y + offsetCol * 30;

    const { seats, seatCount } = buildTableSeats(
      elemId,
      tbl.name,
      tNum,
      tbl.capacity || 10,
      guests
    );

    elements.push({
      id: elemId,
      type: isRect ? 'rectangular_table' : 'round_table',
      name: tbl.name,
      tableNumber: tNum,
      x: finalX,
      y: finalY,
      width: isRect ? 170 : 130,
      height: isRect ? 95 : 130,
      radius: isRect ? undefined : 65,
      rotation: 0,
      seatCount,
      seatsLongSide: isRect ? Math.max(2, Math.floor((seatCount - 2) / 2)) : undefined,
      seatsHead: isRect ? 1 : undefined,
      seats,
      color: '#FFFFFF',
      textColor: '#2D2A26',
      zIndex: 2,
    });
  });

  return elements;
}
