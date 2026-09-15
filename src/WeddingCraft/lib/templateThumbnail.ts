import { WeddingDesignDocument, CanvasElement } from '../types';

/**
 * Generates a high-quality square (1:1) preview thumbnail image (Data URL)
 * directly from a WeddingDesignDocument using an offscreen HTML5 Canvas.
 */
export function generateDocumentSquareThumbnail(
  doc: WeddingDesignDocument,
  size = 320
): string {
  if (typeof window === 'undefined') return '';

  const canvas = window.document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const docWidth = doc.canvas?.width || 720;
  const docHeight = doc.canvas?.height || 980;
  const bgColor = doc.canvas?.backgroundColor || '#FAF8F5';

  // 1. Fill entire square with canvas background color
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Subtle outer edge shadow / card frame
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);

  // 2. Compute scaling to fit the document into the square with uniform margins
  const margin = 14;
  const targetW = size - margin * 2;
  const targetH = size - margin * 2;

  const scale = Math.min(targetW / docWidth, targetH / docHeight);
  const renderedW = docWidth * scale;
  const renderedH = docHeight * scale;
  const offsetX = (size - renderedW) / 2;
  const offsetY = (size - renderedH) / 2;

  // Background for the canvas page area
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Inner canvas bounds background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, docWidth, docHeight);

  // Subtle page outline
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, docWidth, docHeight);

  const elements = doc.pages?.[0]?.elements || [];
  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  sorted.forEach((el: CanvasElement) => {
    if (!el.visible) return;
    const { x, y, width: w, height: h } = el.transform;

    ctx.save();
    ctx.translate(x, y);
    if (el.transform.rotation) {
      ctx.rotate((el.transform.rotation * Math.PI) / 180);
    }

    const st = el.style || {};
    const ct = el.content || {};

    if (el.type === 'text') {
      const text = ct.text || '';
      const fontSize = Math.max(10, st.fontSize || 16);
      const color = st.color || '#2D2A26';
      ctx.fillStyle = color;
      ctx.font = `${st.fontStyle === 'italic' ? 'italic ' : ''}${st.fontWeight === 'bold' ? 'bold ' : ''}${fontSize}px ${st.fontFamily || 'serif'}`;
      ctx.textAlign = (st.align as CanvasTextAlign) || 'center';
      const textX = st.align === 'left' ? 0 : st.align === 'right' ? w : w / 2;
      ctx.fillText(text.slice(0, 50), textX, fontSize);
    } else if (el.type === 'interactive-button') {
      const btnBg = st.backgroundColor || '#2D3748';
      const btnColor = st.color || '#FFFFFF';
      const radius = Math.min(st.borderRadius ?? 16, h / 2);
      ctx.fillStyle = btnBg;
      ctx.beginPath();
      roundRect(ctx, 0, 0, w, h, radius);
      ctx.fill();

      ctx.fillStyle = btnColor;
      ctx.font = `bold ${Math.max(10, (st.fontSize || 13))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ct.text || 'Botón', w / 2, h / 2 + 4);
    } else if (
      el.type === 'event-ceremony-card' ||
      el.type === 'event-reception-card' ||
      el.type === 'dress-code-card' ||
      el.type === 'wishes-wall-card' ||
      el.type === 'couple-quote-contacts-card'
    ) {
      // Render card rectangle
      const cardBg = st.backgroundColor || '#FAF8F5';
      const borderCol = st.borderColor || '#EADDCE';
      const cardRadius = Math.min(st.borderRadius ?? 16, 20);
      ctx.fillStyle = cardBg;
      ctx.beginPath();
      roundRect(ctx, 0, 0, w, h, cardRadius);
      ctx.fill();
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = st.strokeWidth || 1;
      ctx.stroke();

      // Card Badge
      const badgeText = ct.badge || (
        el.type === 'dress-code-card' ? '👔 Código de Vestimenta' :
        el.type === 'wishes-wall-card' ? '💌 Muro de los Deseos' :
        el.type === 'couple-quote-contacts-card' ? '💍 Frase & Contactos' : '⛪ Detalles del Evento'
      );
      ctx.fillStyle = st.accentColor || '#C5A880';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, w / 2, 22);

      // Card Title
      const titleText = ct.title || ct.styleName || ct.coupleNames || ct.venueName || 'Detalles';
      ctx.fillStyle = st.titleColor || '#2D2A26';
      ctx.font = `bold 14px ${st.titleFontFamily || 'serif'}`;
      ctx.textAlign = 'center';
      ctx.fillText(titleText, w / 2, 44);

      // Card Body snippet
      const bodyText = ct.description || ct.quote || ct.contactPhone || ct.time || '';
      if (bodyText) {
        ctx.fillStyle = st.color || '#524B42';
        ctx.font = '11px sans-serif';
        ctx.fillText(bodyText.slice(0, 36) + (bodyText.length > 36 ? '...' : ''), w / 2, 64);
      }
    } else if (el.type === 'countdown-widget') {
      const cardRadius = 10;
      ctx.fillStyle = st.backgroundColor || '#EBEBEB';
      ctx.beginPath();
      roundRect(ctx, 0, 0, w, h, cardRadius);
      ctx.fill();
      ctx.strokeStyle = st.borderColor || '#CBD5E1';
      ctx.stroke();

      ctx.fillStyle = st.titleColor || '#8C8276';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ct.title || 'CUENTA REGRESIVA', w / 2, 18);

      // Mini 4 boxes
      const boxW = (w - 30) / 4;
      for (let i = 0; i < 4; i++) {
        const bx = 10 + i * (boxW + 4);
        ctx.fillStyle = '#FFFFFF';
        roundRect(ctx, bx, 26, boxW, h - 34, 6);
        ctx.fill();
      }
    } else if (el.type === 'image' || el.type === 'image-frame') {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      roundRect(ctx, 0, 0, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.stroke();
    } else if (el.type === 'svg-shape') {
      ctx.fillStyle = st.fill || st.backgroundColor || '#E2E8F0';
      roundRect(ctx, 0, 0, w, h, 6);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * Captures live Konva stage snapshot and fits it neatly onto a square canvas.
 */
export function captureStageSquareThumbnail(stage: any, doc: WeddingDesignDocument, size = 320): string {
  if (!stage || typeof window === 'undefined') {
    return generateDocumentSquareThumbnail(doc, size);
  }

  try {
    const dataUrl = stage.toDataURL({ pixelRatio: 1 });
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return generateDocumentSquareThumbnail(doc, size);
    }

    const canvas = window.document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return generateDocumentSquareThumbnail(doc, size);

    const bgColor = doc.canvas?.backgroundColor || '#FAF8F5';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const img = new Image();
    img.src = dataUrl;

    // Draw synchronously if available or return dataUrl
    const scale = Math.min((size - 16) / stage.width(), (size - 16) / stage.height());
    const w = stage.width() * scale;
    const h = stage.height() * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;

    ctx.drawImage(img, x, y, w, h);
    return canvas.toDataURL('image/png');
  } catch {
    return generateDocumentSquareThumbnail(doc, size);
  }
}

/**
 * Helper to draw rounded rectangle in Canvas2D
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
