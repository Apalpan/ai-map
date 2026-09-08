import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import loginHandler from '../../../api/access/login';
import logoutHandler from '../../../api/access/logout';
import sessionHandler from '../../../api/access/session';
import {
  createSessionToken,
  getSessionCookie,
  secureCodeMatches,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type ApiRequestLike,
  type ApiResponseLike,
} from '../../../api/access/_session';

class MockResponse implements ApiResponseLike {
  statusCode = 200;
  headers = new Map<string, string | string[]>();
  body: unknown;

  status(statusCode: number): ApiResponseLike {
    this.statusCode = statusCode;
    return this;
  }

  setHeader(name: string, value: string | string[]): void {
    this.headers.set(name, value);
  }

  json(body: unknown): void {
    this.body = body;
  }

  end(): void {}
}

function createRequest(overrides: Partial<ApiRequestLike> = {}): ApiRequestLike {
  return { method: 'GET', headers: {}, ...overrides };
}

describe('GEN+ access session primitives', () => {
  const secret = 'test-session-secret-with-enough-entropy';
  const now = Date.UTC(2026, 8, 8, 12, 0, 0);

  it('creates and verifies a signed HMAC session with an eight-hour expiry', () => {
    const token = createSessionToken(secret, now);
    const result = verifySessionToken(token, secret, now + 1_000);

    expect(result.authenticated).toBe(true);
    if (result.authenticated) {
      expect(Date.parse(result.expiresAt)).toBe(now + SESSION_MAX_AGE_SECONDS * 1_000);
    }
  });

  it('rejects tampered and expired tokens', () => {
    const token = createSessionToken(secret, now);
    const [payload] = token.split('.');

    expect(verifySessionToken(`${payload}.invalid`, secret, now)).toEqual({
      authenticated: false,
      reason: 'invalid',
    });
    expect(verifySessionToken(token, secret, now + (SESSION_MAX_AGE_SECONDS + 1) * 1_000)).toEqual({
      authenticated: false,
      reason: 'expired',
    });
  });

  it('compares access codes without exposing their length to timingSafeEqual', () => {
    expect(secureCodeMatches('correct', 'correct')).toBe(true);
    expect(secureCodeMatches('wrong', 'correct')).toBe(false);
    expect(secureCodeMatches('', 'correct')).toBe(false);
  });

  it('issues the required hardened cookie attributes', () => {
    expect(getSessionCookie('signed-token')).toContain(
      `${SESSION_COOKIE_NAME}=signed-token; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800`
    );
  });
});

describe('GEN+ access API routes', () => {
  beforeEach(() => {
    process.env.GENBOT_ACCESS_CODE = 'test-only-code';
    process.env.GENBOT_SESSION_SECRET = 'test-session-secret-with-enough-entropy';
  });

  afterEach(() => {
    delete process.env.GENBOT_ACCESS_CODE;
    delete process.env.GENBOT_SESSION_SECRET;
  });

  it('rejects an invalid login and never returns a session cookie', () => {
    const response = new MockResponse();
    loginHandler(createRequest({ method: 'POST', body: { code: 'wrong' } }), response);

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ ok: false, error: 'invalid_access_code' });
    expect(response.headers.has('Set-Cookie')).toBe(false);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('creates a session and validates it through the session route', () => {
    const loginResponse = new MockResponse();
    loginHandler(
      createRequest({ method: 'POST', body: { code: 'test-only-code' } }),
      loginResponse
    );

    expect(loginResponse.statusCode).toBe(200);
    const setCookie = String(loginResponse.headers.get('Set-Cookie'));
    const cookiePair = setCookie.split(';')[0];

    const sessionResponse = new MockResponse();
    sessionHandler(
      createRequest({ method: 'GET', headers: { cookie: cookiePair } }),
      sessionResponse
    );
    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.body).toMatchObject({ authenticated: true });
  });

  it('clears the cookie on logout and rejects unsupported methods', () => {
    const logoutResponse = new MockResponse();
    logoutHandler(createRequest({ method: 'POST' }), logoutResponse);
    expect(logoutResponse.headers.get('Set-Cookie')).toContain('Max-Age=0');

    const methodResponse = new MockResponse();
    loginHandler(createRequest({ method: 'GET' }), methodResponse);
    expect(methodResponse.statusCode).toBe(405);
    expect(methodResponse.headers.get('Allow')).toBe('POST');
  });
});
