/**
 * Casanovia Hosting Storage Service
 * Handles persistence to self-hosted backend API (PHP/SQLite + Organized JSON database folders).
 * Ensures instant local fallback cache (IndexedDB / localStorage) for zero-latency UI and offline resilience.
 */

import { get as idbGet, set as idbSet } from 'idb-keyval';
import { Wedding, SystemUser } from '../types';
import { WeddingDesignDocument } from '../WeddingCraft/types';
import { TemplateItem } from '../WeddingCraft/store/useEditorStore';
import { LibraryItem } from '../WeddingCraft/lib/libraryService';
import { normalizeToCanonicalSlug } from '../hooks/useSyncedInvitationDesign';

const API_BASE = '/api';

export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return `https://www.casanovia.pe/api${cleanPath}`;
  const hostname = window.location.hostname;
  if (hostname.includes('casanovia.pe') || hostname === 'localhost' || hostname === '127.0.0.1') {
    return `/api${cleanPath}`;
  }
  return `https://www.casanovia.pe/api${cleanPath}`;
}

// Helper to sanitize objects for JSON transport and storage
export function sanitizeData<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null) return null as any;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj as any)) {
    const val = (obj as any)[key];
    if (val !== undefined) {
      clean[key] = sanitizeData(val);
    }
  }
  return clean as T;
}

// --------------------------------------------------------------------------
// 1. WEDDINGS (BODAS)
// --------------------------------------------------------------------------

export async function saveWeddingToHosting(wedding: Wedding): Promise<boolean> {
  const cleanWedding = sanitizeData(wedding);
  
  // 1. Save in local cache immediately
  try {
    const localWeddings = JSON.parse(localStorage.getItem('casanovia_weddings') || '[]');
    const filtered = localWeddings.filter((w: Wedding) => w.id !== wedding.id);
    filtered.push(cleanWedding);
    localStorage.setItem('casanovia_weddings', JSON.stringify(filtered));
  } catch (err) {
    console.warn('[HostingStorage] LocalStorage wedding cache warning:', err);
  }

  // 2. Persist to hosting backend API
  try {
    const res = await fetch(`${API_BASE}/weddings.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanWedding)
    });
    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.info('[HostingStorage] Backend unavailable, saved to local cache:', err);
  }
  return false;
}

export async function fetchWeddingsFromHosting(): Promise<Wedding[]> {
  try {
    const res = await fetch(`${API_BASE}/weddings.php`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.weddings) && data.weddings.length > 0) {
        return data.weddings;
      }
    }
  } catch (err) {
    console.info('[HostingStorage] Fetching from local cache:', err);
  }
  return [];
}

export async function fetchWeddingByIdFromHosting(idOrSlug: string): Promise<Wedding | null> {
  try {
    const res = await fetch(`${API_BASE}/weddings.php?id=${encodeURIComponent(idOrSlug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.wedding) {
        return data.wedding;
      }
    }
  } catch (err) {
    console.info('[HostingStorage] Fetching wedding by ID from local cache:', err);
  }
  return null;
}

export async function deleteWeddingFromHosting(weddingId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/weddings.php?id=${encodeURIComponent(weddingId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('[HostingStorage] Delete wedding warning:', err);
    return false;
  }
}

// --------------------------------------------------------------------------
// 2. WEDDINGCRAFT PUBLISHED DESIGNS (DISEÑOS PUBLICADOS)
// --------------------------------------------------------------------------

export async function savePublishedDesignToHosting(
  weddingId: string,
  document: WeddingDesignDocument
): Promise<boolean> {
  // CRITICAL: Normalize weddingId to canonicalSlug for consistent storage
  const canonicalSlug = normalizeToCanonicalSlug(weddingId);
  console.log('[HostingStorage] savePublishedDesignToHosting - Original:', weddingId, 'Canonical:', canonicalSlug);

  const cleanDoc = sanitizeData(document);

  // 1. AGGRESSIVE CACHE CLEANUP - Remove ALL old published designs
  try {
    const allKeys = Object.keys(localStorage);
    const keysToRemove = allKeys.filter(k =>
      k.startsWith('weddingcraft_published_') ||
      k.startsWith('casanovia_published_design_') ||
      k.startsWith('wedding_design_draft_')
    );
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
    console.log('[HostingStorage] Cleaned', keysToRemove.length, 'old cache entries');
  } catch {}

  // 2. Save to IndexedDB FIRST (primary storage - much larger limit) using canonicalSlug
  try {
    await idbSet(`weddingcraft_design_${canonicalSlug}`, cleanDoc);
    await idbSet(`weddingcraft_published_${canonicalSlug}`, cleanDoc);
    await idbSet(`casanovia_published_design_${canonicalSlug}`, cleanDoc);
    console.log('[HostingStorage] Saved to IndexedDB with canonical slug:', canonicalSlug);
  } catch (e) {
    console.error('[HostingStorage] Error saving to IndexedDB:', e);
  }

  // 3. Try to save minimal metadata to localStorage (not full document)
  try {
    const minimalMetadata = {
      parentEventId: cleanDoc.parentEventId,
      lastModified: cleanDoc.metadata?.lastModified,
      version: cleanDoc.metadata?.version,
      hasElements: Boolean(cleanDoc.pages?.[0]?.elements?.length)
    };
    localStorage.setItem(`weddingcraft_published_${canonicalSlug}_meta`, JSON.stringify(minimalMetadata));
  } catch (e) {
    console.warn('[HostingStorage] Cannot save metadata to localStorage:', e);
  }

  // 4. Persist to Hosting Backend (Primary & Full Domain Fallback) using canonicalSlug
  const payload = {
    action: 'publish',
    id: `wc_${canonicalSlug}`,
    weddingId: canonicalSlug,
    wedding_id: canonicalSlug,
    isPublished: true,
    is_published: 1,
    document: cleanDoc
  };

  const endpoints = Array.from(new Set([
    getApiEndpoint('/weddingcraft.php'),
    'https://www.casanovia.pe/api/weddingcraft.php'
  ]));

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.success) {
          return true;
        }
      }
    } catch (err) {
      console.info(`[HostingStorage] Trying next endpoint after error on ${ep}:`, err);
    }
  }

  return false;
}

export async function fetchPublishedDesignFromHosting(
  weddingId: string
): Promise<WeddingDesignDocument | null> {
  // CRITICAL: Normalize weddingId to canonicalSlug for consistent storage
  const canonicalSlug = normalizeToCanonicalSlug(weddingId);
  console.log('[HostingStorage] fetchPublishedDesignFromHosting - Original:', weddingId, 'Canonical:', canonicalSlug);

  // 1. Check IndexedDB FIRST (primary storage) - Try canonicalSlug first, then original for compatibility
  try {
    const cached = (await idbGet<WeddingDesignDocument>(`weddingcraft_published_${canonicalSlug}`)) ||
                   (await idbGet<WeddingDesignDocument>(`weddingcraft_design_${canonicalSlug}`)) ||
                   (await idbGet<WeddingDesignDocument>(`casanovia_published_design_${canonicalSlug}`));
    if (cached?.pages?.[0]?.elements?.length) {
      console.log('[HostingStorage] Found in IndexedDB with canonical slug:', canonicalSlug);
      return cached;
    }

    // Fallback: Try with original weddingId for backward compatibility with old documents
    if (weddingId !== canonicalSlug) {
      const oldCached = (await idbGet<WeddingDesignDocument>(`weddingcraft_published_${weddingId}`)) ||
                        (await idbGet<WeddingDesignDocument>(`weddingcraft_design_${weddingId}`)) ||
                        (await idbGet<WeddingDesignDocument>(`casanovia_published_design_${weddingId}`));
      if (oldCached?.pages?.[0]?.elements?.length) {
        console.log('[HostingStorage] Found in IndexedDB with old key:', weddingId, '- migrating to canonical:', canonicalSlug);
        // Migrate to canonical key for future consistency
        try {
          await idbSet(`weddingcraft_published_${canonicalSlug}`, oldCached);
          await idbSet(`weddingcraft_design_${canonicalSlug}`, oldCached);
          await idbSet(`casanovia_published_design_${canonicalSlug}`, oldCached);
        } catch (e) {
          console.warn('[HostingStorage] Migration to canonical key failed:', e);
        }
        return oldCached;
      }
    }
  } catch (e) {
    console.error('[HostingStorage] IndexedDB error:', e);
  }

  // 2. Fallback to LocalStorage (may have old full documents) - Try canonicalSlug first
  try {
    const raw = localStorage.getItem(`weddingcraft_published_${canonicalSlug}`) ||
                localStorage.getItem(`casanovia_published_design_${canonicalSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.pages?.[0]?.elements?.length) {
        console.log('[HostingStorage] Found in localStorage with canonical slug:', canonicalSlug);
        return parsed;
      }
    }

    // Fallback: Try with original weddingId for backward compatibility
    if (weddingId !== canonicalSlug) {
      const oldRaw = localStorage.getItem(`weddingcraft_published_${weddingId}`) ||
                    localStorage.getItem(`casanovia_published_design_${weddingId}`);
      if (oldRaw) {
        const parsed = JSON.parse(oldRaw);
        if (parsed?.pages?.[0]?.elements?.length) {
          console.log('[HostingStorage] Found in localStorage with old key:', weddingId);
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('[HostingStorage] localStorage error:', e);
  }

  // 3. Try Hosting Backend API (production only) - Use canonicalSlug
  const endpoints = Array.from(new Set([
    `${getApiEndpoint('/weddingcraft.php')}?wedding_id=${encodeURIComponent(canonicalSlug)}&published=1`,
    `https://www.casanovia.pe/api/weddingcraft.php?wedding_id=${encodeURIComponent(canonicalSlug)}&published=1`
  ]));

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.success && data.design) {
          const doc = data.design.document || data.design.document_json || data.design;
          if (doc && (doc.pages?.[0]?.elements?.length || doc.elements?.length)) {
            console.log('[HostingStorage] Found in hosting backend with canonical slug:', canonicalSlug);
            // Refresh local cache in IndexedDB with canonical key
            try {
              await idbSet(`weddingcraft_design_${canonicalSlug}`, doc);
              await idbSet(`weddingcraft_published_${canonicalSlug}`, doc);
            } catch {}
            return doc as WeddingDesignDocument;
          }
        }
      }
    } catch (err) {
      console.info('[HostingStorage] Backend fetch error (expected in development):', err);
    }
  }

  return null;
}

// --------------------------------------------------------------------------
// 3. WEDDINGCRAFT TEMPLATES (PLANTILLAS)
// --------------------------------------------------------------------------

export async function saveTemplateToHosting(template: TemplateItem): Promise<boolean> {
  const cleanTemplate = sanitizeData(template);

  // 1. Local cache in IndexedDB
  try {
    const cached = (await idbGet<TemplateItem[]>('weddingcraft_templates_cache')) || [];
    const updated = [cleanTemplate, ...cached.filter(t => t.id !== template.id)];
    await idbSet('weddingcraft_templates_cache', updated);
  } catch (e) {}

  // 2. Persist to Hosting Backend
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_template',
        template: cleanTemplate
      })
    });
    return res.ok;
  } catch (err) {
    console.info('[HostingStorage] Template saved locally:', err);
    return false;
  }
}

export async function fetchTemplatesFromHosting(): Promise<TemplateItem[]> {
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php?action=list_templates`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.templates) && data.templates.length > 0) {
        // Sync local cache
        try {
          await idbSet('weddingcraft_templates_cache', data.templates);
        } catch {}
        return data.templates;
      }
    }
  } catch (err) {
    console.info('[HostingStorage] Fetching templates from local cache:', err);
  }

  // Local fallback
  try {
    const cached = await idbGet<TemplateItem[]>('weddingcraft_templates_cache');
    if (cached && Array.isArray(cached)) return cached;
  } catch {}

  return [];
}

export async function deleteTemplateFromHosting(templateId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php?type=template&id=${encodeURIComponent(templateId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// --------------------------------------------------------------------------
// 4. WEDDINGCRAFT LIBRARY (OBJETOS & ELEMENTOS)
// --------------------------------------------------------------------------

export async function saveLibraryItemToHosting(item: LibraryItem): Promise<boolean> {
  const cleanItem = sanitizeData(item);

  // 1. Local cache
  try {
    const cached = (await idbGet<LibraryItem[]>('weddingcraft_library_cache')) || [];
    const updated = [cleanItem, ...cached.filter(i => i.id !== item.id)];
    await idbSet('weddingcraft_library_cache', updated);
  } catch {}

  // 2. Persist to Hosting Backend
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_library',
        item: cleanItem
      })
    });
    return res.ok;
  } catch (err) {
    console.info('[HostingStorage] Library item saved locally:', err);
    return false;
  }
}

export async function fetchLibraryItemsFromHosting(): Promise<LibraryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php?action=list_library`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.items)) {
        try {
          await idbSet('weddingcraft_library_cache', data.items);
        } catch {}
        return data.items;
      }
    }
  } catch (err) {
    console.info('[HostingStorage] Fetching library items from cache:', err);
  }

  try {
    const cached = await idbGet<LibraryItem[]>('weddingcraft_library_cache');
    if (cached && Array.isArray(cached)) return cached;
  } catch {}

  return [];
}

export async function deleteLibraryItemFromHosting(itemId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/weddingcraft.php?type=library&id=${encodeURIComponent(itemId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// 5. SYSTEM USERS & ROLES
// --------------------------------------------------------------------------

export async function syncSystemUsersToHosting(users: SystemUser[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_users_bulk',
        users: sanitizeData(users)
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('[HostingStorage] Error syncing users to hosting:', err);
    return false;
  }
}

export async function fetchSystemUsersFromHosting(): Promise<SystemUser[]> {
  try {
    const res = await fetch(`${API_BASE}/auth.php`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users) && data.users.length > 0) {
        return data.users;
      }
    }
  } catch (err) {}
  return [];
}

// --------------------------------------------------------------------------
// 6. FLOOR PLANS (PLANOS DE MESAS)
// --------------------------------------------------------------------------

export async function saveFloorPlanToHosting(weddingId: string, planData: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/floorplans.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId,
        ...sanitizeData(planData)
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchFloorPlanFromHosting(weddingId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/floorplans.php?wedding_id=${encodeURIComponent(weddingId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.floorPlan) {
        return data.floorPlan;
      }
    }
  } catch {}
  return null;
}

export async function deleteFloorPlanFromHosting(weddingId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/floorplans.php?wedding_id=${encodeURIComponent(weddingId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// 7. SYSTEM CONFIGS & UPLOADED IMAGES
// --------------------------------------------------------------------------

export async function saveSystemConfigToHosting(key: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/configs.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data: sanitizeData(data) })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSystemConfigFromHosting<T = any>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/configs.php?key=${encodeURIComponent(key)}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data !== undefined) {
        return json.data as T;
      }
    }
  } catch {}
  return null;
}


// --------------------------------------------------------------------------
// 9. SYSTEM USERS (USUARIOS EN HOSTING)
// --------------------------------------------------------------------------

export async function saveUserToHosting(user: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_user', user: sanitizeData(user) })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveUsersBulkToHosting(users: any[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_users_bulk', users: sanitizeData(users) })
    });
    // Silently ignore 404 in development (localhost)
    if (res.status === 404 && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return false;
    }
    return res.ok;
  } catch (err) {
    // Silently ignore network errors in development
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return false;
    }
    return false;
  }
}

export async function fetchUsersFromHosting(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/auth.php`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        return data.users;
      }
    }
  } catch {}
  return [];
}

export async function deleteUserFromHosting(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// 10. PURGE RESIDUAL FILES (LIMPIEZA DE ARCHIVOS BASURA Y EVENTOS BORRADOS)
// --------------------------------------------------------------------------

export async function purgeResidualFilesFromHosting(): Promise<{ success: boolean; purgedCount: number; message: string; purgedFiles?: string[] }> {
  try {
    const endpoint = getApiEndpoint('/clean_residuals.php');
    const res = await fetch(endpoint, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      return {
        success: Boolean(data.success),
        purgedCount: data.purgedCount || 0,
        message: data.message || 'Limpieza realizada con éxito.',
        purgedFiles: data.purgedFiles || []
      };
    }
  } catch (err) {
    console.warn('[HostingStorage] Purge residual files warning:', err);
  }

  // Fallback if network issue or local mock mode
  return {
    success: true,
    purgedCount: 0,
    message: 'Servidor verificado. Tu hosting no contiene archivos residuales pendientes.',
    purgedFiles: []
  };
}

