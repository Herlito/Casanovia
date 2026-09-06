export type ProtocolCategory = 
  | 'anfitrion'          // Anfitrión / Anfitriona / Pareja nupcial
  | 'invitado'           // Invitado general / Amigos
  | 'familia_directa'    // Padres, Abuelos, Hermanos
  | 'wedding_planner'    // Wedding Planner, Coordinación, Staff
  | 'cortejo_honor'      // Padrinos, Madrinas, Damas de Honor, Best Men
  | 'damita_honor'       // Damita de Honor
  | 'paje_honor'         // Paje de Honor
  | 'nino_boda'          // Niño/a de Boda
  | 'proveedor'          // Fotógrafo, DJ, Banquete, Floristería, etc.
  | 'programa_evento'    // Compatibilidad para hitos
  | 'invitado_general'   // Compatibilidad con versiones previas
  | string;              // Roles personalizados configurables

export type GuestRole = ProtocolCategory;

export interface CustomGuestRole {
  id: string;
  label: string;
  shortLabel: string;
  desc?: string;
  badgeClass?: string;
  colorClass?: string;
  iconName?: string;
  isCustom?: boolean;
}

export const GUEST_ROLES_CONFIG: {
  id: ProtocolCategory;
  label: string;
  shortLabel: string;
  desc?: string;
  badgeClass: string;
  iconName: string;
}[] = [
  {
    id: 'anfitrion',
    label: 'Anfitrión',
    shortLabel: 'Anfitrión',
    desc: 'Novios / Anfitriones del evento',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Sparkles',
  },
  {
    id: 'invitado',
    label: 'Invitado',
    shortLabel: 'Invitado',
    desc: 'Invitado general / Amigos',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    iconName: 'User',
  },
  {
    id: 'familia_directa',
    label: 'Familia Directa',
    shortLabel: 'Familia',
    desc: 'Padres, hermanos, abuelos',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    iconName: 'Heart',
  },
  {
    id: 'wedding_planner',
    label: 'Wedding Planner',
    shortLabel: 'Planner',
    desc: 'Coordinador, staff y logística',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconName: 'ShieldCheck',
  },
  {
    id: 'cortejo_honor',
    label: 'Cortejo de Honor',
    shortLabel: 'Cortejo',
    desc: 'Padrinos, madrinas, damas',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'Crown',
  },
  {
    id: 'damita_honor',
    label: 'Damita de Honor',
    shortLabel: 'Damita',
    desc: 'Acompañamiento en cortejo y ramo infantil',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-200',
    iconName: 'Sparkles',
  },
  {
    id: 'paje_honor',
    label: 'Paje de Honor',
    shortLabel: 'Paje',
    desc: 'Portador de arras, anillos o letreros',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    iconName: 'Crown',
  },
  {
    id: 'nino_boda',
    label: 'Niño/a de Boda',
    shortLabel: 'Niño/a',
    desc: 'Menor de edad / comensal infantil',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    iconName: 'Heart',
  },
  {
    id: 'proveedor',
    label: 'Proveedor',
    shortLabel: 'Proveedor',
    desc: 'Fotografía, DJ, banquete, flores',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    iconName: 'Briefcase',
  },
];

export type RsvpStatus = 'confirmed' | 'pending' | 'declined';

export interface Guest {
  id: string;
  code: string; // e.g. "BODA-SOF-01" or simple slug
  fullName: string;
  email?: string;
  phone?: string;
  category: ProtocolCategory;
  protocolRoleTitle?: string; // e.g. "Padrino de Velación", "Madrina de Ramo", "Brindis de Honor", "Dama de Honor"
  isProtocolParticipant: boolean;
  
  // Protocol specific instructions
  specialArrivalTime?: string; // e.g. "15:30h (1h 30m antes de ceremonia)"
  rehearsalSchedule?: string; // e.g. "Viernes 17 de Octubre, 17:00h en Capilla"
  photoshootSchedule?: string; // e.g. "Sábado 18 de Octubre, 16:00h en Jardín Principal"
  dressCodeNote?: string; // e.g. "Corbata tono Champagne Dorado (asignada), Traje obscuro medianoche"
  accessoryAssigned?: string; // e.g. "Boutonniere #2 de rosas blancas y eucalipto (entregado en lobby)"
  assignedMilestone?: string; // e.g. "20:30h - Brindis Oficial y Palabras de Agradecimiento"
  assignedMilestoneId?: string;
  
  // Companion association
  mainGuestId?: string; // ID of the principal guest this person accompanies
  
  // Logistics
  assignedTable?: string; // e.g. "Mesa 1 (Mesa de Honor)", "Mesa 4"
  totalPasses: number;
  confirmedPasses: number;
  
  // RSVP Form fields
  rsvpStatus: RsvpStatus;
  dietaryRestrictions?: string;
  confirmedRehearsalPhotoAttendance?: boolean;
  congratulationMessage?: string;
  updatedAt?: string;
}

export type TimelineCategory = 
  | 'preparacion'
  | 'ceremonia'
  | 'ceremonia_civil'
  | 'coctel'
  | 'sesion_fotos'
  | 'recepcion'
  | 'servir_alimentos'
  | 'saludo_mesas'
  | 'protocolo'
  | 'baile_novios_familia'
  | 'fiesta'
  | string;

export interface TimelineMilestone {
  id: string;
  time: string; // e.g. "15:30", "17:00", "20:30"
  title: string;
  location: string;
  description: string;
  category: TimelineCategory;
  responsiblePerson?: string; // e.g. "Carlos Mendoza (Padrino)"
  responsibleGuestId?: string;
  isProtocolCrucial: boolean;
  dressOrItemsRequired?: string;
}

export const VENDOR_SERVICE_CATEGORIES = [
  'Locación & Banquete',
  'Fotografía & Video',
  'Música & Iluminación',
  'Orquesta & DJ',
  'Floristería & Decoración',
  'Decoración & Mobiliario',
  'Wedging Planner',
  'Iglesia',
  'Municipalidad',
  'Apdayc',
  'HoraLoca & Shows',
  'Vestuario & Belleza',
  'Papelería & Recuerdos',
  'Banquetería & Bebidas',
  'Transporte & Movilidad',
  'Maquillaje & Peinado',
  'Joyería & Alianzas',
  'Pastelería & Mesa de Dulces',
  'Coordinación & Protocolo',
  'Otros Servicios'
] as const;

export type VendorServiceCategory = typeof VENDOR_SERVICE_CATEGORIES[number] | string;

export interface BudgetItem {
  id: string;
  category: string;
  concept: string;
  vendor?: string;
  vendorId?: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  notes?: string;
}

export type TaskPhase = 
  | 'fase_1' // Fase 1: Fundamentos y Reservas Principales (12 a 9 meses antes)
  | 'fase_2' // Fase 2: Estilo, Proveedores Clave y Diseño (8 a 6 meses antes)
  | 'fase_3' // Fase 3: Logística, Detalles y Convocatoria (5 a 3 meses antes)
  | 'fase_4' // Fase 4: Confirmaciones y Protocolo (2 meses a 3 semanas antes)
  | 'fase_5' // Fase 5: Recta Final (Semana previa al evento)
  | 'fase_6' // Fase 6: El Día de la Boda y Post-Boda
  | '12_meses'
  | '6_9_meses'
  | '2_3_meses'
  | '1_mes'
  | 'semana_final'
  | 'dia_boda';

export type TaskPriority = 'alta' | 'media' | 'baja';

export interface WeddingTask {
  id: string;
  title: string;
  phase: TaskPhase;
  priority: TaskPriority;
  isCompleted: boolean;
  dueDate?: string;
  assignee?: string; // e.g. "Novios", "Wedding Planner", "Madrina de Anillos"
}

export interface DressCodeColor {
  name: string;
  hex: string;
  description: string;
  recommendedFor?: string;
}

export interface WeddingCustomTheme {
  enabled: boolean;
  primary: string;
  primaryForeground: string;
  primaryHover?: string;
  secondary: string;
  secondaryForeground: string;
  secondaryHover?: string;
  accent: string;
  accentForeground: string;
  bgSoft: string;
  bgCard: string;
  textMain: string;
  textMuted: string;
  borderSoft: string;
  appliedAt?: string;
}

export interface AdditionalVenue {
  id: string;
  name: string; // e.g. "Hotel Casa Grande - Vallecito", "Iglesia Santa Marta", "Jardines de Sabandía"
  type?: string; // e.g. "Hospedaje / Preparación", "Ceremonia Civil", "Sesión de Fotos", "Recepción & Banquete", "After Party / Tornaboda", "Otro"
  address?: string;
  time?: string;
  googleMapsUrl?: string;
  wazeUrl?: string;
  notes?: string;
}

export type EventType = 'Boda' | 'Quinceañero' | 'Fiesta de Promoción' | 'Aniversario' | 'Corporativo' | 'Baby Shower' | 'Graduación' | 'Otro';

export interface WeddingSettings {
  eventType?: EventType | string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO or YYYY-MM-DD
  weddingTime: string; // e.g. "17:00"
  locationSummary: string; // e.g. "San Pedro Garza García & Santiago, N.L."
  hasReligiousCeremony?: boolean; // Toggle si la boda cuenta con ceremonia religiosa o no
  ceremonyVenue: {
    name: string;
    address: string;
    time: string;
    googleMapsUrl: string;
    wazeUrl: string;
    notes: string;
  };
  receptionVenue: {
    name: string;
    address: string;
    time: string;
    googleMapsUrl: string;
    wazeUrl: string;
    notes: string;
  };
  additionalVenues?: AdditionalVenue[];
  customGuestRoles?: CustomGuestRole[];
  dressCodeStyle: string; // "Formal / Rigurosa Etiqueta", "Gala Cóctel"
  dressCodeDescription: string;
  suggestedColors: DressCodeColor[];
  forbiddenColorsNote: string;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    clabe: string;
    accountNumber: string;
    concept: string;
  };
  showGiftRegistry?: boolean;
  showWishesWall?: boolean; // Toggle si se muestra o no la sección de Mensajes y Bendiciones en la Web Invitados
  giftRegistryTitle?: string;
  giftRegistryMessage?: string;
  showBankDetails?: boolean; // Toggle si se muestra o no la información bancaria en la Web de Invitados
  rsvpDeadline?: string; // Fecha límite para confirmar asistencia (ej. '2026-10-10' o '2026-10-10T23:59:59')
  giftRegistries: {
    storeName: string;
    eventNumber: string;
    url: string;
    badgeText?: string;
  }[];
  generalContactEmail: string;
  generalContactPhone: string;
  romanticQuote?: string; // e.g. "El amor no se mira con los ojos, sino con el corazón."
  totalRealBudget?: number; // Presupuesto Total Real editable por Anfitrión, Wedding Planner y Administrador
  customTheme?: WeddingCustomTheme;
}

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'contratado' | 'en_proceso' | 'liquidado';
  totalCost: number;
  paidAmount: number;
  notes: string;
  attendingReception?: boolean; // ¿Asistirá a la Recepción? (SI / NO)
  receptionAttendeesCount?: number; // Cantidad de personas que asistirán
}

export interface WeddingTable {
  id: string;
  name: string; // e.g. "Mesa Principal (Novios)", "Mesa 1", "Mesa 2"
  capacity: number; // default e.g. 10
  shape?: 'round' | 'rectangular' | 'imperial' | 'square';
  zone?: string; // e.g. "Zona Central", "Jardín", "Terraza", "Pista de Baile"
  notes?: string;
}

export interface Wedding {
  id: string;
  coupleNames: string;
  weddingDate: string;
  locationSummary: string;
  status: 'planning' | 'in_progress' | 'completed';
  settings: WeddingSettings;
  guests: Guest[];
  timeline: TimelineMilestone[];
  budget: BudgetItem[];
  tasks: WeddingTask[];
  tables?: WeddingTable[];
  vendors?: VendorItem[];
  createdByUserId?: string; // ID del usuario que creó la boda
  createdByUserName?: string; // Nombre del usuario que creó la boda
  createdByUserLevel?: number; // Nivel del creador (1 = Super Admin, 3 = Wedding Planner)
  plannerId?: string; // ID del Wedding Planner asignado
  plannerName?: string; // Nombre del Wedding Planner
  createdAt: string;
  updatedAt: string;
}

export interface SystemUser {
  id: string;
  username: string; // e.g. "Herly Lizarazo", "Mariana Flores", "Zenaida Anahua"
  clave: string;    // e.g. "00448157", "88442200", "70242438"
  level: number;    // 1 = Super Admin, 2 = Anfitrión, 3 = Wedding Planner, 5 = Observador (Solo lectura, sin edición ni impresión)
  roleTitle: string; // e.g. "Director General & Protocolo (Nivel 1)", "Wedding Planner Certificada (Nivel 3)", "Anfitriona de Boda (Nivel 2)", "Observador de Eventos (Nivel 5)"
  assignedWeddingIds?: string[]; // IDs de bodas donde este usuario tiene rol de Anfitrión o Planner asignado
  createdWeddingIds?: string[];  // IDs de bodas creadas por este usuario mientras ha sido el usuario activo
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser {
  id?: string;
  username: string;
  level: number; // 1 = Super Admin, 2 = Anfitrión, 3 = Wedding Planner, 5 = Observador (Solo Lectura), 0 = Invitado / Público
  roleTitle: string;
  isAuthenticated: boolean;
  assignedWeddingIds?: string[];
  createdWeddingIds?: string[];
}

export type AppViewMode = 'public' | 'private' | 'new_wedding_tasks' | 'tokens';

export interface TokensPaymentConfig {
  qrImageUrl: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  cci: string;
  yapePhone: string;
  yapeHolder: string;
  extraNotes?: string;
}

export interface UploadedImageRecord {
  id: string;
  url: string;
  name: string;
  size?: number;
  type?: string;
  category: 'voucher' | 'gallery' | 'general';
  uploadedAt: string;
  uploadedBy?: {
    userId?: string;
    username: string;
    level?: number;
    isVisitor?: boolean;
    roleTitle?: string;
  };
  orderCode?: string;
  orderTotal?: number;
  selectedPlansSummary?: string;
  weddingId?: string;
  notes?: string;
}

// Floor Plan & PDF Seating Designer Types
export type FloorPlanElementType =
  | 'round_table'
  | 'rectangular_table'
  | 'stage'
  | 'dance_floor'
  | 'bar'
  | 'dj_booth'
  | 'restrooms'
  | 'entrance'
  | 'photo_booth'
  | 'cake_table'
  | 'lounge'
  | 'text_label'
  | 'single_chair'
  | 'chair_row'
  | 'armchair_luis_xv'
  | 'sofa_1_seat'
  | 'sofa_2_seat'
  | 'rug';

export interface FloorPlanSeat {
  id: string;
  seatNumber: number;
  guestId?: string;
  guestName?: string;
  guestInitials?: string;
  guestPhone?: string;
  dietaryRequirement?: string;
  companionCount?: number;
}

export interface FloorPlanElement {
  id: string;
  type: FloorPlanElementType;
  name: string;
  tableNumber?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number; // for round tables / circles
  rotation: number; // in degrees
  seatCount?: number; // for round table (2-12)
  seatsLongSide?: number; // for rectangular table
  seatsHead?: number; // for rectangular table (0, 1, 2)
  seats: FloorPlanSeat[];
  color?: string;
  textColor?: string;
  chairCount?: number; // for chair_row
  isLocked?: boolean;
  zIndex?: number;
  customNotes?: string;
}

export interface FloorPlanScaleCalibration {
  isCalibrated: boolean;
  pixelDistance: number;
  realMeters: number;
  pixelsPerMeter: number;
}

export interface WeddingFloorPlan {
  id: string;
  weddingId: string;
  backgroundImageUrl?: string;
  backgroundFileName?: string;
  backgroundWidth?: number;
  backgroundHeight?: number;
  backgroundOpacity?: number;
  scale: FloorPlanScaleCalibration;
  elements: FloorPlanElement[];
  gridSnap: boolean;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasBackgroundColor?: string;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
}

