import React from 'react';
import { ArrowRight, Bot, Cable, ShieldCheck } from 'lucide-react';

interface HomeMCPViewProps {
  onOpenLibrary: () => void;
}

export function HomeMCPView({ onOpenLibrary }: HomeMCPViewProps): React.ReactElement {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-12">
      <div className="max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--action)]">Agentes y conexiones</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--brand-text)]">Capacidades claras antes de conectar.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--brand-secondary)]">AI Map diferencia agentes documentados, capacidades disponibles y conexiones que todavía requieren configuración. Ninguna ficha implica acceso automático a sistemas externos.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ConnectionSummary icon={<Bot className="h-5 w-5" />} title="11 agentes curados" body="Propósito, disparador, entradas, resultado, control humano, fallback y evidencia." />
          <ConnectionSummary icon={<ShieldCheck className="h-5 w-5" />} title="Control humano" body="Toda acción externa requiere autorización, evidencia y registro." />
          <ConnectionSummary icon={<Cable className="h-5 w-5" />} title="Conexiones verificables" body="Configura integraciones solo cuando el caso y los permisos estén definidos." />
        </div>

        <button type="button" onClick={onOpenLibrary} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action)] px-5 text-sm font-bold text-white hover:bg-[#1b57df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2">
          Revisar catálogo de agentes <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ConnectionSummary({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }): React.ReactElement {
  return <section className="rounded-2xl border border-[var(--brand-border)] bg-white p-5"><div className="text-[var(--action)]" aria-hidden="true">{icon}</div><h2 className="mt-4 text-base font-bold text-[var(--brand-text)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--brand-secondary)]">{body}</p></section>;
}
