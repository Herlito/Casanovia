/**
 * sanitize.ts
 *
 * Central XSS sanitisation helpers for WeddingCraft.
 *
 * Everything that reaches the DOM from a remote/untrusted source (published
 * designs, shared templates, library items, exported documents, imported SVGs)
 * MUST go through this module first.
 *
 * Two layers of defence are used:
 *   1. `sanitizeSvgMarkup()`    - DOMParser based sanitisation for SVG payloads
 *                                (strips <script>, <foreignObject>, every on*
 *                                handler, javascript: URLs and external <use>).
 *   2. `sanitizeHtmlFragment()` - DOMPurify based sanitisation with an explicit
 *                                allow-list. When DOMPurify cannot run (SSR/edge
 *                                runtimes) it degrades to plain HTML escaping so
 *                                raw markup is never injected.
 */

import DOMPurify from 'dompurify';

/* -------------------------------------------------------------------------- */
/*                              Basic escapers                                */
/* -------------------------------------------------------------------------- */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapes a value so it can be safely interpolated into HTML text or into a
 * double/single quoted HTML attribute.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

/**
 * Escapes a value so it can be safely interpolated inside a JavaScript string
 * literal that lives inside an inline <script> block.
 *
 * `</script>` is neutralised as `<\/script>` (still valid JS, no longer able to
 * close the surrounding script element).
 */
export function escapeJs(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/<\//g, '<\\/');
}

/**
 * Removes every whitespace / control character from a URL-ish value.
 * `java\tscript:alert(1)` must not slip past the scheme validation.
 */
function stripUrlNoise(value: string): string {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 32 || code === 127) continue;
    out += value.charAt(i);
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*                                 URL safety                                 */
/* -------------------------------------------------------------------------- */

/**
 * Only these schemes may end up in an href/src attribute of an exported
 * document. Everything else (javascript:, vbscript:, file:, ...) is dropped.
 */
export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // In-page anchors (#rsvp-section) are safe and used by the canvas buttons.
  if (trimmed.startsWith('#')) return trimmed;

  // Images (data:image/...) and in-memory blobs are legitimate here.
  if (/^data:(image|audio|video|font)\/[a-z0-9.+-]+[;,]/i.test(trimmed)) return trimmed;
  if (/^blob:/i.test(trimmed)) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return null;
}

/** True when the given URL may be used inside an href/src attribute. */
export function isSafeUrl(value: unknown): boolean {
  return sanitizeUrl(value) !== null;
}

/**
 * Sanitises a media URL (`src` of an <img>, <audio>, ...).
 *
 * Allows absolute http/https URLs, `data:image/...` payloads, `blob:` URLs and
 * relative paths. Every other scheme (javascript:, vbscript:, data:text/...)
 * is rejected.
 */
export function sanitizeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^data:(image|audio|video|font)\/[a-z0-9.+-]+[;,]/i.test(trimmed)) return trimmed;
  if (/^blob:/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;

  // Relative URL (no scheme at all) - safe.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !trimmed.startsWith('//')) return trimmed;

  return null;
}

/**
 * Sanitises a link URL (`href` / `window.open` target).
 *
 * Allows absolute http/https URLs, `mailto:`/`tel:`, in-page anchors and
 * relative paths. Script protocols are rejected.
 */
export function sanitizeLinkUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('#')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  if (/^blob:/i.test(trimmed)) return trimmed;

  // Relative URL (no scheme at all) - safe.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !trimmed.startsWith('//')) return trimmed;

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              DOMPurify setup                               */
/* -------------------------------------------------------------------------- */

/** Tags that must never survive sanitisation. */
export const FORBIDDEN_HTML_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'base',
  'link',
  'meta',
  'noscript',
  'template',
  'frame',
  'frameset',
  'applet',
  'xmp',
  'plaintext',
  'foreignobject'
];

/** Explicit allow-list (HTML + safe SVG subset). */
export const ALLOWED_HTML_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col',
  'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
  'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
  'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'small', 'span',
  'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul', 'wbr',
  // Safe SVG subset
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'rect', 'text', 'tspan', 'textpath', 'defs', 'clippath', 'mask', 'marker',
  'lineargradient', 'radialgradient', 'stop', 'symbol', 'image', 'title',
  'desc', 'filter', 'fegaussianblur', 'feoffset', 'feblend', 'femerge',
  'fecolormatrix'
];

/** Attributes that are never allowed. */
export const FORBIDDEN_HTML_ATTRS = [
  'srcdoc',
  'formaction',
  'action',
  'ping',
  'http-equiv',
  'background'
];

const URI_ATTRIBUTES = ['href', 'xlink:href', 'src', 'srcset', 'data', 'poster'];

/** True when DOMPurify is usable in the current runtime. */
export function isDomPurifyAvailable(): boolean {
  try {
    return typeof DOMPurify !== 'undefined' && DOMPurify.isSupported === true;
  } catch {
    return false;
  }
}

let hooksInstalled = false;

function installHooks(): void {
  if (hooksInstalled) return;
  hooksInstalled = true;

  try {
    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      const attrName = String(data.attrName || '').toLowerCase();
      const attrValue = String(data.attrValue || '');

      // 1. Every on* event handler is forbidden.
      if (attrName.startsWith('on')) {
        data.keepAttr = false;
        return;
      }

      // 2. URL-ish attributes are scheme validated.
      if (URI_ATTRIBUTES.includes(attrName)) {
        const normalized = stripUrlNoise(attrValue).toLowerCase();
        const isSafe =
          normalized.startsWith('http://') ||
          normalized.startsWith('https://') ||
          normalized.startsWith('#') ||
          normalized.startsWith('mailto:') ||
          normalized.startsWith('tel:') ||
          normalized.startsWith('blob:') ||
          /^data:(image|audio|video|font)\/[a-z0-9.+-]+[;,]/.test(normalized);

        if (!isSafe) {
          data.keepAttr = false;
          return;
        }
      }

      // 3. `style` attributes may not smuggle javascript: URLs.
      if (attrName === 'style' && /javascript:|vbscript:|expression\s*\(/i.test(attrValue)) {
        data.keepAttr = false;
      }
    });

    DOMPurify.addHook('beforeSanitizeElements', (node) => {
      const el = node as Element;
      if (!el || typeof el.getAttribute !== 'function') return;
      const tag = el.tagName ? el.tagName.toLowerCase() : '';
      // <use> must only reference local fragments.
      if (tag === 'use') {
        const ref = el.getAttribute('href') || el.getAttribute('xlink:href') || '';
        if (!ref.trim().startsWith('#')) {
          el.parentNode?.removeChild(el);
        }
      }
    });
  } catch {
    /* hooks are best-effort, DOMPurify defaults already block the basics */
  }
}

/* -------------------------------------------------------------------------- */
/*                             HTML sanitisation                              */
/* -------------------------------------------------------------------------- */

/**
 * Sanitises an HTML fragment using DOMPurify with an explicit allow-list.
 *
 * If DOMPurify cannot run (SSR / edge / no DOM) the fragment is escaped
 * instead of being injected raw.
 */
export function sanitizeHtmlFragment(dirty: unknown): string {
  if (typeof dirty !== 'string' || !dirty) return '';

  if (!isDomPurifyAvailable()) {
    // No DOM available -> never inject raw markup.
    return escapeHtml(dirty);
  }

  installHooks();

  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ALLOWED_HTML_TAGS,
      FORBID_TAGS: FORBIDDEN_HTML_TAGS,
      FORBID_ATTR: FORBIDDEN_HTML_ATTRS,
      FORBID_CONTENTS: FORBIDDEN_HTML_TAGS,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      SANITIZE_DOM: true
    });
  } catch {
    return escapeHtml(dirty);
  }
}

/* -------------------------------------------------------------------------- */
/*                              SVG sanitisation                              */
/* -------------------------------------------------------------------------- */

/** SVG elements that can execute code or embed foreign documents. */
const FORBIDDEN_SVG_ELEMENTS = [
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'handler',
  'listener',
  'set',
  'animate',
  'animatetransform',
  'animatemotion',
  'audio',
  'video'
];

/**
 * Tags forbidden when sanitising SVG markup.
 *
 * Note: `style` is intentionally NOT forbidden here - a `<style>` block inside
 * an SVG is legitimate artwork. Its dangerous constructs (`@import`,
 * `javascript:`, `expression()`) are removed by the DOMParser pass instead.
 */
export const FORBIDDEN_SVG_TAGS = [
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'form',
  'base',
  'link',
  'meta',
  'handler',
  'listener',
  'set',
  'animate',
  'animatetransform',
  'animatemotion',
  'audio',
  'video'
];

/** Attributes that may carry a URL. */
const SVG_URL_ATTRIBUTES = [
  'href',
  'xlink:href',
  'src',
  'from',
  'to',
  'values',
  'begin',
  'end',
  'data',
  'style'
];

/**
 * True when the given text looks like an `<svg>` root element.
 */
export function isSvgMarkup(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^<svg[\s>]/i.test(trimmed) || /^<\?xml[\s\S]*?\?>\s*<svg[\s>]/i.test(trimmed);
}

function stripDangerousSvgNodes(root: Element): void {
  const all = Array.from(root.querySelectorAll('*'));

  for (const el of all) {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    // Remove forbidden elements (SVG uses foreignObject casing).
    if (FORBIDDEN_SVG_ELEMENTS.includes(tag)) {
      el.parentNode?.removeChild(el);
      continue;
    }

    // <style> blocks: drop the dangerous constructs, keep the rest.
    if (tag === 'style') {
      const css = el.textContent || '';
      if (/javascript:|vbscript:|expression\s*\(|@import/i.test(css)) {
        el.parentNode?.removeChild(el);
      } else {
        el.textContent = css.replace(/@import[^;]*;?/gi, '');
      }
      continue;
    }

    // <use> may only reference local fragments.
    if (tag === 'use') {
      const ref = el.getAttribute('href') || el.getAttribute('xlink:href') || '';
      if (!ref.trim().startsWith('#')) {
        el.parentNode?.removeChild(el);
        continue;
      }
    }

    // Remove every on* handler and every dangerous URL.
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (SVG_URL_ATTRIBUTES.includes(name)) {
        const normalized = stripUrlNoise(value).toLowerCase();
        const isLocalFragment = normalized.startsWith('#');
        const isSafeRemote = normalized.startsWith('http://') || normalized.startsWith('https://');
        const isSafeImage = /^data:image\/[a-z0-9.+-]+[;,]/.test(normalized);
        const isRelative = !/^[a-z][a-z0-9+.-]*:/.test(normalized) && !normalized.startsWith('//');
        const hasScriptScheme = /javascript:|vbscript:/.test(normalized);

        if (hasScriptScheme || (!isLocalFragment && !isSafeRemote && !isSafeImage && !isRelative)) {
          el.removeAttribute(attr.name);
        }
      }
    }
  }
}

/**
 * Regex based fallback used when DOMParser is unavailable or the payload
 * cannot be parsed as XML. Removes the same constructs as the DOMParser pass.
 */
export function stripDangerousSvgRegex(svgText: string): string {
  if (!svgText) return '';

  let out = svgText;

  // <script> blocks (paired and self closing).
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  out = out.replace(/<script\b[^>]*\/?>/gi, '');

  // <foreignObject> blocks - they embed arbitrary HTML.
  out = out.replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject\s*>/gi, '');
  out = out.replace(/<foreignObject\b[^>]*\/?>/gi, '');

  // <iframe>, <object>, <embed>, <handler>, <set>, <animate>, ...
  out = out.replace(/<(iframe|object|embed|handler|listener|set|animate|animateTransform|animateMotion)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  out = out.replace(/<(iframe|object|embed|handler|listener|set|animate|animateTransform|animateMotion)\b[^>]*\/?>/gi, '');

  // Every on* event handler attribute.
  out = out.replace(/\son[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g, '');

  // javascript: / vbscript: URLs in href / xlink:href / src / style.
  out = out.replace(
    /\s(?:xlink:href|href|src|style)\s*=\s*(?:"(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*'|(?:javascript|vbscript|data):[^\s>]+)/gi,
    ''
  );

  // <use> may only reference local fragments.
  out = out.replace(/<use\b[^>]*>/gi, (tag) => {
    const hrefMatch = tag.match(/\b(?:xlink:)?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!hrefMatch) return tag;
    const value = (hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? '').trim();
    return value.startsWith('#') ? tag : '';
  });

  return out;
}

/**
 * Sanitises an SVG payload.
 *
 * DOMParser is preferred: the payload is parsed as XML and re-serialised after
 * removing `<script>`, `<foreignObject>`, every `on*` attribute, `javascript:`
 * URLs and `<use>` references to external/data URIs. When DOMParser is not
 * available (or the payload is not parsable) the regex fallback is used.
 *
 * Returns an empty string when the payload is not usable SVG (the caller must
 * then render it as plain text instead of injecting it).
 */
export function sanitizeSvgContent(dirty: unknown): string {
  if (typeof dirty !== 'string') return '';
  const trimmed = dirty.trim();
  if (!trimmed) return '';
  if (!isSvgMarkup(trimmed)) return '';

  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    // No DOM -> fall back to the regex based sanitiser.
    return stripDangerousSvgRegex(trimmed);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'image/svg+xml');
    if (doc.querySelector('parsererror')) {
      return stripDangerousSvgRegex(trimmed);
    }

    const svgEl = doc.documentElement;
    if (!svgEl || svgEl.tagName.toLowerCase() !== 'svg') {
      return stripDangerousSvgRegex(trimmed);
    }

    stripDangerousSvgNodes(svgEl);

    // Guarantee the xmlns so the payload still renders when inlined.
    if (!svgEl.getAttribute('xmlns')) {
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const serialized = new XMLSerializer().serializeToString(svgEl);
    return serialized || stripDangerousSvgRegex(trimmed);
  } catch {
    return stripDangerousSvgRegex(trimmed);
  }
}

/**
 * Sanitises an SVG payload for safe inline injection into the DOM.
 *
 * Runs the DOMParser based sanitiser and then an additional DOMPurify pass
 * (when available) before the markup is handed to `dangerouslySetInnerHTML`.
 *
 * Returns an empty string when the payload is not usable SVG (the caller must
 * then render it as plain text instead of injecting it).
 */
export function sanitizeSvgMarkup(dirty: unknown): string {
  const serialized = sanitizeSvgContent(dirty);
  if (!serialized) return '';

  // Second, independent pass with DOMPurify when it is available.
  if (isDomPurifyAvailable()) {
    installHooks();
    try {
      const purified = DOMPurify.sanitize(serialized, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: FORBIDDEN_SVG_TAGS,
        FORBID_ATTR: FORBIDDEN_HTML_ATTRS,
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        SANITIZE_DOM: true
      });
      return typeof purified === 'string' ? purified : '';
    } catch {
      return '';
    }
  }

  return serialized;
}

/**
 * Sanitises a `data:image/svg+xml` URL by decoding, sanitising and re-encoding
 * the embedded SVG. Any other value is returned untouched.
 */
export function sanitizeSvgDataUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!/^data:image\/svg\+xml/i.test(trimmed)) return value;

  const commaIdx = trimmed.indexOf(',');
  if (commaIdx === -1) return null;

  const meta = trimmed.slice(0, commaIdx);
  const data = trimmed.slice(commaIdx + 1);

  let svgText = '';
  try {
    if (meta.includes(';base64')) {
      svgText = decodeURIComponent(escape(window.atob(data)));
    } else {
      svgText = decodeURIComponent(data);
    }
  } catch {
    return null;
  }

  const safe = sanitizeSvgContent(svgText);
  if (!safe) return null;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(safe);
}

/**
 * Sanitises a payload that may be either SVG markup or plain text.
 *
 * - SVG markup    -> sanitised SVG string (empty when unusable).
 * - anything else -> the raw text (safe to render as a React text node).
 */
export function sanitizeSvgOrText(
  dirty: unknown
): { kind: 'svg'; html: string } | { kind: 'text'; text: string } {
  if (typeof dirty !== 'string' || !dirty.trim()) {
    return { kind: 'text', text: '' };
  }
  if (!isSvgMarkup(dirty)) {
    return { kind: 'text', text: dirty };
  }
  const safe = sanitizeSvgMarkup(dirty);
  if (!safe) {
    return { kind: 'text', text: dirty };
  }
  return { kind: 'svg', html: safe };
}
