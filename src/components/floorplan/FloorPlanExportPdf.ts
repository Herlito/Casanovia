import { jsPDF } from 'jspdf';
import { WeddingFloorPlan, WeddingSettings, FloorPlanElement, FloorPlanSeat } from '../../types';

export type PdfExportMode = 'all' | 'plan_only' | 'list_only';

interface ExportPdfOptions {
  plan: WeddingFloorPlan;
  settings: WeddingSettings;
  canvasElement: HTMLCanvasElement | null;
  weddingTitle: string;
  exportMode?: PdfExportMode;
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
function renderCleanFloorPlanCanvas(plan: WeddingFloorPlan, weddingTitle: string): HTMLCanvasElement {
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

  // Stats calculation
  const tablesCount = plan.elements.filter(
    (e) => e.type === 'round_table' || e.type === 'rectangular_table'
  ).length;
  const totalSeats = plan.elements
    .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
    .reduce((acc, e) => acc + (e.seats?.length || e.seatCount || 0), 0);
  const assignedSeats = plan.elements
    .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
    .reduce((acc, e) => acc + (e.seats?.filter((s) => s.guestId)?.length || 0), 0);

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
      case 'sofa_2_seat': {
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

export async function exportFloorPlanToPdf({
  plan,
  settings,
  weddingTitle,
  exportMode = 'all',
}: ExportPdfOptions): Promise<void> {
  const margin = 14;

  // Generate high-resolution, black-and-white line-art canvas adjusted 100% to A4 horizontal sheet
  const cleanCanvas = renderCleanFloorPlanCanvas(plan, weddingTitle);
  const cleanCanvasDataUrl = cleanCanvas.toDataURL('image/png', 1.0);

  // If we ONLY want the guest list, start directly in portrait
  const doc = new jsPDF({
    orientation: exportMode === 'list_only' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  if (exportMode === 'all' || exportMode === 'plan_only') {
    // ----------------------------------------------------
    // PAGE 1: FLOOR PLAN (LANDSCAPE - 100% A4 FIT, WHITE BACKGROUND, BLACK/GRAY)
    // ----------------------------------------------------
    const pageWidth = 297;
    const pageHeight = 210;

    // Pure white page background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add canvas image filling 100% of the horizontal A4 sheet
    doc.addImage(cleanCanvasDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  }

  if (exportMode === 'all' || exportMode === 'list_only') {
    // ==========================================
    // PAGE 2+: DETAILED SEATING BREAKDOWN (CLEAN BLACK AND WHITE)
    // ==========================================
    const tableElements = plan.elements.filter(
      (e) => e.type === 'round_table' || e.type === 'rectangular_table'
    );

    if (tableElements.length > 0) {
      if (exportMode === 'all') {
        doc.addPage('a4', 'portrait');
      }
      const portWidth = 210;
      const portHeight = 297;

      // Pure White Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, portWidth, portHeight, 'F');

      // Minimalist Header in Pure Black / Gray
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('LISTADO DETALLADO DE MESAS Y ASIENTOS', margin, 14);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`${weddingTitle} • Montaje y Catering`, portWidth - margin - 55, 14);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, 18, portWidth - margin, 18);

      let currentY = 26;

      tableElements.forEach((table, tableIdx) => {
        // Check page overflow
        if (currentY > portHeight - 45) {
          doc.addPage('a4', 'portrait');
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, portWidth, portHeight, 'F');
          currentY = 20;
        }

        // Table Header Card: White background, simple black border
        const assignedInTable = table.seats.filter((s) => s.guestId);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, currentY, portWidth - margin * 2, 8, 1, 1, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, currentY, portWidth - margin * 2, 8, 1, 1, 'S');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const shapeText = table.type === 'round_table' ? 'Mesa Redonda' : 'Mesa Rectangular/Imperial';
        doc.text(
          `Mesa: ${table.name || `Mesa ${table.tableNumber || tableIdx + 1}`} (${shapeText})`,
          margin + 4,
          currentY + 5.5
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text(
          `Capacidad: ${table.seats.length} asientos | Ocupados: ${assignedInTable.length}`,
          portWidth - margin - 65,
          currentY + 5.5
        );

        currentY += 11;

        // Table Seats Details
        table.seats.forEach((seat) => {
          if (currentY > portHeight - 20) {
            doc.addPage('a4', 'portrait');
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, portWidth, portHeight, 'F');
            currentY = 20;
          }

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`Asiento #${seat.seatNumber}:`, margin + 6, currentY);

          doc.setFont('helvetica', 'normal');
          if (seat.guestId && seat.guestName) {
            doc.setTextColor(0, 0, 0);
            let guestLabel = seat.guestName;
            if (seat.companionCount && seat.companionCount > 1) {
              guestLabel += ` (+${seat.companionCount - 1} pases)`;
            }
            if (seat.dietaryRequirement) {
              guestLabel += ` [Dieta: ${seat.dietaryRequirement}]`;
            }
            doc.text(guestLabel, margin + 28, currentY);
          } else {
            doc.setTextColor(120, 120, 120);
            doc.text('— Asiento Disponible / Vacío —', margin + 28, currentY);
          }

          // Dotted divider line
          doc.setDrawColor(200, 200, 200);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(margin + 4, currentY + 2, portWidth - margin - 4, currentY + 2);
          doc.setLineDashPattern([], 0);

          currentY += 5.5;
        });

        currentY += 5;
      });
    }
  }

  // Save the generated PDF
  const safeFilename = `Plano_Distribucion_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf`;
  doc.save(safeFilename);
}
