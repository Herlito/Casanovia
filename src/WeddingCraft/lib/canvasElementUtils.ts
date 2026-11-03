export function normalizeCanvasDocument(doc: any) {
  if (!doc) return doc;
  // Ensure document has required structure
  if (!doc.pages) doc.pages = [];
  if (!doc.canvas) doc.canvas = { width: 720, height: 980, backgroundColor: '#EBEBEB' };
  if (!doc.metadata) doc.metadata = { createdAt: Date.now(), lastModified: Date.now(), version: '1.0.0' };
  return doc;
}

export function normalizeCanvasElement(el: any) {
  if (!el) return el;
  // Ensure element has required structure
  if (!el.id) el.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (!el.transform) el.transform = { x: 0, y: 0, width: 100, height: 100, rotation: 0, scaleX: 1, scaleY: 1 };
  if (!el.style) el.style = {};
  if (!el.content) el.content = {};
  if (el.zIndex === undefined) el.zIndex = 1;
  if (el.visible === undefined) el.visible = true;
  if (el.locked === undefined) el.locked = false;
  return el;
}

export function isValidDraftDocument(doc: any) {
  if (!doc) return false;
  if (!doc.pages || !Array.isArray(doc.pages) || doc.pages.length === 0) return false;
  if (!doc.canvas) return false;
  if (!doc.pages[0].elements || !Array.isArray(doc.pages[0].elements)) return false;
  return true;
}
