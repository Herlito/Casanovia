import { get as idbGet, set as idbSet } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import {
  saveLibraryItemToHosting,
  fetchLibraryItemsFromHosting,
  deleteLibraryItemFromHosting
} from '../../services/hostingStorage';

export interface LibraryItem {
  id: string;
  element: any;
  templateName: string;
  createdAt: number;
  savedBy?: string;
}

// Recursively sanitize objects so JSON & DB never have undefined or non-serializable fields
export function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

export async function saveElementToLibrary(element: any, folderName = 'Objetos Pegados (Ctrl+V)'): Promise<LibraryItem | null> {
  try {
    const libraryId = uuidv4();
    const cleanElement = sanitizeForFirestore(element);
    const item: LibraryItem = {
      id: libraryId,
      element: cleanElement,
      templateName: folderName,
      createdAt: Date.now(),
      savedBy: 'WeddingCraft Studio'
    };

    // Save in IndexedDB immediately for instant local UI responsiveness
    try {
      const existing = (await idbGet<LibraryItem[]>('weddingcraft_library_cache')) || [];
      const updated = [item, ...existing.filter(i => i.id !== libraryId)];
      await idbSet('weddingcraft_library_cache', updated);
    } catch (idbErr) {
      console.warn('Could not save to IndexedDB cache:', idbErr);
    }

    // Persist to Hosting Backend (api/data/weddingcraft/library/)
    try {
      await saveLibraryItemToHosting(item);
    } catch (err) {
      console.warn('Could not save to hosting storage:', err);
    }

    return item;
  } catch (err) {
    console.error('Error saving element to library:', err);
    return null;
  }
}

export async function fetchAllLibraryItems(): Promise<LibraryItem[]> {
  const itemsMap = new Map<string, LibraryItem>();

  // 1. From IndexedDB cache
  try {
    const cached = await idbGet<LibraryItem[]>('weddingcraft_library_cache');
    if (cached && Array.isArray(cached)) {
      cached.forEach(item => itemsMap.set(item.id, item));
    }
  } catch (e) {
    console.warn('Error reading idb library cache', e);
  }

  // 2. From Hosting Backend API (api/data/weddingcraft/library/)
  try {
    const remoteItems = await fetchLibraryItemsFromHosting();
    if (remoteItems && Array.isArray(remoteItems)) {
      remoteItems.forEach(item => itemsMap.set(item.id, item));
    }
  } catch (e) {
    console.warn('Error reading from hosting storage', e);
  }

  const result = Array.from(itemsMap.values());
  result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Refresh IDB cache
  try {
    await idbSet('weddingcraft_library_cache', result);
  } catch (e) {}

  return result;
}

export async function deleteLibraryItem(id: string): Promise<void> {
  // Delete from Hosting Backend
  try {
    await deleteLibraryItemFromHosting(id);
  } catch (e) {
    console.warn('Error deleting from hosting storage', e);
  }

  // Delete from IndexedDB cache
  try {
    const cached = (await idbGet<LibraryItem[]>('weddingcraft_library_cache')) || [];
    const updated = cached.filter(i => i.id !== id);
    await idbSet('weddingcraft_library_cache', updated);
  } catch (e) {}
}
