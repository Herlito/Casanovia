import { useState, useEffect, useRef } from 'react';
import { WeddingDesignDocument } from '../WeddingCraft/types';
import { useEditorStore } from '../WeddingCraft/store/useEditorStore';
import { createDefaultWebInvitationDocument, reflowCanvasElements } from '../WeddingCraft/lib/defaultWebTemplate';
import { RESTORED_MASTER_TEMPLATES } from '../WeddingCraft/data/masterTemplates';
import { get as idbGet } from 'idb-keyval';
import { parseDateSafe, formatSpanishDateLong } from '../lib/dateUtils';
import { normalizeImageUrl } from '../lib/imageUtils';
import { loadDocumentFonts } from '../WeddingCraft/lib/fontLoader';
import publishedDesignsData from '../data/publishedDesignsData.json';

// Dynamic in-memory registry initialized from static bundle for 0ms synchronous access
const RUNTIME_PUBLISHED_DESIGNS: Record<string, WeddingDesignDocument> = {
  ...(publishedDesignsData as Record<string, any>)
};

export function registerPublishedDesignInMemory(eventId: string, doc: WeddingDesignDocument) {
  if (!eventId || !doc) return;
  const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
  const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/, '');
  
  RUNTIME_PUBLISHED_DESIGNS[eventId] = doc;
  RUNTIME_PUBLISHED_DESIGNS[cleanEvt] = doc;
  RUNTIME_PUBLISHED_DESIGNS[cleanEvtNoSuffix] = doc;
  RUNTIME_PUBLISHED_DESIGNS[`boda-${cleanEvt}`] = doc;
  RUNTIME_PUBLISHED_DESIGNS[`boda-${cleanEvtNoSuffix}`] = doc;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('casanovia_published_registry');
      const reg = stored ? JSON.parse(stored) : {};
      reg[eventId] = doc;
      reg[cleanEvt] = doc;
      reg[cleanEvtNoSuffix] = doc;
      localStorage.setItem('casanovia_published_registry', JSON.stringify(reg));
    } catch {}
  }
}

/**
 * Loads dynamic Google Fonts into document.head so custom typography
 * selected in the WeddingCraft editor renders identically on the guest page.
 */

function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms))
  ]);
}

function extractAllImageUrls(doc: WeddingDesignDocument | null): string[] {
  if (!doc) return [];
  const urls: string[] = [];
  if (doc.canvas?.backgroundImage) urls.push(doc.canvas.backgroundImage);
  if ((doc.canvas as any)?.webBackgroundImage) urls.push((doc.canvas as any).webBackgroundImage);
  const elements = doc.pages?.[0]?.elements || [];
  for (const el of elements) {
    if (el.content?.src) urls.push(el.content.src);
    if (el.content?.imageSrc) urls.push(el.content.imageSrc);
    if (el.content?.avatarUrl) urls.push(el.content.avatarUrl);
    if (el.content?.photoUrl) urls.push(el.content.photoUrl);
    if (el.content?.qrCodeUrl) urls.push(el.content.qrCodeUrl);
    if (el.content?.bgImage) urls.push(el.content.bgImage);
  }
  return urls;
}

function preloadAllDocumentImages(doc: WeddingDesignDocument | null): Promise<void> {
  const urls = extractAllImageUrls(doc);
  const validUrls = urls
    .filter(u => u && typeof u === 'string' && u.trim().length > 0 && !u.startsWith('data:image/'))
    .map(u => normalizeImageUrl(u));

  if (validUrls.length === 0) return Promise.resolve();

  const promises = validUrls.map((url) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  });

  return Promise.race([
    Promise.all(promises).then(() => {}),
    new Promise<void>((resolve) => setTimeout(resolve, 2500))
  ]);
}

function injectGoogleFonts(documentData: WeddingDesignDocument | null) {
  if (!documentData || typeof window === 'undefined') return;
  loadDocumentFonts(documentData);
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
  publishedDesign?: any;
}

/**
 * Sanitizes and ensures consistent canvas sizing, backgrounds, and binds live configuration
 * data (such as eventDate, coupleNames, venue) without clobbering custom styling or text.
 */
function sanitizeDesignDocument(parsed: any, liveSettings?: SyncFallbackOptions): WeddingDesignDocument | null {
  if (!parsed) return null;
  if (!parsed.pages?.[0]?.elements && Array.isArray(parsed.elements) && parsed.elements.length > 0) {
    parsed = {
      ...parsed,
      pages: [{ id: 'page-1', name: 'Portada', elements: parsed.elements }]
    };
  }
  if (!parsed.pages?.[0]?.elements) return null;
  const docCopy = JSON.parse(JSON.stringify(parsed));
  
  // Adapt canvas width if it was old mobile 375 and needs responsive reflow to standard 720
  if (docCopy.canvas) {
    if (docCopy.canvas.width === 375) {
      docCopy.canvas.width = 720;
      if (docCopy.pages?.[0]?.elements) {
        docCopy.pages[0].elements = reflowCanvasElements(docCopy.pages[0].elements, 720, 375);
      }
    }
  }

  // Only bind live configuration if element explicitly defines a dataBinding field and is not marked as custom
  const rawVenue = liveSettings?.receptionVenue?.name?.trim() || (liveSettings?.venueName && liveSettings.venueName.trim().toLowerCase() !== 'lugar' ? liveSettings.venueName.trim() : '') || liveSettings?.ceremonyVenue?.name?.trim() || liveSettings?.venueName;
  const effectiveVenue = (rawVenue && rawVenue.trim().toLowerCase() !== 'lugar') ? rawVenue.trim() : 'Fundo Paraíso';

  if (docCopy.pages?.[0]?.elements) {
    const eventDate = liveSettings?.eventDate;
    const coupleNames = liveSettings?.coupleNames;
    const romanticQuote = liveSettings?.romanticQuote;
    const formattedDate = eventDate ? formatSpanishDateLong(eventDate) : null;
    const targetIsoDate = eventDate ? parseDateSafe(eventDate).toISOString() : null;

    docCopy.pages[0].elements = docCopy.pages[0].elements.map((el: any) => {
      // 1. Explicit Event Date Binding
      if (formattedDate && el.dataBinding?.field === 'eventDate' && !el.content?.isCustomText) {
        return {
          ...el,
          content: { ...el.content, text: formattedDate }
        };
      }

      // 2. Countdown Widget Target Date Binding (keeps countdown synchronized with wedding date)
      if (el.type === 'countdown-widget' && targetIsoDate) {
        return {
          ...el,
          content: {
            ...el.content,
            targetDate: targetIsoDate
          }
        };
      }

      // 3. Couple Names Binding ONLY if explicitly bound
      if (coupleNames && coupleNames.length >= 2 && coupleNames[0] && coupleNames[1] && el.dataBinding?.field === 'coupleNames' && !el.content?.isCustomText) {
        return {
          ...el,
          content: { ...el.content, text: `${coupleNames[0]} & ${coupleNames[1]}` }
        };
      }

      // 4. Venue Name Binding (strictly links to Reception Venue / Salón / Hacienda and replaces 'Lugar')
      const isLugarText = el.type === 'text' && (el.content?.text || '').trim().toLowerCase() === 'lugar';
      if (el.dataBinding?.field === 'venueName' || isLugarText) {
        return {
          ...el,
          content: { ...el.content, text: effectiveVenue },
          dataBinding: { field: 'venueName' }
        };
      }

      // 5. Romantic Quote Binding
      if (romanticQuote && el.dataBinding?.field === 'romanticQuote' && !el.content?.isCustomText) {
        return {
          ...el,
          content: { ...el.content, text: `"${romanticQuote}"` }
        };
      }

      // 6. Couple Contacts Card Binding
      if (el.type === 'couple-quote-contacts-card') {
        const updatedContent = { ...el.content };
        if (formattedDate && !updatedContent.weddingDate) updatedContent.weddingDate = formattedDate;
        if (coupleNames && coupleNames.length >= 2 && !updatedContent.coupleNames) updatedContent.coupleNames = `${coupleNames[0]} & ${coupleNames[1]}`;
        if (romanticQuote && !updatedContent.quote) updatedContent.quote = romanticQuote;
        return {
          ...el,
          content: updatedContent
        };
      }

      return el;
    });
  }

  return docCopy;
}

/**
 * Helper to compute the richness/quality score of a design document.
 * A custom design with floral images, photos, customized layouts has higher priority than an auto-generated fallback.
 */
function getDocumentQualityScore(doc: any): number {
  if (!doc) return 0;
  const page = doc.pages?.[0];
  const elements = page?.elements || doc.elements || [];
  if (!elements.length) return 0;
  let score = elements.length * 10;
  for (const el of elements) {
    if (el.type === 'image' && (el.content?.src || el.content?.url)) score += 50;
    if (el.type === 'svg-shape') score += 20;
    if (el.style?.fontFamily && el.style.fontFamily !== 'Montserrat' && el.style.fontFamily !== 'Arial' && el.style.fontFamily !== 'sans-serif') score += 20;
    if (el.type === 'interactive-button') score += 10;
  }
  return score;
}

/**
 * Reactive bridge hook connecting the visual WeddingCraft Editor canvas state
 * directly with the Casanovia Guest Web DOM, ensuring 100% visual parity
 * between the visual editor and "Web Invitados".
 */
export function findSynchronousPublishedDesign(eventId?: string, fallbackData?: SyncFallbackOptions): WeddingDesignDocument | null {
  if (!eventId || typeof window === 'undefined') return null;

  // 1. Check live in-memory editor store first (highest priority if editor is active)
  const activeStore = useEditorStore.getState();
  if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
    const sanitized = sanitizeDesignDocument(activeStore.document, fallbackData);
    if (sanitized) return sanitized;
  }

  // 2. Check explicit publishedDesign passed in fallbackData / active wedding object
  if (fallbackData?.publishedDesign?.pages?.[0]?.elements?.length || fallbackData?.publishedDesign?.elements?.length) {
    const parsed = sanitizeDesignDocument(fallbackData.publishedDesign, fallbackData);
    if (parsed) return parsed;
  }

  const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
  const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/, '');

  const keysToTry = Array.from(new Set([
    eventId,
    cleanEvt,
    cleanEvtNoSuffix,
    `boda-${cleanEvt}`,
    `boda-${cleanEvtNoSuffix}`,
    `1128-erikayemar`,
    `erikayemar`,
    `boda-erikayemar`,
    `boda-erika-yemar-6398`
  ])).filter(Boolean);

  // 3. Check dynamic RUNTIME_PUBLISHED_DESIGNS in-memory registry (0ms instant access)
  for (const k of keysToTry) {
    if (RUNTIME_PUBLISHED_DESIGNS[k]) {
      const parsed = sanitizeDesignDocument(RUNTIME_PUBLISHED_DESIGNS[k], fallbackData);
      if (parsed) return parsed;
    }
  }

  // 4. Check static embedded published designs registry (publishedDesignsData.json)
  const pubRegistry = publishedDesignsData as Record<string, any>;
  for (const k of keysToTry) {
    if (pubRegistry[k]) {
      const parsed = sanitizeDesignDocument(pubRegistry[k], fallbackData);
      if (parsed) return parsed;
    }
  }

  // Fuzzy match on keys of pubRegistry
  for (const [key, pDoc] of Object.entries(pubRegistry)) {
    const cleanKey = key.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
    const cleanKeyNoSuffix = cleanKey.replace(/[-_]\d+$/, '');
    if (cleanKey === cleanEvt || cleanKeyNoSuffix === cleanEvtNoSuffix || key === eventId) {
      const parsed = sanitizeDesignDocument(pDoc, fallbackData);
      if (parsed) return parsed;
    }
  }

  // 5. Check localStorage published registry & individual keys
  try {
    const regStr = localStorage.getItem('casanovia_published_registry');
    if (regStr) {
      const reg = JSON.parse(regStr);
      for (const k of keysToTry) {
        if (reg[k]?.pages?.[0]?.elements?.length) {
          const sanitized = sanitizeDesignDocument(reg[k], fallbackData);
          if (sanitized) return sanitized;
        }
      }
    }

    for (const k of keysToTry) {
      const pubStr = localStorage.getItem(`weddingcraft_published_${k}`) || localStorage.getItem(`casanovia_published_design_${k}`);
      if (pubStr) {
        const parsed = JSON.parse(pubStr);
        if (parsed?.pages?.[0]?.elements?.length) {
          const sanitized = sanitizeDesignDocument(parsed, fallbackData);
          if (sanitized) return sanitized;
        }
      }
    }
  } catch {}

  // 6. Check RESTORED_MASTER_TEMPLATES for legacy matches if parentEventId matches
  const masterMatch = RESTORED_MASTER_TEMPLATES.find(
    (t) =>
      t.document?.parentEventId === eventId ||
      t.id === `template-${cleanEvt}` ||
      t.id === `template-${cleanEvtNoSuffix}`
  );
  if (masterMatch?.document) {
    const parsed = sanitizeDesignDocument(masterMatch.document, fallbackData);
    if (parsed) return parsed;
  }

  // Return null if no published design exists (DO NOT generate fake/default template)
  return null;
}

/**
 * Reactive bridge hook connecting the visual WeddingCraft Editor canvas state
 * directly with the Casanovia Guest Web DOM, ensuring 100% visual parity
 * between the visual editor and "Web Invitados".
 */
export function useSyncedInvitationDesign(eventId?: string, fallbackData?: SyncFallbackOptions) {
  const [syncedDoc, setSyncedDoc] = useState<WeddingDesignDocument | null>(() => {
    return findSynchronousPublishedDesign(eventId, fallbackData);
  });

  const [hasCustomDesign, setHasCustomDesign] = useState<boolean>(Boolean(syncedDoc));
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If we resolved a design synchronously on mount, we are not blocking loading
    return !Boolean(syncedDoc);
  });
  const currentDocRef = useRef<WeddingDesignDocument | null>(syncedDoc);
  const lastAppliedJsonRef = useRef<string>(syncedDoc ? JSON.stringify({ canvas: syncedDoc.canvas, elements: syncedDoc.pages[0]?.elements }) : '');

  useEffect(() => {
    currentDocRef.current = syncedDoc;
    if (syncedDoc) {
      loadDocumentFonts(syncedDoc);
    }
  }, [syncedDoc]);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Helper to safely apply a candidate design, inject typography, and preload all images asynchronously
    const safelyApplyDesign = async (candidate: any, forceUpdate?: boolean) => {
      if (!candidate || !isMounted) return false;
      const sanitized = sanitizeDesignDocument(candidate, fallbackData);
      if (!sanitized || !sanitized.pages?.[0]?.elements?.length) return false;

      // Quick serialization check to avoid infinite re-renders or heavy DOM churn
      const candidateJson = JSON.stringify({ canvas: sanitized.canvas, elements: sanitized.pages[0].elements });
      if (!forceUpdate && candidateJson === lastAppliedJsonRef.current) {
        return true;
      }

      // Quality score guard: Never downgrade a high-fidelity botanical design with a generic skeleton
      if (!forceUpdate && currentDocRef.current) {
        const currentScore = getDocumentQualityScore(currentDocRef.current);
        const candidateScore = getDocumentQualityScore(sanitized);
        if (currentScore >= 200 && candidateScore < currentScore - 150) {
          return false;
        }
      }

      lastAppliedJsonRef.current = candidateJson;
      setSyncedDoc(sanitized);
      currentDocRef.current = sanitized;
      setHasCustomDesign(true);
      injectGoogleFonts(sanitized);
      // Asynchronously preload images in background without blocking paint
      preloadAllDocumentImages(sanitized).catch(() => {});
      return true;
    };

    const loadDesignFromAllSources = async () => {
      try {
        // If we already have a synchronous match, just attempt a fast background update check
        // 0. Priority: Check if publishedDesign was directly passed in fallbackData from active wedding state
        if (fallbackData?.publishedDesign?.pages?.[0]?.elements?.length || fallbackData?.publishedDesign?.elements?.length) {
          if (await safelyApplyDesign(fallbackData.publishedDesign)) {
            setIsLoading(false);
            return;
          }
        }

        // 1. Check localStorage published cache (instant local disk read)
        try {
          const localPub = localStorage.getItem(`weddingcraft_published_${eventId}`) || localStorage.getItem(`casanovia_published_design_${eventId}`);
          if (localPub) {
            const parsed = JSON.parse(localPub);
            if (parsed?.pages?.[0]?.elements?.length) {
              if (await safelyApplyDesign(parsed)) {
                setIsLoading(false);
              }
            }
          }
        } catch (err) {}

        // 3. Check static embedded published registry (instant bundled memory read)
        const pubRegistry = publishedDesignsData as Record<string, any>;
        let foundDoc = pubRegistry[eventId];
        if (!foundDoc) {
          const cleanEvt = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
          const cleanEvtNoSuffix = cleanEvt.replace(/[-_]\d+$/i, '');
          for (const [key, pDoc] of Object.entries(pubRegistry)) {
            const cleanKey = key.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
            const cleanKeyNoSuffix = cleanKey.replace(/[-_]\d+$/i, '');
            if (
              cleanKey === cleanEvt ||
              cleanKeyNoSuffix === cleanEvtNoSuffix ||
              key === eventId
            ) {
              foundDoc = pDoc;
              break;
            }
          }
        }
        if (foundDoc && !currentDocRef.current) {
          await safelyApplyDesign(foundDoc);
        }
        const bundledTimestamp = foundDoc?.metadata?.lastModified || 0;

        // 3. Background non-blocking check: IndexedDB published
        try {
          const idbPub = (await withTimeout(idbGet<WeddingDesignDocument>(`weddingcraft_published_${eventId}`), 1000)) ||
                         (await withTimeout(idbGet<WeddingDesignDocument>(`casanovia_published_design_${eventId}`), 1000));
          if (idbPub?.pages?.[0]?.elements?.length) {
            const idbTimestamp = idbPub?.metadata?.lastModified || 0;
            if (idbTimestamp >= bundledTimestamp) {
              if (await safelyApplyDesign(idbPub)) return;
            }
          }
        } catch (idbErr) {}

        // 5. Background non-blocking check: Remote self-hosted backend API (casanovia.pe) with fast single query
        try {
          // If we already have a high quality published design loaded synchronously, skip blocking remote network calls
          if (!currentDocRef.current || getDocumentQualityScore(currentDocRef.current) < 100) {
            const apiDomain = (typeof window !== 'undefined' && window.location.hostname.includes('casanovia.pe'))
              ? ''
              : 'https://www.casanovia.pe';

            const rawClean = eventId.replace(/^(\d{4}-|boda-|wedding-)/, '');
            const targetId = eventId || rawClean;

            const res = await withTimeout(fetch(`${apiDomain}/api/weddingcraft.php?wedding_id=${encodeURIComponent(targetId)}&published=1`), 1200);
            if (res && res.ok && isMounted) {
              const data = await res.json().catch(() => null);
              const remoteDoc = data?.design?.document || data?.design?.document_json || data?.design || data?.document;
              if (remoteDoc?.pages?.[0]?.elements?.length || remoteDoc?.elements?.length) {
                const remoteTimestamp = remoteDoc?.metadata?.lastModified || 0;
                if (remoteTimestamp >= bundledTimestamp) {
                  if (await safelyApplyDesign(remoteDoc)) {
                    try {
                      localStorage.setItem(`weddingcraft_published_${eventId}`, JSON.stringify(remoteDoc));
                    } catch {}
                  }
                }
              }
            }
          }
        } catch (hostErr) {}

        // 6. If no published design was found anywhere, leave syncedDoc as null (do NOT generate default template)
        if (!currentDocRef.current && isMounted) {
          setSyncedDoc(null);
          setHasCustomDesign(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDesignFromAllSources();

    // Listen for instant broadcast events dispatched by the editor on publish or draft save
    const handleBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<{ eventId: string; document: WeddingDesignDocument }>;
      if (!customEvent.detail?.document || !eventId) return;

      const targetClean = eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase();
      const targetCleanNoSuffix = targetClean.replace(/[-_]\d+$/, '');
      const detailClean = customEvent.detail.eventId ? customEvent.detail.eventId.replace(/^(\d{4}-|boda-|wedding-)/i, '').toLowerCase() : '';
      const detailCleanNoSuffix = detailClean.replace(/[-_]\d+$/, '');

      if (
        customEvent.detail.eventId === eventId ||
        detailClean === targetClean ||
        detailCleanNoSuffix === targetCleanNoSuffix
      ) {
        safelyApplyDesign(customEvent.detail.document, true);
      }
    };

    window.addEventListener('weddingcraft_design_updated', handleBroadcast);

    // Subscribe to real-time changes in useEditorStore if actively editing this wedding
    const unsubStore = useEditorStore.subscribe((state) => {
      if (state.eventData?.eventId === eventId && state.document?.pages?.[0]?.elements) {
        safelyApplyDesign(state.document, true);
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('weddingcraft_design_updated', handleBroadcast);
      unsubStore();
    };
  }, [eventId, JSON.stringify(fallbackData?.publishedDesign?.pages?.[0]?.elements?.length || 0)]);

  return {
    document: syncedDoc,
    hasCustomDesign: Boolean(syncedDoc),
    isLiveEditing: useEditorStore.getState().eventData?.eventId === eventId,
    isLoading
  };
}
