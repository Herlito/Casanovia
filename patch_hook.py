import re

with open('src/hooks/useSyncedInvitationDesign.ts', 'r') as f:
    content = f.read()

# Replace safelyApplyDesign
safely_match = re.search(r'const safelyApplyDesign = \(candidate: any, force = false\) => \{.*?\n    \};', content, re.DOTALL)
if safely_match:
    new_safely = """const safelyApplyDesign = (candidate: any, force = true) => {
      if (!candidate || !isMounted) return false;
      const sanitized = sanitizeDesignDocument(candidate, fallbackData);
      if (!sanitized || !sanitized.pages?.[0]?.elements?.length) return false;

      // Quick serialization check to avoid infinite re-renders or heavy DOM churn
      const candidateJson = JSON.stringify({ canvas: sanitized.canvas, elements: sanitized.pages[0].elements });
      if (candidateJson === lastAppliedJsonRef.current) {
        return true;
      }

      // Removing scoring system - force override for anything coming from DB/PHP
      lastAppliedJsonRef.current = candidateJson;
      setSyncedDoc(sanitized);
      currentDocRef.current = sanitized;
      setHasCustomDesign(true);
      injectGoogleFonts(sanitized);
      return true;
    };"""
    content = content[:safely_match.start()] + new_safely + content[safely_match.end():]
else:
    print("Could not find safelyApplyDesign!")

# Replace loadDesignFromAllSources
load_match = re.search(r'const loadDesignFromAllSources = async \(\) => \{.*?\n    \};', content, re.DOTALL)
if load_match:
    new_load = """const loadDesignFromAllSources = async () => {
      try {
        // 1. Check in-memory store
        const activeStore = useEditorStore.getState();
        if (activeStore.eventData?.eventId === eventId && activeStore.document?.pages?.[0]?.elements?.length) {
          if (safelyApplyDesign(activeStore.document, true)) return;
        }

        // 2. Check Firestore dedicated published design collection (with 2 second timeout)
        try {
          const fetchPromise = getDoc(doc(db, 'weddingcraft_published', eventId));
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 2000));
          const snapPub = await Promise.race([fetchPromise, timeoutPromise]) as any;

          if (snapPub.exists() && isMounted) {
            const fsDoc = snapPub.data()?.document;
            if (fsDoc?.pages?.[0]?.elements?.length) {
              if (safelyApplyDesign(fsDoc, true)) {
                try {
                  localStorage.setItem(`weddingcraft_published_${eventId}`, JSON.stringify(fsDoc));
                } catch {}
                return;
              }
            }
          }
        } catch (fsErr) {
          console.warn('Firebase query failed or timed out, falling back to local and PHP server', fsErr);
        }

        // 3. Check IndexedDB published & draft (where WeddingCraft stores rich blobs/images)
        try {
          const idbPub = (await idbGet<WeddingDesignDocument>(`weddingcraft_published_${eventId}`)) || (await idbGet<WeddingDesignDocument>(`casanovia_published_design_${eventId}`));
          if (idbPub?.pages?.[0]?.elements?.length) {
            if (safelyApplyDesign(idbPub, true)) return;
          }

          const idbDraft = await idbGet<WeddingDesignDocument>(`wedding_design_draft_${eventId}`);
          if (idbDraft?.pages?.[0]?.elements?.length) {
            if (safelyApplyDesign(idbDraft, true)) return;
          }
        } catch (idbErr) {}

        // 4. Check localStorage published
        try {
          const localPub = localStorage.getItem(`weddingcraft_published_${eventId}`) || localStorage.getItem(`casanovia_published_design_${eventId}`);
          if (localPub) {
            const parsed = JSON.parse(localPub);
            if (parsed?.pages?.[0]?.elements?.length) {
              if (safelyApplyDesign(parsed, true)) return;
            }
          }
        } catch (err) {}

        // 5. Check self-hosted backend API (api/data/weddingcraft/published/)
        try {
          const apiDomain = (typeof window !== 'undefined' && window.location.hostname.includes('casanovia.pe'))
            ? ''
            : 'https://www.casanovia.pe';

          let hostRes = await fetch(`${apiDomain}/api/weddingcraft.php?wedding_id=${encodeURIComponent(eventId)}&published=1`).catch(() => null);          
          
          if (!hostRes || !hostRes.ok) {
            hostRes = await fetch(`${apiDomain}/api/weddingcraft.php?wedding_id=${encodeURIComponent(eventId)}`).catch(() => null);
          }

          if (hostRes && hostRes.ok && isMounted) {
            const hostData = await hostRes.json();
            const hostDoc = hostData?.design?.document || hostData?.design?.document_json || hostData?.design;
            if (hostDoc?.pages?.[0]?.elements?.length || hostDoc?.elements?.length) {
              if (safelyApplyDesign(hostDoc, true)) {
                try {
                  localStorage.setItem(`weddingcraft_published_${eventId}`, JSON.stringify(hostDoc));
                } catch {}
                return;
              }
            }
          }
        } catch (hostErr) {}

        // 6. Check Firestore weddings collection (fallback)
        try {
          const fetchWedPromise = getDoc(doc(db, 'weddings', eventId));
          const timeoutWedPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 2000));
          const snapWed = await Promise.race([fetchWedPromise, timeoutWedPromise]) as any;

          if (snapWed.exists() && isMounted) {
            const fsDoc = snapWed.data()?.weddingCraftDesign;
            if (fsDoc?.pages?.[0]?.elements?.length) {
              if (safelyApplyDesign(fsDoc, true)) {
                return;
              }
            }
          }
        } catch (fsErr) {}

        // 7. If no design has been loaded at all, fallback to default template
        if (isMounted && !currentDocRef.current) {
          const fallbackDoc = createDefaultWebInvitationDocument({
            eventId: eventId,
            coupleNames: fallbackData?.coupleNames,
            eventDate: fallbackData?.eventDate,
            venueName: fallbackData?.venueName,
            venueAddress: fallbackData?.venueAddress,
            romanticQuote: fallbackData?.romanticQuote,
          });
          setSyncedDoc(fallbackDoc);
          currentDocRef.current = fallbackDoc;
          setHasCustomDesign(true);
          injectGoogleFonts(fallbackDoc);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };"""
    content = content[:load_match.start()] + new_load + content[load_match.end():]
else:
    print("Could not find loadDesignFromAllSources!")

with open('src/hooks/useSyncedInvitationDesign.ts', 'w') as f:
    f.write(content)
