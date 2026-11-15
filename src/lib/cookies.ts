// Utilities for parsing, normalizing, and exporting cookies that the user
// has exported from a browser they are already logged into.
//
// IMPORTANT: this module does pure, in-memory parsing only. It performs no
// network requests and no login. Nothing here sends credentials anywhere.

export interface NormalizedCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
  /** Unix timestamp in seconds. 0/undefined means a session cookie. */
  expires?: number;
}

export type CookieFormat = 'auto' | 'json' | 'netscape' | 'header';

/**
 * Key Google auth cookies that authenticated Google / Flow requests rely on.
 * Presence of a SID-family cookie indicates a logged-in session export.
 */
export const GOOGLE_AUTH_COOKIE_NAMES = [
  'SID',
  'HSID',
  'SSID',
  'APISID',
  'SAPISID',
  '__Secure-1PSID',
  '__Secure-3PSID',
  '__Secure-1PAPISID',
  '__Secure-3PAPISID',
];

export function detectFormat(raw: string): Exclude<CookieFormat, 'auto'> {
  const t = raw.trim();
  if (!t) return 'header';
  if (t.startsWith('[') || t.startsWith('{')) return 'json';
  if (/^#.*netscape/i.test(t) || t.includes('\t')) return 'netscape';
  return 'header';
}

function toUnixSeconds(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  // Values with 13+ digits are milliseconds; normalize to seconds.
  return n > 1e12 ? Math.floor(n / 1000) : Math.floor(n);
}

interface RawJsonCookie {
  name?: string;
  value?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  httponly?: boolean;
  sameSite?: string;
  samesite?: string;
  expires?: number | string;
  expirationDate?: number | string;
  expiry?: number | string;
}

export function parseJsonCookies(raw: string): NormalizedCookie[] {
  const data: unknown = JSON.parse(raw);
  let list: RawJsonCookie[];
  if (Array.isArray(data)) {
    list = data as RawJsonCookie[];
  } else if (data && typeof data === 'object' && Array.isArray((data as { cookies?: unknown }).cookies)) {
    list = (data as { cookies: RawJsonCookie[] }).cookies;
  } else {
    list = [data as RawJsonCookie];
  }
  return list
    .map((c): NormalizedCookie => ({
      name: String(c.name ?? ''),
      value: String(c.value ?? ''),
      domain: String(c.domain ?? ''),
      path: String(c.path ?? '/'),
      secure: Boolean(c.secure),
      httpOnly: Boolean(c.httpOnly ?? c.httponly),
      sameSite: c.sameSite ?? c.samesite,
      expires: toUnixSeconds(c.expires ?? c.expirationDate ?? c.expiry),
    }))
    .filter((c) => c.name);
}

export function parseNetscapeCookies(raw: string): NormalizedCookie[] {
  const out: NormalizedCookie[] = [];
  for (const lineRaw of raw.split(/\r?\n/)) {
    let line = lineRaw;
    let httpOnly = false;
    if (!line.trim()) continue;
    if (line.startsWith('#')) {
      // curl/yt-dlp mark httpOnly cookies with a "#HttpOnly_" prefix.
      if (/^#HttpOnly_/i.test(line)) {
        httpOnly = true;
        line = line.replace(/^#HttpOnly_/i, '');
      } else {
        continue; // ordinary comment line
      }
    }
    const parts = line.split('\t');
    if (parts.length < 7) continue;
    const [domain, , path, secure, expiry, name, ...valueParts] = parts;
    if (!name) continue;
    out.push({
      name,
      value: valueParts.join('\t'),
      domain,
      path: path || '/',
      secure: secure.toUpperCase() === 'TRUE',
      httpOnly,
      expires: toUnixSeconds(expiry),
    });
  }
  return out;
}

export function parseHeaderCookies(raw: string, domain = '.google.com'): NormalizedCookie[] {
  const out: NormalizedCookie[] = [];
  for (const pair of raw.split(/;\s*/)) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!name) continue;
    out.push({ name, value, domain, path: '/', secure: true, httpOnly: false });
  }
  return out;
}

export function parseCookies(raw: string, format: CookieFormat = 'auto'): NormalizedCookie[] {
  const fmt = format === 'auto' ? detectFormat(raw) : format;
  switch (fmt) {
    case 'json':
      return parseJsonCookies(raw);
    case 'netscape':
      return parseNetscapeCookies(raw);
    default:
      return parseHeaderCookies(raw);
  }
}

export function toHeaderString(cookies: NormalizedCookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

export function toJson(cookies: NormalizedCookie[]): string {
  return JSON.stringify(cookies, null, 2);
}

export function toNetscape(cookies: NormalizedCookie[]): string {
  let out = '# Netscape HTTP Cookie File\n';
  for (const c of cookies) {
    const line = [
      c.domain,
      c.domain.startsWith('.') ? 'TRUE' : 'FALSE',
      c.path || '/',
      c.secure ? 'TRUE' : 'FALSE',
      String(c.expires ?? 0),
      c.name,
      c.value,
    ].join('\t');
    out += (c.httpOnly ? '#HttpOnly_' : '') + line + '\n';
  }
  return out;
}

export interface AuthCheck {
  hasAuth: boolean;
  found: string[];
  missing: string[];
}

export function checkGoogleAuth(cookies: NormalizedCookie[]): AuthCheck {
  const names = new Set(cookies.map((c) => c.name));
  const found = GOOGLE_AUTH_COOKIE_NAMES.filter((n) => names.has(n));
  const missing = GOOGLE_AUTH_COOKIE_NAMES.filter((n) => !names.has(n));
  const hasAuth = found.some((n) => n === 'SID' || n.includes('PSID'));
  return { hasAuth, found, missing };
}

export function filterGoogle(cookies: NormalizedCookie[]): NormalizedCookie[] {
  return cookies.filter((c) => !c.domain || c.domain.toLowerCase().includes('google'));
}
