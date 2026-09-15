/**
 * Utility functions to compute and manage the outer glow, neumorphic highlights,
 * and drop shadows around the wedding invitation canvas.
 */

export function hexOrRgbToRgba(color: string = '#ffffff', opacity: number = 1): string {
  if (!color) return `rgba(255, 255, 255, ${opacity})`;

  // If already rgba, replace alpha
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }

  // If rgb
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }

  // If hex (#FFF or #FFFFFF)
  let hex = color.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
}

export interface CanvasGlowShadowConfig {
  glowEnabled?: boolean;
  glowColor?: string;
  glowIntensity?: number; // Blur in px
  glowOpacity?: number; // 0 - 1
  glowSpread?: number;
  glowOffsetX?: number;
  glowOffsetY?: number;

  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowIntensity?: number; // Blur in px
  shadowOpacity?: number; // 0 - 1
  shadowSpread?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  shadowPreset?: string;
}

/**
 * Computes the exact CSS `box-shadow` property for the Guest Web DOM canvas container.
 */
export function getCanvasBoxShadow(canvas?: CanvasGlowShadowConfig | any): string {
  if (!canvas) {
    return '6px 6px 16px rgba(0,0,0,0.06), -6px -6px 16px rgba(255,255,255,0.7)';
  }

  // Completely disabled / flat
  if (canvas.glowEnabled === false && canvas.shadowEnabled === false) {
    return 'none';
  }
  if (canvas.shadowPreset === 'none') {
    return 'none';
  }

  const parts: string[] = [];

  // 1. Dark Shadow (Bottom-Right or Floating)
  const isShadowActive = canvas.shadowEnabled !== false && (canvas.shadowIntensity === undefined || canvas.shadowIntensity > 0);
  if (isShadowActive) {
    const sColor = canvas.shadowColor || '#000000';
    const sOpacity = canvas.shadowOpacity ?? 0.06;
    const sBlur = canvas.shadowIntensity ?? 16;
    const sSpread = canvas.shadowSpread ?? 0;
    const sX = canvas.shadowOffsetX ?? 6;
    const sY = canvas.shadowOffsetY ?? 6;
    const rgba = hexOrRgbToRgba(sColor, sOpacity);
    parts.push(`${sX}px ${sY}px ${sBlur}px ${sSpread}px ${rgba}`);
  }

  // 2. Light Glow / Outer Resplandor
  const isGlowActive = canvas.glowEnabled !== false && (canvas.glowIntensity === undefined || canvas.glowIntensity > 0);
  if (isGlowActive) {
    const gColor = canvas.glowColor || '#FFFFFF';
    const gOpacity = canvas.glowOpacity ?? 0.7;
    const gBlur = canvas.glowIntensity ?? 16;
    const gSpread = canvas.glowSpread ?? 0;
    const gX = canvas.glowOffsetX ?? -6;
    const gY = canvas.glowOffsetY ?? -6;
    const rgba = hexOrRgbToRgba(gColor, gOpacity);
    parts.push(`${gX}px ${gY}px ${gBlur}px ${gSpread}px ${rgba}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'none';
}

export const CANVAS_SHADOW_PRESETS = [
  {
    id: 'none',
    name: 'Sin Brillo / Plano',
    description: 'Bordes limpios sin brillo ni sombras externas',
    config: {
      glowEnabled: false,
      shadowEnabled: false,
      shadowPreset: 'none'
    }
  },
  {
    id: 'neumorphic',
    name: 'Neumórfico Clásico',
    description: 'Resplandor superior blanco y sombra suave inferior',
    config: {
      glowEnabled: true,
      glowColor: '#FFFFFF',
      glowIntensity: 16,
      glowOpacity: 0.7,
      glowOffsetX: -6,
      glowOffsetY: -6,
      shadowEnabled: true,
      shadowColor: '#000000',
      shadowIntensity: 16,
      shadowOpacity: 0.06,
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      shadowPreset: 'neumorphic'
    }
  },
  {
    id: 'golden-glow',
    name: 'Resplandor Dorado',
    description: 'Aura dorada nupcial y sombra cálida envolvente',
    config: {
      glowEnabled: true,
      glowColor: '#D4AF37',
      glowIntensity: 26,
      glowOpacity: 0.5,
      glowOffsetX: 0,
      glowOffsetY: 0,
      shadowEnabled: true,
      shadowColor: '#78350F',
      shadowIntensity: 20,
      shadowOpacity: 0.12,
      shadowOffsetX: 0,
      shadowOffsetY: 8,
      shadowPreset: 'golden-glow'
    }
  },
  {
    id: 'soft-glow',
    name: 'Halo Blanco Suave',
    description: 'Brillo difuso blanco alrededor de todo el canva',
    config: {
      glowEnabled: true,
      glowColor: '#FFFFFF',
      glowIntensity: 28,
      glowOpacity: 0.9,
      glowOffsetX: 0,
      glowOffsetY: 0,
      shadowEnabled: false,
      shadowPreset: 'soft-glow'
    }
  },
  {
    id: 'subtle-shadow',
    name: 'Sombra Flotante',
    description: 'Sombra suave inferior moderna sin resplandor blanco',
    config: {
      glowEnabled: false,
      shadowEnabled: true,
      shadowColor: '#000000',
      shadowIntensity: 24,
      shadowOpacity: 0.1,
      shadowOffsetX: 0,
      shadowOffsetY: 12,
      shadowPreset: 'subtle-shadow'
    }
  },
  {
    id: 'romantic-pink',
    name: 'Halo Rosa Nupcial',
    description: 'Resplandor romántico en tonalidad rosa pastel',
    config: {
      glowEnabled: true,
      glowColor: '#F472B6',
      glowIntensity: 24,
      glowOpacity: 0.45,
      glowOffsetX: 0,
      glowOffsetY: 0,
      shadowEnabled: true,
      shadowColor: '#831843',
      shadowIntensity: 16,
      shadowOpacity: 0.08,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowPreset: 'romantic-pink'
    }
  }
];
