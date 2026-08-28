const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanExportPdf.ts', 'utf8');

code = code.replace(/interface ExportPdfOptions \{/, "export type PdfExportMode = 'all' | 'plan_only' | 'list_only';\n\ninterface ExportPdfOptions {\n  exportMode?: PdfExportMode;");
code = code.replace(/export async function exportFloorPlanToPdf\(\{([^}]*)\}: ExportPdfOptions\): Promise<void> \{/, "export async function exportFloorPlanToPdf({$1, exportMode = 'all'}: ExportPdfOptions): Promise<void> {");

// The plan page generation block
code = code.replace(/\/\/ Header Band/g, "if (exportMode === 'all' || exportMode === 'plan_only') {\n  // Header Band");

// Find where table pages begin. It is: "  const tableElements = plan.elements.filter("
// Wait, the whole first page is the plan, and then doc.addPage is called for tables.
// We can just wrap the first page logic in `if (exportMode !== 'list_only')` and the rest in `if (exportMode !== 'plan_only')`.

code = fs.readFileSync('src/components/floorplan/FloorPlanExportPdf.ts', 'utf8');
code = code.replace(/interface ExportPdfOptions \{/, "export type PdfExportMode = 'all' | 'plan_only' | 'list_only';\n\ninterface ExportPdfOptions {\n  exportMode?: PdfExportMode;");

// Wait, doing this via script might be messy. Let's just use sed or edit_file.
