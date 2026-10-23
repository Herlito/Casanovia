/**
 * Utilidades numericas para la captura de importes.
 *
 * Los campos monetarios se rellenan a mano, por lo que el usuario puede
 * escribir "1,500.50", "1500,50" o "1500.50". `parseFloat` solo entiende el
 * punto decimal y trunca silenciosamente el valor (o lo convierte en 0),
 * lo que corria el presupuesto guardado.
 */

/**
 * Convierte el texto de un campo de importe a numero.
 *
 * Acepta:
 *   "1500.50", "1500,50", "1.500,50", "1,500.50", "S/ 1 500.50", "1500"
 *
 * Devuelve 0 si el valor no es numerico.
 */
export function parseAmountInput(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  const raw = value.trim();
  if (!raw) return 0;

  // Conserva solo digitos, signo y separadores.
  let cleaned = raw.replace(/[^\d.,-]/g, '');
  if (!cleaned) return 0;

  const negative = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  if (lastDot >= 0 && lastComma >= 0) {
    // Hay ambos separadores: el ultimo en aparecer es el decimal.
    const decimalSep = lastDot > lastComma ? '.' : ',';
    const thousandSep = decimalSep === '.' ? ',' : '.';
    cleaned = cleaned.split(thousandSep).join('');
    cleaned = cleaned.replace(decimalSep, '.');
  } else if (lastComma >= 0) {
    // Solo comas: si cada grupo posterior tiene 3 digitos es separador de miles.
    const parts = cleaned.split(',');
    const isThousands = parts.length > 1 && parts.slice(1).every((p) => p.length === 3);
    cleaned = isThousands ? parts.join('') : cleaned.replace(',', '.');
  }

  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return negative ? -parsed : parsed;
}
