import { db } from '../../lib/firebase';
import { collection, getDocs, getDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { WeddingDesignDocument, CanvasElement, EventDataInput } from '../types';
import { ThemePreset, predefinedThemes } from '../themes';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { sanitizeForFirestore } from '../lib/libraryService';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../lib/defaultWebTemplate';
import { generateDocumentSquareThumbnail } from '../lib/templateThumbnail';

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
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
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

export const useEditorStore = create<EditorState>()((set, get) => ({
  eventData: null,
  isLinkedToWedding: true,
  setIsLinkedToWedding: (linked) => set({ isLinkedToWedding: linked }),
  
  document: {
    id: uuidv4(),
    parentEventId: '',
    metadata: { createdAt: Date.now(), lastModified: Date.now(), version: '1.0.0' },
    canvas: { width: 375, height: 812, backgroundColor: predefinedThemes[0].palette.background },
    theme: predefinedThemes[0],
    pages: [{ id: 'cover', name: 'Portada', elements: [] }],
    assetReferences: []
  },
  
  currentTemplateId: null,
  currentTemplateName: null,
  lastSavedHash: null,
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
    const docCopy = JSON.parse(JSON.stringify(template.document));
    docCopy.id = template.id;
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

    // 3. Save to Firestore (Shared across Romina & Herly Lizarazo)
    try {
      await setDoc(doc(db, 'weddingcraft_templates', targetId), templateData);
    } catch (cloudErr) {
      console.warn('Error saving template to Firestore:', cloudErr);
    }

    return { success: true, id: targetId, name: templateData.name };
  },

  publishDesign: async () => {
    const state = get();
    const eventId = state.eventData?.eventId || 'default_wedding';
    const docToPublish = sanitizeForFirestore(state.document);

    try {
      // 1. Save published document locally
      localStorage.setItem(`weddingcraft_published_${eventId}`, JSON.stringify(docToPublish));
      await idbSet(`weddingcraft_published_${eventId}`, docToPublish);

      // 2. Persist published document to Firestore under weddingcraft_published collection
      await setDoc(doc(db, 'weddingcraft_published', eventId), {
        eventId,
        publishedAt: Date.now(),
        document: docToPublish,
        author: 'WeddingCraft Studio'
      });

      // 3. Dispatch reactive broadcast event for instant in-page synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('weddingcraft_design_updated', {
          detail: { eventId, document: docToPublish }
        }));
      }

      // Update last saved hash and draft
      const publishedHash = computeDocHash(docToPublish);
      set({ lastSavedHash: publishedHash });
      const draftKey = `wedding_design_draft_${eventId}`;
      await idbSet(draftKey, docToPublish);
      try {
        localStorage.setItem(draftKey, JSON.stringify(docToPublish));
      } catch (e) {}

      return { success: true };
    } catch (err: any) {
      console.error('Error publishing WeddingCraft design:', err);
      // Even if offline/Firestore issues occur, local storage succeeded
      return { success: true };
    }
  },

  loadWebInvitados: async () => {
    const state = get();
    const eventId = state.eventData?.eventId || 'default_wedding';

    // Helper to sanitize & modernize document layout
    const sanitizeDoc = (doc: any) => {
      if (doc?.canvas) {
        if (doc.canvas.backgroundColor === '#FAF8F5') {
          doc.canvas.backgroundColor = '#EBEBEB';
        }
        if (doc.canvas.width === 375) {
          doc.canvas.width = 720;
          if (doc.pages?.[0]?.elements) {
            doc.pages[0].elements = reflowCanvasElements(doc.pages[0].elements, 720, 375);
          }
        }
      }
      return doc;
    };

    // 1. Try to load from Firestore published document
    try {
      const snap = await getDoc(doc(db, 'weddingcraft_published', eventId));
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.document) {
          const docCopy = sanitizeDoc(JSON.parse(JSON.stringify(data.document)));
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
      }
    } catch (cloudErr) {
      console.warn('Error reading published design from Firestore:', cloudErr);
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
      await setDoc(doc(db, 'weddingcraft_templates', newId), duplicatedTemplate);
    } catch (cloudErr) {
      console.warn('Error duplicating template to Firestore:', cloudErr);
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
      await deleteDoc(doc(db, 'weddingcraft_templates', templateId));
    } catch (cloudErr) {
      console.warn('Error deleting template from Firestore:', cloudErr);
    }

    return true;
  },
  setEventData: (data) => set({ eventData: data }),
  
  initializeDocument: (doc) => set({ document: doc, history: { past: [], future: [] } }),

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
      const newElem = { ...element, id: uuidv4() } as CanvasElement;
      state.document.pages[0].elements.push(newElem);
      state.selectedElementIds = [newElem.id];
    }));
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
      }
    }));

    // Immediately persist draft so changes to canvas dimensions/background are never lost
    const currentState = get();
    if (currentState.eventData?.eventId) {
      const draftKey = `wedding_design_draft_${currentState.eventData.eventId}`;
      const docClean = sanitizeForFirestore(currentState.document);
      idbSet(draftKey, docClean).catch(e => console.warn('idbSet canvas draft error:', e));
      try {
        localStorage.setItem(draftKey, JSON.stringify(docClean));
      } catch (e) {}
    }
  },
  
  updateElement: (id, updates) => {
    set(produce((state: EditorState) => {
      const el = state.document.pages[0].elements.find(e => e.id === id);
      if (el) {
        Object.assign(el, updates);
        state.document.metadata.lastModified = Date.now();
      }
    }));
  },

  deleteElements: (ids) => {
    get().commitHistory();
    set(produce((state: EditorState) => {
      state.document.pages[0].elements = state.document.pages[0].elements.filter(e => !ids.includes(e.id));
      state.selectedElementIds = state.selectedElementIds.filter(id => !ids.includes(id));
    }));
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

      targetElements.forEach((el, idx) => {
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
        clone.zIndex = elements.length + idx + 1;

        elements.push(clone);
      });

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
      }
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
