import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Set standard worker CDN or embedded worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('[PDF.js] Worker setup fallback notice:', e);
  }
}

/**
 * Converts the first page of a PDF file to a high-resolution image Data URL (PNG/JPEG)
 */
export async function renderPdfFirstPageToImage(
  file: File,
  scale = 2.0
): Promise<{ dataUrl: string; width: number; height: number; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('No se pudo inicializar el contexto de renderizado 2D');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background for PDF blueprints with transparent background
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    // @ts-expect-error pdfjs typing compatibility
    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);

    return {
      dataUrl,
      width: viewport.width,
      height: viewport.height,
      pageCount,
    };
  } catch (err) {
    console.error('Error renderizando PDF con PDF.js:', err);
    throw new Error('No se pudo procesar el archivo PDF. Verifica que no tenga contraseña o esté corrupto.');
  }
}
