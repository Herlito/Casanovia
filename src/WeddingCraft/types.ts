export interface EventDataInput {
  eventId: string;
  coupleNames: [string, string];
  eventDate: string; // ISO Date
  venueName?: string;
  venueAddress?: string;
  currentTheme?: string;
  isReadOnly?: boolean;
}

export interface WeddingDesignDocument {
  id: string;
  parentEventId: string;
  metadata: {
    createdAt: number;
    lastModified: number;
    version: string;
  };
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
  theme: ThemeConfig;
  pages: Page[];
  assetReferences: string[];
}

export interface Page {
  id: string;
  name: string;
  elements: CanvasElement[];
  background?: BackgroundLayer;
}

export interface BackgroundLayer {
  color?: string;
  imageUrl?: string;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'svg-shape' | 'countdown-widget' | 'decorative-element';
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  };
  style: ElementStyle;
  content: any;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  parentGroup?: string;
  dataBinding?: {
    field: 'coupleNames' | 'eventDate' | 'venueName';
    format?: string; // e.g. "{{0}} & {{1}}"
  };
}

export interface ElementStyle {
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    muted: string;
    accent: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
    scriptFont?: string;
  };
  decorations: {
    borderStyle?: string;
    patternOverlay?: string;
    defaultShapes: string[];
  };
}
