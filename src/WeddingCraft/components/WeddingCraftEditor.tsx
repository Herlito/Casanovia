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
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { get, set } from 'idb-keyval';
import { EventDataAdapter } from '../adapter/EventDataAdapter';
import { WeddingDesignDocument } from '../types';
import { X } from 'lucide-react';
import { exportToHTML } from '../lib/exportHTML';
import { SaveTemplateModal } from './SaveTemplateModal';
import { FloatingPropertiesToolbar } from './FloatingPropertiesToolbar';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../lib/defaultWebTemplate';

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
               if (parsed?.canvas) {
                 if (parsed.canvas.backgroundColor === '#FAF8F5') {
                   parsed.canvas.backgroundColor = '#EBEBEB';
                 }
                 if (parsed.canvas.width === 375) {
                   parsed.canvas.width = 720;
                   if (parsed.pages?.[0]?.elements) {
                     parsed.pages[0].elements = reflowCanvasElements(parsed.pages[0].elements, 720, 375);
                   }
                 }
               }
               initializeDocument(parsed);
            } catch (e) {
               console.warn("Failed to parse saved draft", e);
            }
          } else {
            // Default State: If linked and no design exists, load the current "Web Invitados" as the default canvas
            const isLinked = useEditorStore.getState().isLinkedToWedding;
            if (isLinked) {
              const defaultDoc = createDefaultWebInvitationDocument({
                eventId: eventData.eventId,
                coupleNames: eventData.coupleNames,
                eventDate: eventData.eventDate,
                venueName: eventData.venueName,
                venueAddress: eventData.venueAddress,
                romanticQuote: eventData.romanticQuote,
              });
              initializeDocument(defaultDoc);
            }
          }
        }

        setIsLoading(false);
        // Load templates from Firebase (real-time) and merge safely with IndexedDB
        try {
            onSnapshot(collection(db, 'weddingcraft_templates'), async (snap) => {
                const remoteTemplates: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const localTemplates: any[] = (await get('wedding_craft_templates')) || [];
                
                const map = new Map<string, any>();
                localTemplates.forEach(t => { if (t?.id) map.set(t.id, t); });
                remoteTemplates.forEach(t => { if (t?.id) map.set(t.id, t); });
                
                const merged = Array.from(map.values()).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
                useEditorStore.getState().loadTemplates(merged);
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
          <FloatingPropertiesToolbar />
          <CanvasStage />
          <FooterControls />
        </div>
        <div className="hidden md:flex flex-col h-full"><RightSidebar /></div>
      </div>
      
      <MobileNavigation />
      <SaveTemplateModal />
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
