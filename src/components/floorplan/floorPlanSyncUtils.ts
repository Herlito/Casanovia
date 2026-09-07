import { WeddingTable, Guest, FloorPlanElement, FloorPlanSeat, FloorPlanElementType } from '../../types';
import { sortGuestsWithCompanions } from '../private/TableAssignmentModule';

export { sortGuestsWithCompanions };

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
  if (!gNorm || !tNorm) return false;

  // Direct normalized exact match
  if (gNorm === tNorm) return true;

  // Number based match if both have identifiable numbers
  const gNum = extractTableNumber(guestTable);
  const tNum = targetTableNumber !== undefined && targetTableNumber !== null ? targetTableNumber : extractTableNumber(targetTableName);

  // If BOTH have numbers: they MUST match exactly
  if (gNum !== null && tNum !== null) {
    return gNum === tNum;
  }

  // Check if principal / honor table
  const isGHonor = gNorm.includes('honor') || gNorm.includes('principal') || gNorm.includes('novios');
  const isTHonor = tNorm.includes('honor') || tNorm.includes('principal') || tNorm.includes('novios');
  if (isGHonor && isTHonor) {
    if (gNum !== null && gNum !== 1) return false;
    if (tNum !== null && tNum !== 1) return false;
    return true;
  }

  // If one has a table number and the other does not, they cannot match
  if ((gNum !== null && tNum === null) || (gNum === null && tNum !== null)) {
    return false;
  }

  // Disallow generic single-word names like "mesa", "table" from matching everything
  if (tNorm === 'mesa' || tNorm === 'table' || gNorm === 'mesa' || gNorm === 'table') {
    return false;
  }

  // Named tables without numbers must match exactly
  return gNorm === tNorm;
}

/**
 * Ensures all table elements in a floor plan have strictly unique names and table numbers.
 * No table names and no table numbers are allowed to repeat.
 * Any duplicate tables automatically receive a new unique table number and name.
 */
export function ensureUniqueTableIdentities(
  elements: FloorPlanElement[],
  registeredTables: WeddingTable[] = []
): FloorPlanElement[] {
  if (!elements || elements.length === 0) return [];

  const usedNumbers = new Set<number>();
  const usedNormalizedNames = new Set<string>();

  // 1. Gather all numbers and normalized names from registered wedding tables
  registeredTables.forEach((t) => {
    if (t.name) {
      usedNormalizedNames.add(normalizeTableText(t.name));
      const extracted = extractTableNumber(t.name);
      if (extracted !== null) {
        usedNumbers.add(extracted);
      }
    }
  });

  const seenElementIds = new Set<string>();
  const seenTableNumbers = new Set<number>();
  const seenTableNames = new Set<string>();

  return elements.map((elem) => {
    let elemId = elem.id;
    if (seenElementIds.has(elemId)) {
      elemId = `${elem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }
    seenElementIds.add(elemId);

    const isTable = elem.type === 'round_table' || elem.type === 'rectangular_table';

    if (!isTable) {
      let name = elem.name || 'Elemento';
      let normName = normalizeTableText(name);
      if (seenTableNames.has(normName)) {
        const baseName = name.replace(/\s*\(Copia(\s+\d+)?\)$/i, '').trim();
        let copyNum = 2;
        let candidate = `${baseName} (Copia)`;
        while (seenTableNames.has(normalizeTableText(candidate))) {
          candidate = `${baseName} (Copia ${copyNum})`;
          copyNum++;
        }
        name = candidate;
        normName = normalizeTableText(name);
      }
      seenTableNames.add(normName);
      return { ...elem, id: elemId, name };
    }

    // Table element
    let tableNum = elem.tableNumber ?? extractTableNumber(elem.name);
    let tableName = elem.name ? elem.name.trim() : '';
    let normName = normalizeTableText(tableName);

    const isGenericMesa = !tableName || normName === 'mesa' || normName === 'table';
    const isNumberDuplicate = tableNum === null || tableNum === undefined || seenTableNumbers.has(tableNum);
    const isNameDuplicate = isGenericMesa || seenTableNames.has(normName);

    if (isNumberDuplicate || isNameDuplicate) {
      // Calculate next available unique table number
      let candidateNum = Math.max(0, ...Array.from(usedNumbers), ...Array.from(seenTableNumbers)) + 1;
      while (
        usedNumbers.has(candidateNum) ||
        seenTableNumbers.has(candidateNum) ||
        usedNormalizedNames.has(`mesa ${candidateNum}`) ||
        seenTableNames.has(`mesa ${candidateNum}`)
      ) {
        candidateNum++;
      }

      tableNum = candidateNum;
      tableName = `Mesa ${tableNum}`;
      normName = normalizeTableText(tableName);
    }

    seenTableNumbers.add(tableNum);
    seenTableNames.add(normName);

    // Ensure seat IDs are consistent
    const updatedSeats = (elem.seats || []).map((s, idx) => ({
      ...s,
      id: `seat_${elemId}_${s.seatNumber || idx + 1}`,
      seatNumber: s.seatNumber || idx + 1,
    }));

    return {
      ...elem,
      id: elemId,
      name: tableName,
      tableNumber: tableNum,
      seats: updatedSeats,
    };
  });
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

  // 3. STRICT CAPACITY: Respect the exact capacity established in "Asignación de Mesas"
  const targetTotalSeats = Math.max(1, tableCapacity || 8);
  const seats: FloorPlanSeat[] = [];

  for (let i = 0; i < targetTotalSeats; i++) {
    const seatNumber = i + 1;
    if (i < orderedGuests.length) {
      const guest = orderedGuests[i];
      const initials = guest.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'IN';

      seats.push({
        id: `seat_${elementId}_${seatNumber}`,
        seatNumber,
        guestId: guest.id,
        guestName: guest.fullName,
        guestInitials: initials,
        guestPhone: guest.phone,
        dietaryRequirement: guest.dietaryRestrictions,
        companionCount: 1,
      });
    } else {
      seats.push({
        id: `seat_${elementId}_${seatNumber}`,
        seatNumber,
      });
    }
  }

  return {
    seats,
    seatCount: targetTotalSeats,
  };
}

export function getRectangularSeatSides(
  seatCount: number,
  existingLongSide?: number,
  existingHead?: number
): { seatsLongSide: number; seatsHead: number } {
  if (seatCount <= 2) {
    // Mesa para 2 (como Mesa de Honor o novios): sillas al frente
    return { seatsLongSide: -seatCount, seatsHead: 0 };
  }
  if (seatCount <= 4) {
    return { seatsLongSide: 2, seatsHead: 0 };
  }
  if (existingLongSide !== undefined && existingHead !== undefined) {
    const isOneSideLong = existingLongSide < 0;
    const isOneSideHead = existingHead < 0;
    const lSeats = Math.abs(existingLongSide);
    const hSeats = Math.abs(existingHead);
    const totalChairs = (isOneSideLong ? lSeats : lSeats * 2) + (isOneSideHead ? hSeats : hSeats * 2);
    if (totalChairs === seatCount) {
      return { seatsLongSide: existingLongSide, seatsHead: existingHead };
    }
  }
  const head = 1;
  const longSide = Math.max(1, Math.round((seatCount - head * 2) / 2));
  return { seatsLongSide: longSide, seatsHead: head };
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

    // 1. Update existing table elements with fresh seat assignments - strictly matching registered wedding tables
    existingTableElements.forEach((elem) => {
      // Find corresponding wedding table that has NOT already been claimed by another element
      const matchedTable = tables.find(
        (t) =>
          !processedWeddingTableIds.has(t.id) &&
          (t.id === elem.id.replace('elem_table_', '') ||
            isGuestAssignedToTable(t.name, elem.name, elem.tableNumber))
      );

      // Strictly only keep tables that coincide with registered wedding tables in "Asignación de mesas"
      if (!matchedTable) {
        return;
      }

      processedWeddingTableIds.add(matchedTable.id);

      const tableCap = matchedTable.capacity || 10;
      const tName = matchedTable.name;
      const tNum = extractTableNumber(matchedTable.name) ?? (elem.tableNumber || 1);
      const isRect = matchedTable.shape === 'rectangular' || matchedTable.shape === 'imperial' || matchedTable.shape === 'square';

      const { seats, seatCount } = buildTableSeats(
        elem.id,
        tName,
        tNum,
        tableCap,
        guests
      );

      const rectSides = isRect ? getRectangularSeatSides(seatCount, elem.seatsLongSide, elem.seatsHead) : null;

      updatedElements.push({
        ...elem,
        type: isRect ? 'rectangular_table' : 'round_table',
        name: tName,
        tableNumber: tNum,
        seatCount,
        seatsLongSide: rectSides ? rectSides.seatsLongSide : undefined,
        seatsHead: rectSides ? rectSides.seatsHead : undefined,
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

        const rectSides = isRect ? getRectangularSeatSides(seatCount) : null;

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
          seatsLongSide: rectSides ? rectSides.seatsLongSide : undefined,
          seatsHead: rectSides ? rectSides.seatsHead : undefined,
          seats,
          color: '#FFFFFF',
          textColor: '#2D2A26',
        };

        updatedElements.push(newElem);
      });
    }

    return ensureUniqueTableIdentities(updatedElements, tables);
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

export interface GuestGroupInfo {
  mainGuest: Guest;
  registeredCompanions: Guest[];
  allGroupGuests: Guest[];
  requiredSeats: number;
  hasCompanion: boolean;
}

/**
 * Returns comprehensive group information for a guest (including primary guest, companions, and required seat count)
 */
export function getGuestGroupInfo(guest: Guest, allGuests: Guest[]): GuestGroupInfo {
  // 1. Identify primary guest
  const mainGuest = guest.mainGuestId
    ? allGuests.find((g) => g.id === guest.mainGuestId) || guest
    : guest;

  // 2. Identify companions explicitly registered in the database linked to this primary guest
  const registeredCompanions = allGuests.filter(
    (g) => g.mainGuestId === mainGuest.id && g.id !== mainGuest.id
  );

  const allGroupGuests = [mainGuest, ...registeredCompanions];

  // 3. Determine how many seats/passes are needed:
  // Can be from explicitly registered companions (1 + registeredCompanions.length),
  // or indicated by confirmedPasses / totalPasses on the main guest or the dragged guest.
  const requiredSeats = Math.max(
    allGroupGuests.length,
    mainGuest.confirmedPasses || 0,
    mainGuest.totalPasses || 1,
    guest.confirmedPasses || 0,
    guest.totalPasses || 1
  );

  const hasCompanion =
    requiredSeats > 1 ||
    Boolean(guest.mainGuestId) ||
    registeredCompanions.length > 0;

  return {
    mainGuest,
    registeredCompanions,
    allGroupGuests,
    requiredSeats,
    hasCompanion,
  };
}

export interface TableCapacityCheck {
  canFit: boolean;
  maxCapacity: number;
  occupiedSeats: number;
  availableSeats: number;
  requiredSeats: number;
  hasCompanion: boolean;
  exceededBy: number;
  warningMessage?: string;
}

/**
 * Checks if a wedding table has enough capacity for a guest and their companion(s)
 */
export function checkTableCapacityForGroup(
  tableName: string,
  tableCapacity: number,
  currentlyOccupiedPasses: number,
  guest: Guest,
  allGuests: Guest[]
): TableCapacityCheck {
  const group = getGuestGroupInfo(guest, allGuests);
  const availableSeats = Math.max(0, tableCapacity - currentlyOccupiedPasses);
  const canFit = availableSeats >= group.requiredSeats;
  const exceededBy = canFit ? 0 : group.requiredSeats - availableSeats;

  let warningMessage: string | undefined = undefined;
  if (!canFit) {
    const companionLabel =
      group.requiredSeats === 2
        ? 'su acompañante'
        : `sus ${group.requiredSeats - 1} acompañantes`;

    if (group.hasCompanion) {
      warningMessage = `No es posible ubicar a "${guest.fullName}" y ${companionLabel} en la "${tableName}": la mesa sobrepasa su capacidad. Lugares disponibles: ${availableSeats}, requeridos: ${group.requiredSeats} (sobrepasada por ${exceededBy}).`;
    } else {
      warningMessage = `No es posible ubicar a "${guest.fullName}" en la "${tableName}": la mesa sobrepasa su capacidad (${tableCapacity}/${tableCapacity} asientos ocupados).`;
    }
  }

  return {
    canFit,
    maxCapacity: tableCapacity,
    occupiedSeats: currentlyOccupiedPasses,
    availableSeats,
    requiredSeats: group.requiredSeats,
    hasCompanion: group.hasCompanion,
    exceededBy,
    warningMessage,
  };
}

/**
 * Checks if a Floor Plan table element has enough physical chair capacity for a guest and their companion(s)
 */
export function checkFloorPlanElementCapacityForGroup(
  elem: FloorPlanElement,
  guest: Guest,
  allGuests: Guest[]
): TableCapacityCheck {
  const group = getGuestGroupInfo(guest, allGuests);
  const totalSeats = (elem.seats || []).length;

  const groupIds = new Set(group.allGroupGuests.map((g) => g.id));

  // Seats on this table that are free or already occupied by a member of this group
  const freeSeats = (elem.seats || []).filter(
    (s) =>
      !s.guestId ||
      s.guestId.trim() === '' ||
      groupIds.has(s.guestId) ||
      s.guestId.startsWith(`companion_${group.mainGuest.id}_`) ||
      s.guestId.startsWith(`companion_${guest.id}_`)
  );

  const availableSeats = freeSeats.length;
  const canFit = availableSeats >= group.requiredSeats;
  const exceededBy = canFit ? 0 : group.requiredSeats - availableSeats;

  let warningMessage: string | undefined = undefined;
  if (!canFit) {
    const companionLabel =
      group.requiredSeats === 2
        ? 'su acompañante'
        : `sus ${group.requiredSeats - 1} acompañantes`;

    if (group.hasCompanion) {
      warningMessage = `No es posible ubicar a "${guest.fullName}" y ${companionLabel} en la "${elem.name}": la mesa sobrepasa su capacidad física. Lugares libres: ${availableSeats}, requeridos: ${group.requiredSeats} (sobrepasada por ${exceededBy}).`;
    } else {
      warningMessage = `No es posible ubicar a "${guest.fullName}" en la "${elem.name}": la mesa ya no tiene asientos libres (${totalSeats}/${totalSeats} ocupados).`;
    }
  }

  return {
    canFit,
    maxCapacity: totalSeats,
    occupiedSeats: totalSeats - availableSeats,
    availableSeats,
    requiredSeats: group.requiredSeats,
    hasCompanion: group.hasCompanion,
    exceededBy,
    warningMessage,
  };
}

/**
 * Determines whether a color is dark based on its relative luminance
 */
export function isColorDark(color?: string): boolean {
  if (!color) return false;
  let hex = color.trim();
  if (hex.startsWith('rgb')) {
    const matches = hex.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0], 10);
      const g = parseInt(matches[1], 10);
      const b = parseInt(matches[2], 10);
      return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
    }
  }
  if (!hex.startsWith('#')) return false;
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 140;
}

/**
 * Returns a high-contrast text color (#FFFFFF or #1F2937) for a given surface color if not overridden
 */
export function getContrastTextColor(surfaceColor?: string, preferredTextColor?: string): string {
  if (preferredTextColor) return preferredTextColor;
  return isColorDark(surfaceColor) ? '#FFFFFF' : '#1F2937';
}
