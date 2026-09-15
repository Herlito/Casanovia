import { useState, useEffect } from 'react';
import { WeddingDesignDocument } from '../WeddingCraft/types';
import { useEditorStore } from '../WeddingCraft/store/useEditorStore';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../WeddingCraft/lib/defaultWebTemplate';
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
    if (el.style?.titleFontFamily) fontFamilies.add(el.style.titleFontFamily);
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
 * Sanitizes and ensures consistent canvas sizing & backgrounds across devices.
 */
function sanitizeDesignDocument(parsed: any): WeddingDesignDocument | null {
  if (!parsed || !parsed.pages?.[0]?.elements) return null;
  const docCopy = JSON.parse(JSON.stringify(parsed));
  if (docCopy.canvas) {
    if (docCopy.canvas.backgroundColor === '#FAF8F5') {
      docCopy.canvas.backgroundColor = '#EBEBEB';
    }
    if (docCopy.canvas.width === 375) {
      docCopy.canvas.width = 720;
      if (docCopy.pages?.[0]?.elements) {
        docCopy.pages[0].elements = reflowCanvasElements(docCopy.pages[0].elements, 720, 375);
      }
    }
  }
  return docCopy;
}

export interface SyncFallbackOptions {
  eventId?: string;
  coupleNames?: [string, string] | string[];
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
  romanticQuote?: string;
  ceremonyVenue?: any;
  receptionVenue?: any;
  hasReligiousCeremony?: boolean;
  dressCodeStyle?: string;
  dressCodeDescription?: string;
  suggestedColors?: Array<{ name: string; hex: string }>;
  sampleWishes?: Array<{ author: string; message: string; protocolRoleTitle?: string }>;
}

/**
 * Reactive bridge hook connecting the visual WeddingCraft Editor canvas state
 * directly with the Casanovia Guest Web DOM, ensuring 100% visual parity
 * between the visual editor and "Web Invitados".
 */
export function useSyncedInvitationDesign(eventId?: string, fallbackData?: SyncFallbackOptions) {
  const [syncedDoc, setSyncedDoc] = useState<WeddingDesignDocument | null>(() => {
    if (!eventId || typeof window === 'undefined') return null;

    // 1. Check live in-memory editor store first
    const activeStore = useEditorStore.getState();
    if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
      return sanitizeDesignDocument(activeStore.document);
    }

    // 2. Check localStorage draft cache (most recent edits)
    try {
      const draftStr = localStorage.getItem(`wedding_design_draft_${eventId}`);
      if (draftStr) {
        const parsed = sanitizeDesignDocument(JSON.parse(draftStr));
        if (parsed) return parsed;
      }
    } catch {}

    // 3. Check localStorage published cache
    try {
      const pubStr = localStorage.getItem(`weddingcraft_published_${eventId}`);
      if (pubStr) {
        const parsed = sanitizeDesignDocument(JSON.parse(pubStr));
        if (parsed) return parsed;
      }
    } catch {}

    // 4. Fallback to generating default synced document
    if (fallbackData || eventId) {
      const defaultDoc = createDefaultWebInvitationDocument({
        eventId: eventId,
        coupleNames: fallbackData?.coupleNames,
        eventDate: fallbackData?.eventDate,
        venueName: fallbackData?.venueName,
        venueAddress: fallbackData?.venueAddress,
        romanticQuote: fallbackData?.romanticQuote,
      });
      return defaultDoc;
    }

    return null;
  });

  const [hasCustomDesign, setHasCustomDesign] = useState<boolean>(Boolean(syncedDoc));

  useEffect(() => {
    if (!eventId) return;

    let isMounted = true;

    const loadDesignFromAllSources = async () => {
      // 1. Check in-memory store
      const activeStore = useEditorStore.getState();
      if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
        if (isMounted) {
          const docSanitized = sanitizeDesignDocument(activeStore.document);
          if (docSanitized) {
            setSyncedDoc(docSanitized);
            setHasCustomDesign(true);
            injectGoogleFonts(docSanitized);
            return;
          }
        }
      }

      // 2. Check localStorage draft
      try {
        const localDraft = localStorage.getItem(`wedding_design_draft_${eventId}`);
        if (localDraft) {
          const parsed = sanitizeDesignDocument(JSON.parse(localDraft));
          if (parsed && isMounted) {
            setSyncedDoc(parsed);
            setHasCustomDesign(true);
            injectGoogleFonts(parsed);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read draft from localStorage:', err);
      }

      // 3. Check localStorage published
      try {
        const localPub = localStorage.getItem(`weddingcraft_published_${eventId}`);
        if (localPub) {
          const parsed = sanitizeDesignDocument(JSON.parse(localPub));
          if (parsed && isMounted) {
            setSyncedDoc(parsed);
            setHasCustomDesign(true);
            injectGoogleFonts(parsed);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read published design from localStorage:', err);
      }

      // 4. Check IndexedDB draft
      try {
        const idbDraft = await idbGet<WeddingDesignDocument>(`wedding_design_draft_${eventId}`);
        if (idbDraft && isMounted) {
          const parsed = sanitizeDesignDocument(idbDraft);
          if (parsed) {
            setSyncedDoc(parsed);
            setHasCustomDesign(true);
            injectGoogleFonts(parsed);
            return;
          }
        }
      } catch (idbErr) {
        console.warn('Could not read draft from IndexedDB:', idbErr);
      }

      // 5. Check IndexedDB published
      try {
        const idbPub = await idbGet<WeddingDesignDocument>(`weddingcraft_published_${eventId}`);
        if (idbPub && isMounted) {
          const parsed = sanitizeDesignDocument(idbPub);
          if (parsed) {
            setSyncedDoc(parsed);
            setHasCustomDesign(true);
            injectGoogleFonts(parsed);
            return;
          }
        }
      } catch (idbErr) {
        console.warn('Could not read published design from IndexedDB:', idbErr);
      }

      // 6. If none exist in local storage, initialize with default web invitation document
      if (isMounted) {
        const fallbackDoc = createDefaultWebInvitationDocument({
          eventId: eventId,
          coupleNames: fallbackData?.coupleNames,
          eventDate: fallbackData?.eventDate,
          venueName: fallbackData?.venueName,
          venueAddress: fallbackData?.venueAddress,
          romanticQuote: fallbackData?.romanticQuote,
        });
        setSyncedDoc(fallbackDoc);
        setHasCustomDesign(true);
        injectGoogleFonts(fallbackDoc);
      }
    };

    loadDesignFromAllSources();

    // 7. Listen for instant broadcast events dispatched by the editor on publish or draft save
    const handleBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<{ eventId: string; document: WeddingDesignDocument }>;
      if (customEvent.detail?.eventId === eventId && customEvent.detail?.document) {
        const sanitized = sanitizeDesignDocument(customEvent.detail.document);
        if (sanitized && isMounted) {
          setSyncedDoc(sanitized);
          setHasCustomDesign(true);
          injectGoogleFonts(sanitized);
        }
      }
    };

    window.addEventListener('weddingcraft_design_updated', handleBroadcast);

    // 8. Subscribe to real-time changes in useEditorStore if actively editing this wedding
    const unsubStore = useEditorStore.subscribe((state) => {
      if (state.eventData?.eventId === eventId && state.document?.pages?.[0]?.elements) {
        const sanitized = sanitizeDesignDocument(state.document);
        if (sanitized && isMounted) {
          setSyncedDoc(sanitized);
          setHasCustomDesign(true);
          injectGoogleFonts(sanitized);
        }
      }
    });

    // 9. Real-time Firebase Firestore listener for remote updates (passive read-only)
    let unsubFirestore: (() => void) | null = null;
    try {
      unsubFirestore = onSnapshot(doc(db, 'weddingcraft_published', eventId), (snap) => {
        if (snap.exists() && isMounted) {
          const data = snap.data();
          if (data?.document) {
            const sanitized = sanitizeDesignDocument(data.document);
            if (sanitized) {
              setSyncedDoc(sanitized);
              setHasCustomDesign(true);
              injectGoogleFonts(sanitized);
            }
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
  }, [eventId, fallbackData?.coupleNames?.[0], fallbackData?.coupleNames?.[1], fallbackData?.eventDate, fallbackData?.venueName]);

  return {
    document: syncedDoc,
    hasCustomDesign: Boolean(syncedDoc),
    isLiveEditing: useEditorStore.getState().eventData?.eventId === eventId
  };
}
