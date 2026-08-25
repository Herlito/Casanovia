import { DressCodeColor, WeddingCustomTheme } from '../types';

/**
 * Parses any hex color string (e.g. "#8B3A4A", "#FFF", "8B3A4A") into RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return { r: 139, g: 58, b: 74 }; // Fallback to classic burgundy #8B3A4A
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB components to a standard 6-character hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates WCAG relative luminance of a color.
 * Range: 0.0 (darkest black) to 1.0 (lightest white).
 */
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const sRGB = [r, g, b].map((val) => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculates the WCAG contrast ratio between two colors.
 * Range: 1:1 (lowest) to 21:1 (highest).
 */
export function getContrastRatio(color1: string, color2: string): number {
  const L1 = getRelativeLuminance(color1);
  const L2 = getRelativeLuminance(color2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Automatically chooses either pure white (#FFFFFF) or high-contrast dark (#1F2937)
 * depending on which one gives the highest WCAG contrast ratio on the background color.
 */
export function getAccessibleTextColor(bgHex: string): string {
  const contrastWithWhite = getContrastRatio(bgHex, '#FFFFFF');
  const contrastWithDark = getContrastRatio(bgHex, '#1F2937');
  return contrastWithWhite >= contrastWithDark ? '#FFFFFF' : '#1F2937';
}

/**
 * Adjusts brightness of a hex color by a percentage.
 * Positive percent = lighter, Negative percent = darker.
 */
export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = percent / 100;
  const newR = factor > 0 ? r + (255 - r) * factor : r + r * factor;
  const newG = factor > 0 ? g + (255 - g) * factor : g + g * factor;
  const newB = factor > 0 ? b + (255 - b) * factor : b + b * factor;
  return rgbToHex(newR, newG, newB);
}

/**
 * Default Casanovia romantic wedding theme (Burgundy, Sage, Champagne Gold, Ivory)
 */
export function getDefaultWeddingTheme(): WeddingCustomTheme {
  return {
    enabled: false,
    primary: '#8B3A4A',
    primaryForeground: '#FFFFFF',
    primaryHover: '#6E2937',
    secondary: '#8A9A86',
    secondaryForeground: '#FFFFFF',
    secondaryHover: '#6E7E6A',
    accent: '#D4AF37',
    accentForeground: '#FFFFFF',
    bgSoft: '#FDFBF7',
    bgCard: '#FFFFFF',
    textMain: '#2D2A26',
    textMuted: '#7A7268',
    borderSoft: '#E8DCCF',
  };
}

/**
 * Generates an accessible, high-contrast custom wedding theme from the suggested colors.
 * Automatically verifies readability, contrast ratios, and creates complementary soft tones.
 */
export function generateWeddingTheme(colors: DressCodeColor[]): WeddingCustomTheme {
  if (!colors || colors.length === 0) {
    return {
      ...getDefaultWeddingTheme(),
      enabled: true,
      appliedAt: new Date().toISOString(),
    };
  }

  // 1. Primary Color
  const primary = colors[0]?.hex || '#8B3A4A';
  const primaryForeground = getAccessibleTextColor(primary);
  const primaryHover = adjustBrightness(primary, -12);

  // 2. Secondary Color
  const secondary = colors.length > 1 ? colors[1].hex : adjustBrightness(primary, 25);
  const secondaryForeground = getAccessibleTextColor(secondary);
  const secondaryHover = adjustBrightness(secondary, -12);

  // 3. Accent Color (3rd suggested color, or default elegant Champagne Gold)
  const accent = colors.length > 2 ? colors[2].hex : '#D4AF37';
  const accentForeground = getAccessibleTextColor(accent);

  // 4. Background tone: Generate a subtle, warm/cool ivory tone with high luminance (>0.94)
  const { r: pr, g: pg, b: pb } = hexToRgb(primary);
  const bgSoftR = Math.round(250 + (pr - 128) * 0.03);
  const bgSoftG = Math.round(248 + (pg - 128) * 0.03);
  const bgSoftB = Math.round(245 + (pb - 128) * 0.03);
  const bgSoft = rgbToHex(bgSoftR, bgSoftG, bgSoftB);

  // 5. Border soft tone
  const borderSoft = adjustBrightness(bgSoft, -10);

  return {
    enabled: true,
    primary,
    primaryForeground,
    primaryHover,
    secondary,
    secondaryForeground,
    secondaryHover,
    accent,
    accentForeground,
    bgSoft,
    bgCard: '#FFFFFF',
    textMain: '#2D2A26',
    textMuted: '#685F54',
    borderSoft,
    appliedAt: new Date().toISOString(),
  };
}
