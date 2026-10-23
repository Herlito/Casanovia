import React, { useEffect, useState } from 'react';
import { Toolbar } from './Toolbar';
import { LeftSidebar } from './LeftSidebar';
import { FooterControls } from './FooterControls';
import { RightSidebar } from './RightSidebar';
import { MobileNavigation } from './MobileNavigation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CanvasStage } from './CanvasStage';
import { useEditorStore } from '../store/useEditorStore';
import { get, set, del } from 'idb-keyval';
import { fetchTemplatesFromHosting } from '../../services/hostingStorage';
import { EventDataAdapter } from '../adapter/EventDataAdapter';
import { WeddingDesignDocument } from '../types';
import { X } from 'lucide-react';
import { exportToHTML } from '../lib/exportHTML';
import { SaveTemplateModal } from './SaveTemplateModal';
import { FloatingPropertiesToolbar } from './FloatingPropertiesToolbar';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../lib/defaultWebTemplate';
import { RESTORED_MASTER_TEMPLATES } from '../data/masterTemplates';
import { isValidDraftDocument } from '../lib/canvasElementUtils';
import { WeddingCraftErrorBoundary } from './WeddingCraftErrorBoundary';

interface WeddingCraftEditorProps {
  externalAPI: any;
  onClose: () => void;
  initialDocument?: WeddingDesignDocument;
}

export const WeddingCraftEditor: React.FC<WeddingCraftEditorProps> = ({ externalAPI, onClose, initialDocument }) => {
  const { setEventData, initializeDocument } = useEditorStore();
  const isPreviewModalOpen = useEditorStore((state) => state.isPreviewModalOpen);
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const rightSidebarCollapsed = useEditorStore((state) => state.rightSidebarCollapsed);
  const setRightSidebarCollapsed = useEditorStore((state) => state.setRightSidebarCollapsed);
  useKeyboardShortcuts();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-expand RightSidebar when user selects an element on the canvas
  useEffect(() => {
    if (selectedElementIds.length > 0 && rightSidebarCollapsed) {
      setRightSidebarCollapsed(false);
    }
  }, [selectedElementIds, rightSidebarCollapsed, setRightSidebarCollapsed]);

  useEffect(() => {
    // Prevent body scroll when editor is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const externalAPIRef = React.useRef(externalAPI);
  externalAPIRef.current = externalAPI;
  const initialDocumentRef = React.useRef(initialDocument);
  initialDocumentRef.current = initialDocument;

  // Background update for event data when externalAPI changes without reinitializing the canvas document
  useEffect(() => {
    if (!isLoading && externalAPI) {
      const adapter = new EventDataAdapter(externalAPI);
      adapter.getCurrentEvent().then((eventData) => {
        if (eventData) {
          setEventData(eventData);
        }
      }).catch(() => {});
    }
  }, [externalAPI, isLoading, setEventData]);

  useEffect(() => {
    let unsubscribeTemplates: (() => void) | null = null;
    let lastSavedHash = '';
    let isCancelled = false;

    const init = async () => {
      try {
        setIsLoading(true);
        // 1. Adapter initialization
        const adapter = new EventDataAdapter(externalAPIRef.current);
        const eventData = await adapter.getCurrentEvent();
        
        if (isCancelled) return;

        // 2. Set Read-Only Parent Data
        setEventData(eventData);

        // 3. Init local document
        if (initialDocumentRef.current) {
          initializeDocument(initialDocumentRef.current);
        } else {
          // Check IndexedDB for draft and templates
          const savedTemplates = (await get('wedding_craft_templates')) || [];
          const map = new Map<string, any>();
          RESTORED_MASTER_TEMPLATES.forEach(t => map.set(t.id, t));
          if (Array.isArray(savedTemplates)) {
            savedTemplates.forEach((t: any) => { if (t?.id) map.set(t.id, t); });
          }
          const initialTemplates = Array.from(map.values()).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
          useEditorStore.getState().loadTemplates(initialTemplates);
          
          // Helper to load the official wedding template cleanly
          const loadOfficialWeddingTemplate = () => {
            const matchingMaster = RESTORED_MASTER_TEMPLATES.find(
              m => m.document?.parentEventId === eventData.eventId || 
                   (eventData.coupleNames && m.name.toLowerCase().includes(eventData.coupleNames[0]?.toLowerCase() || ''))
            );
            if (matchingMaster?.document && isValidDraftDocument(matchingMaster.document)) {
              initializeDocument(matchingMaster.document);
              return;
            }

            const defaultDoc = createDefaultWebInvitationDocument({
              eventId: eventData.eventId,
              coupleNames: eventData.coupleNames,
              eventDate: eventData.eventDate,
              venueName: eventData.venueName,
              venueAddress: eventData.venueAddress,
              romanticQuote: eventData.romanticQuote,
            });
            initializeDocument(defaultDoc);
          };

          // Bypass local drafts completely and fetch directly from Hosting Backend
          let remoteDesign: any = null;
          try {
            remoteDesign = await fetchPublishedDesignFromHosting(eventData.eventId);
          } catch (e) {
            console.info('[WeddingCraft] No remote design found on hosting, falling back to official template.');
          }

          if (remoteDesign && isValidDraftDocument(remoteDesign)) {
            if (remoteDesign.canvas) {
              if (remoteDesign.canvas.backgroundColor === '#FAF8F5') {
                remoteDesign.canvas.backgroundColor = '#EBEBEB';
              }
              if (remoteDesign.canvas.width === 375) {
                remoteDesign.canvas.width = 720;
                if (remoteDesign.pages?.[0]?.elements) {
                  remoteDesign.pages[0].elements = reflowCanvasElements(remoteDesign.pages[0].elements, 720, 375);
                }
              }
            }
            initializeDocument(remoteDesign);
          } else {
            loadOfficialWeddingTemplate();
          }
        }

        if (isCancelled) return;
        setIsLoading(false);

        // Load templates from hosting backend and merge safely with IndexedDB
        try {
          const remoteTemplates = await fetchTemplatesFromHosting();
          const localTemplates: any[] = (await get('wedding_craft_templates')) || [];
          
          const map = new Map<string, any>();
          localTemplates.forEach(t => { if (t?.id) map.set(t.id, t); });
          remoteTemplates.forEach(t => { if (t?.id) map.set(t.id, t); });
          
          const merged = Array.from(map.values()).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
          if (!isCancelled) {
            useEditorStore.getState().loadTemplates(merged);
          }
        } catch (e) {
          console.info("Info loading templates from hosting:", e);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Error inicializando el editor visual.');
          setIsLoading(false);
        }
      }
    };

    init();

    // Auto-save effect logic using IndexedDB, localStorage, and application-wide sync events
    const saveCurrentDraft = () => {
      const state = useEditorStore.getState();
      const elements = state.document?.pages?.[0]?.elements;
      if (state.eventData?.eventId && elements && elements.length > 0 && isValidDraftDocument(state.document)) {
        const eventId = state.eventData.eventId;
        const currentHash = JSON.stringify({ canvas: state.document.canvas, elements });
        if (currentHash === lastSavedHash) return;
        lastSavedHash = currentHash;

        const draftKey = `wedding_design_draft_${eventId}`;
        
        // 1. Persist draft to IndexedDB
        set(draftKey, state.document).catch(() => {});

        // 2. Persist draft to localStorage
        try {
          localStorage.setItem(draftKey, JSON.stringify(state.document));
        } catch (e) {}
      }
    };

    const saveInterval = setInterval(saveCurrentDraft, 10000);

    return () => {
      isCancelled = true;
      clearInterval(saveInterval);
      if (unsubscribeTemplates) {
        unsubscribeTemplates();
      }
      saveCurrentDraft();
    };
  }, [setEventData, initializeDocument]);

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
      <div className="flex-1 flex overflow-hidden p-0 md:p-2 md:gap-2">
        <LeftSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <WeddingCraftErrorBoundary eventId={useEditorStore.getState().eventData?.eventId}>
            <FloatingPropertiesToolbar />
            <CanvasStage />
            <FooterControls />
          </WeddingCraftErrorBoundary>
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
        onClick={() => {
          const state = useEditorStore.getState();
          
          if (state.hasUnsavedChanges()) {
            const shouldSave = window.confirm(
              "Hay cambios sin guardar en tu diseño.\n\n¿Deseas guardarlos antes de salir?\n\n• Aceptar: Guardar y Salir\n• Cancelar: Salir sin guardar"
            );
            if (shouldSave) {
              if (state.currentTemplateId && state.currentTemplateName) {
                state.directSaveCurrentTemplate().then(() => onClose());
              } else if (state.eventData?.eventId) {
                state.publishDesign().then(() => onClose());
              } else {
                state.openSaveModal('save_as');
                return;
              }
              return;
            }
          }

          const currentElements = state.document?.pages?.[0]?.elements;
          if (state.eventData?.eventId && currentElements && currentElements.length > 0 && isValidDraftDocument(state.document)) {
            const eventId = state.eventData.eventId;
            const draftKey = `wedding_design_draft_${eventId}`;
            set(draftKey, state.document).catch(() => {});
            try {
              localStorage.setItem(draftKey, JSON.stringify(state.document));
            } catch (e) {}
          }
          onClose();
        }}
        className="absolute top-16 right-4 p-2 bg-[#EBEBEB] rounded-full shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] border border-transparent hover:bg-red-50 text-red-500 transition-colors z-50"
        title="Cerrar Editor (Guardar cambios y salir)"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
