/**
 * Formats numeric amounts to Peruvian Soles standard format (S/.)
 * Example: formatCurrency(20000) => "S/. 20,000.00" or "S/. 20,000"
 */

export const formatCurrency = (amount: number, decimals: number = 2): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
  return `S/. ${formatted}`;
};

export const formatCurrencyShort = (amount: number): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `S/. ${formatted}`;
};

export const formatCurrencyInteger = (amount: number): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return `S/. ${formatted}`;
};

/**
 * Formats names or titles to proper Title Case / Altibajas
 * Example: "MARÍA INÉS ARIAS" -> "María Inés Arias"
 */
export const formatAltibajas = (str?: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/(?:^|\s|[\(\[\/\-\.,])\S/g, (char) => char.toUpperCase());
};

/**
 * Extracts only the contact person / advisor name, stripping supplier company or role details.
 * E.g. "Fernando (video Herly Lizarazo) [fotografía & Video] & ..." -> "Fernando"
 * E.g. "Mariana Flores (Wedding Planner)" -> "Mariana Flores"
 * E.g. "María Inés Makeup" -> "María Inés Makeup"
 */
export const extractContactPersonOnly = (str?: string): string => {
  if (!str) return '';
  
  // If there are multiple people joined by "&" or ",", clean each part
  const parts = str.split(/(\s*&\s*|\s*,\s*)/);
  
  const cleanedParts = parts.map((part) => {
    // If it's a delimiter, keep it
    if (/^\s*(&|,)\s*$/.test(part)) return part;
    
    let cleaned = part.trim();
    // Remove bracket annotations: [fotografía & video]
    cleaned = cleaned.replace(/\[.*?\]/g, '').trim();
    // Remove parentheses if they indicate supplier/role, e.g., (video Herly Lizarazo), (Novia), (Wedding Planner)
    cleaned = cleaned.replace(/\(.*?\)/g, '').trim();
    
    return formatAltibajas(cleaned);
  });

  const result = cleanedParts.join(' ').replace(/\s{2,}/g, ' ').trim();
  return result || formatAltibajas(str);
};
