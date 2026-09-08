import React from 'react';
import {
  Copy,
  FileInput,
  Layout,
  LayoutTemplate,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Tooltip } from '../Tooltip';
import type { WorkspaceDocumentPreview } from '@/store/workspaceDocumentModel';
import { recordOnboardingEvent } from '@/services/onboarding/events';
import { AIMapIntake } from './AIMapIntake';

const AUTOSAVED_LABEL = 'Guardado automáticamente';

export interface HomeFlowCard {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  updatedAt?: string;
  isActive?: boolean;
  preview: WorkspaceDocumentPreview | null;
}

interface HomeDashboardProps {
  flows: HomeFlowCard[];
  onCreateNew: () => void;
  onOpenTemplates: () => void;
  onPromptWithAI: () => void;
  onGenerateAIMap: (prompt: string) => void;
  onCreateLocalMap: (dsl: string) => void;
  onImportJSON: () => void;
  onOpenFlow: (flowId: string) => void;
  onRenameFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onOpenLibrary: () => void;
}

export function HomeDashboard({
  flows,
  onCreateNew,
  onOpenTemplates,
  onGenerateAIMap,
  onCreateLocalMap,
  onImportJSON,
  onOpenFlow,
  onRenameFlow,
  onDuplicateFlow,
  onDeleteFlow,
  onOpenLibrary,
}: HomeDashboardProps): React.ReactElement {
  const hasFlows = flows.length > 0;
  function handleCreateNew(): void {
    recordOnboardingEvent('welcome_blank_selected', { source: 'home-dashboard' });
    onCreateNew();
  }

  function handleImportJSON(): void {
    recordOnboardingEvent('welcome_import_selected', { source: 'home-dashboard' });
    onImportJSON();
  }

  function handleOpenTemplates(): void {
    recordOnboardingEvent('welcome_template_selected', { source: 'home-dashboard' });
    onOpenTemplates();
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 animate-in fade-in duration-300 sm:px-6 md:px-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-text)] tracking-tight mb-1">
            AI Map
          </h1>
          <p className="text-[var(--brand-secondary)] text-sm">
            Convierte contexto disperso en procesos, decisiones y acciones verificables.
          </p>
        </div>
        <div className="hidden md:block">
          <Button
            onClick={handleCreateNew}
            data-testid="home-create-new-header"
            variant="secondary"
            size="sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Lienzo en blanco
          </Button>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-[#cfe0ff] bg-[linear-gradient(135deg,#f7faff_0%,#eaf4ff_48%,#f5fbff_100%)] p-5 sm:p-6" aria-labelledby="ap-summary-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--action)]">Snapshot curado · 8 sep 2026</p>
            <h2 id="ap-summary-title" className="mt-2 text-xl font-bold tracking-tight text-[var(--brand-text)]">Biblioteca AP: 12 casos, 12 procesos, 7 plantillas y 11 agentes.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--brand-secondary)]">Explora cómo trabaja el ecosistema, revisa el estado real y convierte cualquier ficha en un mapa editable.</p>
          </div>
          <button type="button" onClick={onOpenLibrary} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[var(--action)] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(33,101,255,0.22)] hover:bg-[#1b57df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2">
            Abrir Biblioteca AP
          </button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Sugerencias de inicio">
          {['Mapear proyecto', 'Auditar proceso', 'Usar plantilla'].map((tip) => (
            <div key={tip} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--brand-text)] shadow-sm">{tip}</div>
          ))}
        </div>
      </section>

      <AIMapIntake onGenerateWithAI={onGenerateAIMap} onCreateLocalMap={onCreateLocalMap} />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-[var(--brand-secondary)] uppercase tracking-wider">
              Mapas de proyecto
            </h2>
            <Tooltip
              text="Guardados en este dispositivo. AI Map no sube tus diagramas a un servidor propio."
              side="right"
            >
              <div className="flex cursor-default items-center justify-center text-[var(--brand-primary)] hover:brightness-110 transition-all duration-200">
                <ShieldCheck
                  className="w-[13px] h-[13px]"
                  fill="currentColor"
                  stroke="white"
                  strokeWidth={1.5}
                />
              </div>
            </Tooltip>
          </div>
          {hasFlows && (
            <span className="text-xs text-[var(--brand-secondary)]">
              {flows.length} {flows.length === 1 ? 'mapa' : 'mapas'}
            </span>
          )}
        </div>

        {!hasFlows ? (
          <div
            className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5"
            data-testid="home-empty-state"
          >
            <div className="mb-4 sm:mb-0">
              <h3 className="text-sm font-semibold text-[var(--brand-text)]">
                Aún no tienes mapas guardados
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--brand-secondary)]">
                Crea el mapa base arriba o inicia desde una fuente existente.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:shrink-0 lg:flex-row">
              <Button
                onClick={handleCreateNew}
                data-testid="home-create-new-main"
                variant="secondary"
                size="sm"
                className="min-h-11"
              >
                <Plus className="h-4 w-4" />
                Lienzo en blanco
              </Button>
              <Button
                onClick={handleOpenTemplates}
                data-testid="home-open-templates"
                variant="secondary"
                size="sm"
                className="min-h-11"
              >
                <LayoutTemplate className="h-4 w-4" />
                Mapas modelo
              </Button>
              <ImportExistingFileButton label="Importar mapa" onClick={handleImportJSON} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {flows.map((flow) => (
              <article
                key={flow.id}
                className="group relative flex flex-col overflow-hidden rounded-[16px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] transition-all duration-300 hover:border-[var(--brand-primary-400)]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
              >
                <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden border-b border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-background)]">
                  <FlowPreview preview={flow.preview} />

                  <button
                    type="button"
                    onClick={() => onOpenFlow(flow.id)}
                    aria-label={`Abrir mapa ${flow.name}`}
                    className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)]"
                  />

                  {/* Sleek Floating Actions Pill */}
                  <div className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-full border border-[color-mix(in_srgb,var(--color-brand-border),white_10%)] bg-[var(--brand-surface)]/80 backdrop-blur-md p-1 opacity-0 transform translate-y-[-4px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 shadow-lg">
                    <FlowCardActionButton
                      label="Renombrar"
                      onClick={() => onRenameFlow(flow.id)}
                      hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] focus-visible:ring-[var(--brand-primary)]"
                    >
                      <Pencil className="h-3 w-3" />
                    </FlowCardActionButton>
                    <FlowCardActionButton
                      label="Duplicar"
                      onClick={() => onDuplicateFlow(flow.id)}
                      hoverClassName="hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] focus-visible:ring-[var(--brand-primary)]"
                    >
                      <Copy className="h-3 w-3" />
                    </FlowCardActionButton>
                    {/* Divider */}
                    <div className="h-3 w-[1px] bg-[var(--color-brand-border)] mx-0.5"></div>
                    <FlowCardActionButton
                      label="Eliminar"
                      onClick={() => onDeleteFlow(flow.id)}
                      hoverClassName="hover:bg-red-500/10 hover:text-red-500 focus-visible:ring-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </FlowCardActionButton>
                  </div>
                </div>
                <div className="flex flex-col p-4 bg-[var(--brand-surface)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--brand-surface),white_2%)]">
                  <h3 className="mb-1.5 truncate text-[13.5px] font-semibold tracking-tight">
                    <button type="button" onClick={() => onOpenFlow(flow.id)} className="max-w-full truncate text-left text-[var(--brand-text)] transition-colors group-hover:text-[var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
                      {flow.name}
                    </button>
                  </h3>
                  <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--brand-secondary)]">
                    <span>{formatUpdatedAt(flow.updatedAt)}</span>
                    <div className="h-[3px] w-[3px] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary),transparent_50%)]"></div>
                    <span>
                      {flow.nodeCount} {flow.nodeCount === 1 ? 'nodo' : 'nodos'}
                    </span>
                    {flow.isActive && (
                      <>
                        <div className="h-[3px] w-[3px] rounded-full bg-[color-mix(in_srgb,var(--brand-secondary),transparent_50%)]"></div>
                        <span className="text-[var(--brand-primary)]">Mapa actual</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatUpdatedAt(updatedAt?: string): string {
  if (!updatedAt) {
    return AUTOSAVED_LABEL;
  }

  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) {
    return AUTOSAVED_LABEL;
  }

  return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getPreviewNodeRadius(node: WorkspaceDocumentPreview['nodes'][number]): number {
  if (node.shape === 'capsule') {
    return node.height / 2;
  }

  if (node.shape === 'rectangle') {
    return 12;
  }

  return 20;
}

interface FlowPreviewProps {
  preview: WorkspaceDocumentPreview | null;
}

function FlowPreview({ preview }: FlowPreviewProps): React.ReactElement {
  if (!preview || preview.nodes.length === 0) {
    return <EmptyFlowPreview />;
  }

  const padding = 24;
  const minX = Math.min(...preview.nodes.map((node) => node.x));
  const minY = Math.min(...preview.nodes.map((node) => node.y));
  const maxX = Math.max(...preview.nodes.map((node) => node.x + node.width));
  const maxY = Math.max(...preview.nodes.map((node) => node.y + node.height));
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;

  return (
    <div className="absolute inset-0 text-[var(--brand-secondary)] overflow-hidden w-full h-full">
      <div
        className="absolute inset-0 dark:hidden opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--brand-secondary) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.35] transition-opacity duration-500 group-hover:opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-brand-border) 1px, transparent 0)',
          backgroundSize: '14px 14px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--brand-primary)_4%,transparent),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <svg
        viewBox={viewBox}
        className="absolute inset-[10%] h-[80%] w-[80%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {preview.nodes.map((node) => (
          <rect
            key={node.id}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={getPreviewNodeRadius(node)}
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_20px_var(--brand-background)] opacity-[0.85]" />
    </div>
  );
}

interface ImportExistingFileButtonProps {
  label: string;
  onClick: () => void;
}

function ImportExistingFileButton({
  label,
  onClick,
}: ImportExistingFileButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[var(--brand-secondary)] transition-[background-color,color] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
    >
      <FileInput className="w-[14px] h-[14px]" />
      {label}
    </button>
  );
}

interface FlowCardActionButtonProps {
  children: React.ReactNode;
  hoverClassName: string;
  label: string;
  onClick: () => void;
}

function FlowCardActionButton({
  children,
  hoverClassName,
  label,
  onClick,
}: FlowCardActionButtonProps): React.ReactElement {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onClick();
  }

  return (
    <Tooltip text={label} side="bottom">
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[var(--brand-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 ${hoverClassName}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function EmptyFlowPreview(): React.ReactElement {
  return (
    <>
      <div
        className="absolute inset-0 dark:hidden opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--brand-secondary) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block opacity-[0.3] transition-opacity duration-300 group-hover:opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-brand-border) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--brand-background)_120%)]" />
      <div className="z-10 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_50%)] bg-[var(--brand-surface)] text-[var(--brand-secondary)] shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--brand-primary-400)]/40 group-hover:text-[var(--brand-primary)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <Layout className="w-4 h-4" />
      </div>
    </>
  );
}
