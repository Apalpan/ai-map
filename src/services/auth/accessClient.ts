export type SessionFailureReason = 'missing' | 'expired' | 'invalid' | 'not_configured';

export type AccessSessionResult =
  | { authenticated: true; expiresAt?: string }
  | { authenticated: false; reason: SessionFailureReason };

export class AccessRequestError extends Error {
  constructor(
    public readonly code: 'offline' | 'invalid_code' | 'not_configured' | 'server_error',
    message: string
  ) {
    super(message);
    this.name = 'AccessRequestError';
  }
}

async function requestJson(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new AccessRequestError(
      'offline',
      'No pudimos conectar con el acceso seguro. Revisa tu conexión e inténtalo otra vez.'
    );
  }
}

export async function getAccessSession(signal?: AbortSignal): Promise<AccessSessionResult> {
  const response = await requestJson('/api/access/session', { method: 'GET', signal });
  if (response.status === 503) {
    throw new AccessRequestError(
      'not_configured',
      'El acceso GEN+ todavía no está configurado en este entorno.'
    );
  }
  if (!response.ok) {
    throw new AccessRequestError('server_error', 'No pudimos verificar la sesión segura.');
  }

  return (await response.json()) as AccessSessionResult;
}

export async function submitAccessCode(code: string): Promise<void> {
  const response = await requestJson('/api/access/login', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (response.status === 401) {
    throw new AccessRequestError('invalid_code', 'La clave de acceso no es correcta.');
  }
  if (response.status === 503) {
    throw new AccessRequestError(
      'not_configured',
      'El acceso GEN+ todavía no está configurado en este entorno.'
    );
  }
  if (!response.ok) {
    throw new AccessRequestError(
      'server_error',
      'No pudimos iniciar la sesión. Inténtalo otra vez.'
    );
  }
}

export async function endAccessSession(): Promise<void> {
  const response = await requestJson('/api/access/logout', { method: 'POST' });
  if (!response.ok) {
    throw new AccessRequestError('server_error', 'No pudimos cerrar la sesión de forma segura.');
  }
}
