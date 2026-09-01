import { db } from '../../lib/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { WeddingDesignDocument, CanvasElement, EventDataInput } from '../types';
import { ThemePreset, predefinedThemes } from '../themes';
import { get as idbGet, set as idbSet } from 'idb-keyval';

interface EditorState {
  // Event Data (Read Only)
  eventData: EventDataInput | null;
  
  // Design Document
  document: WeddingDesignDocument;
  
  // Editor UI State
  selectedElementIds: string[];
  zoom: number;
  magnetEnabled: boolean;
  setMagnetEnabled: (enabled: boolean) => void;
  
  // History for Undo/Redo
  history: {
    past: WeddingDesignDocument[];
    future: WeddingDesignDocument[];
  };
  templates: { id: string; name: string; document: WeddingDesignDocument }[];
  isPreviewModalOpen: boolean;
  setPreviewModalOpen: (isOpen: boolean) => void;
  saveTemplate: (name: string, overwrite?: boolean) => void;
  loadTemplates: (templates: any[]) => void;

  // Actions
  setEventData: (data: EventDataInput) => void;
  initializeDocument: (doc: WeddingDesignDocument) => void;
  
  // Element Manipulation
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateCanvas: (updates: Partial<WeddingDesignDocument['canvas']>) => void;
  deleteElements: (ids: string[]) => void;
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
  
  selectedElementIds: [],
  zoom: 1,
  magnetEnabled: true,
  setMagnetEnabled: (enabled) => set({ magnetEnabled: enabled }),
  
  history: { past: [], future: [] },
  templates: [],
  isPreviewModalOpen: false,
  setPreviewModalOpen: (isOpen) => set({ isPreviewModalOpen: isOpen }),
loadTemplates: (templates) => set({ templates }),
    saveTemplate: (name, overwrite = false) => set((state) => {
    let newId = overwrite ? state.document.id : Date.now().toString();
    if (!overwrite) {
        state.document.id = newId;
    }
    const newTemplate = { id: newId, name, document: JSON.parse(JSON.stringify(state.document)) };
    setDoc(doc(db, 'weddingcraft_templates', newTemplate.id), newTemplate).then(() => {
      getDocs(collection(db, 'weddingcraft_templates')).then((snapshot) => {
        const templates = snapshot.docs.map(d => d.data());
        useEditorStore.getState().loadTemplates(templates);
      });
    }).catch(e => console.error("Error saving template", e));
    return state;
  }),
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
