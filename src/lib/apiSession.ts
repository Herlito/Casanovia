/**
 * Casanovia API session client.
 *
 * El backend PHP usa una sesión de servidor (cookie `CASANOVIASESSID`,
 * HttpOnly + SameSite=Strict) y un token CSRF por sesión. Todas las peticiones
 * mutantes deben enviarse con `credentials: 'include'` y la cabecera
 * `X-CSRF-Token`; de lo contrario el servidor responde 401/403.
 */

const CSRF_STORAGE_KEY = 'casanovia_csrf_token';

let csrfToken: string | null = null;
let authErrorHandler: ((status: number, payload: any) => void) | null = null;

export class ApiAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiAuthError';
    this.status = status;
  }
}

export function getCsrfToken(): string | null {
  if (csrfToken) return csrfToken;
  try {
    csrfToken = sessionStorage.getItem(CSRF_STORAGE_KEY);
  } catch {
    csrfToken = null;
  }
  return csrfToken;
}

export function setCsrfToken(token?: string | null): void {
  csrfToken = token || null;
  try {
    if (token) sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    else sessionStorage.removeItem(CSRF_STORAGE_KEY);
  } catch {
    // sessionStorage puede estar bloqueado: el token vive solo en memoria
  }
}

/** Registra un callback que se dispara cuando el servidor rechaza la sesión. */
export function onApiAuthError(handler: ((status: number, payload: any) => void) | null): void {
  authErrorHandler = handler;
}

/**
 * Resuelve la URL del backend: mismo origen cuando es posible,
 * host absoluto `www.casanovia.pe` como fallback.
 */
export function resolveApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return `https://www.casanovia.pe/api${cleanPath}`;
  const hostname = window.location.hostname;
  if (hostname.includes('casanovia.pe') || hostname === 'localhost' || hostname === '127.0.0.1') {
    return `/api${cleanPath}`;
  }
  return `https://www.casanovia.pe/api${cleanPath}`;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function readJsonSafe(res: Response): Promise<any> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function refreshCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch(resolveApiUrl('/auth.php?action=me'), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.csrfToken) {
      setCsrfToken(data.csrfToken);
      return data.csrfToken as string;
    }
  } catch {
    // sin backend disponible
  }
  return null;
}

/**
 * Fetch autenticado contra la API del hosting.
 * - Envía la cookie de sesión (`credentials: 'include'`).
 * - Añade `X-CSRF-Token` en POST/PUT/PATCH/DELETE.
 * - Ante un 403 por CSRF obsoleto, refresca el token y reintenta una vez.
 * - Ante 401/403 definitiva notifica a la app para cerrar la sesión.
 */
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = MUTATING_METHODS.has(method);
  const isRetry = Boolean((options as any).__casanoviaRetry);

  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (isMutation) {
    const token = getCsrfToken();
    if (token) headers.set('X-CSRF-Token', token);
  }

  const res = await fetch(path, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    setCsrfToken(null);
    const payload = await readJsonSafe(res);
    authErrorHandler?.(401, payload);
    throw new ApiAuthError(401, payload?.error || 'No autenticado.');
  }

  if (res.status === 403) {
    const payload = await readJsonSafe(res);
    const message = payload?.error || 'Permisos insuficientes.';
    if (/csrf/i.test(message) && !isRetry) {
      const fresh = await refreshCsrfToken();
      if (fresh) {
        return apiFetch<T>(path, { ...options, __casanoviaRetry: true } as RequestInit);
      }
    }
    authErrorHandler?.(403, payload);
    throw new ApiAuthError(403, message);
  }

  const data = await readJsonSafe(res);

  if (!res.ok) {
    throw new ApiAuthError(res.status, data?.error || `HTTP error ${res.status}`);
  }

  return data as T;
}

// --------------------------------------------------------------------------
// Autenticación contra el servidor
// --------------------------------------------------------------------------

export interface ServerAuthUser {
  id: string;
  username: string;
  level: number;
  roleTitle?: string;
  assignedWeddingIds?: string[];
  createdWeddingIds?: string[];
  isSystemDefault?: boolean;
  createdAt?: string;
}

export interface ServerLoginResult {
  success: boolean;
  user?: ServerAuthUser;
  csrfToken?: string;
  error?: string;
  /** `true` cuando el servidor respondió (credenciales evaluadas en el backend). */
  serverResponded: boolean;
}

/**
 * Intenta autenticar contra `POST /api/auth.php`.
 * Si el backend no está disponible devuelve `serverResponded: false` para que
 * el llamador pueda aplicar el modo local (demo / offline).
 */
export async function loginToServer(username: string, clave: string): Promise<ServerLoginResult> {
  try {
    const res = await fetch(resolveApiUrl('/auth.php'), {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, clave }),
    });
    const data = await readJsonSafe(res);
    if (data?.success && data.user) {
      setCsrfToken(data.csrfToken || null);
      return { success: true, user: data.user, csrfToken: data.csrfToken, serverResponded: true };
    }
    // El servidor respondió: las credenciales son inválidas en el backend.
    setCsrfToken(null);
    return {
      success: false,
      error: data?.error || 'Credenciales no válidas.',
      serverResponded: true,
    };
  } catch {
    // Backend inaccesible: permitimos el fallback local.
    return { success: false, error: 'Backend no disponible.', serverResponded: false };
  }
}

/** Cierra la sesión en el servidor (idempotente). */
export async function logoutFromServer(): Promise<void> {
  try {
    await fetch(resolveApiUrl('/auth.php'), {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
  } catch {
    // si el backend no responde, la sesión local se limpia igualmente
  } finally {
    setCsrfToken(null);
  }
}

/** Recupera la sesión activa del servidor (`GET /api/auth.php?action=me`). */
export async function fetchServerSession(): Promise<ServerLoginResult> {
  try {
    const res = await fetch(resolveApiUrl('/auth.php?action=me'), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    const data = await readJsonSafe(res);
    if (res.ok && data?.success && data.user) {
      setCsrfToken(data.csrfToken || null);
      return { success: true, user: data.user, csrfToken: data.csrfToken, serverResponded: true };
    }
    return { success: false, error: data?.error || 'No autenticado.', serverResponded: true };
  } catch {
    return { success: false, error: 'Backend no disponible.', serverResponded: false };
  }
}
