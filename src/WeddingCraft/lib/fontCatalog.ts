export interface FontOption {
  family: string;
  category: 'script' | 'serif' | 'sans' | 'display' | 'typewriter';
  weights: number[];
  popular?: boolean;
}

export const FONT_CATALOG: FontOption[] = [
  // Script
  { family: 'Great Vibes', category: 'script', weights: [400], popular: true },
  { family: 'Dancing Script', category: 'script', weights: [400, 500, 600, 700], popular: true },
  { family: 'Parisienne', category: 'script', weights: [400] },
  { family: 'Satisfy', category: 'script', weights: [400] },
  { family: 'Tangerine', category: 'script', weights: [400, 700] },
  { family: 'Alex Brush', category: 'script', weights: [400] },
  { family: 'Allura', category: 'script', weights: [400] },
  { family: 'Kaushan Script', category: 'script', weights: [400] },
  
  // Serif
  { family: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Cinzel', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Cinzel Decorative', category: 'serif', weights: [400, 700, 900] },
  { family: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800] },
  { family: 'Marcellus', category: 'serif', weights: [400] },
  { family: 'Italiana', category: 'serif', weights: [400] },

  // Sans
  { family: 'Montserrat', category: 'sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { family: 'Lato', category: 'sans', weights: [100, 300, 400, 700, 900] },
  { family: 'Raleway', category: 'sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { family: 'Inter', category: 'sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { family: 'Poppins', category: 'sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { family: 'Josefin Sans', category: 'sans', weights: [100, 200, 300, 400, 500, 600, 700] },

  // Display
  { family: 'Bodoni Moda', category: 'display', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Abril Fatface', category: 'display', weights: [400] },
  { family: 'Yeseva One', category: 'display', weights: [400] },

  // Typewriter
  { family: 'Special Elite', category: 'typewriter', weights: [400] },
  { family: 'Courier Prime', category: 'typewriter', weights: [400, 700] },
];
