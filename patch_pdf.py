import re

with open('src/components/floorplan/FloorPlanExportPdf.ts', 'r') as f:
    code = f.read()

# Remove 'Boda: ' from the title text
code = code.replace(
    "doc.text(`Boda: ${titleText}`, margin, 26);",
    "doc.text(titleText, margin, 26);"
)

# Maximize the canvas size on the A4 page
code = code.replace(
    "const availableWidth = pageWidth - margin * 2;",
    "const availableWidth = exportMode === 'plan_only' ? pageWidth - 10 : pageWidth - margin * 2;"
)
code = code.replace(
    "const availableHeight = pageHeight - imgMarginY - 12;",
    "const availableHeight = exportMode === 'plan_only' ? pageHeight - imgMarginY - 5 : pageHeight - imgMarginY - 12;"
)
code = code.replace(
    "const posX = margin + (availableWidth - renderWidth) / 2;",
    "const posX = (exportMode === 'plan_only' ? 5 : margin) + (availableWidth - renderWidth) / 2;"
)

# Fix the filename to not hardcode "Boda"
code = code.replace(
    "const safeFilename = `Plano_Distribucion_Boda_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf`;",
    "const safeFilename = `Plano_Distribucion_${weddingTitle.replace(/[^a-zA-Z0-9]/g, '_') || 'Casanovia'}.pdf`;"
)

with open('src/components/floorplan/FloorPlanExportPdf.ts', 'w') as f:
    f.write(code)

print("Patched FloorPlanExportPdf.ts")
