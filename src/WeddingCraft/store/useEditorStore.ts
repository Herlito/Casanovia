import { create } from 'zustand';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { WeddingDesignDocument, CanvasElement, EventDataInput } from '../types';

interface EditorState {
  // Event Data (Read Only)
  eventData: EventDataInput | null;
  
  // Design Document
  document: WeddingDesignDocument;
  
  // Editor UI State
  selectedElementIds: string[];
  zoom: number;
  
  // History for Undo/Redo
  history: {
    past: WeddingDesignDocument[];
    future: WeddingDesignDocument[];
  };

  // Actions
  setEventData: (data: EventDataInput) => void;
  initializeDocument: (doc: WeddingDesignDocument) => void;
  
  // Element Manipulation
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElements: (ids: string[]) => void;
  selectElements: (ids: string[]) => void;
  
  // Viewport
  setZoom: (zoom: number) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  commitHistory: () => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  eventData: null,
  
  document: {
    id: uuidv4(),
    parentEventId: '',
    metadata: { createdAt: Date.now(), lastModified: Date.now(), version: '1.0.0' },
    canvas: { width: 375, height: 812, backgroundColor: '#F5F1E8' },
    theme: {
      id: 'default-elegant',
      name: 'Elegancia Dorada',
      palette: { primary: '#D4AF37', secondary: '#7C8B6F', background: '#F5F1E8', text: '#2C3E2D', muted: '#8B9A8B', accent: '#D4AF37' },
      typography: { displayFont: 'serif', bodyFont: 'sans-serif' },
      decorations: { defaultShapes: [] }
    },
    pages: [{ id: 'cover', name: 'Portada', elements: [] }],
    assetReferences: []
  },
  
  selectedElementIds: [],
  zoom: 1,
  
  history: { past: [], future: [] },

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
  }))
}));
