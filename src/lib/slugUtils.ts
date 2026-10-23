/**
 * Utility for generating and parsing standardized event slugs in Casanovia.
 * 
 * Rules:
 * - Format: "MMDD-nombreevento" (Month and day of event - Event Name)
 * - Example: Event "Erika & Yemar" on November 28th -> "1128-erikayemar"
 * - If another event has the exact same slug, append the year: "1128-erikayemar-2026"
 * - Replaces legacy formats like "boda-erika-yemar-6398"
 */

const KNOWN_DATES: Record<string, string> = {
  juanjuana: '0919',
  erikayemar: '1128',
  anaedu: '0919',
  zenaidaronny: '0912',
  clinicaauna: '0903',
  aunaclinica: '0903',
  ariannatomas: '0320',
  ellael: '0320',
  lucianamateo: '0710',
  sofiatu: '0918',
  sofiat: '0918',
  valeriasantiago: '0213',
  delecapy: '0110',
};

export function sanitizeEventNameForSlug(name: string): string {
  if (!name) return 'evento';
  let clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents / diacritics
    .toLowerCase()
    .replace(/^0101[-_]?/i, '')
    .replace(/^(boda|wedding)[-_]?/i, '')
    .replace(/^\d{4}[-_]?/, '')
    .replace(/\b(y|e|and|amp)\b/gi, '') // remove connector words like 'y', 'e', 'and'
    .replace(/&/g, '') // remove ampersand
    .replace(/[^a-z0-9]/g, '') // keep only lowercase alphanumeric
    .replace(/juanyjuana/g, 'juanjuana')
    .replace(/deleycapy/g, 'delecapy')
    .replace(/zenaidayronny/g, 'zenaidaronny')
    .replace(/\d+$/, '')
    .trim();

  return clean || 'evento';
}

export function extractEventDateParts(dateStr?: string | null): { mm: string; dd: string; yyyy: string } {
  if (dateStr) {
    // 1. Try ISO string / standard formats: YYYY-MM-DD
    const isoMatch = dateStr.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      return {
        yyyy: isoMatch[1],
        mm: isoMatch[2].padStart(2, '0'),
        dd: isoMatch[3].padStart(2, '0')
      };
    }

    // 2. Try Date object parsing
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return {
        yyyy: d.getFullYear().toString(),
        mm: String(d.getMonth() + 1).padStart(2, '0'),
        dd: String(d.getDate()).padStart(2, '0')
      };
    }
  }

  // Fallback default
  return {
    yyyy: '2026',
    mm: '01',
    dd: '01'
  };
}

/**
 * Generates a clean standardized slug for a new wedding/event.
 * Example: "1128-erikayemar"
 */
export function generateEventSlug(
  coupleNames: string,
  eventDate?: string | null,
  existingWeddings: Array<{ id: string }> = [],
  excludeId?: string
): string {
  const cleanName = sanitizeEventNameForSlug(coupleNames);
  let { mm, dd, yyyy } = extractEventDateParts(eventDate);

  if ((!eventDate || (mm === '01' && dd === '01')) && KNOWN_DATES[cleanName]) {
    const kDate = KNOWN_DATES[cleanName];
    mm = kDate.slice(0, 2);
    dd = kDate.slice(2, 4);
  }

  const baseSlug = `${mm}${dd}-${cleanName}`;

  // If the wedding already uses this slug or is the one being evaluated, return baseSlug directly
  const cleanExclude = (excludeId || '').toLowerCase().trim();
  if (cleanExclude && (cleanExclude === baseSlug || cleanExclude.startsWith(`${baseSlug}-`))) {
    return baseSlug;
  }

  const existingIds = new Set(
    existingWeddings
      .filter(w => {
        const wid = (w?.id || '').toLowerCase().trim();
        return !cleanExclude || wid !== cleanExclude;
      })
      .map(w => (w?.id || '').toLowerCase().trim())
      .filter(Boolean)
  );

  // If unique, return baseSlug
  if (!existingIds.has(baseSlug)) {
    return baseSlug;
  }

  // If duplicate exists, append the year of the event
  const slugWithYear = `${baseSlug}-${yyyy}`;
  if (!existingIds.has(slugWithYear)) {
    return slugWithYear;
  }

  // If still duplicate, append sequential counter
  let counter = 2;
  while (existingIds.has(`${slugWithYear}-${counter}`)) {
    counter++;
  }
  return `${slugWithYear}-${counter}`;
}

/**
 * Computes a unique canonical key for grouping and deduplicating weddings.
 * Example: wedding "Ana & Edu" -> "0919-anaedu"
 */
export function getCanonicalEventKey(w: any): string {
  if (!w) return '';
  const couple = w.coupleNames || w.title || w.name || '';
  const date = w.weddingDate || w.settings?.weddingDate || '';
  const cleanName = sanitizeEventNameForSlug(couple);
  if (!cleanName) return (w.id || '').toLowerCase();
  return generateEventSlug(couple, date).toLowerCase();
}

