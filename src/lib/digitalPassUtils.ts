/**
 * Digital Guest Pass Utilities
 * Implements cryptographically secure token generation, device markers,
 * time-window evaluation for QR activation, and seat resolution.
 */

import QRCode from 'qrcode';
import { DigitalGuestPass, QrDisplayWindowStatus, Guest, Wedding } from '../types';

const DEVICE_MARKER_KEY = 'casanovia_guest_device_marker';

/**
 * Generates an opaque, cryptographically random, immutable QR token.
 * Contains no PII, names, phone numbers, or predictable sequence IDs.
 */
export function generateSecureQrToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    const hex = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    return `cnv_pass_${hex}`;
  }
  // Fallback if crypto.getRandomValues is unavailable
  const randPart = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return `cnv_pass_${randPart}`;
}

/**
 * Gets or creates a unique client device marker in localStorage.
 * Does not contain personal data. Used for automatic pass recovery on return visits.
 */
export function getOrCreateDeviceMarker(): string {
  if (typeof window === 'undefined') return 'server_marker';
  try {
    let marker = localStorage.getItem(DEVICE_MARKER_KEY);
    if (!marker || marker.length < 10) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        marker = `dev_${crypto.randomUUID()}`;
      } else {
        marker = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      }
      localStorage.setItem(DEVICE_MARKER_KEY, marker);
    }
    return marker;
  } catch (e) {
    return `dev_fallback_${Date.now()}`;
  }
}

/**
 * Evaluates the QR display activation window based on the wedding date and time.
 * 
 * Rules:
 * - 'upcoming': Current time is before the event day (or configured validFrom).
 * - 'active': During event day (from 00:00:00 on event day until 06:00:00 the following morning).
 * - 'expired': After 06:00:00 the morning following the event date.
 * 
 * Can also be overridden by custom validFrom / validUntil timestamps if specified.
 */
export function evaluateQrWindowStatus(
  weddingDateStr?: string,
  weddingTimeStr?: string,
  validFromIso?: string,
  validUntilIso?: string
): {
  status: QrDisplayWindowStatus;
  message: string;
  activeFromText?: string;
  remainingDays?: number;
} {
  const now = new Date();

  // If explicit ISO override ranges are provided:
  if (validFromIso && validUntilIso) {
    const from = new Date(validFromIso);
    const until = new Date(validUntilIso);
    if (now < from) {
      const diffMs = from.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        status: 'upcoming',
        message: 'Tu código QR de acceso estará disponible el día del evento.',
        remainingDays: Math.max(1, diffDays),
      };
    }
    if (now > until) {
      return {
        status: 'expired',
        message: 'El período de acceso para este evento ha finalizado.',
      };
    }
    return {
      status: 'active',
      message: 'Código QR de acceso activo.',
    };
  }

  // Parse wedding date (YYYY-MM-DD or ISO)
  if (!weddingDateStr) {
    return {
      status: 'active',
      message: 'Código QR de acceso disponible.',
    };
  }

  const cleanDateStr = weddingDateStr.split('T')[0].trim();
  const dateParts = cleanDateStr.split('-');
  if (dateParts.length !== 3) {
    return {
      status: 'active',
      message: 'Código QR de acceso disponible.',
    };
  }

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  // Default Authorized Window:
  // Starts: 00:00:00 on the day of the event
  // Ends: 06:00:00 on the following morning (allowing reception / party overnight)
  const windowStart = new Date(year, month, day, 0, 0, 0);
  const windowEnd = new Date(year, month, day + 1, 6, 0, 0);

  if (now < windowStart) {
    const diffTime = windowStart.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      status: 'upcoming',
      message: 'Tu código QR de acceso estará disponible el día de la boda.',
      remainingDays: Math.max(1, diffDays),
      activeFromText: `${day}/${month + 1}/${year}`,
    };
  }

  if (now > windowEnd) {
    return {
      status: 'expired',
      message: 'El período de acceso al evento ha concluido.',
    };
  }

  return {
    status: 'active',
    message: 'Código QR de acceso habilitado.',
  };
}

/**
 * Generates an SVG Data URL or SVG string for the QR code token.
 */
export async function generateQrCodeDataUrl(token: string): Promise<string> {
  if (!token) return '';
  try {
    return await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 1.5,
      width: 320,
      color: {
        dark: '#1F2937', // Elegant Charcoal Dark
        light: '#FFFFFF', // Pure White background for camera scanners
      },
    });
  } catch (err) {
    console.error('Error generating QR code data URL:', err);
    return '';
  }
}

/**
 * Checks if a guest has a valid table assigned and extracts seat information.
 * Returns null if table is unassigned, pending, or empty, ensuring NO "Pendiente" or empty boxes are shown.
 */
export function resolveSeatAssignmentDisplay(
  guest: Guest,
  wedding?: Wedding
): {
  hasAssignment: boolean;
  tableText?: string;
  seatText?: string;
  fullDisplay?: string;
} {
  const table = guest.assignedTable?.trim();

  // If no table or generic unassigned indicator
  if (!table || table.toLowerCase().includes('por asignar') || table.toLowerCase() === 'pendiente') {
    return { hasAssignment: false };
  }

  // Check if seat is explicitly set or search in floor plan if available
  let seatLabel: string | undefined = undefined;

  // If table text already contains seat (e.g. "Mesa 4 - Silla 2" or "Mesa 3 (Asiento 1)")
  const seatMatch = table.match(/(?:silla|asiento|seat)\s*#?\s*(\d+)/i);
  if (seatMatch) {
    seatLabel = `Silla ${seatMatch[1]}`;
  }

  const cleanTableName = table.replace(/[-–,]\s*(?:silla|asiento|seat)\s*#?\s*\d+/i, '').trim();

  const fullDisplay = seatLabel ? `${cleanTableName} • ${seatLabel}` : cleanTableName;

  return {
    hasAssignment: true,
    tableText: cleanTableName,
    seatText: seatLabel,
    fullDisplay,
  };
}
