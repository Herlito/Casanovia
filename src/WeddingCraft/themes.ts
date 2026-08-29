export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  palette: {
    primary: string;      // Botones, acentos
    secondary: string;    // Fondos de tarjetas
    background: string;   // Canvas background
    text: string;         // Texto principal
    muted: string;        // Texto secundario
    accent: string;       // Detalles especiales
  };
  typography: {
    displayFont: string;  // Títulos (Google Font)
    bodyFont: string;     // Cuerpo (Google Font)
    scriptFont?: string;  // Para nombres
  };
  decorations?: {
    defaultBorderRadius: string;
    pattern?: string;
  };
}

export const predefinedThemes: ThemePreset[] = [
  {
    id: 'elegancia-clasica',
    name: 'Elegancia Clásica',
    description: 'Dorado y marfil con serif elegantes',
    palette: {
      primary: '#D4AF37',      // Dorado
      secondary: '#F5F5DC',    // Beige/Marfil
      background: '#FFFCF5',   // Blanco roto
      text: '#2C241B',         // Marrón oscuro casi negro
      muted: '#8B7355',        // Marrón medio
      accent: '#D4AF37'
    },
    typography: {
      displayFont: 'Playfair Display',
      bodyFont: 'Cormorant Garamond',
      scriptFont: 'Great Vibes'
    },
    decorations: { defaultBorderRadius: '2px' }
  },
  {
    id: 'boho-chic',
    name: 'Boho Chic',
    description: 'Tierra y verde salvia natural',
    palette: {
      primary: '#E07A5F',      // Terra cotta
      secondary: '#81B29A',    // Verde salvia
      background: '#F4F1DE',   // Crema natural
      text: '#3D405B',         // Azul grisáceo oscuro
      muted: '#8D99AE',        // Gris azulado
      accent: '#F2CC8F'        // Amarillo suave
    },
    typography: {
      displayFont: 'Cormorant Garamond',
      bodyFont: 'Montserrat',
      scriptFont: 'Satisfy'
    },
    decorations: { defaultBorderRadius: '8px' }
  },
  {
    id: 'minimalista-moderno',
    name: 'Minimalista Moderno',
    description: 'Blanco, negro y sans-serif limpio',
    palette: {
      primary: '#000000',      // Negro puro
      secondary: '#F8F9FA',    // Gris muy claro
      background: '#FFFFFF',   // Blanco
      text: '#212529',         // Negro suave
      muted: '#6C757D',        // Gris medio
      accent: '#495057'
    },
    typography: {
      displayFont: 'Inter',
      bodyFont: 'Inter',
      scriptFont: 'Dancing Script'
    },
    decorations: { defaultBorderRadius: '0px' }
  },
  {
    id: 'jardin-secreto',
    name: 'Jardín Secreto',
    description: 'Rosas pasteles y verde musgo',
    palette: {
      primary: '#FFB7B2',      // Rosa pastel
      secondary: '#B5EAD7',    // Menta/Verde agua
      background: '#FFF5F5',   // Rosa muy pálido
      text: '#355070',         // Azul petróleo
      muted: '#6D597A',        // Púrpura grisáceo
      accent: '#E56B6F'        // Rosa frambuesa
    },
    typography: {
      displayFont: 'Cinzel',
      bodyFont: 'Lato',
      scriptFont: 'Parisienne'
    },
    decorations: { defaultBorderRadius: '12px' }
  },
  {
    id: 'noche-estrellada',
    name: 'Noche Estrellada',
    description: 'Azul marino y dorado elegante',
    palette: {
      primary: '#D4AF37',      // Dorado
      secondary: '#1B263B',    // Azul marino oscuro
      background: '#0D1B2A',   // Azul noche
      text: '#E0E1DD',         // Blanco hueso
      muted: '#778DA9',        // Azul grisáceo
      accent: '#415A77'        // Azul medio
    },
    typography: {
      displayFont: 'Cinzel Decorative',
      bodyFont: 'Raleway',
      scriptFont: 'Tangerine'
    },
    decorations: { defaultBorderRadius: '4px' }
  },
  {
    id: 'rustico-vintage',
    name: 'Rústico Vintage',
    description: 'Kraft paper y tipografía typewriter',
    palette: {
      primary: '#8B4513',      // Marrón cuero
      secondary: '#D4C5B0',    // Kraft paper
      background: '#F5F5DC',   // Beige
      text: '#3E2723',         // Marrón oscuro
      muted: '#5D4037',        // Marrón medio
      accent: '#A1887F'        // Gris pardo
    },
    typography: {
      displayFont: 'Special Elite', // Typewriter
      bodyFont: 'Courier Prime',
      scriptFont: 'Kaushan Script'
    },
    decorations: { defaultBorderRadius: '2px' }
  }
];
