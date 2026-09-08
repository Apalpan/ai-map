import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccessGate } from './AccessGate';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('AccessGate', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps protected routes hidden until the server session is authenticated', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse({ authenticated: false, reason: 'missing' })
    );

    render(
      <AccessGate>
        <div>Contenido protegido</div>
      </AccessGate>
    );

    expect(screen.queryByText('Contenido protegido')).toBeNull();
    expect(await screen.findByRole('heading', { name: 'Ingresa a AI Map' })).toBeTruthy();
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('submits with Enter and opens the app only after a successful server login', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ authenticated: false, reason: 'missing' }))
      .mockResolvedValueOnce(jsonResponse({ ok: true, authenticated: true }));

    render(
      <AccessGate>
        <div>Contenido protegido</div>
      </AccessGate>
    );

    const input = await screen.findByLabelText('Clave de acceso');
    fireEvent.change(input, { target: { value: 'test-code' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    expect(await screen.findByText('Contenido protegido')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/access/login');
  });

  it('blocks rapid double submission while login is pending', async () => {
    let resolveLogin: ((response: Response) => void) | undefined;
    const pendingLogin = new Promise<Response>((resolve) => {
      resolveLogin = resolve;
    });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ authenticated: false, reason: 'missing' }))
      .mockReturnValueOnce(pendingLogin);

    render(
      <AccessGate>
        <div>Contenido protegido</div>
      </AccessGate>
    );

    const input = await screen.findByLabelText('Clave de acceso');
    fireEvent.change(input, { target: { value: 'test-code' } });
    const submit = screen.getByRole('button', { name: 'Ingresar a AI Map' });
    fireEvent.click(submit);
    fireEvent.click(submit);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(submit).toBeDisabled();
    resolveLogin?.(jsonResponse({ ok: true, authenticated: true }));
    expect(await screen.findByText('Contenido protegido')).toBeTruthy();
  });

  it('shows expired-session and offline states in an aria-live status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      jsonResponse({ authenticated: false, reason: 'expired' })
    );
    const { unmount } = render(
      <AccessGate>
        <div>Contenido protegido</div>
      </AccessGate>
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu sesión venció');
    expect(screen.getByLabelText('Clave de acceso')).toHaveAttribute('aria-invalid', 'false');
    unmount();

    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('offline'));
    render(
      <AccessGate>
        <div>Contenido protegido</div>
      </AccessGate>
    );
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Revisa tu conexión');
    });
    expect(screen.getByLabelText('Clave de acceso')).toHaveAttribute('aria-invalid', 'false');
  });
});
