const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanExportPdf.ts', 'utf8');

code = code.replace(
`    const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;`,
`    const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;`
); // Actually I can just add `const margin = 14;` outside.

code = code.replace(
`  const doc = new jsPDF({
    orientation: exportMode === 'list_only' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });`,
`  const doc = new jsPDF({
    orientation: exportMode === 'list_only' ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  const margin = 14;`
);

code = code.replace(
`    // ----------------------------------------------------
    // PAGE 1: FLOOR PLAN (LANDSCAPE)
    // ----------------------------------------------------
    const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;`,
`    // ----------------------------------------------------
    // PAGE 1: FLOOR PLAN (LANDSCAPE)
    // ----------------------------------------------------
    const pageWidth = 297;
    const pageHeight = 210;`
);

fs.writeFileSync('src/components/floorplan/FloorPlanExportPdf.ts', code);
