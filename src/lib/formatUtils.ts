/**
 * Formats numeric amounts dynamically based on country currency standard
 */

export interface CountryCurrencyOption {
  code: string;
  country: string;
  flag: string;
  currencyName: string;
  symbol: string;
  currencyCode: string;
  locale: string;
}

export const COUNTRY_CURRENCY_OPTIONS: CountryCurrencyOption[] = [
  { code: 'PE', country: 'Perú', flag: '🇵🇪', currencyName: 'Sol Peruano', symbol: 'S/.', currencyCode: 'PEN', locale: 'es-PE' },
  { code: 'MX', country: 'México', flag: '🇲🇽', currencyName: 'Peso Mexicano', symbol: '$', currencyCode: 'MXN', locale: 'es-MX' },
  { code: 'CO', country: 'Colombia', flag: '🇨🇴', currencyName: 'Peso Colombiano', symbol: '$', currencyCode: 'COP', locale: 'es-CO' },
  { code: 'CL', country: 'Chile', flag: '🇨🇱', currencyName: 'Peso Chileno', symbol: '$', currencyCode: 'CLP', locale: 'es-CL' },
  { code: 'AR', country: 'Argentina', flag: '🇦🇷', currencyName: 'Peso Argentino', symbol: '$', currencyCode: 'ARS', locale: 'es-AR' },
  { code: 'EC', country: 'Ecuador', flag: '🇪🇨', currencyName: 'Dólar Estadounidense', symbol: '$', currencyCode: 'USD', locale: 'es-EC' },
  { code: 'ES', country: 'España', flag: '🇪🇸', currencyName: 'Euro', symbol: '€', currencyCode: 'EUR', locale: 'es-ES' },
  { code: 'US', country: 'Hispanos en EE. UU.', flag: '🇺🇸', currencyName: 'Dólar Estadounidense', symbol: '$', currencyCode: 'USD', locale: 'es-US' },
  { code: 'DO', country: 'República Dominicana', flag: '🇩🇴', currencyName: 'Peso Dominicano', symbol: 'RD$', currencyCode: 'DOP', locale: 'es-DO' },
  { code: 'PA', country: 'Panamá', flag: '🇵🇦', currencyName: 'Balboa / Dólar', symbol: '$', currencyCode: 'USD', locale: 'es-PA' },
  { code: 'CR', country: 'Costa Rica', flag: '🇨🇷', currencyName: 'Colón Costarricense', symbol: '₡', currencyCode: 'CRC', locale: 'es-CR' },
  { code: 'BO', country: 'Bolivia', flag: '🇧🇴', currencyName: 'Boliviano', symbol: 'Bs.', currencyCode: 'BOB', locale: 'es-BO' },
  { code: 'PY', country: 'Paraguay', flag: '🇵🇾', currencyName: 'Guaraní', symbol: '₲', currencyCode: 'PYG', locale: 'es-PY' },
  { code: 'UY', country: 'Uruguay', flag: '🇺🇾', currencyName: 'Peso Uruguayo', symbol: '$', currencyCode: 'UYU', locale: 'es-UY' },
];

let _activeCountryCode: string = 'PE';

export const setActiveCurrencyCountry = (code?: string) => {
  if (code) {
    _activeCountryCode = code;
  }
};

export const getActiveCurrencyCountry = (): string => {
  return _activeCountryCode;
};

export const getCurrencyOption = (countryCode?: string): CountryCurrencyOption => {
  const codeToUse = countryCode || _activeCountryCode || 'PE';
  const found = COUNTRY_CURRENCY_OPTIONS.find(
    c => c.code.toUpperCase() === codeToUse.toUpperCase() || c.currencyCode.toUpperCase() === codeToUse.toUpperCase()
  );
  return found || COUNTRY_CURRENCY_OPTIONS[0];
};

export const formatCurrency = (amount: number, decimals: number = 2, countryCode?: string): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const config = getCurrencyOption(countryCode);
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
  return `${config.symbol} ${formatted}`;
};

export const formatCurrencyShort = (amount: number, countryCode?: string): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const config = getCurrencyOption(countryCode);
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `${config.symbol} ${formatted}`;
};

export const formatCurrencyInteger = (amount: number, countryCode?: string): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const config = getCurrencyOption(countryCode);
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return `${config.symbol} ${formatted}`;
};

/**
 * Formats names or titles to proper Title Case / Altibajas
 * Example: "MARÍA INÉS ARIAS" -> "María Inés Arias"
 * Example: "juan carlos pérez" -> "Juan Carlos Pérez"
 */
export const formatAltibajas = (str?: string): string => {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(?:^|[\s\(\[\/\-\.,'"])\S/g, (char) => char.toUpperCase());
};

/**
 * Splits participants by '&' or ',' that are OUTSIDE brackets [...] and parentheses (...).
 * Avoids splitting internal phrases like "[Fotografía & Video]" or "(Novio & Novia)".
 */
export const splitParticipants = (str?: string): string[] => {
  if (!str || !str.trim()) return [];
  const results: string[] = [];
  let current = '';
  let inBracket = 0;
  let inParen = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '[') inBracket++;
    else if (char === ']') inBracket = Math.max(0, inBracket - 1);
    else if (char === '(') inParen++;
    else if (char === ')') inParen = Math.max(0, inParen - 1);

    if (inBracket === 0 && inParen === 0 && (char === '&' || char === ',')) {
      const trimmed = current.trim();
      if (trimmed) results.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }

  const lastTrimmed = current.trim();
  if (lastTrimmed) results.push(lastTrimmed);

  return results;
};

/**
 * Extracts only the contact person / advisor name, stripping supplier company or role details.
 * E.g. "Fernando (video Herly Lizarazo) [fotografía & Video] & ..." -> "Fernando"
 * E.g. "Mariana Flores (Wedding Planner)" -> "Mariana Flores"
 * E.g. "María Inés Makeup" -> "María Inés Makeup"
 */
export const extractContactPersonOnly = (str?: string): string => {
  if (!str) return '';
  
  const participants = splitParticipants(str);
  if (participants.length === 0) return formatAltibajas(str);

  const cleanedParts = participants.map((part) => {
    let cleaned = part.trim();
    // Remove bracket annotations: [fotografía & video]
    cleaned = cleaned.replace(/\[.*?\]/g, '').trim();
    // Remove parentheses if they indicate supplier/role, e.g., (video Herly Lizarazo), (Novia), (Wedding Planner)
    cleaned = cleaned.replace(/\(.*?\)/g, '').trim();
    
    return formatAltibajas(cleaned) || formatAltibajas(part);
  });

  return cleanedParts.filter(Boolean).join(' & ') || formatAltibajas(str);
};

