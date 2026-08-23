/**
 * Date and Time formatting utilities for Wedding Hub
 */

const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

const MONTHS_LOWERCASE = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

/**
 * Formats a wedding date into the cursive header style:
 * "Timing de Boda - 12 de setiembre"
 */
export function formatTimingHeaderDate(dateStr?: string): string {
  if (!dateStr) return 'Timing de Boda - 12 de setiembre';
  try {
    const cleanStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return 'Timing de Boda - 12 de setiembre';
    const dayNumber = d.getDate();
    const monthName = MONTHS_LOWERCASE[d.getMonth()] === 'septiembre' ? 'setiembre' : MONTHS_LOWERCASE[d.getMonth()];
    return `Timing de Boda - ${dayNumber} de ${monthName}`;
  } catch {
    return 'Timing de Boda - 12 de setiembre';
  }
}

/**
 * Formats a wedding date string into the requested format:
 * "Sábado, 12 septiembre 2026"
 * (Capitalized day, day number, lowercase month name, year - without 'de')
 */
export function formatWeddingDateCustom(dateStr?: string): string {
  if (!dateStr) return 'Sábado, 12 septiembre 2026';

  try {
    // If dateStr is YYYY-MM-DD or ISO
    const cleanStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(cleanStr);
    
    if (isNaN(d.getTime())) {
      return 'Sábado, 12 septiembre 2026';
    }

    const dayName = DAYS_OF_WEEK[d.getDay()];
    const dayNumber = d.getDate();
    const monthName = MONTHS_LOWERCASE[d.getMonth()];
    const year = d.getFullYear();

    return `${dayName}, ${dayNumber} ${monthName} ${year}`;
  } catch {
    return 'Sábado, 12 septiembre 2026';
  }
}

/**
 * Returns the individual parts of a wedding date:
 * { dayOfWeek: 'Sábado', dayNumber: '12', monthName: 'Setiembre', year: '2026' }
 */
export function parseWeddingDateParts(dateStr?: string): {
  dayOfWeek: string;
  dayNumber: string;
  monthName: string;
  year: string;
} {
  if (!dateStr) {
    return {
      dayOfWeek: 'Sábado',
      dayNumber: '12',
      monthName: 'Setiembre',
      year: '2026',
    };
  }

  try {
    const cleanStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return {
        dayOfWeek: 'Sábado',
        dayNumber: '12',
        monthName: 'Setiembre',
        year: '2026',
      };
    }

    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const dayNumber = String(d.getDate());
    let month = MONTHS_LOWERCASE[d.getMonth()];
    if (month === 'septiembre') month = 'setiembre';
    const monthName = month.charAt(0).toUpperCase() + month.slice(1);
    const year = String(d.getFullYear());

    return { dayOfWeek, dayNumber, monthName, year };
  } catch {
    return {
      dayOfWeek: 'Sábado',
      dayNumber: '12',
      monthName: 'Setiembre',
      year: '2026',
    };
  }
}

/**
 * Formats a ceremony time string simply (e.g., "12:00m" or "5:00 pm")
 */
export function formatCeremonyTimeSimple(timeStr?: string, defaultLabel: string = '12:00m'): string {
  if (!timeStr) return defaultLabel;
  try {
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return timeStr;

    const hours = parseInt(match[1], 10);
    const minutes = match[2];

    if (hours === 12 && (minutes === '00' || minutes === '0')) {
      return '12:00m';
    }

    const ampm = hours >= 12 ? 'pm' : 'am';
    let h = hours % 12;
    if (h === 0) h = 12;

    return `${h}:${minutes} ${ampm}`;
  } catch {
    return defaultLabel;
  }
}

/**
 * Formats a 24h or arbitrary time string into standard 12-hour format with Puntual tag:
 * "5:00 pm (Puntual)"
 */
export function formatWeddingTimeCustom(timeStr?: string, defaultLabel: string = '5:00 pm (Puntual)'): string {
  if (!timeStr) return defaultLabel;

  try {
    // Extract HH:MM
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) {
      return defaultLabel;
    }

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${ampm} (Puntual)`;
  } catch {
    return defaultLabel;
  }
}

/**
 * Sorts an array of weddings by weddingDate in ascending order (closest dates first).
 * Weddings without a date or invalid dates are placed at the end.
 */
export function sortWeddingsByDate<T extends { weddingDate?: string }>(weddingsList: T[]): T[] {
  return [...weddingsList].sort((a, b) => {
    const timeA = a.weddingDate ? new Date(a.weddingDate).getTime() : Infinity;
    const timeB = b.weddingDate ? new Date(b.weddingDate).getTime() : Infinity;
    
    const validA = isNaN(timeA) ? Infinity : timeA;
    const validB = isNaN(timeB) ? Infinity : timeB;
    
    return validA - validB;
  });
}

/**
 * Returns days difference from now to wedding date or a humanized string.
 */
export function getDaysUntilWedding(dateStr?: string): { days: number; isPast: boolean; label: string } {
  if (!dateStr) return { days: 0, isPast: false, label: 'Fecha por definir' };
  try {
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return { days: 0, isPast: false, label: 'Fecha por definir' };
    const now = Date.now();
    const diffMs = target - now;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (days === 0) return { days: 0, isPast: false, label: '¡Es Hoy!' };
    if (days > 0) return { days, isPast: false, label: `Faltan ${days} días` };
    return { days: Math.abs(days), isPast: true, label: `Celebrada hace ${Math.abs(days)} días` };
  } catch {
    return { days: 0, isPast: false, label: 'Fecha por definir' };
  }
}

/**
 * Calculates a date that is N days before the wedding date and formats it:
 * e.g., "5 de Septiembre de 2026"
 */
export function formatRsvpCutoffDate(weddingDateStr?: string, daysBefore: number = 7): string {
  if (!weddingDateStr) return '5 de Septiembre de 2026';
  try {
    const cleanStr = weddingDateStr.includes('T') ? weddingDateStr : `${weddingDateStr}T12:00:00`;
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return '5 de Septiembre de 2026';
    
    // Subtract daysBefore days
    d.setDate(d.getDate() - daysBefore);
    
    const dayNumber = d.getDate();
    let month = MONTHS_LOWERCASE[d.getMonth()];
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const year = d.getFullYear();

    return `${dayNumber} de ${capitalizedMonth} de ${year}`;
  } catch {
    return '5 de Septiembre de 2026';
  }
}

/**
 * Returns whether the RSVP deadline has passed (deadline date is before today).
 * If deadline is '2026-10-10', it allows confirmation until end of that day (23:59:59).
 */
export function isRsvpDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr) return false;
  try {
    // If deadlineStr is only YYYY-MM-DD, consider end of that day (23:59:59)
    const cleanStr = deadlineStr.includes('T') ? deadlineStr : `${deadlineStr}T23:59:59`;
    const target = new Date(cleanStr).getTime();
    if (isNaN(target)) return false;
    return target < Date.now();
  } catch {
    return false;
  }
}
