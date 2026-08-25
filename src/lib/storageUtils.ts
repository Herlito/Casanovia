import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Normalizes and compresses an image (especially QR codes) on an HTML5 canvas.
 * Sets a white background to avoid transparent modules becoming dark,
 * and maintains optimal crispness and low payload.
 */
export async function processAndOptimizeQrImage(
  file: File,
  maxDimension = 700
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen inválido o archivo corrupto'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de imagen'));
          return;
        }

        // Fill with white background for clear QR scanning
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png');
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Error al procesar el archivo optimizado'));
            }
          },
          'image/png'
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads QR code to Firebase Storage and returns the public download URL.
 * Falls back safely to optimized light data URL if storage is unavailable.
 */
export async function uploadQrToCloudStorage(
  file: File,
  onProgress?: (status: string) => void
): Promise<{ url: string; isCloudStorage: boolean }> {
  onProgress?.('Optimizando imagen...');
  const { blob, dataUrl } = await processAndOptimizeQrImage(file);

  try {
    onProgress?.('Subiendo a Firebase Cloud Storage...');
    const filename = `system_qr/official_payment_qr_${Date.now()}.png`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob, {
      contentType: 'image/png',
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        purpose: 'official_payment_qr',
      },
    });

    const downloadUrl = await getDownloadURL(storageRef);
    return {
      url: downloadUrl,
      isCloudStorage: true,
    };
  } catch (storageError) {
    console.warn('[Firebase Storage] Fallback to optimized cloud data payload:', storageError);
    // If Firebase Storage is blocked or offline, use the optimized base64 (< 50KB)
    return {
      url: dataUrl,
      isCloudStorage: false,
    };
  }
}
