import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cleanFirestoreData } from '../lib/firestoreUtils';
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
  DressCodeColor
} from '../types';
import { 
  initialGuests, 
  initialTimeline, 
  initialBudget, 
  initialWeddingSettings, 
  initialDefaultWedding,
  initialWeddingsList,
  INITIAL_SYSTEM_USERS,
  generateMasterTasksForWedding,
  initialVendors,
  initialTables,
  INITIAL_TOKENS_PAYMENT_CONFIG
} from '../data/initialData';
import { sortWeddingsByDate, sortTimelineMilestones } from '../lib/dateUtils';
import { syncVendorsIntoBudget, buildBudgetDirectlyFromVendors } from '../lib/budgetSyncUtils';
import { formatAltibajas } from '../lib/formatUtils';
import { generateWeddingTheme, getDefaultWeddingTheme } from '../lib/themeUtils';

export const LEVEL_1_USER = {
  username: 'Herly Lizarazo',
  clave: '00448157',
  level: 1,
  roleTitle: 'Director de Bodas & Protocolo (Nivel 1 - Super Admin)',
};

export const LEVEL_3_DEMO_USER = {
  username: 'Guest Planner',
  clave: '952341165',
  level: 3,
  roleTitle: 'Wedding Planner (Nivel 3 - Wedding Planner)',
  assignedWeddingIds: ['boda-sofia-alejandro', 'boda-valentina-mateo'],
  createdWeddingIds: ['boda-sofia-alejandro', 'boda-valentina-mateo'],
};

export const LEVEL_2_DEMO_USER = {
  username: 'Zenaida Anahua',
  clave: '70242438',
  level: 2,
  roleTitle: 'Anfitriona de Boda (Nivel 2 - Anfitrión)',
  assignedWeddingIds: ['boda-zenaida-ronny', 'boda-zenaida-ronald'],
};

const DEFAULT_ANONYMOUS_USER: AuthUser = {
  username: 'Invitado',
  level: 0,
  roleTitle: 'Visitante / Invitado',
  isAuthenticated: false,
};

interface WeddingContextType {
  // Navigation & View
  viewMode: 'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual';
  appTheme: 'neumorphic' | 'classic';
  setAppTheme: (theme: 'neumorphic' | 'classic') => void;
  setViewMode: (view: 'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual') => void;
  activeView: 'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual';
  setActiveView: (view: 'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual') => void;
  
  // Auth & RBAC
  currentUser: AuthUser;
  login: (username: string, clave: string) => { success: boolean; message: string };
  logout: () => void;
  isLevel1Admin: boolean;
  isHostUser: boolean;
  isLevel3Planner: boolean;
  isPlannerOrAdmin: boolean;
  canCreateWedding: boolean;
  canManageUsers: boolean;
  canEditActiveWedding: boolean;
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
  
  budget: BudgetItem[];
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
  syncBudgetWithVendors: () => Promise<void>;
  
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
  
  // Backup & Reset
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => Promise<boolean>;
  resetToDemoData: () => Promise<void>;
  
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

  // Navigation & URL status
  hasWeddingUrlParam: boolean;
  isPublicHomeLanding: boolean;
  getRequestedWeddingIdFromUrl: () => string;

  // Firebase status
  isFirebaseLoading: boolean;
  isFirebaseConnected: boolean;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  
  const [appTheme, setAppThemeState] = useState<'neumorphic' | 'classic'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('casanovia_app_theme');
      if (saved === 'classic') return 'classic';
    }
    return 'neumorphic';
  });

  const setAppTheme = (theme: 'neumorphic' | 'classic') => {
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


  const [viewMode, setViewModeState] = useState<'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual'>(() => {
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
        return JSON.parse(savedAuth);
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImageRecord[]>([]);

  // Helper to extract requested wedding from URL query parameters or pathname/hash
  const getRequestedWeddingIdFromUrl = (): string => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const bodaParam =
          urlParams.get('boda') ||
          urlParams.get('wedding') ||
          urlParams.get('w') ||
          urlParams.get('id') ||
          urlParams.get('b') ||
          urlParams.get('novios') ||
          urlParams.get('slug');

        if (bodaParam) {
          return decodeURIComponent(bodaParam).trim();
        }

        if (window.location.hash) {
          const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).trim();
          if (hash) {
            const cleanHash = hash.replace(/^(boda\/|wedding\/)/, 'boda-');
            if (cleanHash && !cleanHash.includes('page=') && !cleanHash.includes('precios') && !cleanHash.includes('tokens')) {
              return cleanHash;
            }
          }
        }

        // Check pathname segments e.g. /boda/boda-zenaida-ronny or /boda-zenaida-ronny
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        for (const seg of pathSegments) {
          const cleanSeg = decodeURIComponent(seg).trim();
          if (
            cleanSeg.startsWith('boda-') ||
            cleanSeg.startsWith('wedding-') ||
            (cleanSeg.includes('-') && !['precios', 'tokens', 'api', 'assets'].includes(cleanSeg.toLowerCase()))
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

    // 1. Exact ID match (case-insensitive)
    let found = weddingsList.find((w) => w.id.toLowerCase() === cleanReq);
    if (found) return found;

    // 2. ID match without 'boda-' or 'wedding-' prefix
    const unPrefixedReq = cleanReq.replace(/^(boda-|wedding-)/, '');
    found = weddingsList.find(
      (w) => w.id.toLowerCase().replace(/^(boda-|wedding-)/, '') === unPrefixedReq
    );
    if (found) return found;

    // 3. Match against normalized couple names (e.g. "zenaida-ronny" -> "Zenaida & Ronny")
    found = weddingsList.find((w) => {
      const coupleLower = (w.coupleNames || '').toLowerCase();
      const coupleClean = coupleLower.replace(/[^a-z0-9]/g, '');
      const reqClean = cleanReq.replace(/[^a-z0-9]/g, '');
      const unPrefClean = unPrefixedReq.replace(/[^a-z0-9]/g, '');
      return (
        (coupleClean && coupleClean === reqClean) ||
        (coupleClean && coupleClean === unPrefClean)
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
        coupleLower.includes(cleanReq) ||
        bride.includes(unPrefixedReq) ||
        groom.includes(unPrefixedReq)
      );
    });
    if (found) return found;

    return undefined;
  };

  // Helper to generate public shareable guest wedding URL
  const getShareableWeddingUrl = (weddingId?: string): string => {
    const targetId = weddingId || activeWeddingId;
    try {
      if (typeof window !== 'undefined' && window.location) {
        const origin = window.location.origin;
        const pathname = window.location.pathname;
        return `${origin}${pathname}?boda=${encodeURIComponent(targetId)}`;
      }
    } catch {
      // ignore
    }
    return `https://weddinghub.app/?boda=${targetId}`;
  };

  // Helper to update URL param without reloading
  const updateUrlWeddingParam = (weddingId: string) => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        if (weddingId) {
          url.searchParams.set('boda', weddingId);
        } else {
          url.searchParams.delete('boda');
        }
        window.history.replaceState({}, '', url.toString());
      }
    } catch (err) {
      console.error('Error updating URL search params:', err);
    }
  };

  // System Users state (Admin & Anfitrión roles)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);

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
  const [weddings, setWeddings] = useState<Wedding[]>(initialWeddingsList);
  const [activeWeddingId, setActiveWeddingId] = useState<string>(() => {
    const fromUrl = getRequestedWeddingIdFromUrl();
    if (fromUrl) {
      const match = findWeddingByRequestedParam(initialWeddingsList, fromUrl);
      if (match) {
        persistIndicatedWeddingId(match.id);
        return match.id;
      }
      return fromUrl;
    }
    const fromStored = getStoredIndicatedWeddingId();
    if (fromStored) {
      const match = findWeddingByRequestedParam(initialWeddingsList, fromStored);
      if (match) return match.id;
      return fromStored;
    }
    return initialWeddingsList[0]?.id || '';
  });

  // Selected Guest for Guide
  const [selectedGuestForGuide, setSelectedGuestForGuide] = useState<Guest | null>(null);

  // Firebase connection state
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  const isLevel1Admin = currentUser.isAuthenticated && currentUser.level === 1;
  const isHostUser = currentUser.isAuthenticated && currentUser.level === 2;
  const isLevel3Planner = currentUser.isAuthenticated && currentUser.level === 3;
  const canCreateWedding = currentUser.isAuthenticated && (currentUser.level === 1 || currentUser.level === 3);
  const canManageUsers = currentUser.isAuthenticated && (currentUser.level === 1 || currentUser.level === 3);

  // Real-time Firestore Synchronization for System Users
  useEffect(() => {
    let unsubscribeUsers: (() => void) | undefined;

    const initUsersSync = () => {
      try {
        const usersColl = collection(db, 'system_users');

        unsubscribeUsers = onSnapshot(
          usersColl,
          async (querySnapshot) => {
            // Auto-seed default system users if collection is empty from server
            if (querySnapshot.empty && !querySnapshot.metadata.hasPendingWrites && !querySnapshot.metadata.fromCache) {
              try {
                const batch = writeBatch(db);
                for (const user of INITIAL_SYSTEM_USERS) {
                  const uDoc = doc(db, 'system_users', user.id);
                  batch.set(uDoc, user);
                }
                await batch.commit();
              } catch (seedErr) {
                console.warn('[Firestore] Users seeding skipped/deferred:', seedErr);
              }
              return;
            }

            const list: SystemUser[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data() as SystemUser;
              list.push({
                ...data,
                id: docSnap.id,
              });
            });

            if (list.length > 0) {
              setSystemUsers(list);
            }
          },
          (error) => {
            if ((error as any)?.code === 'unavailable') {
              console.info('[Firestore] system_users listener running in offline mode.');
            } else {
              handleFirestoreError(error, OperationType.LIST, 'system_users');
            }
          }
        );
      } catch (err) {
        console.error('[Firestore] Error conectando a system_users:', err);
      }
    };

    let unsubscribeTokensConfig: (() => void) | undefined;
    const initTokensConfigSync = () => {
      try {
        const configDoc = doc(db, 'system_configs', 'tokens_payment');
        unsubscribeTokensConfig = onSnapshot(
          configDoc,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as TokensPaymentConfig;
              setTokensPaymentConfig(prev => ({ ...prev, ...data }));
              try {
                localStorage.setItem('casanovia_tokens_payment_config', JSON.stringify(data));
              } catch {
                // ignore
              }
            }
          },
          (err) => {
            console.info('[Firestore] tokens_payment listener note:', err);
          }
        );
      } catch (err) {
        console.error('[Firestore] Error conectando a tokens_payment:', err);
      }
    };

    initUsersSync();
    initTokensConfigSync();

    let unsubscribeUploadedImages: (() => void) | undefined;
    const initUploadedImagesSync = () => {
      try {
        const imagesColl = collection(db, 'uploaded_images');
        unsubscribeUploadedImages = onSnapshot(
          imagesColl,
          (snapshot) => {
            const list: UploadedImageRecord[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                ...data,
              } as UploadedImageRecord);
            });
            list.sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
            setUploadedImages(list);
          },
          (err) => {
            console.info('[Firestore] uploaded_images listener note:', err);
          }
        );
      } catch (err) {
        console.error('[Firestore] Error conectando a uploaded_images:', err);
      }
    };
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
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeTokensConfig) unsubscribeTokensConfig();
      if (unsubscribeUploadedImages) unsubscribeUploadedImages();
      window.removeEventListener('popstate', handleUrlNav);
      window.removeEventListener('hashchange', handleUrlNav);
    };
  }, []);

  // View switch interceptor
  const setViewMode = (newMode: 'public' | 'private' | 'new_wedding_tasks' | 'tokens' | 'manual') => {
    if (newMode === 'private' || newMode === 'new_wedding_tasks') {
      if (!currentUser.isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
    }
    setViewModeState(newMode);
    try {
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        const url = new URL(window.location.href);
        if (newMode === 'tokens') {
          // Clean URL: casanovia.vercel.app/?page=precios
          url.search = '?page=precios';
        } else {
          url.searchParams.delete('page');
          if (activeWeddingId && activeWeddingId !== 'default' && !url.searchParams.get('boda')) {
            url.searchParams.set('boda', activeWeddingId);
          }
        }
        window.history.pushState({}, '', url.toString());
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
      }
      
      let welcomeRole = 'Invitado';
      if (foundUser.level === 1) welcomeRole = 'Nivel 1 (Super Administrador)';
      else if (foundUser.level === 3) welcomeRole = 'Nivel 3 (Wedding Planner)';
      else if (foundUser.level === 2) welcomeRole = 'Nivel 2 (Anfitrión)';

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

    if (
      (trimmedUser === LEVEL_3_DEMO_USER.username.toLowerCase() || trimmedUser === 'planner guest' || trimmedUser.includes('planner') || trimmedUser.includes('mariana')) &&
      (trimmedClave === LEVEL_3_DEMO_USER.clave || trimmedClave === '952341165' || trimmedClave === '88442200' || trimmedClave === '88776655')
    ) {
      const authObj: AuthUser = {
        id: 'user-planner-guest',
        username: LEVEL_3_DEMO_USER.username,
        level: 3,
        roleTitle: LEVEL_3_DEMO_USER.roleTitle,
        isAuthenticated: true,
        assignedWeddingIds: LEVEL_3_DEMO_USER.assignedWeddingIds,
        createdWeddingIds: LEVEL_3_DEMO_USER.createdWeddingIds,
      };
      setCurrentUser(authObj);
      try {
        sessionStorage.setItem('wedding_hub_auth', JSON.stringify(authObj));
      } catch {
        // ignore
      }
      setShowAuthModal(false);
      setViewModeState('private');

      // Auto-switch to Sofia & Alejandro wedding if exists among created weddings
      const sWedding = weddings.find(w => w.id === 'boda-sofia-alejandro') || weddings[0];
      if (sWedding) {
        setActiveWeddingId(sWedding.id);
      }

      return {
        success: true,
        message: `¡Bienvenido(a) ${LEVEL_3_DEMO_USER.username}! Acceso concedido como Wedding Planner (Nivel 3).`,
      };
    }

    if (
      (trimmedUser === LEVEL_2_DEMO_USER.username.toLowerCase() || trimmedUser.includes('zenaida')) &&
      trimmedClave === LEVEL_2_DEMO_USER.clave
    ) {
      const authObj: AuthUser = {
        username: LEVEL_2_DEMO_USER.username,
        level: 2,
        roleTitle: LEVEL_2_DEMO_USER.roleTitle,
        isAuthenticated: true,
        assignedWeddingIds: ['boda-zenaida-ronny', 'boda-zenaida-ronald'],
      };
      setCurrentUser(authObj);
      try {
        sessionStorage.setItem('wedding_hub_auth', JSON.stringify(authObj));
      } catch {
        // ignore
      }
      setShowAuthModal(false);
      setViewModeState('private');

      // Auto-switch to Zenaida & Ronny wedding
      const zWedding = weddings.find(w => w.id.includes('zenaida') || w.coupleNames.toLowerCase().includes('zenaida'));
      if (zWedding) {
        setActiveWeddingId(zWedding.id);
      }

      return {
        success: true,
        message: `¡Bienvenida ${LEVEL_2_DEMO_USER.username}! Acceso concedido como Anfitriona de Boda (Zenaida & Ronny).`,
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
    window.location.href = '/';
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
      await setDoc(doc(db, 'system_users', newUserId), cleanFirestoreData(newUser));
      setSystemUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `system_users/${newUserId}`);
      throw err;
    }
  };

  const updateSystemUser = async (id: string, updates: Partial<SystemUser>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'system_users', id), cleanFirestoreData(updatedData), { merge: true });
      setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `system_users/${id}`);
      throw err;
    }
  };

  const deleteSystemUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'system_users', id));
      setSystemUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `system_users/${id}`);
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

      // Also persist to Firestore if available
      try {
        const configDoc = doc(db, 'system_configs', 'tokens_payment');
        await setDoc(configDoc, cleanFirestoreData(mergedConfig), { merge: true });
      } catch (fErr) {
        console.info('[Firestore] Persisted tokens payment config locally (offline mode fallback).', fErr);
      }
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
    try {
      const docRef = doc(db, 'uploaded_images', id);
      await setDoc(docRef, cleanFirestoreData(fullRecord));
    } catch (e) {
      console.warn('[Firestore] Error saving uploaded image:', e);
    }
    setUploadedImages((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return [fullRecord, ...filtered];
    });
    return id;
  };

  const deleteUploadedImage = async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, 'uploaded_images', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('[Firestore] Error deleting uploaded image:', e);
    }
    setUploadedImages((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // Real-time Firestore Synchronization for Multi-Weddings
  // -------------------------------------------------------------
  useEffect(() => {
    let unsubscribeWeddings: (() => void) | undefined;
    let fallbackTimer: NodeJS.Timeout | undefined;

    const initFirestoreSync = () => {
      try {
        const weddingsColl = collection(db, 'weddings');

        fallbackTimer = setTimeout(() => {
          setIsFirebaseLoading((prev) => {
            if (prev) {
              console.info('[Firestore] Fallback timer reached.');
              return false;
            }
            return false;
          });
        }, 4000);

        // Setup real-time listener for all weddings
        unsubscribeWeddings = onSnapshot(
          weddingsColl,
          async (querySnapshot) => {
            if (fallbackTimer) clearTimeout(fallbackTimer);
            // Auto-seed initial weddings if collection is confirmed empty on server
            if (querySnapshot.empty && !querySnapshot.metadata.hasPendingWrites && !querySnapshot.metadata.fromCache) {
              try {
                const batch = writeBatch(db);
                for (const wedding of initialWeddingsList) {
                  const wDoc = doc(db, 'weddings', wedding.id);
                  batch.set(wDoc, cleanFirestoreData(wedding));
                }
                await batch.commit();
              } catch (seedErr) {
                console.warn('[Firestore] Weddings seeding skipped/deferred:', seedErr);
              }
              setIsFirebaseLoading(false);
              setIsFirebaseConnected(true);
              return;
            }

            const list: Wedding[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data() as Wedding;
              list.push({
                ...data,
                id: docSnap.id,
              });
            });

            if (list.length > 0) {
              const sortedList = sortWeddingsByDate(list);
              setWeddings(sortedList);
              // ensure activeWeddingId respects URL parameter if requested or remains valid with indicated wedding
              setActiveWeddingId((prev) => {
                const requestedId = getRequestedWeddingIdFromUrl();
                if (requestedId) {
                  const match = findWeddingByRequestedParam(sortedList, requestedId);
                  if (match) {
                    persistIndicatedWeddingId(match.id);
                    return match.id;
                  }
                  if (sortedList.some((w) => w.id === requestedId)) {
                    persistIndicatedWeddingId(requestedId);
                    return requestedId;
                  }
                  return requestedId;
                }

                // In absence of URL parameter: maintain the previously indicated/active wedding
                if (prev) {
                  const prevMatch = findWeddingByRequestedParam(sortedList, prev);
                  if (prevMatch) {
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
                if (storedIndicated) {
                  const storedMatch = findWeddingByRequestedParam(sortedList, storedIndicated);
                  if (storedMatch) {
                    persistIndicatedWeddingId(storedMatch.id);
                    return storedMatch.id;
                  }
                  if (sortedList.some((w) => w.id === storedIndicated)) {
                    persistIndicatedWeddingId(storedIndicated);
                    return storedIndicated;
                  }
                }

                // If nothing was indicated, maintain the existing state or first available
                const fallbackId = prev || sortedList[0]?.id || '';
                if (fallbackId) {
                  persistIndicatedWeddingId(fallbackId);
                }
                return fallbackId;
              });
            }
            setIsFirebaseLoading(false);
            setIsFirebaseConnected(true);
          },
          (error) => {
            if (fallbackTimer) clearTimeout(fallbackTimer);
            if ((error as any)?.code === 'unavailable') {
              console.info('[Firestore] weddings listener running with offline cache.');
            } else {
              handleFirestoreError(error, OperationType.LIST, 'weddings');
            }
            setIsFirebaseLoading(false);
            setIsFirebaseConnected(false);
          }
        );
      } catch (err) {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        console.error('[Firestore] Error conectando a weddings:', err);
        setIsFirebaseLoading(false);
      }
    };

    initFirestoreSync();

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (unsubscribeWeddings) unsubscribeWeddings();
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
    // If Level 3 Planner: MUST be one of their created weddings
    if (currentUser.isAuthenticated && currentUser.level === 3) {
      if (userCreatedWeddings.length === 0) return null;
      return userCreatedWeddings.find((w) => w.id === activeWeddingId) || userCreatedWeddings[0];
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

    // 3. Fallback check from current URL parameter directly
    const requestedFromUrl = getRequestedWeddingIdFromUrl();
    if (requestedFromUrl) {
      const urlMatch =
        findWeddingByRequestedParam(weddings, requestedFromUrl) ||
        findWeddingByRequestedParam(initialWeddingsList, requestedFromUrl);
      if (urlMatch) return urlMatch;
    }

    // 4. Match from stored indicated wedding in localStorage
    const storedIndicated = getStoredIndicatedWeddingId();
    if (storedIndicated) {
      const storedMatch =
        findWeddingByRequestedParam(weddings, storedIndicated) ||
        findWeddingByRequestedParam(initialWeddingsList, storedIndicated);
      if (storedMatch) return storedMatch;
    }

    return weddings[0] || initialWeddingsList[0] || initialDefaultWedding;
  }, [weddings, userCreatedWeddings, accessibleWeddings, activeWeddingId, currentUser]);

  // Auto-align activeWeddingId when user logs in or accessibleWeddings changes
  useEffect(() => {
    if (currentUser.isAuthenticated && currentUser.level === 3) {
      if (userCreatedWeddings.length > 0) {
        if (!userCreatedWeddings.some(w => w.id === activeWeddingId)) {
          setActiveWeddingId(userCreatedWeddings[0].id);
        }
      } else {
        if (activeWeddingId !== '') {
          setActiveWeddingId('');
        }
      }
    }
  }, [currentUser, userCreatedWeddings, activeWeddingId]);

  // Compute permission to edit active wedding
  const canEditActiveWedding = React.useMemo(() => {
    if (!currentUser.isAuthenticated || !activeWedding) return false;
    if (currentUser.level === 1) return true; // Super Admin has full edit permissions
    
    // Level 3: Wedding Planner has edit permissions ONLY for weddings created by them
    if (currentUser.level === 3) {
      return isWeddingAccessibleByPlanner(activeWedding, currentUser);
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
  const settings: WeddingSettings = activeWedding?.settings || initialWeddingSettings;
  const guests: Guest[] = activeWedding?.guests || [];
  const timeline: TimelineMilestone[] = React.useMemo(() => {
    const raw = activeWedding?.timeline || initialTimeline;
    return sortTimelineMilestones<TimelineMilestone>(raw);
  }, [activeWedding?.timeline]);
  const budget: BudgetItem[] = activeWedding?.budget || [];
  const tasks: WeddingTask[] = activeWedding?.tasks || [];
  const vendors: VendorItem[] = activeWedding?.vendors || initialVendors;
  const tables: WeddingTable[] = activeWedding?.tables && activeWedding.tables.length > 0
    ? activeWedding.tables
    : initialTables;

  // Helper to persist changes to active wedding in Firestore
  const updateActiveWeddingDoc = async (partialWedding: Partial<Wedding>) => {
    if (!activeWeddingId) return;
    try {
      const updatedData = cleanFirestoreData({
        ...partialWedding,
        updatedAt: new Date().toISOString(),
      });

      // Optimistically update local state immediately so UI updates instantly
      setWeddings((prev) =>
        prev.map((w) => {
          if (w.id === activeWeddingId) {
            return {
              ...w,
              ...updatedData,
            };
          }
          return w;
        })
      );

      await setDoc(doc(db, 'weddings', activeWeddingId), updatedData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `weddings/${activeWeddingId}`);
      throw err;
    }
  };

  // Switch active wedding
  const selectWedding = (weddingId: string) => {
    persistIndicatedWeddingId(weddingId);

    // If Level 3 planner, only allow selecting among accessible (created) weddings
    if (currentUser.isAuthenticated && currentUser.level === 3) {
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
  }): Promise<string> => {
    const slug = data.coupleNames
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const newWeddingId = `boda-${slug}-${Date.now().toString().slice(-4)}`;

    const brideName = data.brideName || data.coupleNames.split('&')[0]?.trim() || 'Novia';
    const groomName = data.groomName || data.coupleNames.split('&')[1]?.trim() || 'Novio';

    const newSettings: WeddingSettings = {
      ...initialWeddingSettings,
      eventType: data.eventType || 'Boda',
      coupleNames: data.coupleNames,
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
      coupleNames: data.coupleNames,
      weddingDate: data.weddingDate,
      locationSummary: data.locationSummary,
      status: 'planning',
      settings: newSettings,
      createdByUserId: currentUser.id || currentUser.username,
      createdByUserName: currentUser.username,
      createdByUserLevel: currentUser.level,
      plannerName: currentUser.level === 3 ? currentUser.username : (currentUser.level === 1 ? 'Herly Lizarazo' : undefined),
      guests: [
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
      timeline: initialTimeline.map((item) => ({ ...item, id: `tm-${newWeddingId}-${item.id}` })),
      budget: initialBudget.map((item) => ({ ...item, id: `b-${newWeddingId}-${item.id}` })),
      tasks: generateMasterTasksForWedding(),
      vendors: initialVendors.map((item) => ({ ...item, id: `v-${newWeddingId}-${item.id}` })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'weddings', newWeddingId), cleanFirestoreData(newWedding));
      setWeddings((prev) => [newWedding, ...prev]);
      setActiveWeddingId(newWeddingId);

      // If active user is Wedding Planner, associate this new wedding with their account
      if (currentUser.level === 3) {
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

        // Persist to user record in Firestore if ID exists
        if (currentUser.id) {
          try {
            await setDoc(doc(db, 'system_users', currentUser.id), cleanFirestoreData({
              createdWeddingIds: updatedCreatedIds,
              assignedWeddingIds: updatedAssignedIds,
              updatedAt: new Date().toISOString(),
            }), { merge: true });
          } catch (uErr) {
            console.warn('[Firestore] No se pudo actualizar weddingIds en usuario:', uErr);
          }
        }
      }

      setShowNewWeddingModal(false);
      // Automatically present the interactive task checklist screen for the new wedding
      setViewModeState('new_wedding_tasks');
      return newWeddingId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `weddings/${newWeddingId}`);
      throw err;
    }
  };

  // Delete a wedding
  const deleteWedding = async (weddingId: string) => {
    if (weddings.length <= 1) {
      alert('Debe existir al menos una boda en el sistema.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'weddings', weddingId));
      setWeddings((prev) => prev.filter((w) => w.id !== weddingId));
      if (activeWeddingId === weddingId) {
        const remaining = weddings.filter((w) => w.id !== weddingId);
        if (remaining.length > 0) {
          setActiveWeddingId(remaining[0].id);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `weddings/${weddingId}`);
      throw err;
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

    const payload: Partial<Wedding> = {
      settings: updatedSettings,
      coupleNames: updatedSettings.coupleNames || currentWedding?.coupleNames || 'Sofía & Alejandro',
      weddingDate: updatedSettings.weddingDate || currentWedding?.weddingDate || '2026-10-24T17:00:00',
      locationSummary: updatedSettings.locationSummary || currentWedding?.locationSummary || '',
    };

    if (guestsChanged) {
      payload.guests = updatedGuests;
    }

    await updateActiveWeddingDoc(payload);
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
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
    const currentGuests = currentWedding?.guests || guests || [];

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
    const updatedGuests = [...currentGuests, newGuest];
    await updateActiveWeddingDoc({ guests: updatedGuests });
    return newGuest;
  };

  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
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
      
      if (targetGuest.mainGuestId) {
        // Case A: The updated guest is a companion.
        // Si se le asigna a un acompañante también debe ir el invitado asignado
        const mainId = targetGuest.mainGuestId;
        groupIdsToSyncTable = [
          mainId,
          ...currentGuests.filter((g) => g.mainGuestId === mainId).map((g) => g.id)
        ];
      } else {
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

  const deleteGuest = async (id: string) => {
    const currentWedding = weddings.find((w) => w.id === activeWeddingId);
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

    if (mode === 'replace') {
      finalGuests = newGuests.map((g, idx) => {
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
      const sanitizedNewGuests = newGuests.map((g, idx) => {
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

  // -------------------------------------------------------------
  // Backup & Reset
  // -------------------------------------------------------------
  const exportDataJson = () => {
    const exportObject = {
      weddingHubVersion: '3.0.0-multi-wedding-firebase',
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

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
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
        isPlannerOrAdmin,
        canCreateWedding,
        canManageUsers,
        canEditActiveWedding,
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
        deleteGuest,
        reorderGuests,
        importGuests,
        submitGuestRsvp,
        findGuestByQuery,
        timeline,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        budget,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        syncBudgetWithVendors,
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
        exportDataJson,
        importDataJson,
        resetToDemoData,
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
        saveUploadedImage,
        deleteUploadedImage,
        hasWeddingUrlParam: Boolean(getRequestedWeddingIdFromUrl()),
        isPublicHomeLanding: !Boolean(getRequestedWeddingIdFromUrl()) && viewMode === 'public',
        getRequestedWeddingIdFromUrl,
        isFirebaseLoading,
        isFirebaseConnected,
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
