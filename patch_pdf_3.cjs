const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanExportPdf.ts', 'utf8');

code = code.replace(/  \/\/ Save the generated PDF[\s\S]*$/, 
`  }

  // Save the generated PDF
  const safeFilename = \`Plano_Distribucion_Boda_\${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf\`;
  doc.save(safeFilename);
}`);

fs.writeFileSync('src/components/floorplan/FloorPlanExportPdf.ts', code);
