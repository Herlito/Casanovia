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
  theme: any;
  customThemes?: any[];
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

export interface AnimationConfig {
  type: string;
  duration: number;
  delay: number;
  easing: string;
  trigger: 'onLoad' | 'onScroll' | 'onClick';
  infinite?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
  intensity?: number;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'svg-shape' | 'countdown-widget' | 'decorative-element' | 'interactive-button' | 'audio-player' | 'image-frame';
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
  animation?: {
    entrance?: AnimationConfig;
    permanent?: AnimationConfig;
    exit?: AnimationConfig;
  };
}

export interface ElementStyle {
  variant?: string;
  numberColor?: string;
  labelColor?: string;
  titleColor?: string;
  backgroundColor?: string;
  containerBackgroundColor?: string;
  containerOpacity?: number;
  borderColor?: string;
  gap?: number;
  borderRadius?: number;
  cornerRadius?: number;
  paddingX?: number;
  paddingY?: number;
  numberSize?: number;
  labelSize?: number;
  numberFont?: string;
  labelFont?: string;
  isDefaultStyle?: boolean;
  fontSize?: number;
  color?: string;
  fill?: string;
  gradientEnabled?: boolean;
  gradientType?: 'linear' | 'radial';
  gradientColors?: string[];
  gradientStops?: number[];
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic';
  align?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  opacity?: number;
  shadow?: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
  stroke?: string;
  strokeWidth?: number;
  strokeEnabled?: boolean;
  maskId?: string | null;
  frameId?: string | null;
  cropScale?: number;
  cropX?: number;
  cropY?: number;
  objectFit?: string;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    grayscale?: number;
    blur?: number;
    sepia?: number;
  };
}
