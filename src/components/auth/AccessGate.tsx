import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import {
  AccessRequestError,
  endAccessSession,
  getAccessSession,
} from '@/services/auth/accessClient';
import { GENPLUS_LOGO_PRIMARY_URL } from '@/lib/brand';
import { AccessLogin } from './AccessLogin';

interface AccessSessionContextValue {
  isLoggingOut: boolean;
  logout: () => Promise<void>;
}

const AccessSessionContext = createContext<AccessSessionContextValue | null>(null);
const ACCESS_SESSION_FALLBACK: AccessSessionContextValue = {
  isLoggingOut: false,
  logout: async () => {},
};

type GateState =
  | { status: 'checking' }
  | { status: 'authenticated' }
  | { status: 'unauthenticated'; message?: string; offline?: boolean };

export function AccessGate({ children }: { children: React.ReactNode }): React.ReactElement {
  const [gateState, setGateState] = useState<GateState>({ status: 'checking' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkSession = useCallback(async (signal?: AbortSignal, wasAuthenticated = false) => {
    try {
      const result = await getAccessSession(signal);
      if (result.authenticated === true) {
        setGateState({ status: 'authenticated' });
        return;
      }

      const shouldShowExpired = wasAuthenticated || result.reason === 'expired';
      setGateState({
        status: 'unauthenticated',
        message: shouldShowExpired
          ? 'Tu sesión venció. Ingresa nuevamente para continuar.'
          : result.reason === 'invalid'
            ? 'La sesión no es válida. Ingresa nuevamente.'
            : undefined,
      });
    } catch (cause) {
      if (signal?.aborted) return;
      const message =
        cause instanceof AccessRequestError
          ? cause.message
          : 'No pudimos verificar la sesión segura.';
      setGateState({
        status: 'unauthenticated',
        message,
        offline: cause instanceof AccessRequestError && cause.code === 'offline',
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void checkSession(controller.signal);
    return () => controller.abort();
  }, [checkSession]);

  useEffect(() => {
    if (gateState.status !== 'authenticated') return;

    const validateActiveSession = (): void => {
      if (document.visibilityState === 'visible') {
        void checkSession(undefined, true);
      }
    };
    const intervalId = window.setInterval(validateActiveSession, 5 * 60 * 1000);
    window.addEventListener('focus', validateActiveSession);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', validateActiveSession);
    };
  }, [checkSession, gateState.status]);

  const logout = useCallback(async (): Promise<void> => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await endAccessSession();
      setGateState({ status: 'unauthenticated' });
    } catch (cause) {
      const message =
        cause instanceof AccessRequestError ? cause.message : 'No pudimos cerrar la sesión.';
      setGateState({ status: 'unauthenticated', message, offline: true });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  const contextValue = useMemo(() => ({ isLoggingOut, logout }), [isLoggingOut, logout]);

  if (gateState.status === 'checking') {
    return (
      <main className="gen-access-checking" id="main-content" aria-busy="true">
        <img
          src={GENPLUS_LOGO_PRIMARY_URL}
          alt="GEN+"
          className="gen-access-logo gen-access-logo--primary"
        />
        <LoaderCircle className="gen-access-spinner" aria-hidden="true" />
        <p role="status" aria-live="polite">
          Verificando sesión segura…
        </p>
      </main>
    );
  }

  if (gateState.status === 'unauthenticated') {
    return (
      <AccessLogin
        initialMessage={gateState.message}
        initialOffline={gateState.offline}
        onAuthenticated={() => setGateState({ status: 'authenticated' })}
      />
    );
  }

  return (
    <AccessSessionContext.Provider value={contextValue}>{children}</AccessSessionContext.Provider>
  );
}

export function useAccessSession(): AccessSessionContextValue {
  const context = useContext(AccessSessionContext);
  return context ?? ACCESS_SESSION_FALLBACK;
}
