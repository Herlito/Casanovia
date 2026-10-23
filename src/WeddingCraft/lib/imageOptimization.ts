import { CanvasElement, WeddingDesignDocument } from '../types';
import { uploadImageToHost } from '../../lib/selfHostedApi';
import { detectHasTransparency } from './imageTransparency';

export interface OptimizeImageOptions {
  maxDimension?: number;
  quality?: number;
  forcePng?: boolean;
  prefix?: string;
  eventId?: string;
}

/**
 * Normalizes and converts an image to web-standard 72 DPI resolution.
 * - For images with alpha transparency (PNG, WebP with alpha, cutout graphics, floral borders),
 *   preserves transparency and exports as PNG.
 * - For opaque photos and backgrounds, compresses to high-efficiency JPEG (quality 0.85).
 * - Uploads the optimized asset to Casanovia hosting backend (/uploads/) so that it is permanently accessible.
 * - If offline or server error occurs, falls back to the compressed 72 DPI data URL (<100KB).
 */
export async function optimizeImageTo72Dpi(
  src: string,
  options: OptimizeImageOptions = {}
): Promise<{ url: string; dataUrl: string; isCloudUrl: boolean }> {
  if (!src || typeof src !== 'string') {
    return { url: src, dataUrl: src, isCloudUrl: false };
  }

  // Already hosted on casanovia.pe or external CDN, and not a local blob/base64
  if (!src.startsWith('data:image/') && !src.startsWith('blob:') && (src.includes('/uploads/') || src.startsWith('http'))) {
    return { url: src, dataUrl: src, isCloudUrl: true };
  }

  const {
    maxDimension = 1440,
    quality = 0.85,
    forcePng = false,
    prefix = 'img',
    eventId = 'wedding'
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallbackTimeout = setTimeout(() => {
      resolve({ url: src, dataUrl: src, isCloudUrl: false });
    }, 6000);

    img.onerror = () => {
      clearTimeout(fallbackTimeout);
      resolve({ url: src, dataUrl: src, isCloudUrl: false });
    };

    img.onload = async () => {
      clearTimeout(fallbackTimeout);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          resolve({ url: src, dataUrl: src, isCloudUrl: false });
          return;
        }

        // Calculate 72 DPI screen bounding scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ url: src, dataUrl: src, isCloudUrl: false });
          return;
        }

        // Determine if image contains alpha transparency
        const isPngOrWebp = src.startsWith('data:image/png') || 
                            src.startsWith('data:image/webp') || 
                            src.startsWith('data:image/svg+xml') || 
                            src.toLowerCase().includes('.png') || 
                            src.toLowerCase().includes('.webp');
        const hasTransparency = forcePng || isPngOrWebp || detectHasTransparency(img);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (hasTransparency) {
          // Transparent background for PNG/Graphics/Stickers
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = 'image/png';
          const optimizedDataUrl = canvas.toDataURL(mimeType);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
              return;
            }

            try {
              const filename = `${prefix}_${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.png`;
              const file = new File([blob], filename, { type: 'image/png' });
              const uploadRes = await uploadImageToHost(file, filename);

              if (uploadRes && uploadRes.success && uploadRes.url) {
                resolve({ url: uploadRes.url, dataUrl: optimizedDataUrl, isCloudUrl: true });
              } else {
                resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
              }
            } catch (err) {
              resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
            }
          }, mimeType);
        } else {
          // Opaque image (photos, JPEGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = 'image/jpeg';
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
              return;
            }

            try {
              const filename = `${prefix}_${eventId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;
              const file = new File([blob], filename, { type: 'image/jpeg' });
              const uploadRes = await uploadImageToHost(file, filename);

              if (uploadRes && uploadRes.success && uploadRes.url) {
                resolve({ url: uploadRes.url, dataUrl: optimizedDataUrl, isCloudUrl: true });
              } else {
                resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
              }
            } catch (err) {
              resolve({ url: optimizedDataUrl, dataUrl: optimizedDataUrl, isCloudUrl: false });
            }
          }, mimeType, quality);
        }
      } catch (err) {
        resolve({ url: src, dataUrl: src, isCloudUrl: false });
      }
    };

    img.src = src;
  });
}

/**
 * Optimizes all images across a WeddingDesignDocument prior to saving or publishing:
 * - Converts heavy images (e.g. 10MB camera uploads) to 72 DPI
 * - Preserves transparency for PNG/cutouts/stickers
 * - Normalizes layer zIndexes
 * - Uploads images to hosting so public guest visitors don't rely on local browser memory
 */
export async function optimizeDocumentImagesForPublish(
  doc: WeddingDesignDocument,
  eventId: string
): Promise<WeddingDesignDocument> {
  if (!doc?.pages?.[0]?.elements) return doc;
  const clone: WeddingDesignDocument = JSON.parse(JSON.stringify(doc));
  const elements: CanvasElement[] = clone.pages[0].elements;

  const tasks: Promise<void>[] = [];

  // 1. Optimize Canvas Background Image
  const bgImage = clone.canvas?.backgroundImage;
  if (bgImage && typeof bgImage === 'string' && (bgImage.startsWith('blob:') || bgImage.startsWith('data:image/') || bgImage.length > 5000)) {
    tasks.push(
      (async () => {
        const res = await optimizeImageTo72Dpi(bgImage, {
          maxDimension: 1600,
          quality: 0.85,
          prefix: 'canvas_bg',
          eventId
        });
        if (clone.canvas) {
          clone.canvas.backgroundImage = res.url;
        }
      })()
    );
  }

  const webBgImage = (clone.canvas as any)?.webBackgroundImage;
  if (webBgImage && typeof webBgImage === 'string' && (webBgImage.startsWith('blob:') || webBgImage.startsWith('data:image/') || webBgImage.length > 5000)) {
    tasks.push(
      (async () => {
        const res = await optimizeImageTo72Dpi(webBgImage, {
          maxDimension: 1600,
          quality: 0.85,
          prefix: 'web_bg',
          eventId
        });
        if (clone.canvas) {
          (clone.canvas as any).webBackgroundImage = res.url;
        }
      })()
    );
  }

  // 2. Optimize Elements (Images, Frames, Stickers, Badges)
  elements.forEach((el) => {
    // A. Standard Image Element
    if (el.type === 'image' && el.content) {
      const src = el.content.src || el.content.originalSrc;
      if (src && typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:image/') || src.length > 5000)) {
        tasks.push(
          (async () => {
            const isTransparentImg = Boolean(
              el.content?.isTransparent ||
              src.startsWith('data:image/png') ||
              src.startsWith('data:image/webp') ||
              src.startsWith('data:image/svg') ||
              src.toLowerCase().includes('.png') ||
              src.toLowerCase().includes('.webp')
            );
            const res = await optimizeImageTo72Dpi(src, {
              maxDimension: Math.max(1200, (el.transform?.width || 400) * 2),
              quality: 0.85,
              forcePng: isTransparentImg,
              prefix: `el_${el.type}`,
              eventId
            });
            if (el.content) {
              el.content.src = res.url;
              el.content.originalSrc = res.url;
              if (isTransparentImg) {
                el.content.isTransparent = true;
              }
            }
          })()
        );
      }
    }

    // B. Image Frame Element
    if (el.type === 'image-frame' && el.content) {
      const src = el.content.imageSrc;
      if (src && typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:image/') || src.length > 5000)) {
        tasks.push(
          (async () => {
            const res = await optimizeImageTo72Dpi(src, {
              maxDimension: Math.max(1200, (el.transform?.width || 400) * 2),
              quality: 0.85,
              prefix: 'frame_photo',
              eventId
            });
            if (el.content) {
              el.content.imageSrc = res.url;
            }
          })()
        );
      }
    }

    // C. Avatar / Photo URL in other widgets
    if (el.content?.avatarUrl && typeof el.content.avatarUrl === 'string' && (el.content.avatarUrl.startsWith('blob:') || el.content.avatarUrl.startsWith('data:image/'))) {
      tasks.push(
        (async () => {
          const res = await optimizeImageTo72Dpi(el.content!.avatarUrl, {
            maxDimension: 600,
            quality: 0.85,
            prefix: 'avatar',
            eventId
          });
          if (el.content) {
            el.content.avatarUrl = res.url;
          }
        })()
      );
    }

    // D. Decorative / Background in Shapes
    if (el.content?.bgImage && typeof el.content.bgImage === 'string' && (el.content.bgImage.startsWith('blob:') || el.content.bgImage.startsWith('data:image/'))) {
      tasks.push(
        (async () => {
          const res = await optimizeImageTo72Dpi(el.content!.bgImage, {
            maxDimension: 1200,
            quality: 0.85,
            prefix: 'shape_bg',
            eventId
          });
          if (el.content) {
            el.content.bgImage = res.url;
          }
        })()
      );
    }
  });

  // Wait for all image conversions and uploads to complete concurrently
  await Promise.all(tasks);

  // Guarantee sequential layer indexing
  elements.forEach((el, index) => {
    el.zIndex = index + 1;
  });

  return clone;
}
