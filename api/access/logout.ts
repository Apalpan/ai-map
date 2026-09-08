import type { ApiRequestLike, ApiResponseLike } from './_session.js';
import { getExpiredSessionCookie, rejectUnsupportedMethod, setPrivateNoStore } from './_session.js';

export default function handler(request: ApiRequestLike, response: ApiResponseLike): void {
  setPrivateNoStore(response);
  if (request.method !== 'POST') {
    rejectUnsupportedMethod(response, 'POST');
    return;
  }

  response.setHeader('Set-Cookie', getExpiredSessionCookie());
  response.status(200).json({ ok: true, authenticated: false });
}
