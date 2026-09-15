/**
 * Casanovia Self-Hosted API Client
 * Permite que la app se comunique directamente con la base de datos propia de tu servidor en casanovia.pe
 */

// Detectar si el backend PHP está disponible en el mismo host
let isApiAvailableCache: boolean | null = null;

export async function isSelfHostedBackendAvailable(): Promise<boolean> {
  if (isApiAvailableCache !== null) return isApiAvailableCache;
  try {
    const res = await fetch('/api/status.php', { method: 'GET', cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      isApiAvailableCache = data && data.success === true;
      if (isApiAvailableCache) {
        console.info('🚀 Conectado exitosamente a la Base de Datos y Backend Propio en tu Servidor:', data.domain);
      }
      return isApiAvailableCache;
    }
  } catch (e) {
    isApiAvailableCache = false;
  }
  return false;
}

/**
 * Subida de imágenes a la carpeta uploads/ de tu propio servidor
 */
export async function uploadImageToHost(file: File | Blob, filename?: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file, filename || 'imagen_novios.png');

    const res = await fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('No se pudo subir la imagen al backend propio:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Guardar o actualizar datos de la boda en la base de datos de tu hosting
 */
export async function saveWeddingToHost(weddingData: any): Promise<boolean> {
  try {
    const isAvailable = await isSelfHostedBackendAvailable();
    if (!isAvailable) return false;

    const res = await fetch('/api/weddings.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weddingData)
    });
    return res.ok;
  } catch (e) {
    console.warn('Error guardando en el backend propio:', e);
    return false;
  }
}

/**
 * Guardar o actualizar un invitado en la base de datos de tu hosting
 */
export async function saveGuestToHost(guestData: any): Promise<boolean> {
  try {
    const isAvailable = await isSelfHostedBackendAvailable();
    if (!isAvailable) return false;

    const res = await fetch('/api/guests.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guestData)
    });
    return res.ok;
  } catch (e) {
    console.warn('Error guardando invitado en hosting propio:', e);
    return false;
  }
}

/**
 * Registrar confirmación de asistencia RSVP en tu hosting
 */
export async function submitRsvpToHost(guestId: string, status: string, companions: number, diet: string): Promise<boolean> {
  try {
    const isAvailable = await isSelfHostedBackendAvailable();
    if (!isAvailable) return false;

    const res = await fetch('/api/guests.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rsvp',
        guestId,
        status,
        confirmedCompanions: companions,
        dietaryRestrictions: diet
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Guardar mensaje en el Muro de Deseos en tu hosting
 */
export async function submitWishToHost(weddingId: string, authorName: string, message: string, avatarUrl?: string): Promise<any> {
  try {
    const isAvailable = await isSelfHostedBackendAvailable();
    if (!isAvailable) return null;

    const res = await fetch('/api/wishes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId,
        authorName,
        message,
        avatarUrl
      })
    });
    if (res.ok) {
      const data = await res.json();
      return data.wish || null;
    }
  } catch (e) {
    console.warn('Error enviando deseo a hosting propio:', e);
  }
  return null;
}
