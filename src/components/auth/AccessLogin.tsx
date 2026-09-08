import React, { useId, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { AccessRequestError, submitAccessCode } from '@/services/auth/accessClient';
import { GENPLUS_LOGO_PRIMARY_URL, GENPLUS_LOGO_WHITE_URL } from '@/lib/brand';

interface AccessLoginProps {
  initialMessage?: string | null;
  initialOffline?: boolean;
  onAuthenticated: () => void;
}

const FLOW_STEPS = ['Contexto', 'Mapa', 'Validación', 'Acción'] as const;
const PROOF_POINTS = ['Local-first', 'Editable', 'Control humano'] as const;

export function AccessLogin({
  initialMessage = null,
  initialOffline = false,
  onAuthenticated,
}: AccessLoginProps): React.ReactElement {
  const inputId = useId();
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(initialMessage);
  const [isOffline, setIsOffline] = useState(initialOffline);
  const statusMessage = formError ?? sessionNotice;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSubmitting) return;

    if (!code) {
      setFormError('Ingresa la clave de acceso para continuar.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setSessionNotice(null);
    setIsOffline(false);
    try {
      await submitAccessCode(code);
      onAuthenticated();
    } catch (cause) {
      if (cause instanceof AccessRequestError) {
        if (cause.code === 'invalid_code') {
          setFormError(cause.message);
        } else {
          setIsOffline(cause.code === 'offline');
          setSessionNotice(cause.message);
        }
      } else {
        setSessionNotice('Ocurrió un error inesperado. Inténtalo otra vez.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="gen-access-shell" id="main-content">
      <section className="gen-access-story" aria-labelledby="gen-access-claim">
        <div className="gen-access-story__inner">
          <img
            src={GENPLUS_LOGO_WHITE_URL}
            alt="GEN+"
            className="gen-access-logo gen-access-logo--white"
          />

          <div className="gen-access-story__content">
            <div className="gen-access-eyebrow">AI Map by GEN+</div>
            <h1 id="gen-access-claim">
              De información dispersa a procesos que se entienden y se pueden mejorar.
            </h1>
            <p>
              Convierte un brief, una carpeta o un proceso operativo en un mapa visual, editable y
              listo para validar con tu equipo.
            </p>

            <ol className="gen-access-flow" aria-label="Flujo de AI Map">
              {FLOW_STEPS.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{step}</strong>
                  {index < FLOW_STEPS.length - 1 ? (
                    <ArrowRight className="gen-access-flow__arrow" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ol>

            <ul className="gen-access-proofs" aria-label="Principios del producto">
              {PROOF_POINTS.map((proof) => (
                <li key={proof}>
                  <Check aria-hidden="true" />
                  {proof}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="gen-access-entry" aria-labelledby="gen-access-title">
        <div className="gen-access-entry__inner">
          <img
            src={GENPLUS_LOGO_PRIMARY_URL}
            alt="GEN+"
            className="gen-access-logo gen-access-logo--primary"
          />

          <div className="gen-access-card">
            <div className="gen-access-card__icon" aria-hidden="true">
              <LockKeyhole />
            </div>
            <div className="gen-access-card__heading">
              <div className="gen-access-kicker">Acceso privado</div>
              <h2 id="gen-access-title">Ingresa a AI Map</h2>
              <p>Un entorno GEN+ para mapear, revisar y comunicar procesos con claridad.</p>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} noValidate>
              <label htmlFor={inputId}>Clave de acceso</label>
              <div className="gen-access-field">
                <LockKeyhole aria-hidden="true" className="gen-access-field__leading" />
                <input
                  id={inputId}
                  name="access-code"
                  type={showCode ? 'text' : 'password'}
                  autoComplete="current-password"
                  maxLength={256}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    if (formError) setFormError(null);
                  }}
                  aria-invalid={Boolean(formError)}
                  aria-describedby={statusMessage ? `${inputId}-status` : `${inputId}-help`}
                  placeholder="Ingresa tu clave"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="gen-access-field__toggle"
                  onClick={() => setShowCode((current) => !current)}
                  aria-label={showCode ? 'Ocultar clave' : 'Mostrar clave'}
                  aria-pressed={showCode}
                  disabled={isSubmitting}
                >
                  {showCode ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              <p id={`${inputId}-help`} className="gen-access-helper">
                La clave se valida de forma segura en el servidor y no se guarda en este navegador.
              </p>

              <div
                id={`${inputId}-status`}
                className={`gen-access-status${statusMessage ? ' is-visible' : ''}${isOffline && !formError ? ' is-offline' : ''}`}
                role={statusMessage ? 'alert' : 'status'}
                aria-live="polite"
              >
                {statusMessage ? (
                  <>
                    {isOffline && !formError ? (
                      <WifiOff aria-hidden="true" />
                    ) : (
                      <ShieldCheck aria-hidden="true" />
                    )}
                    <span>{statusMessage}</span>
                  </>
                ) : null}
              </div>

              <button type="submit" className="gen-access-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle className="gen-access-spinner" aria-hidden="true" />
                ) : (
                  <ShieldCheck aria-hidden="true" />
                )}
                <span>{isSubmitting ? 'Verificando acceso…' : 'Ingresar a AI Map'}</span>
                {!isSubmitting ? <ArrowRight aria-hidden="true" /> : null}
              </button>
            </form>

            <div className="gen-access-boundary">
              <strong>Alcance de esta versión</strong>
              <span>
                Este acceso protege la SPA/demo. Toda API sensible debe validar también la cookie de
                sesión. Tus mapas siguen siendo local-first.
              </span>
            </div>
          </div>

          <p className="gen-access-footnote">Ingeniería · Automatización · Inteligencia aplicada</p>
        </div>
      </section>
    </main>
  );
}
