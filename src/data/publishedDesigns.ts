/**
 * Registro de diseños publicados (WeddingCraft).
 *
 * `src/data/publishedDesignsData.json` pesa ~15 MB porque cada diseño se
 * duplicaba bajo varios slugs y arrastra fotos en base64. Ese archivo se
 * conserva intacto para `scripts/build-subirweb.js` (seed del hosting), pero
 * la app ya NO lo importa de forma estatica:
 *
 *  - `publishedDesigns.light.json` (163 KB) -> importacion estatica, disponible
 *    de inmediato para los diseños sin fotos pesadas.
 *  - `publishedDesigns.heavy.json` (6 MB)  -> se carga bajo demanda (import()
 *    dinamico) solo cuando se pide un slug de la lista pesada.
 *
 * Uso:
 *   getPublishedDesignSync(slug)          -> acceso inmediato (solo light)
 *   getPublishedDesign(slug)              -> async, resuelve tambien los pesados
 *   loadHeavyPublishedDesigns()           -> precarga manual del chunk pesado
 */
import lightRegistry from './publishedDesigns.light.json';
import heavyIndex from './publishedDesigns.heavyIndex.json';
import { normalizeToCanonicalSlug } from '../hooks/useSyncedInvitationDesign';

export type PublishedDesignRegistry = Record<string, any>;

/** Disenos published embebidos en el bundle (acceso sincronico). */
export const PUBLISHED_DESIGNS_LIGHT = lightRegistry as PublishedDesignRegistry;

/** slug -> hash del diseño pesado (permite saber que hay que cargar el chunk). */
export const PUBLISHED_DESIGNS_HEAVY_INDEX = heavyIndex as Record<string, string>;

/** Slugs que viven en el chunk pesado (carga diferida). */
export function isHeavyPublishedSlug(slug: string): boolean {
  return Boolean(slug && PUBLISHED_DESIGNS_HEAVY_INDEX[slug]);
}

let heavyPromise: Promise<PublishedDesignRegistry> | null = null;

/** Carga (una sola vez) el chunk con los diseños pesados. */
export function loadHeavyPublishedDesigns(): Promise<PublishedDesignRegistry> {
  if (!heavyPromise) {
    heavyPromise = import('./publishedDesigns.heavy.json').then((mod: any) => {
      const payload = mod?.default ?? mod ?? {};
      const docs: PublishedDesignRegistry = payload.docs ?? {};
      const slugs: Record<string, string> = payload.slugs ?? {};
      const resolved: PublishedDesignRegistry = {};
      for (const [slug, hash] of Object.entries(slugs)) {
        if (docs[hash]) resolved[slug] = docs[hash];
      }
      return resolved;
    });
  }
  return heavyPromise;
}

/** Acceso sincronico: solo devuelve diseños del registro ligero. */
export function getPublishedDesignSync(slug: string): any | null {
  if (!slug) return null;
  return PUBLISHED_DESIGNS_LIGHT[slug] ?? null;
}

/** Acceso asíncrono: resuelve también los diseños pesados. */
export async function getPublishedDesign(slug: string): Promise<any | null> {
  const light = getPublishedDesignSync(slug);
  if (light) return light;
  if (!isHeavyPublishedSlug(slug)) return null;
  const heavy = await loadHeavyPublishedDesigns();
  return heavy[slug] ?? null;
}

/**
 * Normaliza cualquier formato de eventId al slug canónico único: MMDD-nombrecouple
 * Esta función ahora usa la misma lógica que useSyncedInvitationDesign para consistencia.
 */
export const normalizeDesignSlugKey = normalizeToCanonicalSlug;

/** Busca en el registro ligero con coincidencia normalizada. */
export function findPublishedDesignInLight(eventId: string): any | null {
  if (!eventId) return null;
  const canonicalSlug = normalizeDesignSlugKey(eventId);

  // Direct match first
  const direct = PUBLISHED_DESIGNS_LIGHT[canonicalSlug];
  if (direct) return direct;

  // Normalize all keys and match by canonical slug
  for (const [key, doc] of Object.entries(PUBLISHED_DESIGNS_LIGHT)) {
    if (normalizeDesignSlugKey(key) === canonicalSlug) {
      return doc;
    }
  }
  return null;
}

/** Igual que `findPublishedDesignInLight` pero incluyendo el chunk pesado. */
export async function findPublishedDesign(eventId: string): Promise<any | null> {
  const light = findPublishedDesignInLight(eventId);
  if (light) return light;
  if (!eventId) return null;

  const heavyIndexMap = PUBLISHED_DESIGNS_HEAVY_INDEX;
  const canonicalSlug = normalizeDesignSlugKey(eventId);

  let heavySlug: string | null = null;
  for (const key of Object.keys(heavyIndexMap)) {
    if (normalizeDesignSlugKey(key) === canonicalSlug) {
      heavySlug = key;
      break;
    }
  }
  if (!heavySlug) return null;

  const heavy = await loadHeavyPublishedDesigns();
  return heavy[heavySlug] ?? null;
}
