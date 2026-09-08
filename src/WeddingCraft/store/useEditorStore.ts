import { db } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { WeddingDesignDocument, CanvasElement, EventDataInput } from '../types';
import { ThemePreset, predefinedThemes } from '../themes';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { sanitizeForFirestore } from '../lib/libraryService';

export interface TemplateItem {
  id: string;
  name: string;
  document: WeddingDesignDocument;
  author?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface EditorState {
  // Event Data (Read Only)
  eventData: EventDataInput | null;
  
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

export const useEditorStore = create<EditorState>()((set, get) => ({
  eventData: null,
  
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
    if (elements.length === 0) return false;
    const currentHash = JSON.stringify(elements);
    if (!state.lastSavedHash) return true; // Has elements but was never saved in this session
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
  loadTemplates: (templates) => set({ templates }),

  loadTemplateToCanvas: (template: TemplateItem) => {
    const docCopy = JSON.parse(JSON.stringify(template.document));
    docCopy.id = template.id;
    const elementsHash = JSON.stringify(docCopy.pages[0]?.elements || []);
    
    set({
      document: docCopy,
      currentTemplateId: template.id,
      currentTemplateName: template.name,
      lastSavedHash: elementsHash,
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
    const templateData: TemplateItem = {
      id: targetId,
      name: name.trim() || 'Sin Nombre',
      document: cleanDoc,
      author: 'Romina / Herly Lizarazo',
      createdAt: (existingTemplate && overwrite) ? (existingTemplate.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now()
    };

    // 1. Update local store state immediately
    const existingList = state.templates.filter(t => t.id !== targetId);
    const updatedTemplates = [templateData, ...existingList];
    const elementsHash = JSON.stringify(cleanDoc.pages[0]?.elements || []);

    set({
      document: cleanDoc,
      currentTemplateId: targetId,
      currentTemplateName: templateData.name,
      lastSavedHash: elementsHash,
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
    const duplicatedTemplate: TemplateItem = {
      id: newId,
      name: newName,
      document: cleanDoc,
      author: 'Romina / Herly Lizarazo',
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
    set(produce((state: EditorState) => {
      Object.assign(state.document.canvas, updates);
      state.document.metadata.lastModified = Date.now();
    }));
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
