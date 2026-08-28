const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanExportPdf.ts', 'utf8');

code = code.replace(
`  // ==========================================
  // PAGE 2: DETAILED SEATING BREAKDOWN
  // ==========================================`,
`  } // end of if (exportMode === 'all' || exportMode === 'plan_only')

  if (exportMode === 'all' || exportMode === 'list_only') {
  // ==========================================
  // PAGE 2: DETAILED SEATING BREAKDOWN
  // ==========================================`
);

// We need to change `doc.addPage('a4', 'portrait');` to conditionally add if not `list_only`
code = code.replace(
`  if (tableElements.length > 0) {
    doc.addPage('a4', 'portrait');`,
`  if (tableElements.length > 0) {
    if (exportMode === 'all') {
      doc.addPage('a4', 'portrait');
    }`
);

// We need to close the `if (exportMode === 'all' || exportMode === 'list_only') {` at the end of the file
code = code.replace(/doc\.save\(.*?;\n\}/, "  }\n  doc.save(`Plano_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);\n}");

fs.writeFileSync('src/components/floorplan/FloorPlanExportPdf.ts', code);
