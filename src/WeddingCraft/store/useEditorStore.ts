import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { WeddingDesignDocument, CanvasElement, EventDataInput } from '../types';
import { ThemePreset, predefinedThemes } from '../themes';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { sanitizeForFirestore } from '../lib/libraryService';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../lib/defaultWebTemplate';
import { generateDocumentSquareThumbnail } from '../lib/templateThumbnail';
import { normalizeCanvasDocument, normalizeCanvasElement } from '../lib/canvasElementUtils';
import { optimizeDocumentImagesForPublish } from '../lib/imageOptimization';
import {
  saveTemplateToHosting,
  deleteTemplateFromHosting,
  savePublishedDesignToHosting,
  fetchPublishedDesignFromHosting
} from '../../services/hostingStorage';
import { saveWeddingToHost } from '../../lib/selfHostedApi';
import { processAndOptimizeImage } from '../../lib/storageUtils';
import { uploadImageToHost } from '../../lib/selfHostedApi';
import { registerPublishedDesignInMemory } from '../../hooks/useSyncedInvitationDesign';

export interface TemplateItem {
  id: string;
  name: string;
  document: WeddingDesignDocument;
  author?: string;
  thumbnail?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface EditorState {
  // Event Data & Web Linking
  eventData: EventDataInput | null;
  isLinkedToWedding: boolean;
  setIsLinkedToWedding: (linked: boolean) => void;
  
  // Design Document
  document: WeddingDesignDocument;
  
  // Template Tracking
  currentTemplateId: string | null;
  currentTemplateName: string | null;
  lastSavedHash: string | null;
  publishedThumbnail: string | null;
  setPublishedThumbnail: (thumb: string | null) => void;
  setCurrentTemplate: (id: string | null, name: string | null) => void;
  setLastSavedHash: (hash: string | null) => void;
  hasUnsavedChanges: () => boolean;
  directSaveCurrentTemplate: () => Promise<{ success: boolean; name?: string }>;
  
  // Save Modal
  isSaveModalOpen: boolean;
  saveModalInitialMode: 'prompt' | 'save_as';
  setSaveModalOpen: (isOpen: boolean) => void;
  openSaveModal: (mode?: 'prompt' | 'save_as') => void;

  // Editor UI State
  selectedElementIds: string[];
  zoom: number;
  magnetEnabled: boolean;
  setMagnetEnabled: (enabled: boolean) => void;
  gridEnabled: boolean;
  setGridEnabled: (enabled: boolean) => void;
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  libraryVersion: number;
  triggerLibraryUpdate: () => void;
  
  // History for Undo/Redo
  history: {
    past: WeddingDesignDocument[];
    future: WeddingDesignDocument[];
  };
  templates: TemplateItem[];
  isPreviewModalOpen: boolean;
  setPreviewModalOpen: (isOpen: boolean) => void;
  saveTemplate: (name: string, overwrite?: boolean) => Promise<{ success: boolean; id: string; name: string }>;
  publishDesign: () => Promise<{ success: boolean; error?: string }>;
  loadWebInvitados: () => Promise<{ success: boolean; source: 'published' | 'generated' }>;
  duplicateTemplate: (templateId: string) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  loadTemplateToCanvas: (template: TemplateItem) => void;
  loadTemplates: (templates: any[]) => void;

  // Actions
  setEventData: (data: EventDataInput) => void;
  initializeDocument: (doc: WeddingDesignDocument) => void;
  
  // Element Manipulation
  addElement: (element: Omit<CanvasElement, 'id'> & { id?: string }) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateCanvas: (updates: Partial<WeddingDesignDocument['canvas']>) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElements: (ids: string[]) => void;
  groupElements: (ids: string[]) => void;
  ungroupElements: (ids: string[]) => void;
  selectElements: (ids: string[]) => void;
  
  // Viewport
  setZoom: (zoom: number) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderElement: (id: string, targetIndex: number) => void;

  
  // Theme actions
  setTheme: (theme: ThemePreset) => void;
  applyThemeToExistingElements: (theme: ThemePreset) => void;
  addCustomTheme: (theme: ThemePreset) => void;
  updateCustomTheme: (id: string, theme: ThemePreset) => void;
  deleteCustomTheme: (id: string) => void;
}

const computeDocHash = (doc: WeddingDesignDocument) => {
  return JSON.stringify({
    canvas: doc?.canvas,
    elements: doc?.pages?.[0]?.elements || []
  });
};

// Synchronize and normalize element zIndex values to guarantee consistent layer hierarchy
export const syncElementZIndexes = (elements: CanvasElement[]) => {
  if (!elements || !Array.isArray(elements)) return;
  elements.forEach((el, index) => {
    el.zIndex = index + 1;
  });
};

// Cloud image optimizer: converts heavy base64 images into 72 DPI permanent Cloud Storage URLs while strictly maintaining alpha transparency
async function optimizeDesignImagesForCloud(doc: WeddingDesignDocument, eventId: string): Promise<WeddingDesignDocument> {
  if (!doc?.pages?.[0]?.elements) return doc;
  try {
    const optimized = await optimizeDocumentImagesForPublish(doc, eventId);
    return optimized;
  } catch (err) {
    console.warn('Image optimization notice:', err);
    syncElementZIndexes(doc.pages[0].elements);
    return doc;
  }
}

export const syncDocumentWithEventData = (doc: any, eventData?: any) => {
  if (!doc?.pages?.[0]?.elements || !eventData) return doc;
  const liveVenue = (eventData.receptionVenue?.name?.trim() && eventData.receptionVenue.name.trim().toLowerCase() !== 'lugar')
    ? eventData.receptionVenue.name.trim()
    : ((eventData.venueName && eventData.venueName.trim().toLowerCase() !== 'lugar')
      ? eventData.venueName.trim()
      : (eventData.receptionVenue?.name?.trim() || ''));
  if (!liveVenue) return doc;

  doc.pages[0].elements = doc.pages[0].elements.map((el: any) => {
    const isLugarText = el.type === 'text' && (el.content?.text || '').trim().toLowerCase() === 'lugar';
    if (el.dataBinding?.field === 'venueName' || isLugarText) {
      return {
        ...el,
        content: { ...(el.content || {}), text: liveVenue },
        dataBinding: { ...(el.dataBinding || {}), field: 'venueName' }
      };
    }
    return el;
  });
  return doc;
};

let autoSaveDraftTimer: any = null;
const persistDraftToStorage = (state: EditorState) => {
  if (!state.eventData?.eventId) return;
  if (autoSaveDraftTimer) clearTimeout(autoSaveDraftTimer);
  autoSaveDraftTimer = setTimeout(() => {
    try {
      const draftKey = `wedding_design_draft_${state.eventData?.eventId}`;
      const docClean = sanitizeForFirestore(state.document);
      idbSet(draftKey, docClean).catch(() => {});
      localStorage.setItem(draftKey, JSON.stringify(docClean));
    } catch (e) {}
  }, 400);
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  eventData: null,
  isLinkedToWedding: true,
  setIsLinkedToWedding: (linked) => set({ isLinkedToWedding: linked }),
  
  document: {
    id: uuidv4(),
    parentEventId: '',
    metadata: { createdAt: Date.now(), lastModified: Date.now(), version: '1.0.0' },
    canvas: { width: 720, height: 980, backgroundColor: '#EBEBEB' },
    theme: predefinedThemes[0],
    pages: [{ id: 'cover', name: 'Portada', elements: [] }],
    assetReferences: []
  },
  
  currentTemplateId: null,
  currentTemplateName: null,
  lastSavedHash: null,
  publishedThumbnail: null,
  setPublishedThumbnail: (thumb) => set({ publishedThumbnail: thumb }),
  setCurrentTemplate: (id, name) => set({ currentTemplateId: id, currentTemplateName: name }),
  setLastSavedHash: (hash) => set({ lastSavedHash: hash }),
  hasUnsavedChanges: () => {
    const state = get();
    const elements = state.document.pages[0]?.elements || [];
    if (elements.length === 0 && !state.lastSavedHash) return false;
    const currentHash = computeDocHash(state.document);
    if (!state.lastSavedHash) return elements.length > 0;
    return currentHash !== state.lastSavedHash;
  },

  directSaveCurrentTemplate: async () => {
    const state = get();
    if (state.currentTemplateId && state.currentTemplateName) {
      return await state.saveTemplate(state.currentTemplateName, true);
    } else {
      state.openSaveModal('save_as');
      return { success: false };
    }
  },

  isSaveModalOpen: false,
  saveModalInitialMode: 'prompt',
  setSaveModalOpen: (isOpen) => set({ isSaveModalOpen: isOpen }),
  openSaveModal: (mode = 'prompt') => set({ isSaveModalOpen: true, saveModalInitialMode: mode }),

  selectedElementIds: [],
  zoom: 1,
  magnetEnabled: true,
  setMagnetEnabled: (enabled) => set({ magnetEnabled: enabled }),
  gridEnabled: false,
  setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
  leftSidebarCollapsed: false,
  setLeftSidebarCollapsed: (collapsed) => set({ leftSidebarCollapsed: collapsed }),
  rightSidebarCollapsed: false,
  setRightSidebarCollapsed: (collapsed) => set({ rightSidebarCollapsed: collapsed }),
  libraryVersion: 0,
  triggerLibraryUpdate: () => set(state => ({ libraryVersion: state.libraryVersion + 1 })),
  
  history: { past: [], future: [] },
  templates: [],
  isPreviewModalOpen: false,
  setPreviewModalOpen: (isOpen) => set({ isPreviewModalOpen: isOpen }),
  loadTemplates: (templates) => {
    const withThumbnails = (templates || []).map(t => {
      if (!t.thumbnail && t.document) {
        try {
          const thumb = generateDocumentSquareThumbnail(t.document, 300);
          if (thumb) return { ...t, thumbnail: thumb };
        } catch {
          // ignore
        }
      }
      return t;
    });
    set({ templates: withThumbnails });
  },

  loadTemplateToCanvas: (template: TemplateItem) => {
    const docCopy = normalizeCanvasDocument(JSON.parse(JSON.stringify(template.document)));
    docCopy.id = template.id;
    const state = get();
    syncDocumentWithEventData(docCopy, state.eventData);
    if (docCopy.pages?.[0]?.elements) {
      syncElementZIndexes(docCopy.pages[0].elements);
    }
    const docHash = computeDocHash(docCopy);
    
    set({
      document: docCopy,
      currentTemplateId: template.id,
      currentTemplateName: template.name,
      lastSavedHash: docHash,
      history: { past: [], future: [] },
      selectedElementIds: []
    });
  },

  saveTemplate: async (name: string, overwrite = false) => {
    const state = get();
    const targetId = (overwrite && state.currentTemplateId) ? state.currentTemplateId : Date.now().toString();
    
    // Create clean deep copy
    const newDoc = JSON.parse(JSON.stringify(state.document));
    newDoc.id = targetId;
    newDoc.metadata = {
      ...newDoc.metadata,
      lastModified: Date.now()
    };
    
    // Sanitize to avoid any undefined value issues in Firestore
    const cleanDoc = sanitizeForFirestore(newDoc);
    
    const existingTemplate = state.templates.find(t => t.id === targetId);
    
    // Generate square thumbnail for the template preview card
    let thumb = '';
    try {
      thumb = generateDocumentSquareThumbnail(cleanDoc, 320);
    } catch (e) {
      console.warn('Error generating square thumbnail for template:', e);
    }

    const templateData: TemplateItem = {
      id: targetId,
      name: name.trim() || 'Sin Nombre',
      document: cleanDoc,
      author: 'Romina / Herly Lizarazo',
      thumbnail: thumb || existingTemplate?.thumbnail || '',
      createdAt: (existingTemplate && overwrite) ? (existingTemplate.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now()
    };

    // 1. Update local store state immediately
    const existingList = state.templates.filter(t => t.id !== targetId);
    const updatedTemplates = [templateData, ...existingList];
    const docHash = computeDocHash(cleanDoc);

    set({
      document: cleanDoc,
      currentTemplateId: targetId,
      currentTemplateName: templateData.name,
      lastSavedHash: docHash,
      templates: updatedTemplates
    });

    // 2. Save to IndexedDB & localStorage for guaranteed local persistence
    try {
      await idbSet('wedding_craft_templates', updatedTemplates);
      localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(updatedTemplates));
    } catch (localErr) {
      console.warn('Error saving templates locally:', localErr);
    }

    // 3. Save to Hosting Backend API & SQLite/JSON
    try {
      await saveTemplateToHosting(templateData);
    } catch (hostErr) {
      console.warn('Error saving template to hosting storage:', hostErr);
    }

    return { success: true, id: targetId, name: templateData.name };
  },

  publishDesign: async () => {
    const state = get();
    const eventId = state.eventData?.eventId || 'default_wedding';
    const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
    const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/, '');
    
    // 1. Optimize images and guarantee normalized layers before publishing
    const optimizedDoc = await optimizeDesignImagesForCloud(state.document, eventId);
    const docToPublish = sanitizeForFirestore(optimizedDoc);

    // Stamp with authoritative publishedAt timestamp
    const now = Date.now();
    docToPublish.metadata = {
      ...docToPublish.metadata,
      lastModified: now,
      publishedAt: now,
      version: (docToPublish.metadata?.version || 1) + 1,
    };

    // Update in-memory state with optimized cloud references
    set({ document: optimizedDoc });

    try {
      // 0. Register in dynamic in-memory registry immediately (0ms synchronous access)
      registerPublishedDesignInMemory(eventId, docToPublish);
      registerPublishedDesignInMemory(cleanEvt, docToPublish);
      registerPublishedDesignInMemory(cleanEvtNoSuffix, docToPublish);

      // 1. Save published document locally with all alias keys to guarantee instant retrieval
      const docStr = JSON.stringify(docToPublish);
      const aliasKeys = [
        eventId,
        cleanEvt,
        cleanEvtNoSuffix,
        `boda-${cleanEvt}`,
        `boda-${cleanEvtNoSuffix}`
      ];

      for (const key of aliasKeys) {
        try {
          localStorage.setItem(`weddingcraft_published_${key}`, docStr);
          localStorage.setItem(`casanovia_published_design_${key}`, docStr);
          localStorage.setItem(`wedding_design_draft_${key}`, docStr);
          await idbSet(`weddingcraft_published_${key}`, docToPublish);
          await idbSet(`casanovia_published_design_${key}`, docToPublish);
          await idbSet(`wedding_design_draft_${key}`, docToPublish);
        } catch {}
      }

      // Update the persistent dictionary registry
      try {
        const stored = localStorage.getItem('casanovia_published_registry');
        const reg = stored ? JSON.parse(stored) : {};
        for (const key of aliasKeys) {
          reg[key] = docToPublish;
        }
        localStorage.setItem('casanovia_published_registry', JSON.stringify(reg));
      } catch {}

      // Package JSON into project base registry (writes to src/data/publishedDesignsData.json on server)
      try {
        await fetch('/api/publish-design-to-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, document: docToPublish })
        }).catch(() => null);
      } catch (pkgErr) {}

      // 2. Persist published document to Hosting Backend (api/data/weddingcraft/published/)
      try {
        await savePublishedDesignToHosting(eventId, docToPublish);
        if (cleanEvt !== eventId) {
          await savePublishedDesignToHosting(cleanEvt, docToPublish);
        }
      } catch (hostErr) {
        console.warn('Could not save published design to hosting backend:', hostErr);
      }

      // Also update local cache and hosting database for the wedding so that weddings.php contains weddingCraftDesign
      try {
        const storedWeddings = localStorage.getItem('casanovia_all_weddings');
        if (storedWeddings) {
          const list = JSON.parse(storedWeddings);
          if (Array.isArray(list)) {
            const updatedWedding = list.find((w: any) => 
              w.id === eventId || 
              w.id === cleanEvt ||
              (w.coupleNames && eventId.includes(w.coupleNames.toLowerCase().replace(/[^a-z0-9]/g, '')))
            );
            if (updatedWedding) {
              updatedWedding.weddingCraftDesign = docToPublish;
              updatedWedding.updatedAt = new Date().toISOString();
              const updatedList = list.map((w: any) => w.id === updatedWedding.id ? updatedWedding : w);
              localStorage.setItem('casanovia_all_weddings', JSON.stringify(updatedList));
              await saveWeddingToHost(updatedWedding).catch(() => null);
            }
          }
        }
      } catch (locErr) {}

      // 4. Dispatch reactive broadcast event for instant in-page synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('weddingcraft_design_updated', {
          detail: { eventId, document: docToPublish }
        }));
      }

      // Update last saved hash and draft
      const publishedHash = computeDocHash(docToPublish);
      const thumbnail = generateDocumentSquareThumbnail(docToPublish, 320);
      set({ lastSavedHash: publishedHash, publishedThumbnail: thumbnail });

      return { success: true };
    } catch (err: any) {
      console.error('Error publishing WeddingCraft design:', err);
      return { success: true };
    }
  },

  loadWebInvitados: async () => {
    const state = get();
    const eventId = state.eventData?.eventId || 'default_wedding';

    // Helper to sanitize & modernize document layout
    const sanitizeDoc = (doc: any) => {
      const normalized = normalizeCanvasDocument(doc);
      if (normalized?.canvas) {
        if (normalized.canvas.backgroundColor === '#FAF8F5') {
          normalized.canvas.backgroundColor = '#EBEBEB';
        }
        if (normalized.canvas.width === 375) {
          normalized.canvas.width = 720;
          if (normalized.pages?.[0]?.elements) {
            normalized.pages[0].elements = reflowCanvasElements(normalized.pages[0].elements, 720, 375);
          }
        }
      }
      syncDocumentWithEventData(normalized, state.eventData);
      if (normalized?.pages?.[0]?.elements) {
        syncElementZIndexes(normalized.pages[0].elements);
      }
      return normalized;
    };

    // 1. Try to load from Hosting Backend (api/data/weddingcraft/published/)
    try {
      const hostingDoc = await fetchPublishedDesignFromHosting(eventId);
      if (hostingDoc) {
        const docCopy = sanitizeDoc(JSON.parse(JSON.stringify(hostingDoc)));
        const docHash = computeDocHash(docCopy);
        set({
          document: docCopy,
          currentTemplateId: `web_invitados_${eventId}`,
          currentTemplateName: 'Web Invitados (Publicada)',
          lastSavedHash: docHash,
          history: { past: [], future: [] },
          selectedElementIds: []
        });
        return { success: true, source: 'published' };
      }
    } catch (hostErr) {
      console.warn('Error reading published design from hosting storage:', hostErr);
    }

    // 2. Try to load from local storage
    try {
      const localPub = localStorage.getItem(`weddingcraft_published_${eventId}`);
      if (localPub) {
        const parsed = sanitizeDoc(JSON.parse(localPub));
        if (parsed && parsed.pages) {
          const docHash = computeDocHash(parsed);
          set({
            document: parsed,
            currentTemplateId: `web_invitados_${eventId}`,
            currentTemplateName: 'Web Invitados (Publicada)',
            lastSavedHash: docHash,
            history: { past: [], future: [] },
            selectedElementIds: []
          });
          return { success: true, source: 'published' };
        }
      }

      const idbPub = await idbGet(`weddingcraft_published_${eventId}`);
      if (idbPub && idbPub.pages) {
        const sanitized = sanitizeDoc(idbPub);
        const docHash = computeDocHash(sanitized);
        set({
          document: sanitized,
          currentTemplateId: `web_invitados_${eventId}`,
          currentTemplateName: 'Web Invitados (Publicada)',
          lastSavedHash: docHash,
          history: { past: [], future: [] },
          selectedElementIds: []
        });
        return { success: true, source: 'published' };
      }
    } catch (localErr) {
      console.warn('Error reading published design locally:', localErr);
    }

    // 3. If no published design exists yet, generate from current event data
    const newDoc = createDefaultWebInvitationDocument({
      eventId: state.eventData?.eventId,
      coupleNames: state.eventData?.coupleNames,
      eventDate: state.eventData?.eventDate,
      venueName: state.eventData?.venueName,
      venueAddress: state.eventData?.venueAddress,
      romanticQuote: state.eventData?.romanticQuote
    });

    const docHash = computeDocHash(newDoc);
    set({
      document: newDoc,
      currentTemplateId: `web_invitados_${eventId}`,
      currentTemplateName: 'Web Invitados',
      lastSavedHash: docHash,
      history: { past: [], future: [] },
      selectedElementIds: []
    });

    return { success: true, source: 'generated' };
  },

  duplicateTemplate: async (templateId: string) => {
    const state = get();
    const original = state.templates.find(t => t.id === templateId);
    if (!original) return false;

    const newId = Date.now().toString();
    const newName = `${original.name} (Copia)`;
    const newDoc = JSON.parse(JSON.stringify(original.document));
    newDoc.id = newId;
    newDoc.metadata = {
      ...newDoc.metadata,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    const cleanDoc = sanitizeForFirestore(newDoc);
    let thumb = original.thumbnail || '';
    if (!thumb) {
      try {
        thumb = generateDocumentSquareThumbnail(cleanDoc, 320);
      } catch (e) {}
    }

    const duplicatedTemplate: TemplateItem = {
      id: newId,
      name: newName,
      document: cleanDoc,
      author: 'Romina / Herly Lizarazo',
      thumbnail: thumb,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedTemplates = [duplicatedTemplate, ...state.templates];
    set({ templates: updatedTemplates });

    try {
      await idbSet('wedding_craft_templates', updatedTemplates);
      localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(updatedTemplates));
    } catch (e) {}

    try {
      await saveTemplateToHosting(duplicatedTemplate);
    } catch (hostErr) {
      console.warn('Error duplicating template to hosting storage:', hostErr);
    }

    return true;
  },

  deleteTemplate: async (templateId: string) => {
    const state = get();
    const updated = state.templates.filter(t => t.id !== templateId);
    
    // If deleting the active template, unbind it
    if (state.currentTemplateId === templateId) {
      set({ currentTemplateId: null, currentTemplateName: null, lastSavedHash: null });
    }
    set({ templates: updated });

    try {
      await idbSet('wedding_craft_templates', updated);
      localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(updated));
    } catch (e) {}

    try {
      await deleteTemplateFromHosting(templateId);
    } catch (hostErr) {
      console.warn('Error deleting template from hosting storage:', hostErr);
    }

    return true;
  },
  setEventData: (data) => {
    set(state => {
      const updatedDoc = JSON.parse(JSON.stringify(state.document));
      syncDocumentWithEventData(updatedDoc, data);
      return { eventData: data, document: updatedDoc };
    });
  },
  
  initializeDocument: (doc) => {
    const normalized = normalizeCanvasDocument(doc);
    const state = get();
    syncDocumentWithEventData(normalized, state.eventData);
    if (normalized?.pages?.[0]?.elements) {
      syncElementZIndexes(normalized.pages[0].elements);
    }
    set({ document: normalized, history: { past: [], future: [] } });
  },

  commitHistory: () => set(produce((state: EditorState) => {
    // Keep max 20 history states
    state.history.past.push(JSON.parse(JSON.stringify(state.document)));
    if (state.history.past.length > 20) state.history.past.shift();
    state.history.future = [];
    state.document.metadata.lastModified = Date.now();
  })),

  addElement: (element) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const newElem = normalizeCanvasElement(element, state.document.pages[0]?.elements.length || 0);
      state.document.pages[0].elements.push(newElem);
      syncElementZIndexes(state.document.pages[0].elements);
      state.selectedElementIds = [newElem.id];
      state.document.metadata.lastModified = Date.now();
    }));
    persistDraftToStorage(get());
  },

  updateCanvas: (updates) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const oldWidth = state.document.canvas.width;
      Object.assign(state.document.canvas, updates);
      state.document.metadata.lastModified = Date.now();

      if (updates.width && updates.width !== oldWidth && state.document.pages[0]?.elements) {
        state.document.pages[0].elements = reflowCanvasElements(
          state.document.pages[0].elements,
          updates.width,
          oldWidth
        );
        syncElementZIndexes(state.document.pages[0].elements);
      }
    }));

    persistDraftToStorage(get());
  },
  
  updateElement: (id, updates) => {
    set(produce((state: EditorState) => {
      const el = state.document.pages[0].elements.find(e => e.id === id);
      if (el) {
        if (updates.transform) {
          el.transform = { ...el.transform, ...updates.transform };
        }
        if (updates.style) {
          el.style = { ...el.style, ...updates.style };
        }
        if (updates.content) {
          if (typeof updates.content === 'object' && updates.content !== null && !Array.isArray(updates.content)) {
            el.content = { ...(el.content || {}), ...updates.content };
          } else {
            el.content = updates.content;
          }
        }
        if (updates.dataBinding !== undefined) {
          el.dataBinding = updates.dataBinding;
        }
        if (updates.animation) {
          el.animation = { ...(el.animation || {}), ...updates.animation };
        }
        if (updates.locked !== undefined) el.locked = updates.locked;
        if (updates.visible !== undefined) el.visible = updates.visible;
        if (updates.zIndex !== undefined) el.zIndex = updates.zIndex;
        if (updates.type !== undefined) el.type = updates.type;
        if (updates.parentGroup !== undefined) el.parentGroup = updates.parentGroup;

        state.document.metadata.lastModified = Date.now();
      }
    }));
    persistDraftToStorage(get());
  },

  deleteElements: (ids) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.pages[0].elements = state.document.pages[0].elements.filter(e => !ids.includes(e.id));
      syncElementZIndexes(state.document.pages[0].elements);
      state.selectedElementIds = state.selectedElementIds.filter(id => !ids.includes(id));
      state.document.metadata.lastModified = Date.now();
    }));
    persistDraftToStorage(get());
  },

  duplicateElements: (ids) => {
    if (!ids || ids.length === 0) return;
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const targetElements = elements.filter(e => ids.includes(e.id));
      if (targetElements.length === 0) return;

      const groupMap: Record<string, string> = {};
      const newIds: string[] = [];

      targetElements.forEach((el) => {
        const newId = uuidv4();
        newIds.push(newId);

        let newGroup = el.parentGroup;
        if (el.parentGroup) {
          if (!groupMap[el.parentGroup]) {
            groupMap[el.parentGroup] = 'group_' + uuidv4();
          }
          newGroup = groupMap[el.parentGroup];
        }

        const clone: CanvasElement = JSON.parse(JSON.stringify(el));
        clone.id = newId;
        clone.parentGroup = newGroup;
        clone.transform.x = (clone.transform.x || 0) + 20;
        clone.transform.y = (clone.transform.y || 0) + 20;

        elements.push(clone);
      });

      syncElementZIndexes(elements);
      state.selectedElementIds = newIds;
      state.document.metadata.lastModified = Date.now();
    }));
  },

  groupElements: (ids) => {
    if (!ids || ids.length < 2) return;
    get().commitHistory();
    const newGroupId = 'group_' + uuidv4();
    set(produce((state: EditorState) => {
      state.document.pages[0].elements.forEach(el => {
        if (ids.includes(el.id)) {
          el.parentGroup = newGroupId;
        }
      });
      state.document.metadata.lastModified = Date.now();
    }));
  },

  ungroupElements: (ids) => {
    if (!ids || ids.length === 0) return;
    get().commitHistory();
    set(produce((state: EditorState) => {
      const targetElements = state.document.pages[0].elements.filter(e => ids.includes(e.id));
      const targetGroups = new Set(targetElements.map(e => e.parentGroup).filter(Boolean));

      state.document.pages[0].elements.forEach(el => {
        if (ids.includes(el.id) || (el.parentGroup && targetGroups.has(el.parentGroup))) {
          el.parentGroup = undefined;
        }
      });
      state.document.metadata.lastModified = Date.now();
    }));
  },

  selectElements: (ids) => set({ selectedElementIds: ids }),
  
  setZoom: (zoom) => set({ zoom }),

  undo: () => set(produce((state: EditorState) => {
    if (state.history.past.length === 0) return;
    const previous = state.history.past.pop();
    if (previous) {
      state.history.future.unshift(JSON.parse(JSON.stringify(state.document)));
      state.document = previous;
    }
  })),

  redo: () => set(produce((state: EditorState) => {
    if (state.history.future.length === 0) return;
    const next = state.history.future.shift();
    if (next) {
      state.history.past.push(JSON.parse(JSON.stringify(state.document)));
      state.document = next;
    }
  })),

  bringToFront: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > -1 && index < elements.length - 1) {
        const [el] = elements.splice(index, 1);
        elements.push(el);
        syncElementZIndexes(elements);
        state.document.metadata.lastModified = Date.now();
      }
    }));
  },
  sendToBack: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > 0) {
        const [el] = elements.splice(index, 1);
        elements.unshift(el);
        syncElementZIndexes(elements);
        state.document.metadata.lastModified = Date.now();
      }
    }));
  },
  bringForward: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > -1 && index < elements.length - 1) {
        const el = elements[index];
        elements[index] = elements[index + 1];
        elements[index + 1] = el;
        syncElementZIndexes(elements);
        state.document.metadata.lastModified = Date.now();
      }
    }));
  },
  sendBackward: (id) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const index = elements.findIndex(el => el.id === id);
      if (index > 0) {
        const el = elements[index];
        elements[index] = elements[index - 1];
        elements[index - 1] = el;
        syncElementZIndexes(elements);
        state.document.metadata.lastModified = Date.now();
      }
    }));
  },
  reorderElement: (id, targetIndex) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      const elements = state.document.pages[0].elements;
      const currentIndex = elements.findIndex(el => el.id === id);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= elements.length || currentIndex === targetIndex) return;
      const [el] = elements.splice(currentIndex, 1);
      elements.splice(targetIndex, 0, el);
      syncElementZIndexes(elements);
      state.document.metadata.lastModified = Date.now();
    }));
  },
  setTheme: (theme) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.theme = theme;
      state.document.canvas.backgroundColor = theme.palette.background;
    }));
    document.documentElement.style.setProperty('--wc-primary', theme.palette.primary);
    document.documentElement.style.setProperty('--wc-secondary', theme.palette.secondary);
    document.documentElement.style.setProperty('--wc-bg', theme.palette.background);
    document.documentElement.style.setProperty('--wc-text', theme.palette.text);
  },
  addCustomTheme: (theme) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) state.document.customThemes = [];
    state.document.customThemes.push(theme);
  })),
  updateCustomTheme: (id, theme) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) return;
    const index = state.document.customThemes.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      state.document.customThemes[index] = theme;
      if (state.document.theme.id === id) {
        state.document.theme = theme;
        state.document.canvas.backgroundColor = theme.palette.background;
      }
    }
  })),
  deleteCustomTheme: (id) => set(produce((state: EditorState) => {
    if (!state.document.customThemes) return;
    state.document.customThemes = state.document.customThemes.filter((t: any) => t.id !== id);
    if (state.document.theme.id === id) {
      state.document.theme = predefinedThemes[0];
      state.document.canvas.backgroundColor = predefinedThemes[0].palette.background;
    }
  })),

  applyThemeToExistingElements: (theme) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.pages[0].elements.forEach(el => {
        if (el.style.isDefaultStyle) {
          if (el.type === 'text') {
            el.style.fill = theme.palette.text;
            el.style.fontFamily = theme.typography.displayFont;
          } else if (el.type === 'svg-shape') {
            el.style.fill = theme.palette.primary;
          }
        }
      });
    }));
  }
}));
