const fs = require('fs');
let code = fs.readFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', 'utf8');

code = code.replace(
`  const handleExportPdf = async () => {`,
`  const handleExportPdf = async (mode: 'all' | 'plan_only' | 'list_only' = 'all') => {
    setShowExportMenu(false);`
);

code = code.replace(
`      await exportFloorPlanToPdf({
        plan: planPayload,
        settings,
        canvasElement: canvas,
        weddingTitle,
      });`,
`      await exportFloorPlanToPdf({
        plan: planPayload,
        settings,
        canvasElement: canvas,
        weddingTitle,
        exportMode: mode,
      });`
);

fs.writeFileSync('src/components/floorplan/FloorPlanDesignerModal.tsx', code);
