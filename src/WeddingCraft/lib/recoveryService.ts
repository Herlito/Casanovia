import { get as idbGet, set as idbSet } from 'idb-keyval';
import { TemplateItem, useEditorStore } from '../store/useEditorStore';
import { RESTORED_MASTER_TEMPLATES } from '../data/masterTemplates';
import { WeddingDesignDocument } from '../types';
import { fetchTemplatesFromHosting, saveTemplateToHosting } from '../../services/hostingStorage';
import { normalizeCanvasDocument } from './canvasElementUtils';
import { generateDocumentSquareThumbnail } from './templateThumbnail';

export interface RecoveryResult {
  totalRestored: number;
  templatesCount: number;
  publishedCount: number;
  draftsCount: number;
  items: Array<{ name: string; type: 'template' | 'published' | 'draft'; id: string }>;
}

/**
 * Recovers all known WeddingCraft designs from Firestore, IndexedDB, localStorage, and master presets.
 */
export async function recoverAllWeddingCraftDesigns(): Promise<RecoveryResult> {
  const recoveredMap = new Map<string, TemplateItem>();
  const items: Array<{ name: string; type: 'template' | 'published' | 'draft'; id: string }> = [];

  // 1. Seed with Master Templates
  RESTORED_MASTER_TEMPLATES.forEach(t => {
    recoveredMap.set(t.id, t);
    items.push({ name: t.name, type: 'template', id: t.id });
  });

  // 2. Scan IndexedDB for 'wedding_craft_templates'
  try {
    const idbTemplates = (await idbGet<TemplateItem[]>('wedding_craft_templates')) || [];
    idbTemplates.forEach(t => {
      if (t && t.id && t.document) {
        recoveredMap.set(t.id, t);
        if (!items.some(i => i.id === t.id)) {
          items.push({ name: t.name || 'Plantilla Local', type: 'template', id: t.id });
        }
      }
    });
  } catch (err) {
    console.warn('[WeddingCraft Recovery] Error reading IndexedDB templates:', err);
  }

  // 3. Scan LocalStorage for backup templates
  try {
    const backupStr = localStorage.getItem('weddingcraft_templates_backup');
    if (backupStr) {
      const parsed = JSON.parse(backupStr);
      if (Array.isArray(parsed)) {
        parsed.forEach((t: TemplateItem) => {
          if (t && t.id && t.document) {
            recoveredMap.set(t.id, t);
            if (!items.some(i => i.id === t.id)) {
              items.push({ name: t.name || 'Plantilla Respaldada', type: 'template', id: t.id });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('[WeddingCraft Recovery] Error reading localStorage backup:', err);
  }

  // 4. Scan all localStorage keys for published invitations and drafts
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Published designs
      if (key.startsWith('weddingcraft_published_')) {
        const eventId = key.replace('weddingcraft_published_', '');
        try {
          const content = JSON.parse(localStorage.getItem(key) || '{}');
          if (content && content.pages) {
            const templateId = `recovered-pub-${eventId}`;
            const coupleNames = content.pages?.[0]?.elements?.find((e: any) => e.dataBinding?.field === 'coupleNames')?.content?.text || eventId;
            const t: TemplateItem = {
              id: templateId,
              name: `Publicado: ${coupleNames}`,
              author: 'WeddingCraft Publicado',
              document: content,
              updatedAt: Date.now()
            };
            recoveredMap.set(templateId, t);
            items.push({ name: t.name, type: 'published', id: templateId });
          }
        } catch {}
      }

      // Draft designs
      if (key.startsWith('wedding_design_draft_')) {
        const eventId = key.replace('wedding_design_draft_', '');
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const content = typeof raw === 'string' && raw.startsWith('{') ? JSON.parse(raw) : raw;
            if (content && content.pages) {
              const templateId = `recovered-draft-${eventId}`;
              const coupleNames = content.pages?.[0]?.elements?.find((e: any) => e.dataBinding?.field === 'coupleNames')?.content?.text || eventId;
              const t: TemplateItem = {
                id: templateId,
                name: `Borrador: ${coupleNames}`,
                author: 'Borrador Local',
                document: content,
                updatedAt: Date.now()
              };
              recoveredMap.set(templateId, t);
              items.push({ name: t.name, type: 'draft', id: templateId });
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[WeddingCraft Recovery] Error scanning localStorage keys:', err);
  }

  // 5. Fetch remote templates from Hosting Backend (api/data/weddingcraft/templates/)
  try {
    const remoteTemplates = await fetchTemplatesFromHosting();
    if (remoteTemplates && Array.isArray(remoteTemplates)) {
      remoteTemplates.forEach(t => {
        if (t && t.id && t.document) {
          recoveredMap.set(t.id, t);
          if (!items.some(i => i.id === t.id)) {
            items.push({ name: t.name || t.id, type: 'template', id: t.id });
          }
        }
      });
    }
  } catch (hostErr) {
    console.info('[WeddingCraft Recovery] Hosting backend scan info:', hostErr);
  }

  const mergedList = Array.from(recoveredMap.values()).sort(
    (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
  );

  // Update store and persist locally
  useEditorStore.getState().loadTemplates(mergedList);
  try {
    await idbSet('wedding_craft_templates', mergedList);
    localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(mergedList));
  } catch {}

  const templatesCount = items.filter(i => i.type === 'template').length;
  const publishedCount = items.filter(i => i.type === 'published').length;
  const draftsCount = items.filter(i => i.type === 'draft').length;

  return {
    totalRestored: mergedList.length,
    templatesCount,
    publishedCount,
    draftsCount,
    items
  };
}

/**
 * Exports all WeddingCraft designs to a JSON file.
 */
export function exportWeddingCraftDesignsJson(): void {
  const templates = useEditorStore.getState().templates;
  const exportData = {
    app: 'Casanovia WeddingCraft Studio',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    templatesCount: templates.length,
    templates
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weddingcraft-disenos-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports WeddingCraft designs from a JSON file and persists them to the casanovia.pe hosting.
 */
export async function importWeddingCraftDesignsJson(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const rawImported: any[] = Array.isArray(data) ? data : data.templates || [];

    if (!Array.isArray(rawImported) || rawImported.length === 0) {
      return { success: false, count: 0, error: 'El archivo JSON no contiene plantillas válidas de WeddingCraft.' };
    }

    const current = useEditorStore.getState().templates;
    const map = new Map<string, TemplateItem>();
    current.forEach(t => map.set(t.id, t));

    const validImported: TemplateItem[] = [];

    for (const item of rawImported) {
      if (!item || !item.id || !item.document) continue;
      const normalizedDoc = normalizeCanvasDocument(item.document);
      let thumb = item.thumbnail || '';
      if (!thumb) {
        try {
          thumb = generateDocumentSquareThumbnail(normalizedDoc, 320);
        } catch (e) {}
      }

      const cleanItem: TemplateItem = {
        id: String(item.id),
        name: item.name || 'Plantilla Importada',
        document: normalizedDoc,
        author: item.author || 'Importado',
        thumbnail: thumb,
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now()
      };

      map.set(cleanItem.id, cleanItem);
      validImported.push(cleanItem);

      // Persist to hosting backend of casanovia.pe (SQLite + /api/data/weddingcraft/templates/)
      try {
        await saveTemplateToHosting(cleanItem);
      } catch (hostErr) {
        console.warn(`[RecoveryService] Error al guardar plantilla ${cleanItem.id} en hosting:`, hostErr);
      }
    }

    if (validImported.length === 0) {
      return { success: false, count: 0, error: 'No se encontraron plantillas con estructura válida en el archivo JSON.' };
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
    );

    useEditorStore.getState().loadTemplates(merged);
    await idbSet('wedding_craft_templates', merged);
    localStorage.setItem('weddingcraft_templates_backup', JSON.stringify(merged));

    return { success: true, count: validImported.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Error importando archivo JSON.' };
  }
}
