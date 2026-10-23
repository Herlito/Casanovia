import { jsPDF } from 'jspdf';
import { WeddingFloorPlan, WeddingSettings, FloorPlanElement, FloorPlanSeat, WeddingTable, Guest } from '../../types';
import { isGuestAssignedToTable, sortGuestsWithCompanions, extractTableNumber } from './floorPlanSyncUtils';

export type PdfExportMode = 'all' | 'plan_only' | 'list_only';

interface ExportPdfOptions {
  plan: WeddingFloorPlan;
  settings: WeddingSettings;
  canvasElement?: HTMLCanvasElement | null;
  weddingTitle: string;
  exportMode?: PdfExportMode;
  registeredTables?: WeddingTable[];
  guests?: Guest[];
  shouldPrint?: boolean;
}

// Load Montserrat font into jsPDF instance
async function loadMontserratFont(doc: jsPDF): Promise<boolean> {
  try {
    const [regRes, boldRes] = await Promise.all([
      fetch('/fonts/Montserrat-Regular.ttf'),
      fetch('/fonts/Montserrat-Bold.ttf'),
    ]);

    if (regRes.ok && boldRes.ok) {
      const regBuf = await regRes.arrayBuffer();
      const boldBuf = await boldRes.arrayBuffer();

      const arrayBufferToBinaryString = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 8192;
        let binary = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
        }
        return binary;
      };

      doc.addFileToVFS('Montserrat-Regular.ttf', arrayBufferToBinaryString(regBuf));
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');

      doc.addFileToVFS('Montserrat-Bold.ttf', arrayBufferToBinaryString(boldBuf));
      doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');
      return true;
    }
  } catch (err) {
    console.warn('Montserrat font could not be loaded into jsPDF, falling back to helvetica', err);
  }
  return false;
}

// Calculate chair world positions for a table
function calculateChairPositions(elem: FloorPlanElement): { seat: FloorPlanSeat; x: number; y: number; angle: number }[] {
  const chairs: { seat: FloorPlanSeat; x: number; y: number; angle: number }[] = [];
  const seats = elem.seats || [];
  const count = seats.length;
  if (count === 0) return chairs;

  if (elem.type === 'round_table') {
    const radius = elem.radius || 60;
    const chairDistance = radius + 22;
    const startAngle = (elem.rotation * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i * 2 * Math.PI) / count;
      chairs.push({
        seat: seats[i],
        x: elem.x + Math.cos(angle) * chairDistance,
        y: elem.y + Math.sin(angle) * chairDistance,
        angle,
      });
    }
  } else if (elem.type === 'rectangular_table') {
    const w = elem.width;
    const h = elem.height;
    const rot = (elem.rotation * Math.PI) / 180;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    const rotatePoint = (px: number, py: number) => {
      return {
        x: elem.x + px * cosR - py * sinR,
        y: elem.y + px * sinR + py * cosR,
      };
    };

    const headSeatsRaw = elem.seatsHead !== undefined ? elem.seatsHead : 1;
    const headSeats = Math.abs(headSeatsRaw);
    const isOneSideOnly = headSeatsRaw < 0;
    
    const longSeatsRaw = elem.seatsLongSide !== undefined ? elem.seatsLongSide : (Math.floor((count - (isOneSideOnly ? headSeats : headSeats * 2)) / 2) || 3);
    const isOneSideLong = longSeatsRaw < 0;
    const longSeats = Math.abs(longSeatsRaw);

    let seatIdx = 0;

    // Top Side
    const topSpacing = w / (longSeats + 1);
    for (let i = 1; i <= longSeats && seatIdx < count; i++) {
      const localX = -w / 2 + i * topSpacing;
      const localY = -h / 2 - 20;
      const pt = rotatePoint(localX, localY);
      chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot });
      seatIdx++;
    }

    // Right Head (Only if not one-side only)
    if (headSeats > 0 && !isOneSideOnly && seatIdx < count) {
      for (let i = 1; i <= headSeats && seatIdx < count; i++) {
        const localX = w / 2 + 20;
        const localY = -h / 2 + (i * h) / (headSeats + 1);
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI / 2 });
        seatIdx++;
      }
    }

    // Bottom Side (Only if not one-side long)
    const botSpacing = w / (longSeats + 1);
    if (!isOneSideLong) {
      for (let i = longSeats; i >= 1 && seatIdx < count; i--) {
        const localX = -w / 2 + i * botSpacing;
        const localY = h / 2 + 20;
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot + Math.PI });
        seatIdx++;
      }
    }

    // Left Head
    if (headSeats > 0 && seatIdx < count) {
      for (let i = 1; i <= headSeats && seatIdx < count; i++) {
        const localX = -w / 2 - 20;
        const localY = -h / 2 + (i * h) / (headSeats + 1);
        const pt = rotatePoint(localX, localY);
        chairs.push({ seat: seats[seatIdx], x: pt.x, y: pt.y, angle: rot - Math.PI / 2 });
        seatIdx++;
      }
    }
  }

  return chairs;
}

// Helper to draw rounded rectangle safely
function drawSafeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
}

// Render clean, professional black & white line-art canvas adjusted 100% to A4 horizontal ratio
export function renderCleanFloorPlanCanvas(
  plan: WeddingFloorPlan,
  weddingTitle: string,
  registeredTables?: WeddingTable[],
  guests?: Guest[]
): HTMLCanvasElement {
  const exportW = 2970;
  const exportH = 2100;

  const canvas = document.createElement('canvas');
  canvas.width = exportW;
  canvas.height = exportH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Pure White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, exportW, exportH);

  // Stats calculation matching registered tables strictly from "Asignación de mesas"
  const matchingTableElements = (registeredTables && registeredTables.length > 0)
    ? plan.elements.filter(
        (e) => (e.type === 'round_table' || e.type === 'rectangular_table') &&
               registeredTables.some(rt => rt.id === e.id.replace('elem_table_', '') || isGuestAssignedToTable(rt.name, e.name, e.tableNumber))
      )
    : plan.elements.filter((e) => e.type === 'round_table' || e.type === 'rectangular_table');

  const tablesCount = matchingTableElements.length;
  const totalSeats = registeredTables && registeredTables.length > 0
    ? matchingTableElements.reduce((acc, e) => {
        const matchedT = registeredTables.find(rt => rt.id === e.id.replace('elem_table_', '') || isGuestAssignedToTable(rt.name, e.name, e.tableNumber));
        return acc + (matchedT?.capacity || e.seats?.length || e.seatCount || 0);
      }, 0)
    : matchingTableElements.reduce((acc, e) => acc + (e.seats?.length || e.seatCount || 0), 0);

  const assignedSeats = guests && guests.length > 0
    ? guests.filter(g => g && g.assignedTable && g.assignedTable.trim() !== '' && !g.assignedTable.toLowerCase().includes('por asignar')).length
    : matchingTableElements.reduce((acc, e) => acc + (e.seats?.filter((s) => s.guestId)?.length || 0), 0);

  // 2. Minimalist Header Text (pure black / gray, no colored bands)
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(weddingTitle || 'Plano Oficial de Distribución', 70, 50);

  ctx.fillStyle = '#4A5568';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(
    `Total Mesas: ${tablesCount}  |  Total Asientos: ${totalSeats}  |  Invitados Asignados: ${assignedSeats}`,
    70,
    95
  );

  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  ctx.textAlign = 'right';
  ctx.fillText(`Generado: ${dateStr}`, exportW - 70, 50);
  ctx.fillText('Protocolo & Montaje de Banquetes', exportW - 70, 95);

  // Divider Line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 135);
  ctx.lineTo(exportW - 70, 135);
  ctx.stroke();

  // 3. Calculate Bounding Box of all elements to fit 100% of canvas content inside the A4 sheet
  const elements = plan.elements || [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (elements.length > 0) {
    elements.forEach((elem) => {
      const isRound = elem.type === 'round_table';
      const r = isRound ? (elem.radius || 60) + 40 : 0;
      const halfW = isRound ? r : (elem.width / 2) + 40;
      const halfH = isRound ? r : (elem.height / 2) + 40;

      minX = Math.min(minX, elem.x - halfW);
      maxX = Math.max(maxX, elem.x + halfW);
      minY = Math.min(minY, elem.y - halfH);
      maxY = Math.max(maxY, elem.y + halfH);
    });
  }

  // Fallback if empty
  if (!isFinite(minX) || !isFinite(maxX) || maxX - minX < 40) {
    minX = 0;
    minY = 0;
    maxX = plan.canvasWidth || 1600;
    maxY = plan.canvasHeight || 1200;
  }

  // Add margin around content
  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // Available drawing area
  const drawX = 70;
  const drawY = 160;
  const drawW = exportW - 140;
  const drawH = exportH - 240;

  const scale = Math.min(drawW / contentW, drawH / contentH);
  const tx = drawX + (drawW - contentW * scale) / 2 - minX * scale;
  const ty = drawY + (drawH - contentH * scale) / 2 - minY * scale;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  // 4. Render All Objects (Clean Line-Art, No Dark Fills, No Color Fills)
  // Sort elements by z-index
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  sorted.forEach((elem) => {
    switch (elem.type) {
      case 'round_table': {
        const r = elem.radius || 60;

        // Table surface: pure white with simple line border
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, r, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(elem.x, elem.y, r, 0, 2 * Math.PI);
        ctx.stroke();

        // Center labels: black / dark gray
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, elem.x, elem.y - 7);

        const assignedCount = elem.seats ? elem.seats.filter((s) => s.guestId).length : 0;
        ctx.fillStyle = '#4A5568';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`${assignedCount}/${elem.seats?.length || 0} pers.`, elem.x, elem.y + 10);
        break;
      }

      case 'rectangular_table': {
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        // Table surface: pure white with simple line border
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-elem.width / 2, -elem.height / 2, elem.width, elem.height);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-elem.width / 2, -elem.height / 2, elem.width, elem.height);

        // Center labels: black / dark gray
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.name || `Mesa ${elem.tableNumber || ''}`, 0, -6);

        const assignedCount = elem.seats ? elem.seats.filter((s) => s.guestId).length : 0;
        ctx.fillStyle = '#4A5568';
        ctx.font = '10.5px system-ui, sans-serif';
        ctx.fillText(`${assignedCount}/${elem.seats?.length || 0} pers.`, 0, 10);

        ctx.restore();
        break;
      }

      case 'stage':
      case 'dance_floor':
      case 'bar':
      case 'dj_booth':
      case 'restrooms':
      case 'entrance':
      case 'cake_table':
      case 'lounge':
      case 'photo_booth':
      case 'single_chair':
      case 'chair_row':
      case 'armchair_luis_xv':
      case 'sofa_1_seat':
      case 'sofa_2_seat':
      case 'rug': {
        ctx.save();
        ctx.translate(elem.x, elem.y);
        ctx.rotate((elem.rotation * Math.PI) / 180);

        const w = elem.width || 80;
        const h = elem.height || 50;

        // White fill, simple black line border
        ctx.fillStyle = '#FFFFFF';
        drawSafeRoundRect(ctx, -w / 2, -h / 2, w, h, 6);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        drawSafeRoundRect(ctx, -w / 2, -h / 2, w, h, 6);
        ctx.stroke();

        // Label in black
        let defaultLabel = 'ZONA';
        if (elem.type === 'stage') defaultLabel = 'ESCENARIO';
        else if (elem.type === 'dance_floor') defaultLabel = 'PISTA DE BAILE';
        else if (elem.type === 'bar') defaultLabel = 'BARRA DE BAR';
        else if (elem.type === 'dj_booth') defaultLabel = 'CABINA DJ';
        else if (elem.type === 'restrooms') defaultLabel = 'BAÑOS';
        else if (elem.type === 'entrance') defaultLabel = 'ENTRADA / ACCESO';
        else if (elem.type === 'cake_table') defaultLabel = 'MESA DE TARTA';
        else if (elem.type === 'lounge') defaultLabel = 'ZONA LOUNGE';
        else if (elem.type === 'photo_booth') defaultLabel = 'FOTOMATÓN';
        else if (elem.type === 'rug') defaultLabel = 'ALFOMBRA';
        else if (elem.type.includes('sofa') || elem.type.includes('armchair')) defaultLabel = 'SILLÓN';

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.name || defaultLabel, 0, 0);

        ctx.restore();
        break;
      }

      case 'text_label': {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elem.name || 'Texto de Referencia', elem.x, elem.y);
        break;
      }
    }

    // 5. Draw Individual Chairs for Tables in World Space
    if (elem.type === 'round_table' || elem.type === 'rectangular_table') {
      const chairs = calculateChairPositions(elem);
      chairs.forEach(({ seat, x, y }) => {
        const isAssigned = !!seat.guestId;
        const chairRadius = 13;

        // Chair Circle: Pure white fill with simple black line border
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, chairRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, chairRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Guest Initials (black) or Seat Number (gray)
        ctx.fillStyle = isAssigned ? '#000000' : '#4A5568';
        ctx.font = 'bold 9.5px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = isAssigned
          ? seat.guestInitials || seat.guestName?.substring(0, 2).toUpperCase() || 'INV'
          : `${seat.seatNumber}`;
        ctx.fillText(label, x, y);
      });
    }
  });

  ctx.restore();

  // 6. Footer Note
  ctx.fillStyle = '#718096';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    'Plano oficial de montaje e infraestructura para banquetes y protocolo. Casanovia Wedding System.',
    exportW / 2,
    exportH - 25
  );

  return canvas;
}

function drawGuestListHeader(doc: jsPDF, weddingTitle: string, fontName: string) {
  const portWidth = 210;
  const margin = 15;

  // Pure white page background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, portWidth, 297, 'F');

  // Header Title
  doc.setTextColor(0, 0, 0);
  doc.setFont(fontName, 'bold');
  doc.setFontSize(11);
  doc.text('LISTA DE INVITADOS POR MESA', margin, 14);

  // Wedding Title on right
  doc.setFont(fontName, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(weddingTitle, portWidth - margin, 14, { align: 'right' });

  // Clean solid separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(margin, 17, portWidth - margin, 17);
}

export async function exportFloorPlanToPdf({
  plan,
  settings,
  weddingTitle,
  exportMode = 'all',
  registeredTables,
  guests,
  shouldPrint = false,
}: ExportPdfOptions): Promise<void> {
  // If we ONLY want the guest list, start directly in portrait
  const doc = new jsPDF({
    orientation: exportMode === 'list_only' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Load Montserrat font into the jsPDF instance
  const hasMontserrat = await loadMontserratFont(doc);
  const fontName = hasMontserrat ? 'Montserrat' : 'helvetica';

  if (exportMode === 'all' || exportMode === 'plan_only') {
    // ----------------------------------------------------
    // PAGE 1: FLOOR PLAN (LANDSCAPE - 100% A4 FIT, WHITE BACKGROUND, BLACK/GRAY)
    // ----------------------------------------------------
    const pageWidth = 297;
    const pageHeight = 210;

    // Pure white page background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Generate high-resolution line-art canvas adjusted 100% to A4 horizontal sheet
    const cleanCanvas = renderCleanFloorPlanCanvas(plan, weddingTitle, registeredTables, guests);
    const cleanCanvasDataUrl = cleanCanvas.toDataURL('image/png', 1.0);

    // Add canvas image filling 100% of the horizontal A4 sheet
    doc.addImage(cleanCanvasDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  }

  if (exportMode === 'all' || exportMode === 'list_only') {
    // ==========================================
    // GUEST LIST: TWO COLUMNS PER A4 SHEET (MONTSEERAT, WHITE BG, PURE BLACK TEXT)
    // ==========================================
    // Precedence: Strictly registered tables from "Asignación de mesas" that coincide with the floor plan
    const activeTables: { id: string; name: string; capacity: number }[] =
      registeredTables && registeredTables.length > 0
        ? registeredTables
            .filter((rt) =>
              plan.elements.some(
                (elem) =>
                  (elem.type === 'round_table' || elem.type === 'rectangular_table') &&
                  (elem.id.replace('elem_table_', '') === rt.id ||
                    isGuestAssignedToTable(rt.name, elem.name, elem.tableNumber))
              )
            )
            .map((rt) => ({
              id: rt.id,
              name: rt.name,
              capacity: rt.capacity || 10,
            }))
        : plan.elements
            .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
            .map((elem, idx) => ({
              id: elem.id.replace('elem_table_', ''),
              name: elem.name || `Mesa ${elem.tableNumber || idx + 1}`,
              capacity: elem.seats?.length || elem.seatCount || 10,
            }));

    // Sort tables by natural table number
    activeTables.sort((a, b) => {
      const numA = extractTableNumber(a.name) ?? 999;
      const numB = extractTableNumber(b.name) ?? 999;
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    });

    if (activeTables.length > 0) {
      if (exportMode === 'all') {
        doc.addPage('a4', 'portrait');
      }

      const portWidth = 210;
      const margin = 15;
      const colGap = 12;
      const colWidth = (portWidth - margin * 2 - colGap) / 2; // 84mm
      const colX = [margin, margin + colWidth + colGap]; // [15, 111]

      const startY = 24;
      const maxBottomY = 282;

      let currentColumn: 0 | 1 = 0;
      let currentY = startY;

      drawGuestListHeader(doc, weddingTitle, fontName);

      activeTables.forEach((table) => {
        // Source of truth for guests: "Asignación de mesas"
        let assignedGuests: { fullName: string }[] = [];
        if (guests && guests.length > 0) {
          const matchingGuests = guests.filter(
            (g) =>
              g &&
              g.assignedTable &&
              isGuestAssignedToTable(g.assignedTable, table.name, extractTableNumber(table.name))
          );
          assignedGuests = sortGuestsWithCompanions(matchingGuests);
        } else {
          const matchingElem = plan.elements.find(
            (e) =>
              (e.type === 'round_table' || e.type === 'rectangular_table') &&
              (e.id.replace('elem_table_', '') === table.id ||
                isGuestAssignedToTable(table.name, e.name, e.tableNumber))
          );
          assignedGuests = (matchingElem?.seats || [])
            .filter((s) => s.guestName && s.guestId)
            .map((s) => ({ fullName: s.guestName! }));
        }

        const count = assignedGuests.length;
        const lineSpacing = 4.4;
        const headerHeight = 5.0;
        const bottomMargin = 5.5;
        const blockHeight = headerHeight + (count > 0 ? count * lineSpacing : lineSpacing) + bottomMargin;

        // Check if table block fits in the current column
        if (currentY + blockHeight > maxBottomY) {
          if (currentColumn === 0) {
            currentColumn = 1;
            currentY = startY;
          } else {
            doc.addPage('a4', 'portrait');
            drawGuestListHeader(doc, weddingTitle, fontName);
            currentColumn = 0;
            currentY = startY;
          }
        }

        const leftX = colX[currentColumn];
        const rightX = leftX + colWidth;

        // Table Header: Table Name on left, capacity/occupied "10/10" on right
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        // Right-aligned capacity / occupied format "10/10"
        const capacityStr = `${count}/${table.capacity || 10}`;
        doc.text(capacityStr, rightX, currentY, { align: 'right' });

        // Left-aligned table identifier
        doc.text(table.name, leftX, currentY);

        currentY += 4.5;

        // Guests underneath: Seat number and guest name only
        if (count === 0) {
          doc.setFont(fontName, 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text('(Sin invitados asignados)', leftX, currentY);
          currentY += lineSpacing;
        } else {
          assignedGuests.forEach((g, gIdx) => {
            doc.setFont(fontName, 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(0, 0, 0);
            doc.text(`${gIdx + 1}.  ${g.fullName}`, leftX, currentY);
            currentY += lineSpacing;
          });
        }

        currentY += bottomMargin;
      });
    }
  }

  // Save or Print the generated PDF
  const safeFilename = `Plano_Distribucion_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf`;
  
  if (shouldPrint) {
    try {
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      const iframe = document.createElement('iframe');
      iframe.id = 'isolated-pdf-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);
      
      iframe.src = typeof blobUrl === 'string' ? blobUrl : (blobUrl as any).toString();
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Error printing PDF in iframe, falling back to window.open:', e);
          const dataUri = doc.output('datauristring');
          const printWindow = window.open(dataUri, '_blank');
          printWindow?.print();
        }
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 5000);
      };
    } catch (e) {
      console.error('Failed direct PDF print, falling back to download:', e);
      doc.save(safeFilename);
    }
  } else {
    doc.save(safeFilename);
  }
}
