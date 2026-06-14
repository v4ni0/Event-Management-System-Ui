// Base64URL-decode the JWT payload. Returns null on any malformed token.
// We avoid pulling in jwt-decode just for this — the prompt allows either.
export interface JwtPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  role?: string;
  [k: string]: unknown;
}

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const json =
      typeof atob === 'function'
        ? decodeURIComponent(
            atob(b64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''),
          )
        : Buffer.from(b64, 'base64').toString('utf-8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string | null | undefined): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // exp is seconds since epoch
  return payload.exp * 1000 < Date.now();
}
