import { API_BASE } from "./config";

/**
 * Unified HTTP client for {BASE_URL}/api/vendor.
 * - Always sends Accept: application/json and Authorization: Bearer <token>.
 * - Unwraps the { success, message, data } envelope.
 * - On 401: tries POST /auth/refresh once (single-flight), retries, otherwise logs out.
 * - Errors are thrown as ApiError carrying the server `message` (and `errors` for 422).
 */

const TOKEN_KEY = "ez.vendor.token";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  /** true when the request never reached the server (offline / DNS / CORS). */
  network: boolean;

  constructor(message: string, status = 0, errors?: Record<string, string[]>, network = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.network = network;
  }

  /** First validation message, falling back to the envelope message. */
  get firstError(): string {
    const first = this.errors ? Object.values(this.errors)[0]?.[0] : undefined;
    return first ?? this.message;
  }
}

/* ---------- token storage ---------- */

let memoryToken: string | null = null;

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window === "undefined") return null;
  try {
    memoryToken = window.localStorage.getItem(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export function setToken(token: string | null) {
  memoryToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — keep in memory only */
  }
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Called when the session can't be recovered (refresh failed) — AuthProvider redirects to /login. */
export function onUnauthorized(fn: Listener) {
  unauthorizedListeners.add(fn);
  return () => {
    unauthorizedListeners.delete(fn);
  };
}

/* ---------- core request ---------- */

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Return the raw Response (used for CSV blobs). */
  raw?: boolean;
  /** Internal: don't attempt refresh (auth routes / retry). */
  noRefresh?: boolean;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

let refreshing: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const json = await res.json();
    const next = json?.data?.token as string | undefined;
    if (!next) return false;
    setToken(next);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body; // browser sets the multipart boundary
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), { method, headers, body });
  } catch {
    throw new ApiError("Network error", 0, undefined, true);
  }

  if (res.status === 401 && !opts.noRefresh && !path.startsWith("/auth/")) {
    refreshing ??= refreshToken().finally(() => {
      refreshing = null;
    });
    if (await refreshing) return request<T>(method, path, { ...opts, noRefresh: true });
    setToken(null);
    unauthorizedListeners.forEach((fn) => fn());
    throw new ApiError(await readMessage(res, "Unauthenticated."), 401);
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    let errors: Record<string, string[]> | undefined;
    try {
      const json = await res.json();
      message = json?.message ?? message;
      errors = json?.errors;
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(message, res.status, errors);
  }

  if (opts.raw) return res as unknown as T;
  if (res.status === 204) return undefined as T;
  const json = await res.json();
  return json?.data as T;
}

async function readMessage(res: Response, fallback: string) {
  try {
    const json = await res.json();
    return json?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  del: <T>(path: string, body?: unknown) => request<T>("DELETE", path, { body }),

  /** GET a file (CSV) with the auth header and trigger a browser download. */
  async download(path: string, query: Query | undefined, fallbackName: string) {
    const res = await request<Response>("GET", path, { query, raw: true });
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") ?? "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    const name = match ? decodeURIComponent(match[1]) : fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

/* ---------- multipart helper ---------- */

/**
 * Serialises a nested payload into Laravel-style multipart keys:
 * name[ar]=..., addons[0][name][en]=..., is_available=1
 */
export function toFormData(
  payload: Record<string, unknown>,
  form = new FormData(),
  prefix = "",
): FormData {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    const field = prefix ? `${prefix}[${key}]` : key;
    if (value instanceof File || value instanceof Blob) {
      form.append(field, value);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v !== null && typeof v === "object" && !(v instanceof Blob)) {
          toFormData(v as Record<string, unknown>, form, `${field}[${i}]`);
        } else {
          form.append(`${field}[${i}]`, formValue(v));
        }
      });
    } else if (value !== null && typeof value === "object") {
      toFormData(value as Record<string, unknown>, form, field);
    } else {
      form.append(field, formValue(value));
    }
  }
  return form;
}

function formValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v === null) return "";
  return String(v);
}
