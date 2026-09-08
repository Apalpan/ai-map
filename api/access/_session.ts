import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = '__Host-ai_map_session';
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

interface SessionPayload {
  v: 1;
  iat: number;
  exp: number;
}

export interface ApiRequestLike {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponseLike {
  status: (statusCode: number) => ApiResponseLike;
  setHeader: (name: string, value: string | string[]) => void;
  json: (body: unknown) => void;
  end: () => void;
}

export type SessionVerification =
  | { authenticated: true; expiresAt: string }
  | { authenticated: false; reason: 'missing' | 'expired' | 'invalid' };

function encodeBase64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

function decodePayload(encodedPayload: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<SessionPayload>;
    if (parsed.v !== 1 || !Number.isSafeInteger(parsed.iat) || !Number.isSafeInteger(parsed.exp)) {
      return null;
    }

    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;

  for (const segment of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = segment.trim().split('=');
    if (rawName === name) {
      return rawValue.join('=') || null;
    }
  }

  return null;
}

export function secureCodeMatches(candidate: string, expected: string): boolean {
  const candidateDigest = createHash('sha256').update(candidate, 'utf8').digest();
  const expectedDigest = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export function createSessionToken(secret: string, nowMs = Date.now()): string {
  const issuedAt = Math.floor(nowMs / 1000);
  const payload: SessionPayload = {
    v: 1,
    iat: issuedAt,
    exp: issuedAt + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const encodedSignature = signPayload(encodedPayload, secret).toString('base64url');
  return `${encodedPayload}.${encodedSignature}`;
}

export function verifySessionToken(
  token: string | null,
  secret: string,
  nowMs = Date.now()
): SessionVerification {
  if (!token) return { authenticated: false, reason: 'missing' };

  const [encodedPayload, encodedSignature, extra] = token.split('.');
  if (!encodedPayload || !encodedSignature || extra) {
    return { authenticated: false, reason: 'invalid' };
  }

  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(encodedSignature, 'base64url');
  } catch {
    return { authenticated: false, reason: 'invalid' };
  }

  const expectedSignature = signPayload(encodedPayload, secret);
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return { authenticated: false, reason: 'invalid' };
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) return { authenticated: false, reason: 'invalid' };

  const nowSeconds = Math.floor(nowMs / 1000);
  if (payload.exp <= nowSeconds) {
    return { authenticated: false, reason: 'expired' };
  }

  if (payload.iat > nowSeconds + 60) {
    return { authenticated: false, reason: 'invalid' };
  }

  return { authenticated: true, expiresAt: new Date(payload.exp * 1000).toISOString() };
}

export function verifyRequestSession(
  request: ApiRequestLike,
  secret: string,
  nowMs = Date.now()
): SessionVerification {
  const rawCookie = request.headers.cookie;
  const cookieHeader = Array.isArray(rawCookie) ? rawCookie.join(';') : rawCookie;
  return verifySessionToken(readCookie(cookieHeader, SESSION_COOKIE_NAME), secret, nowMs);
}

export function getSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function getExpiredSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function setPrivateNoStore(response: ApiResponseLike): void {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Vary', 'Cookie');
}

export function rejectUnsupportedMethod(response: ApiResponseLike, allow: string): void {
  response.setHeader('Allow', allow);
  response.status(405).json({ ok: false, error: 'method_not_allowed' });
}

export function getStringBodyField(body: unknown, fieldName: string): string | null {
  let parsedBody = body;
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (!parsedBody || typeof parsedBody !== 'object') return null;
  const value = (parsedBody as Record<string, unknown>)[fieldName];
  return typeof value === 'string' ? value : null;
}
