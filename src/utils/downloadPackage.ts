/**
 * Utility to reliably download .tar.gz and .zip deployment archives
 * ensuring real binary data (avoiding cached or fallback 10KB HTML files).
 */
export async function downloadPackage(
  filename: string,
  onStatusChange?: (status: { loading: boolean; text?: string; error?: string }) => void
): Promise<boolean> {
  if (onStatusChange) {
    onStatusChange({ loading: true, text: 'Conectando...' });
  }

  try {
    // 1. Fetch with cache-busting timestamp and no-cache headers
    const url = `/${filename}?t=${Date.now()}`;
    if (onStatusChange) {
      onStatusChange({ loading: true, text: 'Descargando paquete (~2.5 MB)...' });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/gzip, application/octet-stream, application/zip, */*',
        'Cache-Control': 'no-cache, no-store'
      }
    });

    if (!response.ok) {
      throw new Error(`El servidor devolvió código ${response.status} al solicitar ${filename}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('El servidor devolvió HTML en vez del archivo comprimido.');
    }

    const blob = await response.blob();

    // Check size - if it's ~10KB and contains HTML, reject it
    if (blob.size < 100 * 1024) {
      const sampleText = await blob.text();
      if (sampleText.includes('<!DOCTYPE') || sampleText.includes('<html')) {
        throw new Error('El archivo recibido es una página HTML residual (~10 KB). Por favor intenta de nuevo.');
      }
    }

    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    if (onStatusChange) {
      onStatusChange({ loading: true, text: `Guardando ${filename} (${sizeMb} MB)...` });
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 1500);

    if (onStatusChange) {
      onStatusChange({ loading: false, text: `¡Descargado (${sizeMb} MB)!` });
    }
    return true;
  } catch (err: any) {
    console.error('Error al descargar paquete:', err);
    if (onStatusChange) {
      onStatusChange({ loading: false, error: err.message || 'Error al descargar archivo' });
    }
    return false;
  }
}
