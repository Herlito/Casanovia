import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  saveWeddingToHosting,
  fetchWeddingsFromHosting,
  fetchWeddingByIdFromHosting,
  deleteWeddingFromHosting,
  saveUserToHosting,
  saveUsersBulkToHosting,
  fetchUsersFromHosting,
  deleteUserFromHosting,
  saveSystemConfigToHosting,
  fetchSystemConfigFromHosting,
  saveFloorPlanToHosting,
  deleteFloorPlanFromHosting,
  sanitizeData as cleanFirestoreData,
} from '../services/hostingStorage';
import { 
  Guest, 
  TimelineMilestone, 
  BudgetItem, 
  WeddingTask, 
  WeddingSettings, 
  AdditionalVenue,
  Wedding,
  AuthUser,
  SystemUser,
  RsvpStatus,
  VendorItem,
  WeddingTable,
  TokensPaymentConfig,
  UploadedImageRecord,
  WeddingCustomTheme,
  DressCodeColor,
  PromotionFeeQuota,
  PartialPayment
} from '../types';
import { 
  initialGuests, 
  initialTimeline, 
  initialBudget, 
  initialWeddingSettings, 
  initialDefaultWedding,
  initialWeddingsList,
  initialJuanJuanaWedding,
  initialErikaWedding,
  INITIAL_SYSTEM_USERS,
  generateMasterTasksForWedding,
  initialVendors,
  initialTables,
  INITIAL_TOKENS_PAYMENT_CONFIG
} from '../data/initialData';
import publishedDesignsData from '../data/publishedDesignsData.json';
import { sortWeddingsByDate, sortTimelineMilestones, isRsvpDeadlinePassed } from '../lib/dateUtils';
import { syncVendorsIntoBudget, buildBudgetDirectlyFromVendors } from '../lib/budgetSyncUtils';
import { formatAltibajas, setActiveCurrencyCountry } from '../lib/formatUtils';
import { generateWeddingTheme, getDefaultWeddingTheme } from '../lib/themeUtils';
import { generateEventSlug, sanitizeEventNameForSlug, getCanonicalEventKey } from '../lib/slugUtils';

export const LEVEL_1_USER = {
  id: 'user-herly-lizarazo',
  username: 'Herly Lizarazo',
  clave: '00448157',
  level: 1,
  roleTitle: 'Director de Bodas & Protocolo (Nivel 1 - Super Admin)',
};

export const DEPRECATED_OR_DELETED_WEDDING_IDS = new Set([
  'boda-sofia-alejandro',
  'boda-valentina-mateo',
]);

export function getDeletedWeddingIdsSet(): Set<string> {
  const set = new Set<string>([
    'boda-sofia-alejandro',
    'boda-valentina-mateo',
  ]);
  try {
    const stored = localStorage.getItem('casanovia_deleted_wedding_ids');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: string) => {
          if (id && typeof id === 'string') {
            const clean = id.toLowerCase().trim();
            // Prevent false-positive generic strings or corrupted entries
            if (clean && clean !== 'evento' && clean !== '0101-evento') {
              set.add(clean);
            }
          }
        });
      }
    }
  } catch {}
  return set;
}

export function markWeddingAsDeletedLocally(weddingId: string, slug?: string) {
  const set = getDeletedWeddingIdsSet();
  if (weddingId) {
    const wClean = weddingId.toLowerCase().trim();
    if (wClean && wClean !== 'evento' && wClean !== '0101-evento') {
      set.add(wClean);
    }
  }
  if (slug) {
    const sClean = slug.toLowerCase().trim();
    if (sClean && sClean !== 'evento' && sClean !== '0101-evento') {
      set.add(sClean);
    }
  }
  try {
    localStorage.setItem('casanovia_deleted_wedding_ids', JSON.stringify(Array.from(set)));
  } catch {}
}

export function isWeddingDeleted(w: Wedding | string, deletedSet?: Set<string>): boolean {
  const set = deletedSet || getDeletedWeddingIdsSet();
  if (typeof w === 'string') {
    const cleanStr = w.toLowerCase().trim();
    return set.has(cleanStr);
  }

  if (!w || !w.id) return false;
  const wId = (w.id || '').toLowerCase().trim();
  const wSlug = (w.slug || '').toLowerCase().trim();
  if (set.has(wId) || (wSlug && set.has(wSlug))) return true;

  return false;
}

/**
 * Consolidates an array of wedding objects from multiple sources (SQLite, JSON files, seeds, imports)
 * into clean, unique records under the canonical slug format "MMDD-nombreevento" without the letter "y".
 * 
 * Merges:
 * - Guests: combines all unique guests, keeping RSVPs, table seatings, and contact details without losing anyone.
 * - Tables: combines table arrangements and seatings.
 * - Timeline: combines schedule milestones chronologically.
 * - Tasks, budget, and vendors.
 * - Published invitation designs.
 */
export function consolidateWeddingsList(rawList: Wedding[]): Wedding[] {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  // Filter valid objects
  const validList = rawList.filter(
    (w) => w && typeof w === 'object' && (w.id || w.coupleNames || w.title || w.settings?.coupleNames)
  );

  // Group by canonical event key (e.g. 0919-anaedu, 0912-zenaidaronny, 0919-juanjuana)
  const grouped = new Map<string, Wedding[]>();

  for (const item of validList) {
    const canonSlug = getCanonicalEventKey(item);
    if (!canonSlug) continue;

    if (!grouped.has(canonSlug)) {
      grouped.set(canonSlug, []);
    }
    grouped.get(canonSlug)!.push(item);
  }

  const consolidated: Wedding[] = [];

  for (const [canonSlug, entries] of grouped.entries()) {
    // Sort entries so the most complete one is prioritized
    entries.sort((a, b) => {
      const scoreA = (a.guests?.length || 0) * 10 + (a.tables?.length || 0) * 5 + (a.weddingCraftDesign ? 50 : 0) + (a.coupleNames && !a.coupleNames.startsWith('0101-') ? 20 : 0);
      const scoreB = (b.guests?.length || 0) * 10 + (b.tables?.length || 0) * 5 + (b.weddingCraftDesign ? 50 : 0) + (b.coupleNames && !b.coupleNames.startsWith('0101-') ? 20 : 0);
      return scoreB - scoreA;
    });

    const bestEntry = entries[0];

    // Pick cleanest coupleNames from entries (avoid "0101-...", "boda-...")
    let bestCoupleNames = bestEntry.coupleNames || bestEntry.title || bestEntry.settings?.coupleNames || '';
    for (const e of entries) {
      const name = e.coupleNames || e.title || e.settings?.coupleNames || '';
      if (name && !name.startsWith('0101-') && !name.toLowerCase().startsWith('boda-') && !name.match(/^\d{4}-/)) {
        bestCoupleNames = name;
        break;
      }
    }
    if (!bestCoupleNames) {
      bestCoupleNames = bestEntry.coupleNames || bestEntry.title || canonSlug;
    }

    // Pick best weddingDate
    let bestWeddingDate = bestEntry.weddingDate || bestEntry.settings?.weddingDate || '';
    for (const e of entries) {
      const d = e.weddingDate || e.settings?.weddingDate || '';
      if (d && !d.includes('01-01') && !d.includes('0101')) {
        bestWeddingDate = d;
        break;
      }
    }
    if (!bestWeddingDate) {
      bestWeddingDate = bestEntry.weddingDate || '2026-09-19';
    }

    // Merge Settings
    let mergedSettings: WeddingSettings = {
      ...(bestEntry.settings || initialWeddingSettings),
      coupleNames: bestCoupleNames,
      weddingDate: bestWeddingDate,
    };
    for (const e of entries) {
      if (e.settings) {
        mergedSettings = {
          ...mergedSettings,
          ...Object.fromEntries(Object.entries(e.settings).filter(([_, v]) => v !== undefined && v !== null && v !== '')),
          coupleNames: bestCoupleNames,
          weddingDate: bestWeddingDate,
        };
      }
    }

    // Merge Guests comprehensively
    const guestMap = new Map<string, Guest>();
    for (const e of entries) {
      if (Array.isArray(e.guests)) {
        for (const g of e.guests) {
          if (!g) continue;
          const normName = (g.fullName || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const key = g.id || normName || g.phone || g.email;
          if (!key) continue;

          if (!guestMap.has(key)) {
            const existingByName = normName ? Array.from(guestMap.values()).find(
              (eg) => (eg.fullName || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === normName
            ) : null;

            if (existingByName) {
              const mergedG: Guest = {
                ...existingByName,
                ...g,
                rsvpStatus: g.rsvpStatus === 'confirmed' ? 'confirmed' : (existingByName.rsvpStatus || g.rsvpStatus),
                assignedTable: g.assignedTable || existingByName.assignedTable,
                totalPasses: Math.max(g.totalPasses || 1, existingByName.totalPasses || 1),
                confirmedPasses: Math.max(g.confirmedPasses || 0, existingByName.confirmedPasses || 0),
                dietaryRestrictions: g.dietaryRestrictions || existingByName.dietaryRestrictions,
                notes: g.notes || existingByName.notes,
              };
              guestMap.set(existingByName.id || key, mergedG);
            } else {
              guestMap.set(key, { ...g });
            }
          } else {
            const existing = guestMap.get(key)!;
            const mergedG: Guest = {
              ...existing,
              ...g,
              rsvpStatus: g.rsvpStatus === 'confirmed' ? 'confirmed' : (existing.rsvpStatus || g.rsvpStatus),
              assignedTable: g.assignedTable || existing.assignedTable,
              totalPasses: Math.max(g.totalPasses || 1, existing.totalPasses || 1),
              confirmedPasses: Math.max(g.confirmedPasses || 0, existing.confirmedPasses || 0),
              dietaryRestrictions: g.dietaryRestrictions || existing.dietaryRestrictions,
              notes: g.notes || existing.notes,
            };
            guestMap.set(key, mergedG);
          }
        }
      }
    }

    // Merge Tables
    const tableMap = new Map<string, WeddingTable>();
    for (const e of entries) {
      if (Array.isArray(e.tables)) {
        for (const tb of e.tables) {
          if (!tb) continue;
          const tbKey = tb.id || (tb.name ? tb.name.toLowerCase().trim() : '');
          if (!tbKey) continue;
          if (!tableMap.has(tbKey)) {
            tableMap.set(tbKey, { ...tb });
          } else {
            const existingTb = tableMap.get(tbKey)!;
            tableMap.set(tbKey, {
              ...existingTb,
              ...tb,
              capacity: Math.max(existingTb.capacity || 10, tb.capacity || 10),
            });
          }
        }
      }
    }

    // Merge Timeline
    const timelineMap = new Map<string, TimelineMilestone>();
    for (const e of entries) {
      if (Array.isArray(e.timeline)) {
        for (const tm of e.timeline) {
          if (!tm) continue;
          const tmKey = tm.id || `${tm.time || ''}-${(tm.title || '').toLowerCase().trim()}`;
          if (!tmKey) continue;
          if (!timelineMap.has(tmKey)) {
            timelineMap.set(tmKey, { ...tm });
          }
        }
      }
    }

    // Merge Tasks
    const taskMap = new Map<string, WeddingTask>();
    for (const e of entries) {
      if (Array.isArray(e.tasks)) {
        for (const tk of e.tasks) {
          if (!tk) continue;
          const tkKey = tk.id || (tk.title ? tk.title.toLowerCase().trim() : '');
          if (!tkKey) continue;
          if (!taskMap.has(tkKey)) {
            taskMap.set(tkKey, { ...tk });
          } else {
            const existingTk = taskMap.get(tkKey)!;
            taskMap.set(tkKey, {
              ...existingTk,
              ...tk,
              isCompleted: existingTk.isCompleted || (tk as any).isCompleted || (tk as any).completed || false,
            });
          }
        }
      }
    }

    // Merge Budget
    const budgetMap = new Map<string, BudgetItem>();
    for (const e of entries) {
      if (Array.isArray(e.budget)) {
        for (const bg of e.budget) {
          if (!bg) continue;
          const bgConcept = bg.concept || (bg as any).name || (bg as any).item || '';
          const bgKey = bg.id || `${bg.category || ''}-${bgConcept.toLowerCase().trim()}`;
          if (!bgKey) continue;
          if (!budgetMap.has(bgKey)) {
            budgetMap.set(bgKey, { ...bg });
          }
        }
      }
    }

    // Merge Vendors
    const vendorMap = new Map<string, VendorItem>();
    for (const e of entries) {
      if (Array.isArray(e.vendors)) {
        for (const vd of e.vendors) {
          if (!vd) continue;
          const vdKey = vd.id || (vd.name ? vd.name.toLowerCase().trim() : '');
          if (!vdKey) continue;
          if (!vendorMap.has(vdKey)) {
            vendorMap.set(vdKey, { ...vd });
          }
        }
      }
    }

    // Merge WeddingCraft Design
    let bestDesign: any = null;
    for (const e of entries) {
      if (e.weddingCraftDesign && (e.weddingCraftDesign.pages?.length || e.weddingCraftDesign.elements?.length)) {
        bestDesign = e.weddingCraftDesign;
        break;
      }
    }
    if (!bestDesign && (publishedDesignsData as Record<string, any>)[canonSlug]) {
      bestDesign = (publishedDesignsData as Record<string, any>)[canonSlug];
    }

    const mergedWedding: Wedding = {
      ...bestEntry,
      id: canonSlug,
      slug: canonSlug,
      title: bestCoupleNames,
      coupleNames: bestCoupleNames,
      weddingDate: bestWeddingDate,
      settings: mergedSettings,
      guests: Array.from(guestMap.values()),
      tables: Array.from(tableMap.values()),
      timeline: Array.from(timelineMap.values()).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
      tasks: taskMap.size > 0 ? Array.from(taskMap.values()) : generateMasterTasksForWedding(),
      budget: Array.from(budgetMap.values()),
      vendors: Array.from(vendorMap.values()),
      weddingCraftDesign: bestDesign || bestEntry.weddingCraftDesign,
    };

    consolidated.push(mergedWedding);
  }

  return sortWeddingsByDate(consolidated);
}

export function deduplicateAndFilterWeddingsList(rawList: Wedding[]): Wedding[] {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];
  const deletedSet = getDeletedWeddingIdsSet();
  const validList = rawList.filter((w) => w && w.id && !isWeddingDeleted(w, deletedSet));
  return consolidateWeddingsList(validList);
}

export const DEFAULT_ANONYMOUS_USER: AuthUser = {
  username: 'Invitado',
  level: 0,
  roleTitle: 'Visitante / Invitado',
  isAuthenticated: false,
};

interface WeddingContextType {
  // Navigation & View
  viewMode: 'public' | 'private' | 'new_wedding_tasks' | 'tokens';
  appTheme: 'neumorphic' | 'classic' | 'minimalist';
  setAppTheme: (theme: 'neumorphic' | 'classic' | 'minimalist') => void;
  setViewMode: (view: 'public' | 'private' | 'new_wedding_tasks' | 'tokens') => void;
  activeView: 'public' | 'private' | 'new_wedding_tasks' | 'tokens';
  setActiveView: (view: 'public' | 'private' | 'new_wedding_tasks' | 'tokens') => void;
  
  // Auth & RBAC
  currentUser: AuthUser;
  login: (username: string, clave: string) => { success: boolean; message: string };
  logout: () => void;
  isLevel1Admin: boolean;
  isHostUser: boolean;
  isLevel3Planner: boolean;
  isLevel4Free: boolean;
  isLevel5Observer: boolean;
  canPrint: boolean;
  isPlannerOrAdmin: boolean;
  canCreateWedding: boolean;
  canManageUsers: boolean;
  canEditActiveWedding: boolean;
  isLevel4TrialExpired: boolean;
  level4DaysRemaining: number;
  level4RegistrationDateStr: string;
  upgradeNotice: { isOpen: boolean; featureTitle: string; message: string };
  showUpgradeNotice: (featureTitle?: string, message?: string) => void;
  closeUpgradeNotice: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showNewWeddingModal: boolean;
  setShowNewWeddingModal: (show: boolean) => void;
  setActiveWeddingId: (id: string) => void;
  showUserManagementModal: boolean;
  setShowUserManagementModal: (show: boolean) => void;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  getShareableWeddingUrl: (weddingId?: string) => string;

  // System Users Management (Admin)
  systemUsers: SystemUser[];
  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => Promise<SystemUser>;
  updateSystemUser: (id: string, updates: Partial<SystemUser>) => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;

  // Multi-Wedding Management
  weddings: Wedding[];
  accessibleWeddings: Wedding[];
  userCreatedWeddings: Wedding[];
  activeWeddingId: string;
  activeWedding: Wedding | null;
  selectWedding: (weddingId: string) => void;
  createNewWedding: (data: {
    eventType?: string;
    coupleNames: string;
    brideName?: string;
    groomName?: string;
    weddingDate: string;
    locationSummary: string;
    ceremonyVenueName?: string;
    receptionVenueName?: string;
    emptyFields?: boolean;
  }) => Promise<string>;
  deleteWedding: (weddingId: string) => Promise<void>;
  
  // Active Wedding Specific Data
  settings: WeddingSettings;
  updateSettings: (newSettings: Partial<WeddingSettings>) => Promise<void>;
  addAdditionalVenue: (venue: Omit<AdditionalVenue, 'id'>) => Promise<AdditionalVenue>;
  updateAdditionalVenue: (id: string, updates: Partial<AdditionalVenue>) => Promise<void>;
  deleteAdditionalVenue: (id: string) => Promise<void>;
  
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id'>) => Promise<Guest>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<void>;
  assignCompanion: (primaryGuestId: string, companionGuestId: string, targetTable?: string) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  reorderGuests: (reorderedGuests: Guest[]) => Promise<void>;
  importGuests: (newGuests: Guest[], mode: 'append' | 'replace') => Promise<void>;
  submitGuestRsvp: (guestCodeOrName: string, rsvpData: {
    fullName: string;
    rsvpStatus: RsvpStatus;
    confirmedPasses: number;
    dietaryRestrictions?: string;
    confirmedRehearsalPhotoAttendance?: boolean;
    congratulationMessage?: string;
  }) => Promise<{ success: boolean; guest?: Guest; message: string }>;
  findGuestByQuery: (query: string) => Guest | undefined;
  
  timeline: TimelineMilestone[];
  addMilestone: (milestone: Omit<TimelineMilestone, 'id'>) => Promise<void>;
  updateMilestone: (id: string, updates: Partial<TimelineMilestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  setTimeline: (newTimeline: TimelineMilestone[]) => Promise<void>;
  
  budget: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  syncBudgetWithVendors: () => Promise<void>;
  
  // Finanzas Fiesta de Promoción (Cuotas y Pagos Parciales Padres de Familia)
  promotionQuotas: PromotionFeeQuota[];
  addPromotionQuota: (quota: Omit<PromotionFeeQuota, 'id' | 'createdAt' | 'updatedAt' | 'partialPayments' | 'status'> & { partialPayments?: PartialPayment[] }) => Promise<void>;
  updatePromotionQuota: (id: string, updates: Partial<PromotionFeeQuota>) => Promise<void>;
  deletePromotionQuota: (id: string) => Promise<void>;
  addPartialPaymentToQuota: (quotaId: string, payment: Omit<PartialPayment, 'id' | 'createdAt'>) => Promise<void>;
  deletePartialPaymentFromQuota: (quotaId: string, paymentId: string) => Promise<void>;
  assignGlobalPromotionQuota: (globalTargetAmount: number, notes?: string) => Promise<{ updatedCount: number; createdCount: number }>;
  isPromotionComisionUser: boolean;
  
  tasks: WeddingTask[];
  addTask: (task: Omit<WeddingTask, 'id'>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleAllTasks: (completed: boolean) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
  setAllTasks: (tasks: WeddingTask[]) => Promise<void>;
  updateTask: (id: string, updates: Partial<WeddingTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetTasksToMaster: () => Promise<void>;
  
  // Vendors & Services
  vendors: VendorItem[];
  addVendor: (vendor: Omit<VendorItem, 'id'>) => Promise<VendorItem>;
  updateVendor: (id: string, updates: Partial<VendorItem>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  
  // Tables & Seating Arrangement
  tables: WeddingTable[];
  updateTables: (tables: WeddingTable[]) => Promise<void>;
  addTable: (table: Omit<WeddingTable, 'id'>) => Promise<WeddingTable>;
  updateTable: (id: string, updates: Partial<WeddingTable>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  batchAssignGuestsToTable: (guestIds: string[], tableName: string) => Promise<void>;
  batchUpdateGuests: (updatedGuests: Guest[]) => Promise<void>;
  
  // Backup & Reset
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => Promise<boolean>;
  exportAllDatabaseJson: () => void;
  importAllDatabaseJson: (jsonString: string) => Promise<{ success: boolean; message: string; weddingsCount: number; usersCount: number }>;
  resetToDemoData: () => Promise<void>;
  clearWeddingData: (targetWeddingId?: string) => Promise<void>;
  
  // Custom Theme for this wedding
  currentWeddingTheme: WeddingCustomTheme;
  applyWeddingColorsTheme: (colors?: DressCodeColor[]) => Promise<WeddingCustomTheme>;
  resetWeddingColorsTheme: () => Promise<void>;

  // Shared Active Guest for Guide Modal
  selectedGuestForGuide: Guest | null;
  setSelectedGuestForGuide: (guest: Guest | null) => void;

  // Tokens Payment Configuration (Admin Editable)
  tokensPaymentConfig: TokensPaymentConfig;
  updateTokensPaymentConfig: (updates: Partial<TokensPaymentConfig>) => Promise<void>;

  // Uploaded Images & Payment Receipts (Admin & Visitor uploads)
  uploadedImages: UploadedImageRecord[];
  showUploadedImagesModal: boolean;
  setShowUploadedImagesModal: (show: boolean) => void;
  saveUploadedImage: (record: Omit<UploadedImageRecord, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }) => Promise<string>;
  deleteUploadedImage: (id: string) => Promise<void>;

  // Floor Plan Designer Modal (Admin & Planner)
  showFloorPlanModal: boolean;
  setShowFloorPlanModal: (show: boolean) => void;
  showWeddingCraftModal: boolean;
  setShowWeddingCraftModal: (show: boolean) => void;

  // RSVP Full-Screen Modal
  isRsvpModalOpen: boolean;
  setIsRsvpModalOpen: (show: boolean) => void;
  openRsvpModal: () => void;
  closeRsvpModal: () => void;

  // Navigation & URL status
  hasWeddingUrlParam: boolean;
  isPublicHomeLanding: boolean;
  isNoviasLanding: boolean;
  getRequestedWeddingIdFromUrl: () => string;

  // Firebase status
  isFirebaseLoading: boolean;
  isFirebaseConnected: boolean;

  // Precarga de la app (al ingresar y al cerrar sesión)
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Helper to check if URL explicitly requests the /novias landing page
  const isNoviasUrlRequested = (): boolean => {
    try {
      if (typeof window !== 'undefined') {
        const path = (window.location.pathname || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        return (
          path === '/novias' ||
          path === '/novias/' ||
          path.startsWith('/novias/') ||
          search.includes('novias') ||
          search.includes('page=novias') ||
          search.includes('page=Novias') ||
          hash.includes('novias')
        );
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Helper to check if URL explicitly requests the /precios (or legacy /tokens) query
  const isTokensUrlRequested = (): boolean => {
    try {
      if (typeof window !== 'undefined') {
        const path = (window.location.pathname || '').toLowerCase();
        const search = (window.location.search || '').toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        return (
          path.includes('/precios') ||
          path.endsWith('/precios') ||
          path.includes('/tokens') ||
          path.endsWith('/tokens') ||
          search.includes('precios') ||
          search.includes('page=precios') ||
          search.includes('page=Precios') ||
          search.includes('tokens') ||
          search.includes('page=tokens') ||
          hash.includes('precios') ||
          hash.includes('tokens')
        );
      }
    } catch {
      // ignore
    }
    return false;
  };

  
  const [appTheme, setAppThemeState] = useState<'neumorphic' | 'classic' | 'minimalist'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('casanovia_app_theme');
      if (saved === 'minimalist') return 'minimalist';
      if (saved === 'classic') return 'classic';
    }
    return 'neumorphic';
  });

  const setAppTheme = (theme: 'neumorphic' | 'classic' | 'minimalist') => {
    setAppThemeState(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('casanovia_app_theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  };

  // Add an effect to set it initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.setAttribute('data-theme', appTheme);
    }
  }, [appTheme]);


  const [viewMode, setViewModeState] = useState<'public' | 'private' | 'new_wedding_tasks' | 'tokens'>(() => {
    if (isTokensUrlRequested()) {
      return 'tokens';
    }
    return 'public';
  });
  
  // Auth state: check session or default to anonymous
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const savedAuth = sessionStorage.getItem('wedding_hub_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_ANONYMOUS_USER;
  });


  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewWeddingModal, setShowNewWeddingModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadedImagesModal, setShowUploadedImagesModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [showWeddingCraftModal, setShowWeddingCraftModal] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageRecord[]>([]);

  // Helper to extract requested wedding from URL query parameters or pathname/hash
  const getRequestedWeddingIdFromUrl = (): string => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const bodaParam =
          urlParams.get('boda') ||
          urlParams.get('evento') ||
          urlParams.get('event') ||
          urlParams.get('wedding') ||
          urlParams.get('w') ||
          urlParams.get('id') ||
          urlParams.get('b') ||
          urlParams.get('novios') ||
          urlParams.get('slug') ||
          urlParams.get('invitacion') ||
          urlParams.get('invitado') ||
          urlParams.get('guest') ||
          urlParams.get('code') ||
          urlParams.get('c') ||
          urlParams.get('token') ||
          urlParams.get('pase');

        if (isNoviasUrlRequested()) {
          return '';
        }

        if (bodaParam) {
          return decodeURIComponent(bodaParam).trim();
        }

        // Check if query string is a raw slug directly: e.g. "?1128-erikayemar"
        const rawSearch = window.location.search.replace(/^\?/, '').trim();
        if (rawSearch && !rawSearch.includes('=')) {
          const decoded = decodeURIComponent(rawSearch).trim();
          if (decoded && !['precios', 'tokens', 'admin', 'login', 'portal', 'home', 'novias'].includes(decoded.toLowerCase())) {
            return decoded;
          }
        }

        if (window.location.hash) {
          const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).trim();
          if (hash) {
            const cleanHash = hash.replace(/^(boda\/|wedding\/|evento\/)/, '');
            if (cleanHash && !cleanHash.includes('page=') && !cleanHash.includes('precios') && !cleanHash.includes('tokens') && !cleanHash.includes('novias')) {
              return cleanHash;
            }
          }
        }

        // Check pathname segments e.g. /1128-erikayemar, /boda/1128-erikayemar, /boda-erika-yemar-6398
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        for (const seg of pathSegments) {
          const cleanSeg = decodeURIComponent(seg).trim();
          if (
            cleanSeg.toLowerCase() === 'novias' ||
            cleanSeg.toLowerCase() === 'precios' ||
            cleanSeg.toLowerCase() === 'tokens' ||
            cleanSeg.toLowerCase() === 'admin'
          ) {
            continue;
          }
          if (
            cleanSeg.startsWith('boda-') ||
            cleanSeg.startsWith('wedding-') ||
            /^\d{4}-/.test(cleanSeg) ||
            (cleanSeg.includes('-') && !['precios', 'tokens', 'api', 'assets', 'admin', 'login', 'novias'].includes(cleanSeg.toLowerCase()))
          ) {
            return cleanSeg;
          }
        }
      }
    } catch (e) {
      console.error('Error reading wedding ID from URL:', e);
    }
    return '';
  };

  // Helper to retrieve previously indicated/persisted wedding ID from local storage
  const getStoredIndicatedWeddingId = (): string => {
    try {
      if (typeof window !== 'undefined') {
        const stored =
          localStorage.getItem('casanovia_indicated_wedding_id') ||
          localStorage.getItem('weddinghub_active_wedding_id');
        if (stored) {
          return decodeURIComponent(stored).trim();
        }
      }
    } catch {
      // ignore
    }
    return '';
  };

  // Helper to persist indicated wedding ID to local storage
  const persistIndicatedWeddingId = (weddingId: string) => {
    if (!weddingId) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('casanovia_indicated_wedding_id', weddingId);
        localStorage.setItem('weddinghub_active_wedding_id', weddingId);
      }
    } catch {
      // ignore
    }
  };

  // Helper to find a wedding matching the requested identifier
  const findWeddingByRequestedParam = (weddingsList: Wedding[], requested: string): Wedding | undefined => {
    if (!requested || !weddingsList || weddingsList.length === 0) return undefined;
    const cleanReq = decodeURIComponent(requested).trim().toLowerCase();
    if (!cleanReq) return undefined;

    // 0. Match by standardized slug (e.g. "0919-juanyjuana")
    let found = weddingsList.find((w) => {
      const slug = generateEventSlug(w.coupleNames || '', w.weddingDate || w.settings?.weddingDate).toLowerCase();
      return slug === cleanReq || slug.replace(/y/g, '') === cleanReq.replace(/y/g, '');
    });
    if (found) return found;

    // 1. Exact ID match (case-insensitive)
    found = weddingsList.find((w) => w.id.toLowerCase() === cleanReq);
    if (found) return found;

    // 2. ID match without 'boda-' or 'wedding-' prefix
    const unPrefixedReq = cleanReq.replace(/^(boda-|wedding-)/, '');
    found = weddingsList.find(
      (w) => w.id.toLowerCase().replace(/^(boda-|wedding-)/, '') === unPrefixedReq
    );
    if (found) return found;

    // 2.5 Match stripping trailing random numeric suffix (e.g. "boda-erika-yemar-6398" <-> "boda-erika-yemar")
    const stripSuffix = (s: string) => s.replace(/[-_]\d+$/, '').replace(/^(boda-|wedding-)/, '');
    const cleanReqNoSuffix = stripSuffix(cleanReq);
    found = weddingsList.find((w) => stripSuffix(w.id.toLowerCase()) === cleanReqNoSuffix);
    if (found) return found;

    // 3. Match against normalized couple names (e.g. "zenaida-ronny" -> "Zenaida & Ronny", "erika-yemar-6398" -> "Erika & Yemar")
    found = weddingsList.find((w) => {
      const coupleLower = (w.coupleNames || '').toLowerCase();
      const coupleClean = coupleLower.replace(/[^a-z0-9]/g, '');
      const reqClean = cleanReq.replace(/[^a-z0-9]/g, '');
      const reqNoDigits = cleanReq.replace(/[^a-z]/g, '');
      const unPrefClean = unPrefixedReq.replace(/[^a-z0-9]/g, '');
      const unPrefNoDigits = unPrefixedReq.replace(/[^a-z]/g, '');
      const coupleNoDigits = coupleLower.replace(/[^a-z]/g, '');
      return (
        (coupleClean && coupleClean === reqClean) ||
        (coupleClean && coupleClean === unPrefClean) ||
        (coupleNoDigits && coupleNoDigits === reqNoDigits) ||
        (coupleNoDigits && coupleNoDigits === unPrefNoDigits)
      );
    });
    if (found) return found;

    // 4. Substring search in couple names, brideName or groomName
    found = weddingsList.find((w) => {
      const coupleLower = (w.coupleNames || '').toLowerCase();
      const bride = (w.settings?.brideName || '').toLowerCase();
      const groom = (w.settings?.groomName || '').toLowerCase();
      return (
        coupleLower.includes(unPrefixedReq) ||
        coupleLower.includes(cleanReqNoSuffix) ||
        coupleLower.includes(cleanReq) ||
        bride.includes(unPrefixedReq) ||
        groom.includes(unPrefixedReq)
      );
    });
    if (found) return found;

    // 5. Match by guest code, phone, or guest ID
    found = weddingsList.find((w) =>
      w.guests?.some(
        (g) =>
          (g.code && g.code.toLowerCase() === cleanReq) ||
          (g.id && g.id.toLowerCase() === cleanReq) ||
          (g.phone && g.phone.replace(/[^0-9]/g, '') === cleanReq.replace(/[^0-9]/g, ''))
      )
    );
    if (found) return found;

    return undefined;
  };

  // Helper to generate public shareable guest wedding URL
  const getShareableWeddingUrl = (weddingId?: string): string => {
    const targetId = weddingId || activeWeddingId;
    const targetWedding = weddings.find(w => w.id === targetId) || activeWedding;
    let finalSlug = '0919-juanjuana';
    if (targetWedding?.id && !targetWedding.id.startsWith('boda-')) {
      finalSlug = targetWedding.id;
    } else if (targetId && !targetId.startsWith('boda-')) {
      finalSlug = targetId;
    } else if (targetWedding?.coupleNames) {
      finalSlug = generateEventSlug(targetWedding.coupleNames, targetWedding.weddingDate || targetWedding.settings?.weddingDate, weddings, targetWedding.id);
    }
    return `https://www.casanovia.pe/?boda=${encodeURIComponent(finalSlug)}`;
  };

  // Helper to update URL param without reloading
  const updateUrlWeddingParam = (weddingId: string) => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        if (viewMode === 'public') {
          const url = new URL(window.location.href);
          if (weddingId) {
            url.searchParams.set('boda', weddingId);
          } else {
            url.searchParams.delete('boda');
          }
          window.history.replaceState({}, '', url.toString());
        } else if (viewMode === 'tokens') {
          window.history.replaceState({}, '', '/precios');
        } else {
          // Keep URL clean as root for private administration
          window.history.replaceState({}, '', window.location.origin + '/');
        }
      }
    } catch (err) {
      console.error('Error updating URL search params:', err);
    }
  };

  // System Users state (Admin & Anfitrión roles)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    try {
      const local = localStorage.getItem('casanovia_system_users');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SYSTEM_USERS;
  });

  // Automatically persist systemUsers to localStorage as resilient offline backup
  React.useEffect(() => {
    try {
      if (systemUsers && systemUsers.length > 0) {
        localStorage.setItem('casanovia_system_users', JSON.stringify(systemUsers));
      }
    } catch {
      // ignore
    }
  }, [systemUsers]);

  // Sync currentUser with systemUsers updates from Firestore
  React.useEffect(() => {
    if (currentUser.isAuthenticated && currentUser.id) {
      const freshUser = systemUsers.find(u => u.id === currentUser.id);
      if (freshUser) {
        let hasChanges = false;
        
        const currentAssigned = currentUser.assignedWeddingIds || [];
        const freshAssigned = freshUser.assignedWeddingIds || [];
        if (currentAssigned.length !== freshAssigned.length || !currentAssigned.every(id => freshAssigned.includes(id))) {
          hasChanges = true;
        }
        
        const currentCreated = currentUser.createdWeddingIds || [];
        const freshCreated = freshUser.createdWeddingIds || [];
        if (currentCreated.length !== freshCreated.length || !currentCreated.every(id => freshCreated.includes(id))) {
          hasChanges = true;
        }

        if (currentUser.level !== freshUser.level) {
          hasChanges = true;
        }

        if (hasChanges) {
          const updatedAuth = {
            ...currentUser,
            level: freshUser.level,
            roleTitle: freshUser.roleTitle,
            assignedWeddingIds: freshAssigned,
            createdWeddingIds: freshCreated,
          };
          setCurrentUser(updatedAuth);
          try {
            sessionStorage.setItem('wedding_hub_auth', JSON.stringify(updatedAuth));
          } catch {
            // ignore
          }
        }
      }
    }
  }, [systemUsers, currentUser.id, currentUser.isAuthenticated, currentUser.level, currentUser.assignedWeddingIds, currentUser.createdWeddingIds]);

  // Tokens Payment Configuration (Admin Configurable)
  const [tokensPaymentConfig, setTokensPaymentConfig] = useState<TokensPaymentConfig>(() => {
    try {
      const local = localStorage.getItem('casanovia_tokens_payment_config');
      if (local) {
        return { ...INITIAL_TOKENS_PAYMENT_CONFIG, ...JSON.parse(local) };
      }
    } catch {
      // ignore
    }
    return INITIAL_TOKENS_PAYMENT_CONFIG;
  });

  // Multi-wedding state
  const [weddings, setWeddings] = useState<Wedding[]>(() => {
    try {
      const local = localStorage.getItem('casanovia_all_weddings');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const combined = deduplicateAndFilterWeddingsList([...parsed, ...initialWeddingsList]);
          try {
            localStorage.setItem('casanovia_all_weddings', JSON.stringify(combined));
          } catch {}
          return combined;
        }
      }
    } catch {
      // ignore
    }
    return deduplicateAndFilterWeddingsList(initialWeddingsList);
  });

  // Automatically persist weddings to localStorage as resilient offline backup
  React.useEffect(() => {
    try {
      if (weddings && weddings.length > 0) {
        localStorage.setItem('casanovia_all_weddings', JSON.stringify(weddings));
      }
    } catch {
      // ignore
    }
  }, [weddings]);

  // Synchronize WeddingCraft design changes in real time across the entire app
  React.useEffect(() => {
    const handleDesignUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ eventId: string; document: any }>;
      if (customEvent.detail?.eventId && customEvent.detail?.document) {
        const { eventId, document } = customEvent.detail;
        const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
        const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/, '');

        setWeddings((prev) => {
          const updated = prev.map((w) => {
            const cleanW = w.id.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
            const cleanWNoSuffix = cleanW.replace(/[-_]\d+$/, '');
            if (w.id === eventId || cleanW === cleanEvt || cleanWNoSuffix === cleanEvtNoSuffix) {
              return { ...w, weddingCraftDesign: document, updatedAt: new Date().toISOString() };
            }
            return w;
          });
          try {
            localStorage.setItem('casanovia_all_weddings', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    };
    window.addEventListener('weddingcraft_design_updated', handleDesignUpdate);
    return () => window.removeEventListener('weddingcraft_design_updated', handleDesignUpdate);
  }, []);

  // Self-hosted seed loader (if running on casanovia.pe or Apache with api/data/seed.json)
  React.useEffect(() => {
    const checkSelfHostedSeed = async () => {
      try {
        let seed: any = null;
        try {
          const sRes = await fetch('/api/seed.php');
          if (sRes.ok) seed = await sRes.json();
        } catch {}

        if (!seed) {
          try {
            const dRes = await fetch('/api/data/seed.json');
            if (dRes.ok) seed = await dRes.json();
          } catch {}
        }

        if (seed && Array.isArray(seed.weddings) && seed.weddings.length > 0) {
            setWeddings((prev) => {
              const merged = deduplicateAndFilterWeddingsList([...prev, ...seed.weddings]);
              try { localStorage.setItem('casanovia_all_weddings', JSON.stringify(merged)); } catch {}
              return merged;
            });

            // Store published WeddingCraft designs in localStorage for instant guest view
            if (seed.publishedDesigns && typeof seed.publishedDesigns === 'object') {
              Object.entries(seed.publishedDesigns).forEach(([eId, des]) => {
                try {
                  localStorage.setItem(`weddingcraft_published_${eId}`, JSON.stringify(des));
                } catch (e) {}
              });
            }

            // Immediately check and align URL parameter after seed load
            const requestedUrlId = getRequestedWeddingIdFromUrl();
            if (requestedUrlId) {
              const match = findWeddingByRequestedParam(seed.weddings, requestedUrlId);
              if (match) {
                setActiveWeddingId(match.id);
                persistIndicatedWeddingId(match.id);
              }
            }
          }
          if (seed && Array.isArray(seed.systemUsers) && seed.systemUsers.length > 0) {
            setSystemUsers((prev) => {
              const userMap = new Map<string, SystemUser>();
              prev.forEach(u => userMap.set(u.id, u));
              seed.systemUsers.forEach((u: SystemUser) => userMap.set(u.id, { ...userMap.get(u.id), ...u }));
              const merged = Array.from(userMap.values());
              try { localStorage.setItem('casanovia_system_users', JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
          if (seed && seed.tokensPaymentConfig) {
            setTokensPaymentConfig((prev) => ({ ...prev, ...seed.tokensPaymentConfig }));
            try { localStorage.setItem('casanovia_tokens_payment_config', JSON.stringify(seed.tokensPaymentConfig)); } catch {}
          }
      } catch {
        // ignore
      }
    };
    checkSelfHostedSeed();
  }, []);
  const [activeWeddingId, setActiveWeddingId] = useState<string>(() => {
    const fromUrl = getRequestedWeddingIdFromUrl();
    if (fromUrl && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(fromUrl)) {
      try {
        const stored = localStorage.getItem('casanovia_all_weddings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const match = findWeddingByRequestedParam(parsed, fromUrl);
            if (match && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(match.id)) {
              persistIndicatedWeddingId(match.id);
              return match.id;
            }
          }
        }
      } catch {}
      const match = findWeddingByRequestedParam(initialWeddingsList, fromUrl);
      if (match && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(match.id)) {
        persistIndicatedWeddingId(match.id);
        return match.id;
      }
      return fromUrl;
    }
    const fromStored = getStoredIndicatedWeddingId();
    if (fromStored && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(fromStored)) {
      try {
        const stored = localStorage.getItem('casanovia_all_weddings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const match = findWeddingByRequestedParam(parsed, fromStored);
            if (match && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(match.id)) return match.id;
          }
        }
      } catch {}
      const match = findWeddingByRequestedParam(initialWeddingsList, fromStored);
      if (match && !DEPRECATED_OR_DELETED_WEDDING_IDS.has(match.id)) return match.id;
      return fromStored;
    }
    const defaultWedding = initialWeddingsList.find(w => w.id === '1128-erikayemar') || initialWeddingsList[0];
    const defaultId = defaultWedding?.id || '';
    if (defaultId) persistIndicatedWeddingId(defaultId);
    return defaultId;
  });

  // Selected Guest for Guide
  const [selectedGuestForGuide, setSelectedGuestForGuide] = useState<Guest | null>(null);

  // Firebase connection state (non-blocking for self-hosted domain)
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Sin pantalla de precarga al iniciar: la aplicación y las invitaciones cargan directamente
  const [isAppLoading, setIsAppLoading] = useState<boolean>(false);

  const isLevel1Admin = currentUser.isAuthenticated && currentUser.level === 1;
  const isHostUser = currentUser.isAuthenticated && currentUser.level === 2;
  const isLevel3Planner = currentUser.isAuthenticated && currentUser.level === 3;
  const isLevel4Free = currentUser.isAuthenticated && currentUser.level === 4;
  const isLevel5Observer = currentUser.isAuthenticated && currentUser.level === 5;
  const canPrint = !isLevel5Observer && !isLevel4Free;

  // Level 4 limitation: only 1 event allowed
  const level4EventsCount = useMemo(() => {
    if (!isLevel4Free) return 0;
    return weddings.filter(w => 
      w.createdByUserId === currentUser.id ||
      w.createdByUserId === currentUser.username ||
      (currentUser.createdWeddingIds && currentUser.createdWeddingIds.includes(w.id))
    ).length;
  }, [isLevel4Free, weddings, currentUser]);

  const isLevel4AtEventLimit = isLevel4Free && level4EventsCount >= 1;

  const canCreateWedding = currentUser.isAuthenticated && (
    currentUser.level === 1 || 
    currentUser.level === 3 || 
    (currentUser.level === 4 && !isLevel4AtEventLimit)
  );
  const canManageUsers = currentUser.isAuthenticated && (currentUser.level === 1 || currentUser.level === 3);

  // Level 4: 48-hour trial period calculation (2 days / 48 hours from creation)
  const level4CreatedAt = useMemo(() => {
    if (!isLevel4Free) return undefined;
    if (currentUser.createdAt) return currentUser.createdAt;
    const found = systemUsers.find(
      u => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()
    );
    return found?.createdAt || undefined;
  }, [isLevel4Free, currentUser, systemUsers]);

  const level4TrialStatus = useMemo(() => {
    if (!level4CreatedAt) {
      return { isExpired: false, hoursRemaining: 48, daysRemaining: 2, daysElapsed: 0, registrationDateFormatted: 'Fecha de registro' };
    }
    const regDate = new Date(level4CreatedAt);
    const now = new Date();
    const diffMs = now.getTime() - regDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const isExpired = diffHours >= 48;
    const hoursRemaining = Math.max(0, Math.ceil(48 - diffHours));
    const daysRemaining = Math.max(0, Math.ceil((48 - diffHours) / 24));
    const registrationDateFormatted = regDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return {
      isExpired,
      hoursRemaining,
      daysRemaining,
      diffHours,
      registrationDateFormatted,
    };
  }, [level4CreatedAt]);

  const isLevel4TrialExpired = isLevel4Free && level4TrialStatus.isExpired;
  const level4DaysRemaining = level4TrialStatus.daysRemaining;
  const level4RegistrationDateStr = level4TrialStatus.registrationDateFormatted;

  // Upgrade notice modal state
  const [upgradeNotice, setUpgradeNotice] = useState<{
    isOpen: boolean;
    featureTitle: string;
    message: string;
  }>({
    isOpen: false,
    featureTitle: '',
    message: '',
  });

  const showUpgradeNotice = (featureTitle?: string, message?: string) => {
    setUpgradeNotice({
      isOpen: true,
      featureTitle: featureTitle || 'Subir de Nivel',
      message: message || 'Esta función no está disponible en la cuenta Nivel 4 (Plan Gratuito). Sube de nivel para acceder a todas las funciones sin restricciones.',
    });
  };

  const closeUpgradeNotice = () => {
    setUpgradeNotice(prev => ({ ...prev, isOpen: false }));
  };

  // Hosting Backend Synchronization for System Users, Tokens Config, and Uploaded Images
  useEffect(() => {
    let isMounted = true;

    const initUsersSync = async () => {
      try {
        const list = await fetchUsersFromHosting();
        if (!isMounted) return;

        if (!list || list.length === 0) {
          // Auto-seed default system user (Herly Lizarazo) if hosting is empty
          try {
            await saveUsersBulkToHosting(INITIAL_SYSTEM_USERS);
          } catch (seedErr) {
            console.warn('[Hosting] Users seeding skipped/deferred:', seedErr);
          }
          setSystemUsers(INITIAL_SYSTEM_USERS);
          try {
            localStorage.setItem('casanovia_system_users', JSON.stringify(INITIAL_SYSTEM_USERS));
          } catch {}
          return;
        }

        setSystemUsers(list);
        try {
          localStorage.setItem('casanovia_system_users', JSON.stringify(list));
        } catch {}
      } catch (err) {
        console.info('[Hosting] Note loading system users:', err);
      }
    };

    const initTokensConfigSync = async () => {
      try {
        const data = await fetchSystemConfigFromHosting<TokensPaymentConfig>('tokens_payment');
        if (isMounted && data) {
          setTokensPaymentConfig(prev => ({ ...prev, ...data }));
          try {
            localStorage.setItem('casanovia_tokens_payment_config', JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.info('[Hosting] Note loading tokens_payment config:', err);
      }
    };

    const initUploadedImagesSync = async () => {
      try {
        const data = await fetchSystemConfigFromHosting<UploadedImageRecord[]>('uploaded_images');
        if (isMounted && data && Array.isArray(data)) {
          const list = [...data].sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
          setUploadedImages(list);
        }
      } catch (err) {
        console.info('[Hosting] Note loading uploaded_images:', err);
      }
    };

    initUsersSync();
    initTokensConfigSync();
    initUploadedImagesSync();

    // Listen to browser forward/back or hash changes for URL routing
    const handleUrlNav = () => {
      if (isTokensUrlRequested()) {
        setViewModeState('tokens');
      } else {
        const requestedId = getRequestedWeddingIdFromUrl();
        if (requestedId) {
          setActiveWeddingId((prev) => {
            const match = findWeddingByRequestedParam(weddings, requestedId);
            const targetId = match ? match.id : requestedId;
            persistIndicatedWeddingId(targetId);
            return targetId;
          });
        }
      }
    };
    window.addEventListener('popstate', handleUrlNav);
    window.addEventListener('hashchange', handleUrlNav);

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handleUrlNav);
      window.removeEventListener('hashchange', handleUrlNav);
    };
  }, []);

  // View switch interceptor
  const setViewMode = (newMode: 'public' | 'private' | 'new_wedding_tasks' | 'tokens') => {
    if (newMode === 'public' && currentUser.isAuthenticated && currentUser.level === 4) {
      showUpgradeNotice(
        'Web Invitados',
        'El acceso a la "Web Invitados" no está disponible para cuentas de Nivel 4 (Plan Gratuito). Por favor sube de nivel para activar la web interactiva para tus invitados.'
      );
      return;
    }

    if (newMode === 'private' || newMode === 'new_wedding_tasks') {
      let isAuth = currentUser.isAuthenticated;
      if (!isAuth && typeof window !== 'undefined') {
        try {
          const stored = sessionStorage.getItem('wedding_hub_auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.isAuthenticated) isAuth = true;
          }
        } catch {}
      }
      if (!isAuth) {
        setShowAuthModal(true);
        return;
      }
    }
    setViewModeState(newMode);
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        if (newMode === 'tokens') {
          window.history.replaceState({}, '', '/precios');
        } else if (newMode === 'public') {
          const url = new URL(window.location.href);
          if (activeWeddingId && activeWeddingId !== 'default') {
            url.searchParams.set('boda', activeWeddingId);
          }
          window.history.replaceState({}, '', url.toString());
        } else {
          // Clean URL: casanovia.pe/ without extra params or path
          window.history.replaceState({}, '', window.location.origin + '/');
        }
      }
    } catch (err) {
      console.error('Error updating URL for view mode:', err);
    }
  };

  const setActiveView = setViewMode;

  // Authentication methods supporting both Super Admin and Anfitriones
  const login = (usernameInput: string, claveInput: string): { success: boolean; message: string } => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedClave = claveInput.trim();

    // 1. Look up in active system users list (or fallback list)
    const userPool = systemUsers.length > 0 ? systemUsers : INITIAL_SYSTEM_USERS;
    const foundUser = userPool.find(
      (u) => u.username.trim().toLowerCase() === trimmedUser && u.clave.trim() === trimmedClave
    );

    if (foundUser) {
      if (foundUser.level === 4) {
        const regDate = new Date(foundUser.createdAt || new Date().toISOString());
        const now = new Date();
        const diffMs = now.getTime() - regDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= 48) {
          return {
            success: false,
            message: 'Ha finalizado tu plazo de prueba gratuito de 48 horas (2 días). Tu acceso a la plataforma se encuentra cerrado. Por favor sube a un plan de pago para continuar.',
          };
        }
      }
      const assigned = foundUser.assignedWeddingIds || [];
      const created = foundUser.createdWeddingIds || [];
      const authObj: AuthUser = {
        id: foundUser.id,
        username: foundUser.username,
        level: foundUser.level,
        roleTitle: foundUser.roleTitle,
        isAuthenticated: true,
        assignedWeddingIds: assigned,
        createdWeddingIds: created,
        createdAt: foundUser.createdAt,
      };
      setCurrentUser(authObj);
      try {
        sessionStorage.setItem('wedding_hub_auth', JSON.stringify(authObj));
      } catch {
        // ignore
      }
      setShowAuthModal(false);
      setViewModeState('private');

      // Auto-switch to assigned/created wedding if Level 2 Anfitrión or Level 3 Planner
      if (foundUser.level === 2) {
        const targetWedding = weddings.find(w => 
          assigned.includes(w.id) || 
          w.coupleNames.toLowerCase().includes(foundUser.username.toLowerCase()) ||
          (foundUser.username.toLowerCase().includes('zenaida') && (w.id.includes('zenaida') || w.coupleNames.toLowerCase().includes('zenaida')))
        );
        if (targetWedding) {
          setActiveWeddingId(targetWedding.id);
        }
      } else if (foundUser.level === 3) {
        // For Level 3 Planner: ONLY weddings created by this user
        const uCreated = weddings.filter(w => 
          created.includes(w.id) || 
          w.createdByUserId === foundUser.id ||
          w.createdByUserId === foundUser.username ||
          (w.createdByUserName && w.createdByUserName.trim().toLowerCase() === foundUser.username.trim().toLowerCase())
        );
        if (uCreated.length > 0) {
          setActiveWeddingId(uCreated[0].id);
        } else {
          setActiveWeddingId('');
        }
      } else if (foundUser.level === 4) {
        // For Level 4 Novia Free: ONLY weddings created by or assigned to this user
        const uCreated = weddings.filter(w => 
          created.includes(w.id) || 
          assigned.includes(w.id) ||
          w.createdByUserId === foundUser.id ||
          w.createdByUserId === foundUser.username ||
          (w.createdByUserName && w.createdByUserName.trim().toLowerCase() === foundUser.username.trim().toLowerCase())
        );
        if (uCreated.length > 0) {
          setActiveWeddingId(uCreated[0].id);
        } else {
          setActiveWeddingId('');
        }
      } else if (foundUser.level === 5) {
        if (assigned.length > 0) {
          const target = weddings.find(w => assigned.includes(w.id));
          if (target) {
            setActiveWeddingId(target.id);
          }
        }
      }
      
      let welcomeRole = 'Invitado';
      if (foundUser.level === 1) welcomeRole = 'Nivel 1 (Super Administrador)';
      else if (foundUser.level === 3) welcomeRole = 'Nivel 3 (Wedding Planner)';
      else if (foundUser.level === 2) welcomeRole = 'Nivel 2 (Anfitrión)';
      else if (foundUser.level === 4) welcomeRole = 'Nivel 4 (Novia Free)';
      else if (foundUser.level === 5) welcomeRole = 'Nivel 5 (Observador)';

      return {
        success: true,
        message: `¡Bienvenido(a) ${foundUser.username}! Acceso concedido como ${welcomeRole}.`,
      };
    }

    // 2. Direct check for hardcoded defaults for safety
    if (
      trimmedUser === LEVEL_1_USER.username.toLowerCase() &&
      trimmedClave === LEVEL_1_USER.clave
    ) {
      const authObj: AuthUser = {
        username: LEVEL_1_USER.username,
        level: 1,
        roleTitle: LEVEL_1_USER.roleTitle,
        isAuthenticated: true,
      };
      setCurrentUser(authObj);
      try {
        sessionStorage.setItem('wedding_hub_auth', JSON.stringify(authObj));
      } catch {
        // ignore
      }
      setShowAuthModal(false);
      setViewModeState('private');
      return {
        success: true,
        message: `¡Bienvenido ${LEVEL_1_USER.username}! Acceso concedido (Nivel 1).`,
      };
    }

    return {
      success: false,
      message: 'Credenciales no válidas. Verifica el usuario y la clave ingresada.',
    };
  };

  const logout = () => {
    setCurrentUser(DEFAULT_ANONYMOUS_USER);
    try {
      sessionStorage.removeItem('wedding_hub_auth');
    } catch {
      // ignore
    }
    setShowAuthModal(false);
    setViewModeState('public');

    // Activar la precarga al cerrar sesión
    setIsAppLoading(true);
    setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);

    try {
      if (typeof window !== 'undefined') {
        const cleanPath = window.location.pathname.endsWith('.html') ? window.location.pathname : '/';
        window.history.replaceState(null, '', cleanPath);
      }
    } catch (err) {
      console.error('Error al resetear URL en logout:', err);
    }
  };

  // System Users CRUD (for Level 1 Admin)
  const addSystemUser = async (userData: Omit<SystemUser, 'id' | 'createdAt'>): Promise<SystemUser> => {
    const newUserId = `user-${Date.now()}`;
    const newUser: SystemUser = {
      ...userData,
      id: newUserId,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveUserToHosting(newUser);
      setSystemUsers(prev => [newUser, ...prev]);
      try {
        localStorage.setItem('casanovia_system_users', JSON.stringify([newUser, ...systemUsers]));
      } catch {}
      return newUser;
    } catch (err) {
      console.warn('Error saving user to hosting:', err);
      throw err;
    }
  };

  const updateSystemUser = async (id: string, updates: Partial<SystemUser>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const existing = systemUsers.find(u => u.id === id);
      const mergedUser = existing ? { ...existing, ...updatedData } : { id, ...updatedData };
      await saveUserToHosting(mergedUser);
      setSystemUsers(prev => {
        const next = prev.map(u => u.id === id ? { ...u, ...updatedData } : u);
        try {
          localStorage.setItem('casanovia_system_users', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.warn('Error updating user on hosting:', err);
      throw err;
    }
  };

  const deleteSystemUser = async (id: string) => {
    try {
      await deleteUserFromHosting(id);
      setSystemUsers(prev => {
        const next = prev.filter(u => u.id !== id);
        try {
          localStorage.setItem('casanovia_system_users', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.warn('Error deleting user from hosting:', err);
      throw err;
    }
  };

  // Tokens Payment Config Update
  const updateTokensPaymentConfig = async (updates: Partial<TokensPaymentConfig>) => {
    try {
      const mergedConfig = { ...tokensPaymentConfig, ...updates };
      setTokensPaymentConfig(mergedConfig);
      try {
        localStorage.setItem('casanovia_tokens_payment_config', JSON.stringify(mergedConfig));
      } catch {
        // ignore
      }

      await saveSystemConfigToHosting('tokens_payment', mergedConfig);
    } catch (err) {
      console.error('Error updating tokens payment config:', err);
      throw err;
    }
  };

  const saveUploadedImage = async (
    record: Omit<UploadedImageRecord, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }
  ): Promise<string> => {
    const id = record.id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const uploadedAt = record.uploadedAt || new Date().toISOString();
    const fullRecord: UploadedImageRecord = {
      ...record,
      id,
      uploadedAt,
    };
    const updated = [fullRecord, ...uploadedImages.filter((item) => item.id !== id)];
    setUploadedImages(updated);
    try {
      await saveSystemConfigToHosting('uploaded_images', updated);
    } catch (e) {
      console.warn('[Hosting] Error saving uploaded image config:', e);
    }
    return id;
  };

  const deleteUploadedImage = async (id: string): Promise<void> => {
    const updated = uploadedImages.filter((item) => item.id !== id);
    setUploadedImages(updated);
    try {
      await saveSystemConfigToHosting('uploaded_images', updated);
    } catch (e) {
      console.warn('[Hosting] Error deleting uploaded image config:', e);
    }
  };

  // -------------------------------------------------------------
  // Hosting Backend Synchronization for Multi-Weddings
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const initHostingWeddingsSync = async () => {
      try {
        const fetchedList = await fetchWeddingsFromHosting();
        if (!isMounted) return;

        // Use strictly the weddings present on the hosting backend
        const hostingWeddings = Array.isArray(fetchedList) ? fetchedList : [];
        const sortedList = deduplicateAndFilterWeddingsList(hostingWeddings);
        setIsFirebaseLoading(false);
        setIsFirebaseConnected(true);

        if (sortedList.length > 0) {
          setWeddings(sortedList);
          try {
            localStorage.setItem('casanovia_all_weddings', JSON.stringify(sortedList));
          } catch {
            // ignore
          }
          // ensure activeWeddingId respects URL parameter if requested or remains valid with indicated wedding
          setActiveWeddingId((prev) => {
            const requestedId = getRequestedWeddingIdFromUrl();
            if (requestedId && !isWeddingDeleted(requestedId)) {
              const match = findWeddingByRequestedParam(sortedList, requestedId);
              if (match && !isWeddingDeleted(match.id)) {
                persistIndicatedWeddingId(match.id);
                return match.id;
              }
              if (sortedList.some((w) => w.id === requestedId)) {
                persistIndicatedWeddingId(requestedId);
                return requestedId;
              }
              return requestedId;
            }

            // In absence of URL parameter: maintain the previously indicated/active wedding if not deprecated
            if (prev && !isWeddingDeleted(prev)) {
              const prevMatch = findWeddingByRequestedParam(sortedList, prev);
              if (prevMatch && !isWeddingDeleted(prevMatch.id)) {
                persistIndicatedWeddingId(prevMatch.id);
                return prevMatch.id;
              }
              if (sortedList.some((w) => w.id === prev)) {
                persistIndicatedWeddingId(prev);
                return prev;
              }
            }

            // Check stored indicated wedding in localStorage
            const storedIndicated = getStoredIndicatedWeddingId();
            if (storedIndicated && !isWeddingDeleted(storedIndicated)) {
              const storedMatch = findWeddingByRequestedParam(sortedList, storedIndicated);
              if (storedMatch && !isWeddingDeleted(storedMatch.id)) {
                persistIndicatedWeddingId(storedMatch.id);
                return storedMatch.id;
              }
              if (sortedList.some((w) => w.id === storedIndicated)) {
                persistIndicatedWeddingId(storedIndicated);
                return storedIndicated;
              }
            }

            // If nothing was indicated, maintain Erika & Yemar or first available
            const defaultW = sortedList.find(w => w.id === '1128-erikayemar') || sortedList[0];
            const fallbackId = defaultW?.id || '';
            if (fallbackId) {
              persistIndicatedWeddingId(fallbackId);
            }
            return fallbackId;
          });
        }
        setIsFirebaseLoading(false);
        setIsFirebaseConnected(true);
      } catch (err) {
        console.warn('[Hosting] Weddings fetch error, using cached weddings:', err);
        setIsFirebaseLoading(false);
        setIsFirebaseConnected(true);
      }
    };

    initHostingWeddingsSync();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to check if a wedding was created by a specific user
  const isWeddingAccessibleByPlanner = (wedding: Wedding | null | undefined, user: AuthUser): boolean => {
    if (!wedding || !user.isAuthenticated || user.level !== 3) return false;
    const uName = (user.username || '').trim().toLowerCase();
    const uId = user.id;
    const createdIds = user.createdWeddingIds || [];
    const assignedIds = user.assignedWeddingIds || [];
    if (createdIds.includes(wedding.id)) return true;
    if (assignedIds.includes(wedding.id)) return true;
    if (wedding.createdByUserId && (wedding.createdByUserId === uId || wedding.createdByUserId === user.username)) return true;
    if (wedding.createdByUserName && wedding.createdByUserName.trim().toLowerCase() === uName) return true;
    return false;
  };

  // Weddings created by the current Level 3 user
  const userCreatedWeddings = React.useMemo(() => {
    if (!currentUser.isAuthenticated || currentUser.level !== 3) return [];
    return weddings.filter((w) => isWeddingAccessibleByPlanner(w, currentUser));
  }, [weddings, currentUser]);

  // Weddings accessible based on current user's role and identity
  const accessibleWeddings = React.useMemo(() => {
    if (!currentUser.isAuthenticated) return weddings;
    
    // Level 1: Super Admin has full access to ALL weddings
    if (currentUser.level === 1) return weddings;
    
    // Level 3: Wedding Planner ONLY has access to weddings created by themselves!
    if (currentUser.level === 3) {
      return userCreatedWeddings;
    }

    // Level 4: Novia Free has access to ONLY weddings created by or assigned to her! (New users start with 0 events)
    if (currentUser.level === 4) {
      const assignedIds = currentUser.assignedWeddingIds || [];
      const createdIds = currentUser.createdWeddingIds || [];
      const uName = (currentUser.username || '').trim().toLowerCase();
      const uId = currentUser.id;
      const own = weddings.filter((w) =>
        assignedIds.includes(w.id) ||
        createdIds.includes(w.id) ||
        (w.createdByUserId && (w.createdByUserId === uId || w.createdByUserId === currentUser.username)) ||
        (w.createdByUserName && w.createdByUserName.trim().toLowerCase() === uName)
      );
      return own;
    }

    // Level 5: Observador has view access to assigned weddings (or all weddings if none specified)
    if (currentUser.level === 5) {
      const assignedIds = currentUser.assignedWeddingIds || [];
      if (assignedIds.length > 0) {
        return weddings.filter((w) => assignedIds.includes(w.id));
      }
      return weddings;
    }
    
    // Level 2: Anfitrión has access to their assigned wedding(s)
    if (currentUser.level === 2) {
      const assignedIds = currentUser.assignedWeddingIds || [];
      const uName = (currentUser.username || '').trim().toLowerCase();
      return weddings.filter((w) => 
        assignedIds.includes(w.id) || 
        w.coupleNames.toLowerCase().includes(uName) ||
        (uName.includes('zenaida') && (w.id.includes('zenaida') || w.coupleNames.toLowerCase().includes('zenaida')))
      );
    }
    
    return weddings;
  }, [weddings, currentUser, userCreatedWeddings]);

  // Compute active wedding object
  const activeWedding = React.useMemo(() => {
    // 0. Priority: URL parameter if explicitly provided in URL
    const requestedFromUrl = getRequestedWeddingIdFromUrl();
    if (requestedFromUrl) {
      const urlMatch =
        findWeddingByRequestedParam(weddings, requestedFromUrl) ||
        findWeddingByRequestedParam(initialWeddingsList, requestedFromUrl);
      if (urlMatch) return urlMatch;

      // Parse slug if formatted as "MMDD-name" or "boda-name"
      let parsedDate = '2026-09-19T18:00:00';
      let rawNames = requestedFromUrl;

      const mmddMatch = requestedFromUrl.match(/^(\d{2})(\d{2})-([a-z0-9-_]+)/i);
      if (mmddMatch) {
        const mm = mmddMatch[1];
        const dd = mmddMatch[2];
        rawNames = mmddMatch[3];
        parsedDate = `2026-${mm}-${dd}T18:00:00`;
      } else {
        rawNames = requestedFromUrl
          .replace(/^(boda-|wedding-)/, '')
          .replace(/[-_]\d+$/, '');
      }

      // Convert rawNames (e.g. "juanyjuana" or "juan-juana" or "juan y juana") to "Juan & Juana"
      let formattedNames = rawNames
        .replace(/[-_]/g, ' ')
        .replace(/y/gi, ' & ')
        .replace(/and/gi, ' & ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .replace(/\s*&\s*/g, ' & ');

      // If string is "Juanyjuana" without spaces
      if (!formattedNames.includes('&')) {
        const ySplit = rawNames.split(/y/i);
        if (ySplit.length === 2 && ySplit[0] && ySplit[1]) {
          const p1 = ySplit[0].charAt(0).toUpperCase() + ySplit[0].slice(1).toLowerCase();
          const p2 = ySplit[1].charAt(0).toUpperCase() + ySplit[1].slice(1).toLowerCase();
          formattedNames = `${p1} & ${p2}`;
        }
      }

      const coupleNames = formattedNames || 'Juan & Juana';
      const brideName = coupleNames.split('&')[1]?.trim() || coupleNames.split('&')[0]?.trim() || 'Juana';
      const groomName = coupleNames.split('&')[0]?.trim() || 'Juan';

      const virtualRequestedWedding: Wedding = {
        id: requestedFromUrl,
        coupleNames,
        weddingDate: parsedDate,
        locationSummary: 'Arequipa, Perú',
        status: 'planning',
        settings: {
          ...initialWeddingSettings,
          coupleNames,
          brideName,
          groomName,
          weddingDate: parsedDate,
          weddingTime: '18:00',
          locationSummary: 'Arequipa, Perú',
          ceremonyVenue: {
            name: 'Parroquia Nuestra Señora de la Asunción',
            address: 'Calle Real 140, Yanahuara, Arequipa',
            time: '18:00 hrs',
            googleMapsUrl: '',
            wazeUrl: '',
            notes: '',
          },
          receptionVenue: {
            name: 'Jardines de Sabandia',
            address: 'Arequipa',
            time: '19:30 hrs',
            googleMapsUrl: '',
            wazeUrl: '',
            notes: '',
          },
        },
        guests: [],
        timeline: [],
        budget: [],
        tasks: [],
        tables: [],
        vendors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return virtualRequestedWedding;
    }

    // If Level 3 Planner: MUST be one of their created weddings
    if (currentUser.isAuthenticated && currentUser.level === 3) {
      if (userCreatedWeddings.length === 0) return null;
      return userCreatedWeddings.find((w) => w.id === activeWeddingId) || userCreatedWeddings[0];
    }

    // If Level 4 Novia Free: MUST be one of their created/assigned weddings
    if (currentUser.isAuthenticated && currentUser.level === 4) {
      if (accessibleWeddings.length === 0) return null;
      return accessibleWeddings.find((w) => w.id === activeWeddingId) || accessibleWeddings[0];
    }

    // If Level 5 Observador: MUST be one of accessible weddings
    if (currentUser.isAuthenticated && currentUser.level === 5) {
      if (accessibleWeddings.length === 0) return null;
      return accessibleWeddings.find((w) => w.id === activeWeddingId) || accessibleWeddings[0];
    }

    // If Level 2 Host: MUST be one of their assigned weddings
    if (currentUser.isAuthenticated && currentUser.level === 2) {
      if (accessibleWeddings.length === 0) return null;
      return accessibleWeddings.find((w) => w.id === activeWeddingId) || accessibleWeddings[0];
    }

    // 1. Direct match by ID
    const directMatch = weddings.find((w) => w.id === activeWeddingId);
    if (directMatch) return directMatch;

    // 2. Fuzzy match by param/slug from activeWeddingId
    if (activeWeddingId) {
      const match = findWeddingByRequestedParam(weddings, activeWeddingId);
      if (match) return match;
    }

    // 3. Match from stored indicated wedding in localStorage
    const storedIndicated = getStoredIndicatedWeddingId();
    if (storedIndicated) {
      const storedMatch =
        findWeddingByRequestedParam(weddings, storedIndicated) ||
        findWeddingByRequestedParam(initialWeddingsList, storedIndicated);
      if (storedMatch) return storedMatch;
    }

    return weddings[0] || initialWeddingsList[0] || initialDefaultWedding;
  }, [weddings, userCreatedWeddings, accessibleWeddings, activeWeddingId, currentUser]);

  // Auto-align activeWeddingId when user logs in, accessibleWeddings changes, or activeWedding is resolved
  useEffect(() => {
    const requestedFromUrl = getRequestedWeddingIdFromUrl();
    if (requestedFromUrl) {
      const matched =
        findWeddingByRequestedParam(weddings, requestedFromUrl) ||
        findWeddingByRequestedParam(initialWeddingsList, requestedFromUrl);
      const targetId = matched ? matched.id : requestedFromUrl;
      if (activeWeddingId !== targetId) {
        setActiveWeddingId(targetId);
        persistIndicatedWeddingId(targetId);
      }
      return;
    }

    if (currentUser.isAuthenticated && (currentUser.level === 3 || currentUser.level === 4 || currentUser.level === 5)) {
      if (accessibleWeddings.length > 0) {
        if (!accessibleWeddings.some(w => w.id === activeWeddingId)) {
          setActiveWeddingId(accessibleWeddings[0].id);
        }
      } else {
        if (activeWeddingId !== '') {
          setActiveWeddingId('');
        }
      }
    } else if (activeWedding && activeWedding.id && activeWedding.id !== activeWeddingId) {
      setActiveWeddingId(activeWedding.id);
    }
  }, [currentUser, accessibleWeddings, activeWeddingId, activeWedding, weddings]);

  // Proactively fetch requested wedding from Firestore and self-hosted backend if opened directly by URL
  useEffect(() => {
    const requested = getRequestedWeddingIdFromUrl();
    if (!requested) return;

    let isMounted = true;
    const existing = findWeddingByRequestedParam(weddings, requested);
    if (existing && existing.weddingDate && existing.settings?.ceremonyVenue) {
      return;
    }

    const fetchSpecificWedding = async () => {
      // Direct host backend API (cPanel casanovia.pe)
      try {
        const apiDomain = (typeof window !== 'undefined' && window.location.hostname.includes('casanovia.pe'))
          ? ''
          : 'https://www.casanovia.pe';
          
        let res = await fetch(`${apiDomain}/api/weddings.php?slug=${encodeURIComponent(requested)}&public=1`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${apiDomain}/api/weddings.php?id=${encodeURIComponent(requested)}&public=1`).catch(() => null);
        }

        if (res && res.ok && isMounted) {
          const resData = await res.json();
          if (resData?.success && resData?.wedding) {
            const wData = resData.wedding;
            setWeddings((prev) => {
              const index = prev.findIndex((w) => w.id === wData.id);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], ...wData };
                return updated;
              }
              return sortWeddingsByDate([wData, ...prev]);
            });
            setActiveWeddingId(wData.id);
            persistIndicatedWeddingId(wData.id);
          }
        }
      } catch {}
    };

    fetchSpecificWedding();

    return () => {
      isMounted = false;
    };
  }, [weddings.length]);

  // Compute permission to edit active wedding
  const canEditActiveWedding = React.useMemo(() => {
    if (!currentUser.isAuthenticated || !activeWedding) return false;

    // Level 5: Observador has strictly read-only access (NO edit permissions)
    if (currentUser.level === 5) return false;

    if (currentUser.level === 1) return true; // Super Admin has full edit permissions
    
    // Level 3: Wedding Planner has edit permissions ONLY for weddings created by them
    if (currentUser.level === 3) {
      return isWeddingAccessibleByPlanner(activeWedding, currentUser);
    }

    // Level 4: Novia Free has edit permissions on her weddings
    if (currentUser.level === 4) {
      const uName = currentUser.username.trim().toLowerCase();
      const assignedIds = currentUser.assignedWeddingIds || [];
      const createdIds = currentUser.createdWeddingIds || [];
      const isOwner = assignedIds.includes(activeWedding.id) ||
                      createdIds.includes(activeWedding.id) ||
                      activeWedding.createdByUserId === currentUser.id ||
                      (activeWedding.createdByUserName && activeWedding.createdByUserName.trim().toLowerCase() === uName) ||
                      activeWedding?.coupleNames?.toLowerCase().includes(uName);
      return Boolean(isOwner || (!activeWedding.createdByUserId && weddings.length === 1) || (!currentUser.createdWeddingIds?.length && !currentUser.assignedWeddingIds?.length));
    }

    if (currentUser.level === 2) {
      // Anfitrión has edit permission ONLY for assigned weddings (e.g. Zenaida & Ronny)
      const uName = currentUser.username.trim().toLowerCase();
      const assignedIds = currentUser.assignedWeddingIds || [];
      const isAssigned = assignedIds.includes(activeWedding.id) || 
        (uName.includes('zenaida') && (activeWedding.id.includes('zenaida') || activeWedding?.coupleNames?.toLowerCase().includes('zenaida')));
      const isCouple = activeWedding?.coupleNames?.toLowerCase().includes(uName) ||
                       activeWedding?.settings?.brideName?.toLowerCase().includes(uName) ||
                       activeWedding?.settings?.groomName?.toLowerCase().includes(uName);
      const isHostGuest = activeWedding?.guests?.some(
        (g) => g.category === 'anfitrion' && g.fullName.toLowerCase().includes(uName)
      );
      return Boolean(isAssigned || isCouple || isHostGuest);
    }
    return false;
  }, [currentUser, activeWedding]);

  // Compute if user is an Administrator or Wedding Planner (excludes single-couple anfitriones)
  const isPlannerOrAdmin = React.useMemo(() => {
    if (!currentUser.isAuthenticated) return false;
    if (currentUser.level === 1 || currentUser.level === 3) return true; // Super Admin (Nv1) or Wedding Planner (Nv3)
    const roleLower = (currentUser.roleTitle || '').toLowerCase();
    const userLower = (currentUser.username || '').toLowerCase();
    
    // Explicitly exclude single-wedding anfitriones/novios (like Zenaida Anahua)
    if (userLower.includes('zenaida') || roleLower.includes('anfitri') || roleLower.includes('novi')) {
      return false;
    }

    return roleLower.includes('planner') || 
           roleLower.includes('organizador') || 
           roleLower.includes('coordinad') || 
           roleLower.includes('admin') ||
           userLower.includes('planner');
  }, [currentUser]);

  // Active Wedding Sub-entities
  const emptySettings: WeddingSettings = {
    ...initialWeddingSettings,
    coupleNames: '',
    brideName: '',
    groomName: '',
    weddingDate: '',
    weddingTime: '',
    locationSummary: '',
  };

  const settings: WeddingSettings = activeWedding?.settings || (!activeWedding && (currentUser.level === 4 || currentUser.level === 3) ? emptySettings : initialWeddingSettings);

  useEffect(() => {
    setActiveCurrencyCountry(settings?.countryCurrency || 'PE');
  }, [settings?.countryCurrency]);
  const guests: Guest[] = activeWedding?.guests || [];
  const timeline: TimelineMilestone[] = React.useMemo(() => {
    if (!activeWedding) return [];
    const raw = activeWedding?.timeline !== undefined ? activeWedding.timeline : initialTimeline;
    return sortTimelineMilestones<TimelineMilestone>(raw);
  }, [activeWedding?.timeline, activeWedding]);
  const budget: BudgetItem[] = activeWedding?.budget || [];
  const promotionQuotas: PromotionFeeQuota[] = activeWedding?.promotionQuotas || [];
  
  // Permission for Comisión role in Fiesta de Promoción
  const isPromotionComisionUser = React.useMemo(() => {
    if (!currentUser.isAuthenticated) return false;
    if (currentUser.level === 1 || currentUser.level === 3) return true; // Super Admin or Planner
    const roleLower = (currentUser.roleTitle || '').toLowerCase();
    const userLower = (currentUser.username || '').toLowerCase();
    const promRole = (currentUser.promotionRole || '').toLowerCase();
    return promRole.includes('comision') ||
           promRole.includes('comisión') ||
           roleLower.includes('comision') ||
           roleLower.includes('comisión') ||
           userLower.includes('comision') ||
           userLower.includes('comisión');
  }, [currentUser]);

  const tasks: WeddingTask[] = activeWedding?.tasks || [];
  const vendors: VendorItem[] = activeWedding ? (activeWedding.vendors !== undefined ? activeWedding.vendors : initialVendors) : [];
  const tables: WeddingTable[] = activeWedding ? (activeWedding.tables !== undefined ? activeWedding.tables : initialTables) : [];

  // Helper to persist changes to active wedding in Firestore
  const updateActiveWeddingDoc = async (partialWedding: Partial<Wedding>) => {
    const targetWeddingId = activeWedding?.id || activeWeddingId;
    if (!targetWeddingId) return;
    if (currentUser.level === 5) {
      console.warn('[WeddingContext] Nivel 5 Observador tiene acceso de solo lectura. Modificación cancelada.');
      return;
    }
    if (activeWedding?.id && activeWeddingId !== activeWedding.id) {
      setActiveWeddingId(activeWedding.id);
    }
    try {
      const updatedData = cleanFirestoreData({
        ...partialWedding,
        updatedAt: new Date().toISOString(),
      });

      // Optimistically update local state immediately so UI updates instantly
      setWeddings((prev) =>
        prev.map((w) => {
          if (w.id === targetWeddingId || (activeWeddingId && w.id === activeWeddingId)) {
            return {
              ...w,
              ...updatedData,
            };
          }
          return w;
        })
      );

      // Save to Hosting Backend
      try {
        const fullWedding = weddings.find(w => w.id === targetWeddingId);
        if (fullWedding) {
          await saveWeddingToHosting({ ...fullWedding, ...updatedData });
        }
      } catch (hostErr) {
        console.warn('[Hosting Storage] update wedding warning:', hostErr);
      }
    } catch (err) {
      console.warn('Update wedding error:', err);
    }
  };

  // Switch active wedding
  const selectWedding = (weddingId: string) => {
    persistIndicatedWeddingId(weddingId);

    // If Level 3 planner or Level 5 observer, allow selecting among accessible weddings
    if (currentUser.isAuthenticated && (currentUser.level === 3 || currentUser.level === 5)) {
      if (accessibleWeddings.some((w) => w.id === weddingId)) {
        setActiveWeddingId(weddingId);
        setSelectedGuestForGuide(null);
        updateUrlWeddingParam(weddingId);
      }
      return;
    }

    if (weddings.some((w) => w.id === weddingId)) {
      setActiveWeddingId(weddingId);
      setSelectedGuestForGuide(null);
      updateUrlWeddingParam(weddingId);
    }
  };

  // Create a new wedding (Level 1 Admin only)
  const createNewWedding = async (data: {
    eventType?: string;
    coupleNames: string;
    brideName?: string;
    groomName?: string;
    weddingDate: string;
    locationSummary: string;
    ceremonyVenueName?: string;
    receptionVenueName?: string;
    emptyFields?: boolean;
  }): Promise<string> => {
    // For Level 4 Novia Free: limit to only 1 event
    if (currentUser.level === 4) {
      const userCreatedWeddings = weddings.filter(w => 
        w.createdByUserId === currentUser.id ||
        w.createdByUserId === currentUser.username ||
        (currentUser.createdWeddingIds && currentUser.createdWeddingIds.includes(w.id))
      );
      if (userCreatedWeddings.length >= 1) {
        showUpgradeNotice('Crear Nuevo Evento', 'Tu cuenta Nivel 4 (Plan Gratuito) ya ha creado su único evento permitido. Sube de nivel para crear y gestionar eventos ilimitados.');
        throw new Error('Límite de 1 evento alcanzado para Nivel 4');
      }
    }

    const isBlank = Boolean(data.emptyFields);
    const coupleNames = data.coupleNames.trim() || (isBlank ? 'Nuevo Evento' : 'Nueva Pareja');
    // For Level 4 Novia Free: Always force eventType to 'Boda' (blocking other event types)
    const effectiveEventType = currentUser.level === 4 ? 'Boda' : (data.eventType || 'Boda');
    // Generate event slug using the exact required rule: "MMDD-nombreevento" (e.g. "1128-erikayemar")
    // If collision, appends year: "1128-erikayemar-2026"
    const newWeddingId = generateEventSlug(coupleNames, data.weddingDate, weddings);
    const slug = newWeddingId.replace(/[^a-zA-Z0-9]/g, '');

    const brideName = isBlank
      ? (data.brideName?.trim() || '')
      : (data.brideName || coupleNames.split('&')[0]?.trim() || 'Novia');
    const groomName = isBlank
      ? (data.groomName?.trim() || '')
      : (data.groomName || coupleNames.split('&')[1]?.trim() || 'Novio');

    const newSettings: WeddingSettings = isBlank
      ? {
          eventType: effectiveEventType,
          coupleNames,
          brideName,
          groomName,
          weddingDate: data.weddingDate?.trim() || '',
          weddingTime: '',
          locationSummary: data.locationSummary?.trim() || '',
          hasReligiousCeremony: false,
          ceremonyVenue: {
            name: data.ceremonyVenueName?.trim() || '',
            address: '',
            time: '',
            googleMapsUrl: '',
            wazeUrl: '',
            notes: '',
          },
          receptionVenue: {
            name: data.receptionVenueName?.trim() || '',
            address: '',
            time: '',
            googleMapsUrl: '',
            wazeUrl: '',
            notes: '',
          },
          additionalVenues: [],
          dressCodeStyle: '',
          dressCodeDescription: '',
          suggestedColors: [],
          forbiddenColorsNote: '',
          bankDetails: {
            bankName: '',
            accountHolder: '',
            clabe: '',
            accountNumber: '',
            concept: '',
          },
          showGiftRegistry: false,
          giftRegistryTitle: '',
          giftRegistryMessage: '',
          showBankDetails: false,
          rsvpDeadline: '',
          giftRegistries: [],
          generalContactEmail: '',
          generalContactPhone: '',
          romanticQuote: '',
          totalRealBudget: 0,
        }
      : {
          ...initialWeddingSettings,
          eventType: effectiveEventType,
          coupleNames,
          brideName,
          groomName,
          weddingDate: data.weddingDate,
          weddingTime: '18:00',
          locationSummary: data.locationSummary,
          hasReligiousCeremony: true,
          ceremonyVenue: {
            ...initialWeddingSettings.ceremonyVenue,
            name: data.ceremonyVenueName || 'Parroquia / Capilla Central',
            address: data.locationSummary,
          },
          receptionVenue: {
            ...initialWeddingSettings.receptionVenue,
            name: data.receptionVenueName || 'Hacienda / Jardín de Eventos',
            address: data.locationSummary,
          },
          additionalVenues: [],
          bankDetails: {
            bankName: 'Banco Destino',
            accountHolder: data.coupleNames,
            clabe: '000000000000000000',
            accountNumber: '0000 0000 0000',
            concept: `Regalo Boda ${data.coupleNames}`,
          },
          generalContactEmail: `boda.${slug}@gmail.com`,
          generalContactPhone: '+52 81 0000 0000',
          romanticQuote: '"El amor no se mira con los ojos, sino con el corazón."',
        };

    const newWedding: Wedding = {
      id: newWeddingId,
      coupleNames,
      weddingDate: data.weddingDate?.trim() || '',
      locationSummary: data.locationSummary?.trim() || '',
      status: 'planning',
      settings: newSettings,
      createdByUserId: currentUser.id || currentUser.username,
      createdByUserName: currentUser.username,
      createdByUserLevel: currentUser.level,
      plannerName: currentUser.level === 3 ? currentUser.username : (currentUser.level === 1 ? 'Herly Lizarazo' : undefined),
      guests: isBlank
        ? []
        : [
            {
              id: `g-${newWeddingId}-novia`,
              code: `BODA-${slug.slice(0, 4).toUpperCase()}-NOVIA`,
              fullName: brideName,
              category: 'anfitrion',
              protocolRoleTitle: 'Novia & Anfitriona Principal',
              isProtocolParticipant: true,
              totalPasses: 1,
              confirmedPasses: 1,
              rsvpStatus: 'confirmed',
              assignedTable: 'Mesa Principal (Novios)',
              congratulationMessage: '¡Nuestra gran boda!',
              updatedAt: new Date().toISOString().split('T')[0],
            },
            {
              id: `g-${newWeddingId}-novio`,
              code: `BODA-${slug.slice(0, 4).toUpperCase()}-NOVIO`,
              fullName: groomName,
              category: 'anfitrion',
              protocolRoleTitle: 'Novio & Anfitrión Principal',
              isProtocolParticipant: true,
              totalPasses: 1,
              confirmedPasses: 1,
              rsvpStatus: 'confirmed',
              assignedTable: 'Mesa Principal (Novios)',
              congratulationMessage: '¡El día más esperado!',
              updatedAt: new Date().toISOString().split('T')[0],
            },
            {
              id: `g-${newWeddingId}-padrino`,
              code: `BODA-${slug.slice(0, 4).toUpperCase()}-PADRINO`,
              fullName: 'Padrino de Velación',
              category: 'cortejo_honor',
              protocolRoleTitle: 'Padrino de Honor',
              isProtocolParticipant: true,
              totalPasses: 2,
              confirmedPasses: 2,
              rsvpStatus: 'confirmed',
              assignedTable: 'Mesa 1 (Mesa de Honor)',
              congratulationMessage: '¡Felicidades a los futuros esposos!',
              updatedAt: new Date().toISOString().split('T')[0],
            },
          ],
      timeline: isBlank ? [] : initialTimeline.map((item) => ({ ...item, id: `tm-${newWeddingId}-${item.id}` })),
      budget: isBlank ? [] : initialBudget.map((item) => ({ ...item, id: `b-${newWeddingId}-${item.id}` })),
      tasks: isBlank ? [] : generateMasterTasksForWedding(),
      vendors: isBlank ? [] : initialVendors.map((item) => ({ ...item, id: `v-${newWeddingId}-${item.id}` })),
      tables: isBlank ? [] : initialTables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Save to Hosting Backend
      try {
        await saveWeddingToHosting(newWedding);
      } catch (hostErr) {
        console.warn('[Hosting Storage] create wedding warning:', hostErr);
      }

      setWeddings((prev) => deduplicateAndFilterWeddingsList([newWedding, ...prev]));
      setActiveWeddingId(newWeddingId);

      // If active user is Wedding Planner or Novia Free, associate this new wedding with their account
      if (currentUser.level === 3 || currentUser.level === 4) {
        const updatedCreatedIds = [...(currentUser.createdWeddingIds || []), newWeddingId];
        const updatedAssignedIds = [...(currentUser.assignedWeddingIds || []), newWeddingId];
        const updatedAuth: AuthUser = {
          ...currentUser,
          createdWeddingIds: updatedCreatedIds,
          assignedWeddingIds: updatedAssignedIds,
        };
        setCurrentUser(updatedAuth);
        try {
          sessionStorage.setItem('wedding_hub_auth', JSON.stringify(updatedAuth));
        } catch {
          // ignore
        }

        // Persist to user record in Hosting if ID exists
        if (currentUser.id) {
          try {
            await saveUserToHosting(updatedAuth);
          } catch (uErr) {
            console.warn('[Hosting] No se pudo actualizar weddingIds en usuario:', uErr);
          }
        }
      }

      setShowNewWeddingModal(false);
      // Automatically present the interactive task checklist screen for the new wedding
      setViewModeState('new_wedding_tasks');

      // When Level 4 creates their event, notify them about the 48-hour trial period
      if (currentUser.level === 4) {
        showUpgradeNotice(
          'Plazo de Prueba (48 Horas)',
          '¡Evento creado exitosamente! Recuerda que tu cuenta de Nivel 4 (Novia Free) dispone de un plazo de 48 horas (2 días) para usar la plataforma sin acceso a descargas PDF ni impresión de archivos. Para descargar e imprimir, sube a un plan de pago.'
        );
      }

      return newWeddingId;
    } catch (err) {
      console.warn('Create wedding warning:', err);
      return newWeddingId;
    }
  };

  // Delete a wedding
  const deleteWedding = async (weddingId: string) => {
    if (weddings.length <= 1) {
      alert('Debe existir al menos una boda en el sistema.');
      return;
    }
    try {
      const targetW = weddings.find((w) => w.id === weddingId || w.slug === weddingId);
      markWeddingAsDeletedLocally(weddingId, targetW?.slug);

      try {
        await deleteWeddingFromHosting(weddingId);
        if (targetW?.slug && targetW.slug !== weddingId) {
          await deleteWeddingFromHosting(targetW.slug);
        }
      } catch (hostErr) {
        console.warn('[Hosting Storage] delete wedding warning:', hostErr);
      }

      const cleanRemaining = weddings.filter((w) => w.id !== weddingId && w.slug !== weddingId);
      setWeddings(cleanRemaining);
      try {
        localStorage.setItem('casanovia_all_weddings', JSON.stringify(cleanRemaining));
      } catch {}

      if (activeWeddingId === weddingId || activeWeddingId === targetW?.slug) {
        if (cleanRemaining.length > 0) {
          setActiveWeddingId(cleanRemaining[0].id);
          persistIndicatedWeddingId(cleanRemaining[0].id);
          updateUrlWeddingParam(cleanRemaining[0].id);
        }
      }
    } catch (err) {
      console.warn('Delete wedding warning:', err);
    }
  };

  // -------------------------------------------------------------
  // Settings & Venues operations
  // -------------------------------------------------------------
  const updateSettings = async (newSettings: Partial<WeddingSettings>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentSettings = currentWedding?.settings || settings || initialWeddingSettings;
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
    };

    // If brideName or groomName changed, automatically synchronize or register them as guests with role 'anfitrion'
    let updatedGuests = currentWedding?.guests ? [...currentWedding.guests] : (guests ? [...guests] : []);
    let guestsChanged = false;

    if (newSettings.brideName && newSettings.brideName.trim() && newSettings.brideName.trim() !== currentSettings.brideName) {
      const bName = newSettings.brideName.trim();
      const existingBride = updatedGuests.find((g) => 
        g.category === 'anfitrion' && 
        (g.protocolRoleTitle?.toLowerCase().includes('novia') || g.fullName.toLowerCase().includes(currentSettings.brideName?.toLowerCase() || 'novia'))
      );
      if (existingBride) {
        updatedGuests = updatedGuests.map((g) => g.id === existingBride.id ? { ...g, fullName: bName } : g);
        guestsChanged = true;
      } else {
        const newBrideGuest: Guest = {
          id: `g-${activeWeddingId}-novia-${Date.now()}`,
          code: `BODA-NOVIA-${Math.floor(100 + Math.random() * 900)}`,
          fullName: bName,
          category: 'anfitrion',
          protocolRoleTitle: 'Novia & Anfitriona Principal',
          isProtocolParticipant: true,
          totalPasses: 1,
          confirmedPasses: 1,
          rsvpStatus: 'confirmed',
          assignedTable: 'Mesa Principal (Novios)',
          updatedAt: new Date().toISOString().split('T')[0],
        };
        updatedGuests = [newBrideGuest, ...updatedGuests];
        guestsChanged = true;
      }
    }

    if (newSettings.groomName && newSettings.groomName.trim() && newSettings.groomName.trim() !== currentSettings.groomName) {
      const gName = newSettings.groomName.trim();
      const existingGroom = updatedGuests.find((g) => 
        g.category === 'anfitrion' && 
        (g.protocolRoleTitle?.toLowerCase().includes('novio') || g.fullName.toLowerCase().includes(currentSettings.groomName?.toLowerCase() || 'novio'))
      );
      if (existingGroom) {
        updatedGuests = updatedGuests.map((g) => g.id === existingGroom.id ? { ...g, fullName: gName } : g);
        guestsChanged = true;
      } else {
        const newGroomGuest: Guest = {
          id: `g-${activeWeddingId}-novio-${Date.now()}`,
          code: `BODA-NOVIO-${Math.floor(100 + Math.random() * 900)}`,
          fullName: gName,
          category: 'anfitrion',
          protocolRoleTitle: 'Novio & Anfitrión Principal',
          isProtocolParticipant: true,
          totalPasses: 1,
          confirmedPasses: 1,
          rsvpStatus: 'confirmed',
          assignedTable: 'Mesa Principal (Novios)',
          updatedAt: new Date().toISOString().split('T')[0],
        };
        updatedGuests = [...updatedGuests, newGroomGuest];
        guestsChanged = true;
      }
    }

    const coupleNames = (updatedSettings.coupleNames || currentWedding?.coupleNames || 'Sofía & Alejandro').trim();
    const weddingDate = updatedSettings.weddingDate || currentWedding?.weddingDate || '2026-10-24T17:00:00';
    const oldWeddingId = currentWedding?.id || activeWeddingId;
    
    // Generate the clean canonical slug without connectors (e.g. 0912-zenaidaronny)
    const newCanonicalSlug = generateEventSlug(coupleNames, weddingDate, weddings, oldWeddingId);

    const payload: Partial<Wedding> = {
      id: newCanonicalSlug,
      slug: newCanonicalSlug,
      settings: updatedSettings,
      coupleNames: coupleNames,
      title: coupleNames,
      weddingDate: weddingDate,
      locationSummary: updatedSettings.locationSummary || currentWedding?.locationSummary || '',
    };

    if (guestsChanged) {
      payload.guests = updatedGuests;
    }

    if (newCanonicalSlug && oldWeddingId && newCanonicalSlug !== oldWeddingId) {
      try {
        await deleteWeddingFromHosting(oldWeddingId);
      } catch (e) {
        console.warn('Old wedding deletion warning on slug change:', e);
      }

      const fullUpdated: Wedding = {
        guests: currentWedding?.guests || [],
        tables: currentWedding?.tables || [],
        timeline: currentWedding?.timeline || [],
        tasks: currentWedding?.tasks || [],
        budget: currentWedding?.budget || [],
        vendors: currentWedding?.vendors || [],
        status: currentWedding?.status || 'planning',
        createdAt: currentWedding?.createdAt || new Date().toISOString(),
        ...(currentWedding || {}),
        ...payload,
        id: newCanonicalSlug,
        slug: newCanonicalSlug,
        coupleNames,
        title: coupleNames,
        weddingDate,
        locationSummary: updatedSettings.locationSummary || currentWedding?.locationSummary || '',
        settings: updatedSettings,
        updatedAt: new Date().toISOString(),
      };

      setWeddings((prev) => {
        const list = prev
          .filter((w) => w.id !== oldWeddingId && w.id !== newCanonicalSlug)
          .concat(fullUpdated);
        const consolidated = consolidateWeddingsList(list);
        try {
          localStorage.setItem('casanovia_all_weddings', JSON.stringify(consolidated));
        } catch {}
        return consolidated;
      });

      setActiveWeddingId(newCanonicalSlug);
      persistIndicatedWeddingId(newCanonicalSlug);
      updateUrlWeddingParam(newCanonicalSlug);

      try {
        await saveWeddingToHosting(fullUpdated);
      } catch (e) {
        console.warn('Error saving updated wedding to hosting:', e);
      }

      setSystemUsers((prevUsers) => {
        let changed = false;
        const newUsers = prevUsers.map((u) => {
          const uAssigned = u.assignedWeddingIds || [];
          const uCreated = u.createdWeddingIds || [];
          if (uAssigned.includes(oldWeddingId) || uCreated.includes(oldWeddingId)) {
            changed = true;
            return {
              ...u,
              assignedWeddingIds: uAssigned.map((id) => (id === oldWeddingId ? newCanonicalSlug : id)),
              createdWeddingIds: uCreated.map((id) => (id === oldWeddingId ? newCanonicalSlug : id)),
            };
          }
          return u;
        });
        if (changed) {
          try {
            localStorage.setItem('casanovia_system_users', JSON.stringify(newUsers));
            saveUsersBulkToHosting(newUsers);
          } catch {}
        }
        return newUsers;
      });
    } else {
      await updateActiveWeddingDoc(payload);
    }
  };

  const addAdditionalVenue = async (venueData: Omit<AdditionalVenue, 'id'>): Promise<AdditionalVenue> => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentSettings = currentWedding?.settings || settings || initialWeddingSettings;
    const newVenue: AdditionalVenue = {
      ...venueData,
      id: `venue-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: venueData.name?.trim() || 'Nueva Sede',
      type: venueData.type || 'Hospedaje / Preparación',
      address: venueData.address || '',
      time: venueData.time || '',
      googleMapsUrl: venueData.googleMapsUrl || '',
      wazeUrl: venueData.wazeUrl || '',
      notes: venueData.notes || '',
    };
    const currentVenues = currentSettings.additionalVenues || [];
    const updatedVenues = [...currentVenues, newVenue];
    await updateSettings({ additionalVenues: updatedVenues });
    return newVenue;
  };

  const updateAdditionalVenue = async (id: string, updates: Partial<AdditionalVenue>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentSettings = currentWedding?.settings || settings || initialWeddingSettings;
    const currentVenues = currentSettings.additionalVenues || [];
    const updatedVenues = currentVenues.map((v) => (v.id === id ? { ...v, ...updates } : v));
    await updateSettings({ additionalVenues: updatedVenues });
  };

  const deleteAdditionalVenue = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentSettings = currentWedding?.settings || settings || initialWeddingSettings;
    const currentVenues = currentSettings.additionalVenues || [];
    const updatedVenues = currentVenues.filter((v) => v.id !== id);
    await updateSettings({ additionalVenues: updatedVenues });
  };

  // -------------------------------------------------------------
  // Wedding Custom Theme & Color Palette Operations
  // -------------------------------------------------------------
  const currentWeddingTheme: WeddingCustomTheme = (settings?.customTheme && settings.customTheme.enabled)
    ? settings.customTheme
    : getDefaultWeddingTheme();

  const applyWeddingColorsTheme = async (colorsToUse?: DressCodeColor[]): Promise<WeddingCustomTheme> => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentSettings = currentWedding?.settings || settings || initialWeddingSettings;
    const list = colorsToUse || currentSettings.suggestedColors || [];
    const generatedTheme = generateWeddingTheme(list);
    await updateSettings({
      suggestedColors: list,
      customTheme: generatedTheme,
    });
    return generatedTheme;
  };

  const resetWeddingColorsTheme = async (): Promise<void> => {
    const defaultTheme = {
      ...getDefaultWeddingTheme(),
      enabled: false,
    };
    await updateSettings({
      customTheme: defaultTheme,
    });
  };

  // -------------------------------------------------------------
  // Guests operations
  // -------------------------------------------------------------
  const addGuest = async (guestData: Omit<Guest, 'id'>): Promise<Guest> => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentGuests = currentWedding?.guests || guests || [];

    // Nivel 4: Novia Free (Límite máximo de 20 invitados)
    if (currentUser.level === 4 && currentGuests.length >= 20) {
      alert('Plan Novia Free (Nivel 4): Has alcanzado el límite máximo de 20 invitados permitidos.');
      throw new Error('Límite de 20 invitados alcanzado para el Plan Novia Free.');
    }

    // Format full name to Altibajas automatically
    const cleanFullName = formatAltibajas(guestData.fullName);

    // If companion of a main guest, synchronize initial table with the main guest
    let tableToAssign = guestData.assignedTable || 'Mesa por asignar';
    if (guestData.mainGuestId) {
      const mainGuest = currentGuests.find((g) => g.id === guestData.mainGuestId);
      if (mainGuest) {
        tableToAssign = (mainGuest.assignedTable && mainGuest.assignedTable.trim() !== '' && mainGuest.assignedTable !== 'Mesa por asignar')
          ? mainGuest.assignedTable
          : 'Mesa por asignar';
      }
    }

    const cleanNameCode = cleanFullName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'INV';

    const newGuest: Guest = {
      ...guestData,
      fullName: cleanFullName,
      assignedTable: tableToAssign,
      id: `g-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      code: guestData.code || `BODA-${cleanNameCode}-${Math.floor(100 + Math.random() * 900)}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    let updatedGuests: Guest[];
    if (guestData.mainGuestId) {
      const mainGuest = currentGuests.find((g) => g.id === guestData.mainGuestId);
      const existingComps = currentGuests.filter((g) => g.mainGuestId === guestData.mainGuestId);
      const neededPasses = existingComps.length + 2;
      const shouldIncreasePasses = mainGuest && (mainGuest.totalPasses || 1) < neededPasses;

      updatedGuests = currentGuests.map((g) => {
        if (shouldIncreasePasses && g.id === guestData.mainGuestId) {
          return {
            ...g,
            totalPasses: neededPasses,
            assignedTable: tableToAssign !== 'Mesa por asignar' ? tableToAssign : g.assignedTable,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return g;
      });
      updatedGuests.push(newGuest);
    } else {
      updatedGuests = [...currentGuests, newGuest];
    }

    await updateActiveWeddingDoc({ guests: updatedGuests });
    return newGuest;
  };

  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentGuests = currentWedding?.guests || guests || [];
    const targetGuest = currentGuests.find((g) => g.id === id);

    // Ensure Altibajas if fullName is being updated
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.fullName) {
      sanitizedUpdates.fullName = formatAltibajas(sanitizedUpdates.fullName);
    }

    // If updating assignedTable, synchronize the entire group (main guest + companions)
    let groupIdsToSyncTable: string[] = [];
    let groupNewTable: string | undefined = undefined;

    if (sanitizedUpdates.assignedTable !== undefined && targetGuest) {
      groupNewTable = sanitizedUpdates.assignedTable;
      
      const isUnlinking = 'mainGuestId' in sanitizedUpdates && !sanitizedUpdates.mainGuestId;

      if (!isUnlinking && targetGuest.mainGuestId) {
        // Case A: The updated guest is a companion.
        // Si se le asigna a un acompañante también debe ir el invitado asignado
        const mainId = targetGuest.mainGuestId;
        groupIdsToSyncTable = [
          mainId,
          ...currentGuests.filter((g) => g.mainGuestId === mainId).map((g) => g.id)
        ];
      } else if (!isUnlinking) {
        // Case B: The updated guest is the primary/main guest.
        // Synchronize all companions of this main guest
        groupIdsToSyncTable = [
          targetGuest.id,
          ...currentGuests.filter((g) => g.mainGuestId === targetGuest.id).map((g) => g.id)
        ];
      }
    }

    const updatedGuests = currentGuests.map((g) => {
      // 1. Direct target update
      if (g.id === id) {
        const updated = {
          ...g,
          ...sanitizedUpdates,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        if (selectedGuestForGuide?.id === id) {
          setSelectedGuestForGuide(updated);
        }
        return updated;
      }

      // 2. Cascade table assignment to companions/main guest in the same party
      if (groupNewTable !== undefined && groupIdsToSyncTable.includes(g.id)) {
        return {
          ...g,
          assignedTable: groupNewTable,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }

      return g;
    });
    await updateActiveWeddingDoc({ guests: updatedGuests });
  };

  const assignCompanion = async (primaryGuestId: string, companionGuestId: string, targetTable?: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentGuests = currentWedding?.guests || guests || [];

    const primary = currentGuests.find((g) => g.id === primaryGuestId);
    const companion = currentGuests.find((g) => g.id === companionGuestId);
    if (!primary || !companion) return;

    // Count existing companions of primary (excluding the companion being assigned)
    const existingCompanions = currentGuests.filter(
      (g) => g.mainGuestId === primaryGuestId && g.id !== companionGuestId
    );
    // Needed passes = 1 primary + existing companions + 1 new companion
    const neededPasses = existingCompanions.length + 2;
    const newTotalPasses = Math.max(primary.totalPasses || 1, neededPasses);

    // Resolve final table
    let finalTable = (targetTable && targetTable !== 'Mesa por asignar')
      ? targetTable
      : (primary.assignedTable && primary.assignedTable !== 'Mesa por asignar'
          ? primary.assignedTable
          : (companion.assignedTable && companion.assignedTable !== 'Mesa por asignar'
              ? companion.assignedTable
              : 'Mesa por asignar'));

    // IDs of everyone in the group to sync table
    const groupIdsToSync = [
      primaryGuestId,
      companionGuestId,
      ...existingCompanions.map((g) => g.id),
    ];

    const updatedGuests = currentGuests.map((g) => {
      // 1. Companion being assigned
      if (g.id === companionGuestId) {
        return {
          ...g,
          mainGuestId: primaryGuestId,
          category: 'invitado' as const,
          assignedTable: finalTable,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }

      // 2. Primary guest: update passes and table
      if (g.id === primaryGuestId) {
        return {
          ...g,
          totalPasses: newTotalPasses,
          assignedTable: finalTable !== 'Mesa por asignar' ? finalTable : g.assignedTable,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }

      // 3. Existing companions of primary: sync table if specified
      if (finalTable !== 'Mesa por asignar' && groupIdsToSync.includes(g.id)) {
        return {
          ...g,
          assignedTable: finalTable,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }

      return g;
    });

    await updateActiveWeddingDoc({ guests: updatedGuests });
  };

  const deleteGuest = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentGuests = currentWedding?.guests || guests || [];
    
    // If deleting a main guest, unlink companions so they don't hold orphan pointers
    const updatedGuests = currentGuests
      .filter((g) => g.id !== id)
      .map((g) => {
        if (g.mainGuestId === id) {
          return {
            ...g,
            mainGuestId: undefined,
            assignedTable: 'Mesa por asignar',
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return g;
      });

    if (selectedGuestForGuide?.id === id) {
      setSelectedGuestForGuide(null);
    }
    await updateActiveWeddingDoc({ guests: updatedGuests });
  };

  const reorderGuests = async (reorderedGuests: Guest[]) => {
    await updateActiveWeddingDoc({ guests: reorderedGuests });
  };

  const importGuests = async (newGuests: Guest[], mode: 'append' | 'replace') => {
    let finalGuests: Guest[] = [];
    const nowIso = new Date().toISOString().split('T')[0];

    // Nivel 4: Novia Free - Límite de 20 invitados: solo se importan los primeros hasta completar 20, descartando los demás
    let effectiveNewGuests = newGuests;
    if (currentUser.level === 4) {
      if (mode === 'replace') {
        effectiveNewGuests = newGuests.slice(0, 20);
      } else {
        const availableSlots = Math.max(0, 20 - guests.length);
        effectiveNewGuests = newGuests.slice(0, availableSlots);
      }
      if (newGuests.length > effectiveNewGuests.length) {
        showUpgradeNotice(
          'Límite de 20 Invitados (Nivel 4)',
          `El sistema solo importó los primeros ${effectiveNewGuests.length} invitados (límite máximo de 20 invitados para cuentas Nivel 4). Los demás invitados fueron descartados. Por favor sube de nivel para tener invitados ilimitados.`
        );
        try {
          alert(`Plan Novia Free (Nivel 4): El sistema solo importó los primeros ${effectiveNewGuests.length} invitados (límite máximo de 20 invitados). Los demás invitados fueron descartados.`);
        } catch (_) {}
      }
    }

    if (mode === 'replace') {
      finalGuests = effectiveNewGuests.map((g, idx) => {
        const cleanName = formatAltibajas(g.fullName || `Invitado ${idx + 1}`);
        const cleanNameCode = cleanName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'INV';
        return {
          ...g,
          id: g.id || `g-imp-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          code: g.code || `BODA-${cleanNameCode}-${String(idx + 1).padStart(2, '0')}`,
          fullName: cleanName,
          category: g.category || 'invitado',
          assignedTable: g.assignedTable || 'Mesa por asignar',
          totalPasses: Number(g.totalPasses) > 0 ? Number(g.totalPasses) : 1,
          confirmedPasses: g.rsvpStatus === 'confirmed' ? (Number(g.confirmedPasses) || Number(g.totalPasses) || 1) : 0,
          rsvpStatus: g.rsvpStatus || 'pending',
          dietaryRestrictions: g.dietaryRestrictions || 'Ninguna',
          email: g.email || '',
          phone: g.phone || '',
          specialArrivalTime: g.specialArrivalTime || '',
          photoshootSchedule: g.photoshootSchedule || '',
          dressCodeNote: g.dressCodeNote || '',
          accessoryAssigned: g.accessoryAssigned || '',
          assignedMilestone: g.assignedMilestone || '',
          congratulationMessage: g.congratulationMessage || '',
          updatedAt: nowIso,
        };
      });
    } else {
      // Append mode: merge ensuring unique IDs and codes
      const existingIds = new Set(guests.map((g) => g.id));
      const existingCodes = new Set(guests.map((g) => g.code.toUpperCase()));
      const sanitizedNewGuests = effectiveNewGuests.map((g, idx) => {
        const cleanName = formatAltibajas(g.fullName || `Invitado ${idx + 1}`);
        const cleanNameCode = cleanName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'INV';
        let code = g.code;
        if (!code || existingCodes.has(code.toUpperCase())) {
          code = `BODA-${cleanNameCode}-${Math.floor(100 + Math.random() * 900)}`;
          existingCodes.add(code.toUpperCase());
        }

        const id = existingIds.has(g.id)
          ? `g-imp-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`
          : g.id || `g-imp-${Date.now()}-${idx}`;
        existingIds.add(id);

        return {
          ...g,
          id,
          code,
          fullName: cleanName,
          category: g.category || 'invitado',
          assignedTable: g.assignedTable || 'Mesa por asignar',
          totalPasses: Number(g.totalPasses) > 0 ? Number(g.totalPasses) : 1,
          confirmedPasses: g.rsvpStatus === 'confirmed' ? (Number(g.confirmedPasses) || Number(g.totalPasses) || 1) : 0,
          rsvpStatus: g.rsvpStatus || 'pending',
          dietaryRestrictions: g.dietaryRestrictions || 'Ninguna',
          email: g.email || '',
          phone: g.phone || '',
          specialArrivalTime: g.specialArrivalTime || '',
          photoshootSchedule: g.photoshootSchedule || '',
          dressCodeNote: g.dressCodeNote || '',
          accessoryAssigned: g.accessoryAssigned || '',
          assignedMilestone: g.assignedMilestone || '',
          congratulationMessage: g.congratulationMessage || '',
          updatedAt: nowIso,
        };
      });
      finalGuests = [...guests, ...sanitizedNewGuests];
    }
    await updateActiveWeddingDoc({ guests: finalGuests });
  };

  const findGuestByQuery = (query: string): Guest | undefined => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return guests.find(
      (g) =>
        g.code.toLowerCase() === q ||
        g.fullName.toLowerCase() === q ||
        g.fullName.toLowerCase().includes(q) ||
        (g.email && g.email.toLowerCase() === q)
    );
  };

  const submitGuestRsvp = async (
    guestCodeOrName: string,
    rsvpData: {
      fullName: string;
      rsvpStatus: RsvpStatus;
      confirmedPasses: number;
      dietaryRestrictions?: string;
      confirmedRehearsalPhotoAttendance?: boolean;
      congratulationMessage?: string;
    }
  ): Promise<{ success: boolean; guest?: Guest; message: string }> => {
    const existingGuest = findGuestByQuery(guestCodeOrName);
    const cleanRsvpName = formatAltibajas(rsvpData.fullName);

    if (existingGuest) {
      const updated: Guest = {
        ...existingGuest,
        fullName: cleanRsvpName || existingGuest.fullName,
        rsvpStatus: rsvpData.rsvpStatus,
        confirmedPasses: rsvpData.rsvpStatus === 'confirmed' ? rsvpData.confirmedPasses : 0,
        dietaryRestrictions: rsvpData.dietaryRestrictions || existingGuest.dietaryRestrictions || 'Ninguna',
        confirmedRehearsalPhotoAttendance:
          rsvpData.confirmedRehearsalPhotoAttendance ?? existingGuest.confirmedRehearsalPhotoAttendance,
        congratulationMessage: rsvpData.congratulationMessage || existingGuest.congratulationMessage || '',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const updatedGuests = guests.map((g) => (g.id === existingGuest.id ? updated : g));
      await updateActiveWeddingDoc({ guests: updatedGuests });
      setSelectedGuestForGuide(updated);

      return {
        success: true,
        guest: updated,
        message:
          rsvpData.rsvpStatus === 'confirmed'
            ? `¡Gracias ${updated.fullName}! Tu asistencia ha sido confirmada en Firestore (${updated.confirmedPasses} ${
                updated.confirmedPasses === 1 ? 'pase' : 'pases'
              }).`
            : `Hemos registrado tu respuesta en la nube. ¡Gracias por acompañarnos con tus buenos deseos!`,
      };
    } else {
      const cleanPrefix = cleanRsvpName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'INV';
      const newGuest: Guest = {
        id: `g-rsvp-${Date.now()}`,
        code: `BODA-${cleanPrefix}-${Math.floor(100 + Math.random() * 900)}`,
        fullName: cleanRsvpName || 'Invitado Registrado',
        category: 'invitado',
        isProtocolParticipant: false,
        totalPasses: rsvpData.confirmedPasses || 1,
        confirmedPasses: rsvpData.rsvpStatus === 'confirmed' ? rsvpData.confirmedPasses || 1 : 0,
        rsvpStatus: rsvpData.rsvpStatus,
        dietaryRestrictions: rsvpData.dietaryRestrictions || 'Ninguna',
        congratulationMessage: rsvpData.congratulationMessage || '',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const updatedGuests = [...guests, newGuest];
      await updateActiveWeddingDoc({ guests: updatedGuests });
      setSelectedGuestForGuide(newGuest);

      return {
        success: true,
        guest: newGuest,
        message: `¡Registro exitoso! Te esperamos para celebrar este gran día.`,
      };
    }
  };

  // -------------------------------------------------------------
  // Timeline operations
  // -------------------------------------------------------------
  const addMilestone = async (milestone: Omit<TimelineMilestone, 'id'>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentTimeline = currentWedding?.timeline || timeline || [];

    // Nivel 4: Novia Free (Crear hasta 5 hitos en el cronograma)
    if (currentUser.level === 4 && currentTimeline.length >= 5) {
      alert('Plan Novia Free (Nivel 4): Has alcanzado el límite máximo de 5 hitos en el cronograma.');
      return;
    }

    const newMilestone: TimelineMilestone = {
      ...milestone,
      id: `tm-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      time: milestone.time?.trim() || '18:00',
      title: milestone.title?.trim() || 'Hito del Cronograma',
      location: milestone.location?.trim() || '',
      description: milestone.description?.trim() || '',
      category: milestone.category || 'protocolo',
      isProtocolCrucial: milestone.isProtocolCrucial ?? true,
      responsiblePerson: milestone.responsiblePerson?.trim() || '',
      dressOrItemsRequired: milestone.dressOrItemsRequired?.trim() || '',
    };
    const updated: TimelineMilestone[] = sortTimelineMilestones<TimelineMilestone>([...currentTimeline, newMilestone]);
    await updateActiveWeddingDoc({ timeline: updated });
  };

  const updateMilestone = async (id: string, updates: Partial<TimelineMilestone>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentTimeline = currentWedding?.timeline || timeline || [];
    const updated: TimelineMilestone[] = sortTimelineMilestones<TimelineMilestone>(
      currentTimeline.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    await updateActiveWeddingDoc({ timeline: updated });
  };

  const deleteMilestone = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentTimeline = currentWedding?.timeline || timeline || [];
    const updated = currentTimeline.filter((item) => item.id !== id);
    await updateActiveWeddingDoc({ timeline: updated });
  };

  const setTimeline = async (newTimeline: TimelineMilestone[]) => {
    const updated: TimelineMilestone[] = sortTimelineMilestones<TimelineMilestone>(newTimeline);
    await updateActiveWeddingDoc({ timeline: updated });
  };

  // -------------------------------------------------------------
  // Budget operations
  // -------------------------------------------------------------
  const addBudgetItem = async (item: Omit<BudgetItem, 'id'>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentBudget = currentWedding?.budget || budget || [];

    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}`,
    };
    const updated = [...currentBudget, newItem];
    await updateActiveWeddingDoc({ budget: updated });
  };

  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentBudget = currentWedding?.budget || budget || [];

    const updated = currentBudget.map((item) => (item.id === id ? { ...item, ...updates } : item));
    await updateActiveWeddingDoc({ budget: updated });
  };

  const deleteBudgetItem = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentBudget = currentWedding?.budget || budget || [];

    const updated = currentBudget.filter((item) => item.id !== id);
    await updateActiveWeddingDoc({ budget: updated });
  };

  const syncBudgetWithVendors = async () => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentVendors = currentWedding?.vendors || vendors || [];

    // Erase fictitious dummy items and regenerate budget 100% directly from registered vendors
    const syncedBudget = buildBudgetDirectlyFromVendors(currentVendors);
    const sumActual = syncedBudget.reduce((acc, b) => acc + (b.actualCost || 0), 0);
    const curTarget = settings.totalRealBudget || 0;
    const newTarget = curTarget > 0 ? curTarget : sumActual;

    await updateActiveWeddingDoc({
      budget: syncedBudget,
      settings: {
        ...settings,
        totalRealBudget: newTarget,
      },
    });
  };

  // -------------------------------------------------------------
  // Finanzas Fiesta de Promoción (Cuotas & Pagos Parciales Padres de Familia)
  // -------------------------------------------------------------
  const addPromotionQuota = async (quotaData: Omit<PromotionFeeQuota, 'id' | 'createdAt' | 'updatedAt' | 'partialPayments' | 'status'> & { partialPayments?: PartialPayment[] }) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];

    const now = new Date().toISOString();
    const payments = quotaData.partialPayments || [];
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const target = Number(quotaData.totalTargetAmount) || 0;

    let status: 'pendiente' | 'parcial' | 'completado' = 'pendiente';
    if (totalPaid >= target && target > 0) {
      status = 'completado';
    } else if (totalPaid > 0) {
      status = 'parcial';
    }

    const newQuota: PromotionFeeQuota = {
      id: `quota-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      parentName: quotaData.parentName,
      studentName: quotaData.studentName || '',
      parentId: quotaData.parentId || '',
      totalTargetAmount: target,
      partialPayments: payments,
      status,
      notes: quotaData.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...currentQuotas, newQuota];
    await updateActiveWeddingDoc({ promotionQuotas: updated });
  };

  const updatePromotionQuota = async (id: string, updates: Partial<PromotionFeeQuota>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];

    const now = new Date().toISOString();
    const updated = currentQuotas.map((q) => {
      if (q.id !== id) return q;
      const merged = { ...q, ...updates, updatedAt: now };
      const target = Number(merged.totalTargetAmount) || 0;
      const totalPaid = (merged.partialPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      
      let status: 'pendiente' | 'parcial' | 'completado' = 'pendiente';
      if (totalPaid >= target && target > 0) {
        status = 'completado';
      } else if (totalPaid > 0) {
        status = 'parcial';
      }
      merged.status = status;
      return merged;
    });

    await updateActiveWeddingDoc({ promotionQuotas: updated });
  };

  const deletePromotionQuota = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];

    const updated = currentQuotas.filter((q) => q.id !== id);
    await updateActiveWeddingDoc({ promotionQuotas: updated });
  };

  const addPartialPaymentToQuota = async (quotaId: string, paymentData: Omit<PartialPayment, 'id' | 'createdAt'>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];

    const newPayment: PartialPayment = {
      id: `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      concept: paymentData.concept,
      amount: Number(paymentData.amount) || 0,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      registeredBy: currentUser.username || 'Comisión',
      notes: paymentData.notes || '',
      receiptUrl: paymentData.receiptUrl || '',
      createdAt: new Date().toISOString(),
    };

    const updated = currentQuotas.map((q) => {
      if (q.id !== quotaId) return q;
      const newPayments = [...(q.partialPayments || []), newPayment];
      const totalPaid = newPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const target = Number(q.totalTargetAmount) || 0;

      let status: 'pendiente' | 'parcial' | 'completado' = 'pendiente';
      if (totalPaid >= target && target > 0) {
        status = 'completado';
      } else if (totalPaid > 0) {
        status = 'parcial';
      }

      return {
        ...q,
        partialPayments: newPayments,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    await updateActiveWeddingDoc({ promotionQuotas: updated });
  };

  const deletePartialPaymentFromQuota = async (quotaId: string, paymentId: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];

    const updated = currentQuotas.map((q) => {
      if (q.id !== quotaId) return q;
      const newPayments = (q.partialPayments || []).filter((p) => p.id !== paymentId);
      const totalPaid = newPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const target = Number(q.totalTargetAmount) || 0;

      let status: 'pendiente' | 'parcial' | 'completado' = 'pendiente';
      if (totalPaid >= target && target > 0) {
        status = 'completado';
      } else if (totalPaid > 0) {
        status = 'parcial';
      }

      return {
        ...q,
        partialPayments: newPayments,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    await updateActiveWeddingDoc({ promotionQuotas: updated });
  };

  const assignGlobalPromotionQuota = async (globalTargetAmount: number, notes?: string): Promise<{ updatedCount: number; createdCount: number }> => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId) || activeWedding;
    const currentQuotas = currentWedding?.promotionQuotas || promotionQuotas || [];
    const currentGuests = currentWedding?.guests || guests || [];
    const now = new Date().toISOString();
    const target = Number(globalTargetAmount) || 0;

    const padres = currentGuests.filter((g) =>
      g.category === 'padres_familia' ||
      (g.protocolRoleTitle && g.protocolRoleTitle.toLowerCase().includes('padre'))
    );

    let updatedCount = 0;
    let createdCount = 0;

    const updatedExistingQuotas: PromotionFeeQuota[] = currentQuotas.map((q) => {
      updatedCount++;
      const totalPaid = (q.partialPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      let status: 'pendiente' | 'parcial' | 'completado' = 'pendiente';
      if (totalPaid >= target && target > 0) {
        status = 'completado';
      } else if (totalPaid > 0) {
        status = 'parcial';
      }
      return {
        ...q,
        totalTargetAmount: target,
        notes: notes !== undefined ? (notes ? notes.trim() : q.notes) : q.notes,
        status,
        updatedAt: now,
      };
    });

    const newQuotasForUnassignedParents: PromotionFeeQuota[] = [];
    for (const padre of padres) {
      const alreadyExists = updatedExistingQuotas.some((q) =>
        (q.parentId && q.parentId === padre.id) ||
        (q.parentName && q.parentName.trim().toLowerCase() === padre.fullName.trim().toLowerCase())
      );
      if (!alreadyExists) {
        createdCount++;
        let studentName = padre.childStudentName || '';
        if (!studentName && padre.childStudentId) {
          const child = currentGuests.find(g => g.id === padre.childStudentId);
          if (child) studentName = child.fullName;
        }
        if (!studentName && padre.dressCodeNote) {
          studentName = padre.dressCodeNote;
        }

        newQuotasForUnassignedParents.push({
          id: `quota-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${createdCount}`,
          parentName: padre.fullName,
          studentName,
          parentId: padre.id,
          totalTargetAmount: target,
          partialPayments: [],
          status: 'pendiente',
          notes: notes ? notes.trim() : 'Cuota General Asignada',
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const finalQuotasList = [...updatedExistingQuotas, ...newQuotasForUnassignedParents];
    await updateActiveWeddingDoc({ promotionQuotas: finalQuotasList });
    return { updatedCount, createdCount };
  };

  // -------------------------------------------------------------
  // Task operations (Master 6-Phase Checklist)
  // -------------------------------------------------------------
  const addTask = async (task: Omit<WeddingTask, 'id'>) => {
    const newTask: WeddingTask = {
      ...task,
      id: `t-${Date.now()}`,
    };
    const updated = [...tasks, newTask];
    await updateActiveWeddingDoc({ tasks: updated });
  };

  const toggleTask = async (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    await updateActiveWeddingDoc({ tasks: updated });
  };

  const toggleAllTasks = async (completed: boolean) => {
    const updated = tasks.map((t) => ({ ...t, isCompleted: completed }));
    await updateActiveWeddingDoc({ tasks: updated });
  };

  const deleteAllTasks = async () => {
    await updateActiveWeddingDoc({ tasks: [] });
  };

  const setAllTasks = async (newTasks: WeddingTask[]) => {
    await updateActiveWeddingDoc({ tasks: newTasks });
  };

  const updateTask = async (id: string, updates: Partial<WeddingTask>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    await updateActiveWeddingDoc({ tasks: updated });
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    await updateActiveWeddingDoc({ tasks: updated });
  };

  const resetTasksToMaster = async () => {
    const masterTasks = generateMasterTasksForWedding();
    await updateActiveWeddingDoc({ tasks: masterTasks });
  };

  // -------------------------------------------------------------
  // Vendor operations (with automatic Budget Synchronization)
  // -------------------------------------------------------------
  const addVendor = async (vendorData: Omit<VendorItem, 'id'>): Promise<VendorItem> => {
    const newVendor: VendorItem = {
      ...vendorData,
      id: `v-${Date.now()}`,
    };
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentVendors = currentWedding?.vendors || vendors || [];
    
    const updatedVendors = [...currentVendors, newVendor];
    // Keep budget strictly synchronized with all registered vendors
    const updatedBudget = buildBudgetDirectlyFromVendors(updatedVendors);
    const sumActual = updatedBudget.reduce((acc, b) => acc + (b.actualCost || 0), 0);
    
    await updateActiveWeddingDoc({ 
      vendors: updatedVendors,
      budget: updatedBudget,
      settings: {
        ...settings,
        totalRealBudget: settings.totalRealBudget || sumActual,
      },
    });
    return newVendor;
  };

  const updateVendor = async (id: string, updates: Partial<VendorItem>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentVendors = currentWedding?.vendors || vendors || [];

    const updatedVendors = currentVendors.map((v) => (v.id === id ? { ...v, ...updates } : v));
    const updatedBudget = buildBudgetDirectlyFromVendors(updatedVendors);
    const sumActual = updatedBudget.reduce((acc, b) => acc + (b.actualCost || 0), 0);

    await updateActiveWeddingDoc({ 
      vendors: updatedVendors,
      budget: updatedBudget,
      settings: {
        ...settings,
        totalRealBudget: settings.totalRealBudget || sumActual,
      },
    });
  };

  const deleteVendor = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentVendors = currentWedding?.vendors || vendors || [];

    const updatedVendors = currentVendors.filter((v) => v.id !== id);
    const updatedBudget = buildBudgetDirectlyFromVendors(updatedVendors);

    await updateActiveWeddingDoc({ 
      vendors: updatedVendors,
      budget: updatedBudget,
    });
  };

  // -------------------------------------------------------------
  // Table / Seating Operations
  // -------------------------------------------------------------
  const updateTables = async (newTables: WeddingTable[]) => {
    await updateActiveWeddingDoc({ tables: newTables });
  };

  const addTable = async (tableData: Omit<WeddingTable, 'id'>): Promise<WeddingTable> => {
    const newTable: WeddingTable = {
      ...tableData,
      id: `tbl-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    };
    const currentTables = activeWedding?.tables && activeWedding.tables.length > 0 
      ? activeWedding.tables 
      : initialTables;
    const updated = [...currentTables, newTable];
    await updateActiveWeddingDoc({ tables: updated });
    return newTable;
  };

  const updateTable = async (id: string, updates: Partial<WeddingTable>) => {
    const currentTables = activeWedding?.tables && activeWedding.tables.length > 0 
      ? activeWedding.tables 
      : initialTables;
    const oldTable = currentTables.find(t => t.id === id);
    const updated = currentTables.map((t) => (t.id === id ? { ...t, ...updates } : t));

    // If table name changed, update all guests assigned to this table name
    if (updates.name && oldTable && updates.name !== oldTable.name) {
      const currentGuests = activeWedding?.guests || guests || [];
      const updatedGuests = currentGuests.map(g => {
        if (g.assignedTable === oldTable.name) {
          return { ...g, assignedTable: updates.name! };
        }
        return g;
      });
      await updateActiveWeddingDoc({ tables: updated, guests: updatedGuests });
    } else {
      await updateActiveWeddingDoc({ tables: updated });
    }

    // Synchronize changes to Plano Local (Floor Plan) elements
    try {
      if (activeWeddingId && typeof window !== 'undefined') {
        const storageKey = `casanovia_floor_plan_${activeWeddingId}`;
        const localPlanRaw = localStorage.getItem(storageKey);
        if (localPlanRaw) {
          const localPlan = JSON.parse(localPlanRaw);
          if (Array.isArray(localPlan.elements)) {
            let hasPlanChanges = false;
            const updatedPlanElements = localPlan.elements.map((el: any) => {
              const isMatch =
                el.id === id ||
                el.id === `elem_table_${id}` ||
                el.tableId === id ||
                (oldTable && el.name?.trim().toLowerCase() === oldTable.name.trim().toLowerCase());
              if (isMatch) {
                hasPlanChanges = true;
                return {
                  ...el,
                  name: updates.name !== undefined ? updates.name : el.name,
                  seatCount: updates.capacity !== undefined ? updates.capacity : el.seatCount,
                };
              }
              return el;
            });
            if (hasPlanChanges) {
              localPlan.elements = updatedPlanElements;
              localStorage.setItem(storageKey, JSON.stringify(localPlan));
              saveFloorPlanToHosting(activeWeddingId, localPlan).catch((err) => {
                console.warn('[WeddingContext] Error updating floor_plans hosting doc:', err);
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[WeddingContext] Error syncing table to floor plan:', e);
    }
  };

  const deleteTable = async (id: string) => {
    const currentTables = activeWedding?.tables && activeWedding.tables.length > 0 
      ? activeWedding.tables 
      : initialTables;
    const targetTable = currentTables.find(t => t.id === id);
    const updated = currentTables.filter((t) => t.id !== id);

    const currentGuests = activeWedding?.guests || guests || [];
    if (targetTable) {
      const updatedGuests = currentGuests.map(g => {
        if (g.assignedTable === targetTable.name) {
          return { ...g, assignedTable: 'Mesa por asignar' };
        }
        return g;
      });
      await updateActiveWeddingDoc({ tables: updated, guests: updatedGuests });
    } else {
      await updateActiveWeddingDoc({ tables: updated });
    }
  };

  const batchAssignGuestsToTable = async (guestIds: string[], tableName: string) => {
    const currentGuests = activeWedding?.guests || guests || [];
    const updatedGuests = currentGuests.map((g) => {
      if (guestIds.includes(g.id)) {
        return {
          ...g,
          assignedTable: tableName,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return g;
    });
    await updateActiveWeddingDoc({ guests: updatedGuests });
  };

  const batchUpdateGuests = async (updatedGuests: Guest[]) => {
    await updateActiveWeddingDoc({ guests: updatedGuests });
  };

  // -------------------------------------------------------------
  // Backup & Reset
  // -------------------------------------------------------------
  const exportDataJson = () => {
    const exportObject = {
      weddingHubVersion: '3.1.0-casanovia-hosting',
      exportDate: new Date().toISOString(),
      wedding: activeWedding,
      allWeddingsCount: weddings.length,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_hub_${activeWedding.coupleNames.replace(/[^a-zA-Z0-9]/g, '_')}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllDatabaseJson = () => {
    let weddingcraftTemplates = [];
    try {
      const wcStr = localStorage.getItem('weddingcraft_templates_backup');
      if (wcStr) weddingcraftTemplates = JSON.parse(wcStr);
    } catch {}

    const exportObject = {
      casanoviaVersion: '3.0.0-complete-suite',
      exportDate: new Date().toISOString(),
      systemUsers,
      weddings,
      tokensPaymentConfig,
      weddingcraftTemplates,
      activeWeddingId,
      stats: {
        totalWeddings: weddings.length,
        totalUsers: systemUsers.length,
        totalGuests: weddings.reduce((acc, w) => acc + (w.guests?.length || 0), 0),
        totalWeddingCraftTemplates: weddingcraftTemplates.length,
      }
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casanovia_base_de_datos_completa_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importAllDatabaseJson = async (jsonString: string): Promise<{ success: boolean; message: string; weddingsCount: number; usersCount: number }> => {
    if (currentUser.level === 5) {
      return { success: false, message: 'El usuario observador (Nivel 5) no tiene permisos de importación.', weddingsCount: 0, usersCount: 0 };
    }
    try {
      const parsed = JSON.parse(jsonString);
      let importedWeddings: Wedding[] = [];
      let importedUsers: SystemUser[] = [];

      if (Array.isArray(parsed.weddings)) {
        importedWeddings = parsed.weddings;
      } else if (Array.isArray(parsed)) {
        importedWeddings = parsed;
      } else if (parsed.wedding && parsed.wedding.id) {
        importedWeddings = [parsed.wedding];
      }

      if (Array.isArray(parsed.systemUsers)) {
        importedUsers = parsed.systemUsers;
      }

      if (Array.isArray(parsed.weddingcraftTemplates) && parsed.weddingcraftTemplates.length > 0) {
        try {
          localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(parsed.weddingcraftTemplates));
        } catch {}
      }

      // 1. Gather all candidate weddings from imported JSON, active state, local storage, seeds, and initial data
      let storedLocalWeddings: Wedding[] = [];
      try {
        const stored = localStorage.getItem('casanovia_all_weddings');
        if (stored) storedLocalWeddings = JSON.parse(stored);
      } catch {}

      let hostingWeddings: Wedding[] = [];
      try {
        const fetched = await fetchWeddingsFromHosting();
        if (Array.isArray(fetched) && fetched.length > 0) {
          hostingWeddings = fetched;
        }
      } catch {}

      const allCandidateWeddings: Wedding[] = [
        ...importedWeddings,
        ...weddings,
        ...storedLocalWeddings,
        ...hostingWeddings,
      ];

      // 2. Consolidate and merge all records into canonical slugs (without "y" connector)
      const consolidatedList = consolidateWeddingsList(allCandidateWeddings);

      if (consolidatedList.length > 0) {
        setWeddings(consolidatedList);
        try {
          localStorage.setItem('casanovia_all_weddings', JSON.stringify(consolidatedList));
        } catch {}

        // Persist all consolidated weddings to hosting backend
        try {
          for (const w of consolidatedList) {
            await saveWeddingToHosting(w);
          }
        } catch (e) {
          console.warn('[Hosting] Syncing consolidated weddings to hosting deferred:', e);
        }

        // Trigger backend sync & file cleanup if online
        try {
          await fetch('/api/sync_events.php', { method: 'POST' });
        } catch {}

        // Ensure active wedding is set to a valid consolidated wedding
        const currentActive = consolidatedList.find(w => w.id === activeWeddingId || w.slug === activeWeddingId) || consolidatedList[0];
        if (currentActive?.id) {
          setActiveWeddingId(currentActive.id);
          persistIndicatedWeddingId(currentActive.id);
        }
      }

      // 3. Process Users
      const allUsers = importedUsers.length > 0 ? importedUsers : (systemUsers.length > 0 ? systemUsers : INITIAL_SYSTEM_USERS);
      setSystemUsers(allUsers);
      try {
        localStorage.setItem('casanovia_system_users', JSON.stringify(allUsers));
      } catch {}
      try {
        await saveUsersBulkToHosting(allUsers);
      } catch (e) {
        console.warn('[Hosting] Syncing imported users to hosting deferred:', e);
      }

      // 4. Tokens config
      if (parsed.tokensPaymentConfig) {
        setTokensPaymentConfig(parsed.tokensPaymentConfig);
        try {
          localStorage.setItem('casanovia_tokens_payment_config', JSON.stringify(parsed.tokensPaymentConfig));
        } catch {}
        try {
          await saveSystemConfigToHosting('tokens_payment', parsed.tokensPaymentConfig);
        } catch (e) {
          console.warn('[Hosting] Syncing tokens config to hosting deferred:', e);
        }
      }

      const totalGuests = consolidatedList.reduce((acc, w) => acc + (w.guests?.length || 0), 0);
      const totalTables = consolidatedList.reduce((acc, w) => acc + (w.tables?.length || 0), 0);

      return {
        success: true,
        message: `¡Restauración y consolidación completada con éxito! Se recolectaron y consolidaron ${consolidatedList.length} bodas (${totalGuests} invitados, ${totalTables} mesas) bajo sus slugs canónicos limpios. Ninguna boda se eliminó ni se perdió.`,
        weddingsCount: consolidatedList.length,
        usersCount: allUsers.length,
      };
    } catch (err) {
      console.error('Error importing full database JSON:', err);
      return {
        success: false,
        message: 'El archivo JSON no tiene un formato válido o ocurrió un error durante la consolidación.',
        weddingsCount: 0,
        usersCount: 0,
      };
    }
  };

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    if (currentUser.level === 5) return false;
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.weddings || parsed.systemUsers) {
        const res = await importAllDatabaseJson(jsonString);
        return res.success;
      }
      if (parsed.wedding && parsed.wedding.settings) {
        await updateActiveWeddingDoc(parsed.wedding);
        return true;
      }
      if (parsed.settings && parsed.guests) {
        await updateActiveWeddingDoc({
          settings: parsed.settings,
          guests: parsed.guests || [],
          timeline: parsed.timeline || [],
          budget: parsed.budget || [],
          tasks: parsed.tasks || [],
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Import JSON] Error parsing backup file:', e);
      return false;
    }
  };

  const resetToDemoData = async () => {
    if (currentUser.level === 5) return;
    try {
      await updateActiveWeddingDoc({
        settings: initialWeddingSettings,
        guests: initialGuests,
        timeline: initialTimeline,
        budget: initialBudget,
        tasks: generateMasterTasksForWedding(),
      });
    } catch (err) {
      console.error('Error restableciendo demo data:', err);
    }
  };

  const clearWeddingData = async (targetWeddingId?: string) => {
    if (currentUser.level !== 1) {
      console.warn('[WeddingContext] Solo el Administrador (Nivel 1) puede limpiar la boda.');
      return;
    }
    const targetId = targetWeddingId || activeWeddingId;
    if (!targetId) return;

    const currentWedding = weddings.find((w) => w.id === targetId) || activeWedding;
    if (!currentWedding) return;

    const currentSettings = currentWedding.settings || settings;

    // Solo conservar el nombre del evento, la fecha, ciudad y Fecha Límite para confirmar Asistencia.
    const preservedCoupleNames = currentSettings?.coupleNames || currentWedding.coupleNames || 'Boda';
    const preservedDate = currentSettings?.weddingDate || currentWedding.weddingDate || '';
    const preservedLocation = currentSettings?.locationSummary || currentWedding.locationSummary || '';
    const preservedRsvpDeadline = currentSettings?.rsvpDeadline || '';

    const blankSettings: WeddingSettings = {
      eventType: currentSettings?.eventType || 'Boda',
      coupleNames: preservedCoupleNames,
      brideName: '',
      groomName: '',
      weddingDate: preservedDate,
      weddingTime: '',
      locationSummary: preservedLocation,
      hasReligiousCeremony: false,
      ceremonyVenue: {
        name: '',
        address: '',
        time: '',
        googleMapsUrl: '',
        wazeUrl: '',
        notes: '',
      },
      receptionVenue: {
        name: '',
        address: '',
        time: '',
        googleMapsUrl: '',
        wazeUrl: '',
        notes: '',
      },
      additionalVenues: [],
      dressCodeStyle: '',
      dressCodeDescription: '',
      suggestedColors: [],
      forbiddenColorsNote: '',
      bankDetails: {
        bankName: '',
        accountHolder: '',
        clabe: '',
        accountNumber: '',
        concept: '',
      },
      showGiftRegistry: false,
      giftRegistryTitle: '',
      giftRegistryMessage: '',
      showBankDetails: false,
      rsvpDeadline: preservedRsvpDeadline,
      giftRegistries: [],
      generalContactEmail: '',
      generalContactPhone: '',
      romanticQuote: '',
      totalRealBudget: 0,
    };

    const fullClearedWedding: Wedding = {
      ...currentWedding,
      coupleNames: preservedCoupleNames,
      weddingDate: preservedDate,
      locationSummary: preservedLocation,
      settings: blankSettings,
      guests: [],
      timeline: [],
      budget: [],
      tasks: [],
      tables: [],
      vendors: [],
      status: 'planning',
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Actualizar estado local inmediatamente para respuesta instantánea de la UI
      setWeddings((prev) =>
        prev.map((w) => (w.id === targetId ? fullClearedWedding : w))
      );

      // 2. Limpiar caché del plano local y notificar inmediatamente a los componentes
      try {
        localStorage.removeItem(`casanovia_floor_plan_${targetId}`);
        window.dispatchEvent(new CustomEvent('casanovia_floor_plan_cleared', { detail: { weddingId: targetId } }));
      } catch (e) {
        console.warn('[FloorPlan] Error clearing local storage:', e);
      }

      // 3. Persistir en Hosting Backend
      try {
        await saveWeddingToHosting(fullClearedWedding);
      } catch (wErr) {
        console.warn('[Hosting] Error guardando boda limpia en Hosting:', wErr);
      }

      try {
        await deleteFloorPlanFromHosting(targetId);
      } catch (fpErr) {
        console.warn('[Hosting] Error eliminando plano en Hosting:', fpErr);
      }
    } catch (err) {
      console.error('Error al limpiar los datos de la boda:', err);
      // No relanzamos error fatal para evitar bloquear o congelar la interfaz del usuario
    }
  };

  return (
    <WeddingContext.Provider
      value={{
        viewMode,
        setViewMode,
    appTheme,
    setAppTheme,
        activeView: viewMode,
        setActiveView,
        
        currentUser,
        login,
        logout,
        isLevel1Admin,
        isHostUser,
        isLevel3Planner,
        isLevel4Free,
        isLevel5Observer,
        canPrint,
        isPlannerOrAdmin,
        canCreateWedding,
        canManageUsers,
        canEditActiveWedding,
        isLevel4TrialExpired,
        level4DaysRemaining,
        level4RegistrationDateStr,
        upgradeNotice,
        showUpgradeNotice,
        closeUpgradeNotice,
        showAuthModal,
        setShowAuthModal,
        showNewWeddingModal,
        setShowNewWeddingModal,
        showUserManagementModal,
        setShowUserManagementModal,
        showShareModal,
        setShowShareModal,
        getShareableWeddingUrl,

        systemUsers,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,

        weddings,
        accessibleWeddings,
        userCreatedWeddings,
        activeWeddingId,
        activeWedding,
        setActiveWeddingId,
        selectWedding,
        createNewWedding,
        deleteWedding,

        settings,
        updateSettings,
        addAdditionalVenue,
        updateAdditionalVenue,
        deleteAdditionalVenue,
        guests,
        addGuest,
        updateGuest,
        assignCompanion,
        deleteGuest,
        reorderGuests,
        importGuests,
        submitGuestRsvp,
        findGuestByQuery,
        timeline,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        setTimeline,
        budget,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        syncBudgetWithVendors,
        promotionQuotas,
        addPromotionQuota,
        updatePromotionQuota,
        deletePromotionQuota,
        addPartialPaymentToQuota,
        deletePartialPaymentFromQuota,
        assignGlobalPromotionQuota,
        isPromotionComisionUser,
        tasks,
        addTask,
        toggleTask,
        toggleAllTasks,
        deleteAllTasks,
        setAllTasks,
        updateTask,
        deleteTask,
        resetTasksToMaster,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        tables,
        updateTables,
        addTable,
        updateTable,
        deleteTable,
        batchAssignGuestsToTable,
        batchUpdateGuests,
        exportDataJson,
        importDataJson,
        exportAllDatabaseJson,
        importAllDatabaseJson,
        resetToDemoData,
        clearWeddingData,
        currentWeddingTheme,
        applyWeddingColorsTheme,
        resetWeddingColorsTheme,
        selectedGuestForGuide,
        setSelectedGuestForGuide,
        tokensPaymentConfig,
        updateTokensPaymentConfig,
        uploadedImages,
        showUploadedImagesModal,
        setShowUploadedImagesModal,
        showFloorPlanModal,
        setShowFloorPlanModal,
        showWeddingCraftModal,
        setShowWeddingCraftModal,
        isRsvpModalOpen,
        setIsRsvpModalOpen,
        openRsvpModal: () => {
          if (isRsvpDeadlinePassed(settings.rsvpDeadline)) {
            return;
          }
          setIsRsvpModalOpen(true);
        },
        closeRsvpModal: () => setIsRsvpModalOpen(false),
        saveUploadedImage,
        deleteUploadedImage,
        hasWeddingUrlParam: Boolean(getRequestedWeddingIdFromUrl()),
        isPublicHomeLanding: !Boolean(getRequestedWeddingIdFromUrl()) && viewMode === 'public' && !currentUser.isAuthenticated && !isNoviasUrlRequested(),
        isNoviasLanding: isNoviasUrlRequested(),
        getRequestedWeddingIdFromUrl,
        isFirebaseLoading,
        isFirebaseConnected,
        isAppLoading,
        setIsAppLoading,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
