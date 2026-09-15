/**
 * Utility for image background removal, white halo reduction (defringing/erosion),
 * and alpha preservation for WeddingCraft Design.
 */

export interface TransparencyOptions {
  tolerance?: number;       // 10 to 90 (default: 35)
  haloReduction?: number;   // 0 to 8 px (default: 2) -> regulates border / white halo elimination
  smoothEdges?: boolean;    // smooth alpha transitions (default: true)
  edgeDefringe?: boolean;   // remove white color bleed from edge pixels (default: true)
  customBgColor?: { r: number; g: number; b: number } | null;
}

export function detectHasTransparency(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement('canvas');
    const w = Math.min(img.width || 100, 150);
    const h = Math.min(img.height || 100, 150);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 240) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function processImageTransparency(
  imageSrc: string,
  options: TransparencyOptions = {}
): Promise<string> {
  const {
    tolerance = 35,
    haloReduction = 2,
    smoothEdges = true,
    edgeDefringe = true,
    customBgColor = null
  } = options;

  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve(imageSrc);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.width;
        const h = img.height;
        if (w === 0 || h === 0) {
          resolve(imageSrc);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Auto-detect corner background color if not custom
        let targetR = 255, targetG = 255, targetB = 255;
        if (customBgColor) {
          targetR = customBgColor.r;
          targetG = customBgColor.g;
          targetB = customBgColor.b;
        } else {
          // Sample 4 corners and borders
          const samplePoints = [
            0, 1, 2, Math.min(w - 1, 4),
            (h - 1) * w, (h - 1) * w + 1, (h - 1) * w + w - 1,
            w - 1, w - 2
          ];
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (const p of samplePoints) {
            const idx = p * 4;
            if (idx < data.length) {
              sumR += data[idx];
              sumG += data[idx + 1];
              sumB += data[idx + 2];
              count++;
            }
          }
          if (count > 0) {
            targetR = sumR / count;
            targetG = sumG / count;
            targetB = sumB / count;
          }
        }

        const tolDist = (tolerance / 100) * 255 * 1.732;
        const whiteMin = Math.max(180, 255 - (tolerance * 1.1));

        // Alpha map array
        const alphaMap = new Uint8ClampedArray(w * h);

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const origA = data[i + 3];

          if (origA === 0) {
            alphaMap[p] = 0;
            continue;
          }

          // Distance to target corner background
          const distTarget = Math.sqrt(
            (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2
          );

          // Distance to pure white
          const distWhite = Math.sqrt(
            (255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2
          );

          const isNearWhite = r >= whiteMin && g >= whiteMin && b >= whiteMin;
          const minDist = Math.min(distTarget, distWhite);

          if (isNearWhite || minDist < tolDist) {
            if (smoothEdges && minDist > tolDist * 0.65) {
              const ramp = (minDist - tolDist * 0.65) / (tolDist * 0.35);
              alphaMap[p] = Math.round(origA * Math.max(0, Math.min(1, ramp)));
            } else {
              alphaMap[p] = 0;
            }
          } else {
            alphaMap[p] = origA;
          }
        }

        // Halo Reduction: Erode border and decontaminate white bleed
        if (haloReduction > 0) {
          const passes = Math.min(8, Math.max(1, Math.round(haloReduction)));
          const currentAlpha = new Uint8ClampedArray(alphaMap);
          const erodedAlpha = new Uint8ClampedArray(alphaMap);

          for (let pass = 0; pass < passes; pass++) {
            for (let y = 0; y < h; y++) {
              for (let x = 0; x < w; x++) {
                const p = y * w + x;
                if (currentAlpha[p] === 0) continue;

                // Check 4-way neighbors
                const left = x > 0 ? currentAlpha[p - 1] : 0;
                const right = x < w - 1 ? currentAlpha[p + 1] : 0;
                const top = y > 0 ? currentAlpha[p - w] : 0;
                const bottom = y < h - 1 ? currentAlpha[p + w] : 0;

                if (left === 0 || right === 0 || top === 0 || bottom === 0) {
                  // Border pixel detected!
                  // Soften or erase depending on pass
                  if (pass === 0) {
                    erodedAlpha[p] = Math.round(currentAlpha[p] * 0.35);
                  } else {
                    erodedAlpha[p] = 0;
                  }
                }
              }
            }
            currentAlpha.set(erodedAlpha);
          }

          // Apply eroded alpha and de-fringe (de-whiten) edge pixels
          for (let p = 0, i = 0; p < w * h; p++, i += 4) {
            const a = currentAlpha[p];
            data[i + 3] = a;

            if (edgeDefringe && a > 0 && a < 255) {
              const alphaNorm = a / 255;
              // Remove white bleed: un-premultiply assuming white background
              const defringeR = (data[i] - 255 * (1 - alphaNorm)) / alphaNorm;
              const defringeG = (data[i + 1] - 255 * (1 - alphaNorm)) / alphaNorm;
              const defringeB = (data[i + 2] - 255 * (1 - alphaNorm)) / alphaNorm;

              data[i] = Math.max(0, Math.min(255, Math.round(defringeR)));
              data[i + 1] = Math.max(0, Math.min(255, Math.round(defringeG)));
              data[i + 2] = Math.max(0, Math.min(255, Math.round(defringeB)));
            }
          }
        } else {
          for (let p = 0, i = 0; p < w * h; p++, i += 4) {
            data[i + 3] = alphaMap[p];
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Error processing image transparency:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => {
      resolve(imageSrc);
    };
    img.src = imageSrc;
  });
}
