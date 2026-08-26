import { jsPDF } from 'jspdf';
import { WeddingFloorPlan, WeddingSettings } from '../../types';

interface ExportPdfOptions {
  plan: WeddingFloorPlan;
  settings: WeddingSettings;
  canvasElement: HTMLCanvasElement | null;
  weddingTitle: string;
}

export async function exportFloorPlanToPdf({
  plan,
  settings,
  canvasElement,
  weddingTitle,
}: ExportPdfOptions): Promise<void> {
  if (!canvasElement) {
    throw new Error('Canvas no disponible para exportar');
  }

  // Create high quality snapshot of the canvas
  const canvasDataUrl = canvasElement.toDataURL('image/png', 1.0);

  // Initialize jsPDF in Landscape mode A4 (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;

  // Background accent banner
  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header band
  doc.setFillColor(139, 58, 74); // #8B3A4A (Burgundy Brand)
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CASANOVIA • PLANO OFICIAL DE DISTRIBUCIÓN & PROTOCOLO', margin, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Generado: ${dateStr}`, pageWidth - margin - 45, 11);

  // Subtitle / Wedding info
  doc.setTextColor(45, 42, 38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleText = weddingTitle || settings.coupleNames || `${settings.brideName || ''} & ${settings.groomName || ''}`.trim() || 'Nuestra Boda';
  doc.text(`Boda: ${titleText}`, margin, 26);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 100, 90);
  
  const tablesCount = plan.elements.filter(
    (e) => e.type === 'round_table' || e.type === 'rectangular_table'
  ).length;
  const totalSeats = plan.elements
    .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
    .reduce((acc, e) => acc + (e.seats?.length || e.seatCount || 0), 0);
  const assignedSeats = plan.elements
    .filter((e) => e.type === 'round_table' || e.type === 'rectangular_table')
    .reduce((acc, e) => acc + (e.seats?.filter((s) => s.guestId)?.length || 0), 0);

  const venueNameStr = settings.receptionVenue?.name || settings.locationSummary || '';
  const venueInfo = venueNameStr ? `Lugar: ${venueNameStr} | ` : '';
  const scaleInfo = plan.scale.isCalibrated
    ? `Escala calibrada: 1m = ${plan.scale.pixelsPerMeter.toFixed(1)}px | `
    : '';
  doc.text(
    `${venueInfo}${scaleInfo}Total Mesas: ${tablesCount} | Total Asientos: ${totalSeats} | Invitados Asignados: ${assignedSeats}`,
    margin,
    31
  );

  // Insert Canvas Image
  const imgMarginX = margin;
  const imgMarginY = 34;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - imgMarginY - 12;

  // Aspect ratio calculation
  const imgRatio = canvasElement.width / canvasElement.height;
  let renderWidth = availableWidth;
  let renderHeight = renderWidth / imgRatio;

  if (renderHeight > availableHeight) {
    renderHeight = availableHeight;
    renderWidth = renderHeight * imgRatio;
  }

  const posX = margin + (availableWidth - renderWidth) / 2;
  const posY = imgMarginY + (availableHeight - renderHeight) / 2;

  // Border frame for plan
  doc.setDrawColor(217, 206, 191);
  doc.setLineWidth(0.5);
  doc.rect(posX - 1, posY - 1, renderWidth + 2, renderHeight + 2);

  // Add canvas image
  doc.addImage(canvasDataUrl, 'PNG', posX, posY, renderWidth, renderHeight);

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(140, 130, 118);
  doc.text(
    'Plano de montaje e infraestructura para banquetes y protocolo. Casanovia Wedding System.',
    margin,
    pageHeight - 5
  );

  // ==========================================
  // PAGE 2: DETAILED SEATING BREAKDOWN
  // ==========================================
  const tableElements = plan.elements.filter(
    (e) => e.type === 'round_table' || e.type === 'rectangular_table'
  );

  if (tableElements.length > 0) {
    doc.addPage('a4', 'portrait');
    const portWidth = 210;
    const portHeight = 297;

    // Header Band
    doc.setFillColor(139, 58, 74);
    doc.rect(0, 0, portWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('LISTADO DETALLADO DE MESAS Y ASIENTOS', margin, 11);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${weddingTitle} • Montaje y Catering`, portWidth - margin - 55, 11);

    let currentY = 28;

    tableElements.forEach((table, tableIdx) => {
      // Check page overflow
      if (currentY > portHeight - 45) {
        doc.addPage('a4', 'portrait');
        currentY = 24;
      }

      // Table Header Card
      const assignedInTable = table.seats.filter((s) => s.guestId);
      doc.setFillColor(243, 239, 234);
      doc.roundedRect(margin, currentY, portWidth - margin * 2, 8, 2, 2, 'F');
      doc.setDrawColor(217, 206, 191);
      doc.roundedRect(margin, currentY, portWidth - margin * 2, 8, 2, 2, 'S');

      doc.setTextColor(45, 42, 38);
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
      doc.setTextColor(110, 100, 90);
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
          currentY = 24;
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 58, 74);
        doc.text(`Asiento #${seat.seatNumber}:`, margin + 6, currentY);

        doc.setFont('helvetica', 'normal');
        if (seat.guestId && seat.guestName) {
          doc.setTextColor(45, 42, 38);
          let guestLabel = seat.guestName;
          if (seat.companionCount && seat.companionCount > 1) {
            guestLabel += ` (+${seat.companionCount - 1} pases)`;
          }
          if (seat.dietaryRequirement) {
            guestLabel += ` [Dieta: ${seat.dietaryRequirement}]`;
          }
          doc.text(guestLabel, margin + 28, currentY);
        } else {
          doc.setTextColor(160, 150, 140);
          doc.text('— Asiento Disponible / Vacío —', margin + 28, currentY);
        }

        // Dotted divider line
        doc.setDrawColor(235, 230, 222);
        doc.setLineDashPattern([1, 1], 0);
        doc.line(margin + 4, currentY + 2, portWidth - margin - 4, currentY + 2);
        doc.setLineDashPattern([], 0);

        currentY += 5.5;
      });

      currentY += 5;
    });
  }

  // Save the generated PDF
  const safeFilename = `Plano_Distribucion_Boda_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf`;
  doc.save(safeFilename);
}
