import type { ApiRequestLike, ApiResponseLike } from './_session.js';
import {
  getExpiredSessionCookie,
  rejectUnsupportedMethod,
  setPrivateNoStore,
  verifyRequestSession,
} from './_session.js';

export default function handler(request: ApiRequestLike, response: ApiResponseLike): void {
  setPrivateNoStore(response);
  if (request.method !== 'GET') {
    rejectUnsupportedMethod(response, 'GET');
    return;
  }

  const sessionSecret = process.env.GENBOT_SESSION_SECRET;
  if (!sessionSecret) {
    response.status(503).json({ authenticated: false, reason: 'not_configured' });
    return;
  }

  const verification = verifyRequestSession(request, sessionSecret);
  if ('reason' in verification && verification.reason !== 'missing') {
    response.setHeader('Set-Cookie', getExpiredSessionCookie());
  }

  response.status(200).json(verification);
}
