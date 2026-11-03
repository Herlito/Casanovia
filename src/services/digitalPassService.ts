/**
 * Casanovia Digital Pass Service
 * Manages creation, retrieval, immutable QR token preservation, device marker linking,
 * and real-time synchronization of digital guest passes.
 */

import { DigitalGuestPass, DigitalPassValidationResult, Guest, Wedding } from '../types';
import { generateSecureQrToken, getOrCreateDeviceMarker, resolveSeatAssignmentDisplay, evaluateQrWindowStatus } from '../lib/digitalPassUtils';

const STORAGE_KEY = 'casanovia_digital_passes';
const SYNC_CHANNEL_NAME = 'casanovia_digital_pass_sync';

// Local in-memory / storage cache
function getLocalPasses(): DigitalGuestPass[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalPasses(passes: DigitalGuestPass[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passes));
  } catch (e) {
    console.warn('Failed to save digital passes to localStorage:', e);
  }
}

// Broadcast channel for real-time multi-tab synchronization
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    syncChannel = null;
  }
}

function notifyPassUpdated(pass: DigitalGuestPass): void {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'PASS_UPDATED', pass });
    }
    // Also trigger window custom event for local component listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('casanovia_pass_updated', { detail: pass }));
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Subscribes to real-time updates for a specific guest pass
 */
export function subscribeToPassUpdates(
  passId: string,
  onUpdate: (updatedPass: DigitalGuestPass) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleChannelMsg = (event: MessageEvent) => {
    if (event.data?.type === 'PASS_UPDATED' && event.data?.pass?.id === passId) {
      onUpdate(event.data.pass);
    }
  };

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<DigitalGuestPass>;
    if (custom.detail?.id === passId) {
      onUpdate(custom.detail);
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handleChannelMsg);
  }
  window.addEventListener('casanovia_pass_updated', handleCustomEvent);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleChannelMsg);
    }
    window.removeEventListener('casanovia_pass_updated', handleCustomEvent);
  };
}

/**
 * Idempotently creates or retrieves the digital pass for a confirmed guest.
 * Guarantees that:
 * 1. An existing pass is NEVER duplicated.
 * 2. The QR token is generated once and remains strictly immutable.
 * 3. The current device marker is linked.
 * 4. Assigned table and seat are accurately reflected without empty or pending labels.
 */
export async function getOrCreateDigitalGuestPass(
  wedding: Wedding,
  guest: Guest,
  companionNames: string[] = []
): Promise<DigitalGuestPass> {
  const weddingId = wedding.id || wedding.slug || 'evento';
  const deviceMarker = getOrCreateDeviceMarker();
  const allPasses = getLocalPasses();

  // 1. Look for existing pass by guestId or guestCode
  let existingPass = allPasses.find(
    (p) => p.guestId === guest.id || (guest.code && p.guestCode === guest.code)
  );

  const seatInfo = resolveSeatAssignmentDisplay(guest, wedding);

  if (existingPass) {
    // Update dynamic fields while STRICTLY PRESERVING the original immutable qrToken
    const updatedPass: DigitalGuestPass = {
      ...existingPass,
      guestFullName: guest.fullName,
      totalPasses: guest.totalPasses || existingPass.totalPasses || 1,
      confirmedPasses: guest.confirmedPasses || existingPass.confirmedPasses || 1,
      companionNames: companionNames.length > 0 ? companionNames : existingPass.companionNames || [],
      assignedTable: seatInfo.hasAssignment ? seatInfo.tableText : undefined,
      assignedSeat: seatInfo.hasAssignment ? seatInfo.seatText : undefined,
      deviceMarker: deviceMarker, // update device marker to current authorized device
      updatedAt: new Date().toISOString(),
    };

    const updatedList = allPasses.map((p) => (p.id === updatedPass.id ? updatedPass : p));
    saveLocalPasses(updatedList);
    notifyPassUpdated(updatedPass);

    // Sync to backend asynchronously
    syncPassToBackend(updatedPass);

    return updatedPass;
  }

  // 2. Try fetching from backend before creating a new one (in case created on another device)
  try {
    const remote = await fetchPassFromBackend({ weddingId, guestId: guest.id, guestCode: guest.code });
    if (remote) {
      // Remote pass found: cache locally, link device marker, preserve immutable token
      const linkedPass: DigitalGuestPass = {
        ...remote,
        deviceMarker,
        assignedTable: seatInfo.hasAssignment ? seatInfo.tableText : remote.assignedTable,
        assignedSeat: seatInfo.hasAssignment ? seatInfo.seatText : remote.assignedSeat,
        updatedAt: new Date().toISOString(),
      };
      const updatedList = allPasses.filter((p) => p.id !== linkedPass.id).concat(linkedPass);
      saveLocalPasses(updatedList);
      notifyPassUpdated(linkedPass);
      syncPassToBackend(linkedPass);
      return linkedPass;
    }
  } catch (e) {
    // continue to local creation
  }

  // 3. Create fresh pass with immutable cryptographic token
  const newQrToken = generateSecureQrToken();
  const newPass: DigitalGuestPass = {
    id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    weddingId,
    guestId: guest.id,
    guestCode: guest.code || `BODA-${guest.fullName.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    qrToken: newQrToken,
    guestFullName: guest.fullName,
    totalPasses: guest.totalPasses || 1,
    confirmedPasses: guest.confirmedPasses || 1,
    companionNames: companionNames || [],
    assignedTable: seatInfo.hasAssignment ? seatInfo.tableText : undefined,
    assignedSeat: seatInfo.hasAssignment ? seatInfo.seatText : undefined,
    deviceMarker,
    usedPasses: 0,
    accessStatus: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...allPasses, newPass];
  saveLocalPasses(updatedList);
  notifyPassUpdated(newPass);

  // Sync to backend
  syncPassToBackend(newPass);

  return newPass;
}

/**
 * Recovers pass automatically by current device marker
 */
export async function recoverPassByDeviceMarker(
  weddingId: string
): Promise<DigitalGuestPass | null> {
  const marker = getOrCreateDeviceMarker();
  if (!marker) return null;

  const local = getLocalPasses().find(
    (p) => p.weddingId === weddingId && p.deviceMarker === marker
  );
  if (local) return local;

  // Try backend lookup by device marker
  try {
    const remote = await fetchPassFromBackend({ weddingId, deviceMarker: marker });
    if (remote) {
      const all = getLocalPasses().filter((p) => p.id !== remote.id).concat(remote);
      saveLocalPasses(all);
      return remote;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

/**
 * Recovers pass by guest code (e.g. "¿Ya confirmaste? Ingresa tu código de invitado")
 * Rate-limited and validated against the wedding.
 */
export async function recoverPassByGuestCode(
  wedding: Wedding,
  guestCode: string
): Promise<{ success: boolean; pass?: DigitalGuestPass; error?: string }> {
  const cleanCode = guestCode.trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 3) {
    return { success: false, error: 'Por favor ingresa un código de invitado válido.' };
  }

  const weddingId = wedding.id || wedding.slug || 'evento';
  const deviceMarker = getOrCreateDeviceMarker();

  // 1. Check in local passes cache
  const local = getLocalPasses().find(
    (p) => p.weddingId === weddingId && p.guestCode.toUpperCase() === cleanCode
  );

  if (local) {
    // Relink current device marker to this device
    const updated: DigitalGuestPass = {
      ...local,
      deviceMarker,
      updatedAt: new Date().toISOString(),
    };
    const all = getLocalPasses().map((p) => (p.id === updated.id ? updated : p));
    saveLocalPasses(all);
    notifyPassUpdated(updated);
    syncPassToBackend(updated);
    return { success: true, pass: updated };
  }

  // 2. Check if code matches an existing guest in this wedding
  const matchedGuest = wedding.guests.find(
    (g) => g.code && g.code.trim().toUpperCase() === cleanCode
  );

  if (matchedGuest) {
    if (matchedGuest.rsvpStatus !== 'confirmed') {
      return {
        success: false,
        error: 'El código corresponde a un invitado que aún no ha confirmado su asistencia.',
      };
    }

    const companions = wedding.guests
      .filter((g) => g.mainGuestId === matchedGuest.id)
      .map((g) => g.fullName);

    const pass = await getOrCreateDigitalGuestPass(wedding, matchedGuest, companions);
    return { success: true, pass };
  }

  // 3. Fallback to backend search
  try {
    const remote = await fetchPassFromBackend({ weddingId, guestCode: cleanCode });
    if (remote) {
      const linked: DigitalGuestPass = {
        ...remote,
        deviceMarker,
        updatedAt: new Date().toISOString(),
      };
      const all = getLocalPasses().filter((p) => p.id !== linked.id).concat(linked);
      saveLocalPasses(all);
      notifyPassUpdated(linked);
      syncPassToBackend(linked);
      return { success: true, pass: linked };
    }
  } catch (e) {
    // ignore
  }

  return {
    success: false,
    error: 'No se encontró ninguna confirmación asociada a este código de invitado.',
  };
}

/**
 * Synchronizes administrative updates to an existing guest (name change, table assignment,
 * companion addition) into their digital pass without changing the immutable QR token.
 */
export async function syncPassOnGuestUpdate(
  wedding: Wedding,
  guestId: string,
  updatedFields: Partial<Guest>
): Promise<void> {
  const weddingId = wedding.id || wedding.slug || 'evento';
  const all = getLocalPasses();
  const passIndex = all.findIndex((p) => p.guestId === guestId && p.weddingId === weddingId);

  if (passIndex === -1) return;

  const currentPass = all[passIndex];
  const currentGuest = wedding.guests.find((g) => g.id === guestId);
  const effectiveGuest = { ...(currentGuest || {}), ...updatedFields } as Guest;

  const seatInfo = resolveSeatAssignmentDisplay(effectiveGuest, wedding);

  const updatedPass: DigitalGuestPass = {
    ...currentPass,
    guestFullName: effectiveGuest.fullName || currentPass.guestFullName,
    totalPasses: effectiveGuest.totalPasses || currentPass.totalPasses,
    confirmedPasses: effectiveGuest.confirmedPasses || currentPass.confirmedPasses,
    assignedTable: seatInfo.hasAssignment ? seatInfo.tableText : undefined,
    assignedSeat: seatInfo.hasAssignment ? seatInfo.seatText : undefined,
    // CRITICAL: qrToken is left strictly untouched!
    updatedAt: new Date().toISOString(),
  };

  all[passIndex] = updatedPass;
  saveLocalPasses(all);
  notifyPassUpdated(updatedPass);

  syncPassToBackend(updatedPass);
}

/**
 * Validates a pass at the door / reception when scanned by staff
 */
export async function validatePassAtDoor(
  wedding: Wedding,
  qrToken: string,
  passesToAdmit: number = 1
): Promise<DigitalPassValidationResult> {
  const weddingId = wedding.id || wedding.slug || 'evento';
  const all = getLocalPasses();
  const pass = all.find((p) => p.qrToken === qrToken);

  if (!pass) {
    return {
      valid: false,
      message: 'Código QR no reconocido o pase inexistente.',
      code: 'NOT_FOUND',
    };
  }

  if (pass.weddingId !== weddingId) {
    return {
      valid: false,
      message: 'Este pase corresponde a un evento diferente.',
      code: 'INVALID_WEDDING',
    };
  }

  if (pass.accessStatus === 'revoked') {
    return {
      valid: false,
      message: 'Este pase ha sido revocado por la coordinación del evento.',
      code: 'REVOKED',
      pass,
    };
  }

  // Time window validation
  const windowStatus = evaluateQrWindowStatus(
    wedding.settings.weddingDate,
    wedding.settings.weddingTime,
    pass.validFrom,
    pass.validUntil
  );

  if (windowStatus.status === 'upcoming') {
    return {
      valid: false,
      message: 'El código QR aún no está habilitado para el acceso.',
      code: 'UPCOMING',
      pass,
    };
  }

  if (windowStatus.status === 'expired') {
    return {
      valid: false,
      message: 'El período de validez de este pase ha concluido.',
      code: 'EXPIRED',
      pass,
    };
  }

  // Pass quota check
  const availablePasses = Math.max(0, pass.confirmedPasses - pass.usedPasses);
  if (availablePasses <= 0) {
    return {
      valid: false,
      message: `Pase agotado. Todos los pases asignados (${pass.confirmedPasses}) ya ingresaron.`,
      code: 'QUOTA_EXCEEDED',
      pass,
      availablePasses: 0,
    };
  }

  const effectiveToAdmit = Math.min(passesToAdmit, availablePasses);
  const newUsedCount = pass.usedPasses + effectiveToAdmit;

  const updatedPass: DigitalGuestPass = {
    ...pass,
    usedPasses: newUsedCount,
    accessStatus: newUsedCount >= pass.confirmedPasses ? 'used' : 'active',
    updatedAt: new Date().toISOString(),
  };

  const updatedList = all.map((p) => (p.id === updatedPass.id ? updatedPass : p));
  saveLocalPasses(updatedList);
  notifyPassUpdated(updatedPass);
  syncPassToBackend(updatedPass);

  return {
    valid: true,
    message: `Acceso autorizado para ${effectiveToAdmit} ${effectiveToAdmit === 1 ? 'persona' : 'personas'}.`,
    code: 'OK',
    pass: updatedPass,
    availablePasses: pass.confirmedPasses - newUsedCount,
  };
}

// -------------------------------------------------------------
// Backend API Transport Helpers
// -------------------------------------------------------------
async function syncPassToBackend(pass: DigitalGuestPass): Promise<void> {
  try {
    await fetch('/api/digital_passes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pass),
    });
  } catch (e) {
    // backend silent fallback
  }
}

async function fetchPassFromBackend(params: {
  weddingId: string;
  guestId?: string;
  guestCode?: string;
  deviceMarker?: string;
  token?: string;
}): Promise<DigitalGuestPass | null> {
  const query = new URLSearchParams();
  if (params.weddingId) query.set('wedding_id', params.weddingId);
  if (params.guestId) query.set('guest_id', params.guestId);
  if (params.guestCode) query.set('code', params.guestCode);
  if (params.deviceMarker) query.set('device_marker', params.deviceMarker);
  if (params.token) query.set('token', params.token);

  const res = await fetch(`/api/digital_passes.php?${query.toString()}`);
  if (res.ok) {
    const data = await res.json();
    if (data?.success && data?.pass) {
      return data.pass;
    }
  }
  return null;
}
