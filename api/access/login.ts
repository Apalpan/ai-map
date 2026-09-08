import type { ApiRequestLike, ApiResponseLike } from './_session.js';
import {
  createSessionToken,
  getSessionCookie,
  getStringBodyField,
  rejectUnsupportedMethod,
  secureCodeMatches,
  setPrivateNoStore,
} from './_session.js';

export default function handler(request: ApiRequestLike, response: ApiResponseLike): void {
  setPrivateNoStore(response);
  if (request.method !== 'POST') {
    rejectUnsupportedMethod(response, 'POST');
    return;
  }

  const accessCode = process.env.GENBOT_ACCESS_CODE;
  const sessionSecret = process.env.GENBOT_SESSION_SECRET;
  if (!accessCode || !sessionSecret) {
    response.status(503).json({ ok: false, error: 'access_not_configured' });
    return;
  }

  const submittedCode = getStringBodyField(request.body, 'code');
  if (!submittedCode || submittedCode.length > 256 || !secureCodeMatches(submittedCode, accessCode)) {
    response.status(401).json({ ok: false, error: 'invalid_access_code' });
    return;
  }

  const token = createSessionToken(sessionSecret);
  response.setHeader('Set-Cookie', getSessionCookie(token));
  response.status(200).json({ ok: true, authenticated: true });
}
