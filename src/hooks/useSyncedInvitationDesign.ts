import { useState, useEffect } from 'react';
import { WeddingDesignDocument } from '../WeddingCraft/types';
import { useEditorStore } from '../WeddingCraft/store/useEditorStore';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { get as idbGet } from 'idb-keyval';

/**
 * Loads dynamic Google Fonts into document.head so custom typography
 * selected in the WeddingCraft editor renders identically on the guest page.
 */
function injectGoogleFonts(documentData: WeddingDesignDocument | null) {
  if (!documentData || typeof window === 'undefined') return;

  const fontFamilies = new Set<string>();
  const page = documentData.pages?.[0];
  if (!page) return;

  page.elements?.forEach(el => {
    if (el.style?.fontFamily) fontFamilies.add(el.style.fontFamily);
    if (el.type === 'countdown-widget') {
      if (el.style?.numberFont) fontFamilies.add(el.style.numberFont);
      if (el.style?.labelFont) fontFamilies.add(el.style.labelFont);
    }
  });

  const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'sans-serif', 'serif'];
  const webFonts = Array.from(fontFamilies).filter(f => !systemFonts.includes(f));

  if (webFonts.length === 0) return;

  const fontQuery = webFonts
    .map(f => f.trim().replace(/ /g, '+') + ':ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600')
    .join('&family=');

  const linkId = 'weddingcraft-synced-fonts';
  let link = document.getElementById(linkId) as HTMLLinkElement;
  const href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;

  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  } else if (link.href !== href) {
    link.href = href;
  }
}

/**
 * Reactive bridge hook connecting the visual WeddingCraft Editor canvas state
 * directly with the Casanovia Guest Web DOM, strictly without touching any
 * backend tables, auth, or guest protocol logic.
 */
export function useSyncedInvitationDesign(eventId?: string) {
  const [syncedDoc, setSyncedDoc] = useState<WeddingDesignDocument | null>(() => {
    if (!eventId || typeof window === 'undefined') return null;

    // 1. Check live in-memory editor store first
    const activeStore = useEditorStore.getState();
    if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
      return activeStore.document;
    }

    // 2. Check localStorage published cache
    try {
      const local = localStorage.getItem(`weddingcraft_published_${eventId}`);
      if (local) return JSON.parse(local);
    } catch {
      // Ignore parse error
    }

    return null;
  });

  const [hasCustomDesign, setHasCustomDesign] = useState<boolean>(Boolean(syncedDoc));

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;

    const loadInitialDesign = async () => {
      // 1. Check in-memory store
      const activeStore = useEditorStore.getState();
      if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
        if (isMounted) {
          setSyncedDoc(activeStore.document);
          setHasCustomDesign(true);
          injectGoogleFonts(activeStore.document);
        }
        return;
      }

      // 2. Check localStorage
      try {
        const local = localStorage.getItem(`weddingcraft_published_${eventId}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (isMounted) {
            setSyncedDoc(parsed);
            setHasCustomDesign(true);
            injectGoogleFonts(parsed);
          }
        }
      } catch (err) {
        console.warn('Could not read published design from localStorage:', err);
      }

      // 3. Check IndexedDB
      try {
        const idbDoc = await idbGet<WeddingDesignDocument>(`weddingcraft_published_${eventId}`);
        if (idbDoc && isMounted) {
          setSyncedDoc(idbDoc);
          setHasCustomDesign(true);
          injectGoogleFonts(idbDoc);
        }
      } catch (idbErr) {
        console.warn('Could not read published design from IndexedDB:', idbErr);
      }
    };

    loadInitialDesign();

    // 4. Listen for instant broadcast events dispatched by the editor on publish
    const handleBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<{ eventId: string; document: WeddingDesignDocument }>;
      if (customEvent.detail?.eventId === eventId && customEvent.detail?.document) {
        if (isMounted) {
          setSyncedDoc(customEvent.detail.document);
          setHasCustomDesign(true);
          injectGoogleFonts(customEvent.detail.document);
        }
      }
    };

    window.addEventListener('weddingcraft_design_updated', handleBroadcast);

    // 5. Subscribe to real-time changes in useEditorStore if editing the same wedding
    const unsubStore = useEditorStore.subscribe((state) => {
      if (state.eventData?.eventId === eventId && state.document?.pages?.[0]?.elements) {
        if (isMounted) {
          setSyncedDoc(state.document);
          setHasCustomDesign(true);
          injectGoogleFonts(state.document);
        }
      }
    });

    // 6. Real-time Firebase Firestore listener for remote updates (passive read-only)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(doc(db, 'weddingcraft_published', eventId), (snap) => {
        if (snap.exists() && isMounted) {
          const data = snap.data();
          if (data?.document) {
            setSyncedDoc(data.document);
            setHasCustomDesign(true);
            injectGoogleFonts(data.document);
          }
        }
      }, (err) => {
        console.warn('Passive Firestore listener for published design failed gracefully:', err);
      });
    } catch {
      // Continue offline
    }

    return () => {
      isMounted = false;
      window.removeEventListener('weddingcraft_design_updated', handleBroadcast);
      unsubStore();
      if (unsubFirestore) unsubFirestore();
    };
  }, [eventId]);

  return {
    document: syncedDoc,
    hasCustomDesign,
    isLiveEditing: useEditorStore.getState().eventData?.eventId === eventId
  };
}
