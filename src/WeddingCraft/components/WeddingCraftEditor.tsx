import React, { useEffect, useState } from 'react';
import { Toolbar } from './Toolbar';
import { LeftSidebar } from './LeftSidebar';
import { FooterControls } from './FooterControls';
import { RightSidebar } from './RightSidebar';
import { MobileNavigation } from './MobileNavigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CanvasStage } from './CanvasStage';
import { useEditorStore } from '../store/useEditorStore';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { get, set } from 'idb-keyval';
import { EventDataAdapter } from '../adapter/EventDataAdapter';
import { WeddingDesignDocument } from '../types';
import { X } from 'lucide-react';
import { exportToHTML } from '../lib/exportHTML';

interface WeddingCraftEditorProps {
  externalAPI: any;
  onClose: () => void;
  initialDocument?: WeddingDesignDocument;
}

export const WeddingCraftEditor: React.FC<WeddingCraftEditorProps> = ({ externalAPI, onClose, initialDocument }) => {
  const { setEventData, initializeDocument } = useEditorStore();
  const isPreviewModalOpen = useEditorStore((state) => state.isPreviewModalOpen);
  useKeyboardShortcuts();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent body scroll when editor is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
          // Load templates
          const savedTemplates = await get('wedding_craft_templates');
          if (savedTemplates) {
             useEditorStore.getState().loadTemplates(savedTemplates);
          }
          
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
        // Load templates from Firebase (real-time)
        try {
           import('firebase/firestore').then(({ onSnapshot, collection }) => {
              onSnapshot(collection(db, 'weddingcraft_templates'), (snap) => {
                 const templates = snap.docs.map(d => d.data());
                 useEditorStore.getState().loadTemplates(templates);
              });
           });
        } catch (e) {
           console.error("Error loading templates", e);
        }
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
      <div className="fixed inset-0 z-[9999] bg-[#EBEBEB] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-transparent mb-4"></div>
        <p className="text-[#8C8276] font-semibold text-sm">Inicializando WeddingCraft Studio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#EBEBEB] flex flex-col items-center justify-center p-8 text-center">
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
        <LeftSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <CanvasStage />
          <FooterControls />
        </div>
        <div className="hidden md:flex flex-col h-full"><RightSidebar /></div>
      </div>
      
      <MobileNavigation />
      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#EBEBEB] rounded-2xl shadow-2xl w-full h-full max-w-md md:max-w-4xl flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Previsualización (Animaciones)</h3>
              <button 
                onClick={() => useEditorStore.getState().setPreviewModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 bg-gray-50 flex items-center justify-center relative overflow-hidden">
               <iframe 
                  srcDoc={exportToHTML(useEditorStore.getState().document)} 
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
               />
            </div>
          </div>
        </div>
      )}
      
      {/* Close button float */}
      <button 
        onClick={onClose}
        className="absolute top-16 right-4 p-2 bg-[#EBEBEB] rounded-full shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-transparent hover:bg-red-50 text-red-500 transition-colors z-50"
        title="Cerrar Editor (Limpiar memoria)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
