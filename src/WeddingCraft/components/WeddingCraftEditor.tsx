import React, { useEffect, useState } from 'react';
import { Toolbar } from './Toolbar';
import { LayersPanel } from './LayersPanel';
import { RightSidebar } from './RightSidebar';
import { MobileNavigation } from './MobileNavigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CanvasStage } from './CanvasStage';
import { useEditorStore } from '../store/useEditorStore';
import { get, set } from 'idb-keyval';
import { EventDataAdapter } from '../adapter/EventDataAdapter';
import { WeddingDesignDocument } from '../types';
import { X } from 'lucide-react';

interface WeddingCraftEditorProps {
  externalAPI: any;
  onClose: () => void;
  initialDocument?: WeddingDesignDocument;
}

export const WeddingCraftEditor: React.FC<WeddingCraftEditorProps> = ({ externalAPI, onClose, initialDocument }) => {
  const { setEventData, initializeDocument } = useEditorStore();
  useKeyboardShortcuts();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        // 1. Adapter initialization
        const adapter = new EventDataAdapter(externalAPI);
        const eventData = await adapter.getCurrentEvent();
        
        // 2. Set Read-Only Parent Data
        setEventData(eventData);

        // 3. Init local document
        if (initialDocument) {
          initializeDocument(initialDocument);
        } else {
          // Check IndexedDB for draft
          const draftKey = `wedding_design_draft_${eventData.eventId}`;
          const savedDraft = await get(draftKey);
          if (savedDraft) {
            // Support both stringified and plain objects depending on how it was saved
            try {
               const parsed = typeof savedDraft === 'string' ? JSON.parse(savedDraft) : savedDraft;
               initializeDocument(parsed);
            } catch (e) {
               console.warn("Failed to parse saved draft", e);
            }
          }
          // Else relies on the store's default document
        }

        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error inicializando el editor visual.');
        setIsLoading(false);
      }
    };

    init();

    // Auto-save effect logic using IndexedDB
    const saveInterval = setInterval(() => {
      const state = useEditorStore.getState();
      if (state.eventData) {
        const draftKey = `wedding_design_draft_${state.eventData.eventId}`;
        set(draftKey, JSON.stringify(state.document)).catch(e => {
            console.warn('Failed to save draft to IndexedDB:', e);
        });
      }
    }, 30000); // 30s autosave

    return () => clearInterval(saveInterval);
  }, [externalAPI, initialDocument, setEventData, initializeDocument]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B3A4A] mb-4"></div>
        <p className="text-[#8C8276] font-semibold text-sm">Inicializando WeddingCraft Studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 font-bold mb-4">Error de Integración</p>
        <p className="text-[#524B42] text-sm max-w-md">{error}</p>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">
          Cerrar Editor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f2f2f7] flex flex-col wc-editor-root font-sans">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden p-0 md:p-3 md:gap-3">
        <div className="hidden md:flex flex-col h-full"><LayersPanel /></div>
        <CanvasStage />
        <div className="hidden md:flex flex-col h-full"><RightSidebar /></div>
      </div>
      
      <MobileNavigation />
      {/* Close button float */}
      <button 
        onClick={onClose}
        className="absolute top-16 right-4 p-2 bg-white rounded-full shadow-lg border border-[#E8DCCF] hover:bg-red-50 text-red-500 transition-colors z-50"
        title="Cerrar Editor (Limpiar memoria)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
