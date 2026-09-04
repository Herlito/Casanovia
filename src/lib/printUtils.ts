/**
 * Utility to print or export HTML nodes in an isolated iframe context.
 * This completely isolates the printable document from the parent app DOM,
 * eliminating blank pages caused by parent scroll offsets, hidden root layout heights,
 * or background modals.
 */

export const printElementById = (elementId: string, docTitle: string = 'Documento'): Promise<boolean> => {
  return new Promise((resolve) => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      console.warn(`[printUtils] Element with id "${elementId}" not found. Falling back to window.print()`);
      window.print();
      resolve(false);
      return;
    }

    // Clean up any existing print iframes
    const existingIframe = document.getElementById('isolated-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create an invisible iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'isolated-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.warn('[printUtils] Could not access iframe document. Falling back to window.print()');
      iframe.remove();
      window.print();
      resolve(false);
      return;
    }

    // Collect all head stylesheets and inline styles
    const styles: string[] = [];
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((node) => {
      styles.push(node.outerHTML);
    });

    // Construct isolated HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${docTitle}</title>
          ${styles.join('\n')}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              color: #000000 !important;
              width: 100% !important;
              min-width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            #isolated-print-content {
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              position: static !important;
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            .no-print, [data-no-print="true"] {
              display: none !important;
            }
            .item-listado,
            .print-avoid-break,
            .print-card,
            .print-row,
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            h1, h2, h3, h4, h5, h6 {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
            table {
              border-collapse: collapse !important;
              width: 100% !important;
              break-inside: auto !important;
              page-break-inside: auto !important;
            }
            thead {
              display: table-header-group !important;
            }
            tfoot {
              display: table-footer-group !important;
            }
          </style>
        </head>
        <body>
          <div id="isolated-print-content">
            ${targetElement.outerHTML}
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Trigger printing once the iframe has rendered
    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve(true);
      } catch (err) {
        console.error('[printUtils] Print error in iframe:', err);
        window.print();
        resolve(false);
      } finally {
        // Cleanup after printing dialog closes
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 2000);
      }
    };

    // Wait for styles/fonts to be parsed
    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(triggerPrint, 200);
    } else {
      iframe.onload = () => {
        setTimeout(triggerPrint, 200);
      };
      // Fallback timeout in case onload doesn't fire
      setTimeout(triggerPrint, 400);
    }
  });
};
