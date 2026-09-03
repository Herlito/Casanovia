import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

export interface LibraryItem {
  id: string;
  element: any;
  templateName: string;
  createdAt: number;
  savedBy?: string;
}

// Recursively sanitize objects so Firestore never rejects undefined values
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
      savedBy: 'Romina / Herly Lizarazo'
    };

    // Save in IndexedDB immediately for instant local availability
    try {
      const existing = (await idbGet<LibraryItem[]>('weddingcraft_library_cache')) || [];
      const updated = [item, ...existing.filter(i => i.id !== libraryId)];
      await idbSet('weddingcraft_library_cache', updated);
    } catch (idbErr) {
      console.warn('Could not save to IndexedDB cache:', idbErr);
    }

    // Save to Firestore
    try {
      await setDoc(doc(db, 'weddingcraft_library', libraryId), item);
    } catch (fireErr) {
      console.warn('Could not save to Firestore weddingcraft_library:', fireErr);
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

  // 2. From Firestore
  try {
    const snap = await getDocs(collection(db, 'weddingcraft_library'));
    snap.docs.forEach(d => {
      const data = d.data() as LibraryItem;
      itemsMap.set(d.id, { ...data, id: d.id });
    });
  } catch (e) {
    console.warn('Error reading Firestore weddingcraft_library', e);
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
  // Delete from Firestore
  try {
    await deleteDoc(doc(db, 'weddingcraft_library', id));
  } catch (e) {
    console.warn('Error deleting from Firestore', e);
  }

  // Delete from IndexedDB cache
  try {
    const cached = (await idbGet<LibraryItem[]>('weddingcraft_library_cache')) || [];
    const updated = cached.filter(i => i.id !== id);
    await idbSet('weddingcraft_library_cache', updated);
  } catch (e) {}
}
