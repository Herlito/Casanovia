/**
 * Validacion de URLs para la vista publica.
 *
 * Los campos de URL de la boda (Google Maps, Waze, tienda de regalos, enlaces
 * del banner) son texto libre editable por el anfitrion. Sin validacion, un
 * `javascript:` en cualquiera de esos campos se ejecutaria al hacer clic.
 *
 * `safeUrl` devuelve la URL solo si su esquema es seguro, o `null` si debe
 * bloquearse. Nunca lanza.
 */

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Normaliza y valida una URL de enlace.
 * - Acepta http/https/mailto/tel y rutas relativas.
 * - Acepta anclas internas (#seccion).
 * - Rechaza javascript:, vbscript:, data:, file: y cualquier esquema desconocido.
 */
export function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Anclas internas (#rsvp-section)
  if (trimmed.startsWith('#')) return trimmed;

  // Detecta el esquema antes de los dos puntos (evita falsos positivos con
  // rutas relativas como "maps/place" o "2024/evento").
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (!SAFE_SCHEMES.has(scheme)) return null;
    return trimmed;
  }

  // Protocolo relativo (//evil.com) o ruta absoluta: se permiten, pero se
  // bloquean las URLs relativas con prefijo de protocolo (//) por ser ambiguas.
  if (trimmed.startsWith('//')) return null;

  return trimmed;
}

/** `true` si la URL puede usarse como href/window.open. */
export function isSafeUrl(value: unknown): boolean {
  return safeUrl(value) !== null;
}
