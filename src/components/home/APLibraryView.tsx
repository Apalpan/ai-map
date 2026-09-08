import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  FileStack,
  GitBranch,
  Library,
  PanelRightOpen,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  AP_LIBRARY_BY_TAB,
  AP_LIBRARY_COUNTS,
  AP_LIBRARY_SNAPSHOT_LABEL,
  type APAgent,
  type APLibraryItem,
  type APLibraryState,
  type APLibraryTab,
  type APTemplate,
  type APUnit,
} from '@/data/apLibrary';
import { buildLibraryMapDsl } from '@/services/apLibrary/buildLibraryMapDsl';

interface APLibraryViewProps {
  onCreateLocalMap: (dsl: string) => void;
  initialTab?: APLibraryTab;
}

const TABS: Array<{ id: APLibraryTab; label: string; icon: React.ReactNode }> = [
  { id: 'cases', label: 'Casos', icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { id: 'processes', label: 'Procesos', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'templates', label: 'Plantillas', icon: <FileStack className="h-4 w-4" /> },
  { id: 'agents', label: 'Agentes', icon: <Bot className="h-4 w-4" /> },
];

const STATES: APLibraryState[] = ['Confirmado', 'Documentado', 'WIP', 'Requiere validación'];
const UNITS: APUnit[] = ['GEN+', 'AECODE', 'VisionPro', 'AgentFlow', 'AP'];

function shouldOpenDetailByDefault(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(min-width: 1280px)').matches;
}

export function APLibraryView({
  onCreateLocalMap,
  initialTab = 'cases',
}: APLibraryViewProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<APLibraryTab>(initialTab);
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState<APUnit | 'all'>('all');
  const [state, setState] = useState<APLibraryState | 'all'>('all');
  const [selectedId, setSelectedId] = useState(AP_LIBRARY_BY_TAB[initialTab][0]?.id ?? '');
  const [detailOpen, setDetailOpen] = useState(shouldOpenDetailByDefault);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reopenButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    return AP_LIBRARY_BY_TAB[activeTab].filter((item) => {
      const matchesQuery = !normalizedQuery || [item.title, item.summary, item.purpose, item.owner]
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(normalizedQuery);
      return matchesQuery && (unit === 'all' || item.unit === unit) && (state === 'all' || item.state === state);
    });
  }, [activeTab, query, state, unit]);

  const selectedItem = filteredItems.find((item) => item.id === selectedId)
    ?? filteredItems[0]
    ?? null;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape' && detailOpen) {
        setDetailOpen(false);
        window.setTimeout(() => reopenButtonRef.current?.focus(), 0);
      }
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [detailOpen]);

  function changeTab(nextTab: APLibraryTab): void {
    setActiveTab(nextTab);
    setSelectedId(AP_LIBRARY_BY_TAB[nextTab][0]?.id ?? '');
    setQuery('');
    setUnit('all');
    setState('all');
    setDetailOpen(shouldOpenDetailByDefault());
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = TABS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    changeTab(TABS[nextIndex].id);
    window.setTimeout(() => tabButtonRefs.current[nextIndex]?.focus(), 0);
  }

  function selectItem(item: APLibraryItem): void {
    setSelectedId(item.id);
    setDetailOpen(true);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
  }

  function closeDetail(): void {
    setDetailOpen(false);
    window.setTimeout(() => reopenButtonRef.current?.focus(), 0);
  }

  function reopenDetail(): void {
    setDetailOpen(true);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
  }

  return (
    <div className="ap-library flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-10">
      <header className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--action)]">
              <Library className="h-4 w-4" aria-hidden="true" /> Biblioteca AP
            </p>
            <h1 className="text-3xl font-bold tracking-[-0.035em] text-[var(--brand-text)] sm:text-4xl">
              Casos, procesos y agentes explicados para actuar.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--brand-secondary)]">
              Catálogo sanitizado derivado de fuentes curadas. Cada ficha separa estado,
              evidencia, control humano y siguiente acción; no expone rutas privadas ni secretos.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-[var(--brand-border)] bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-[var(--brand-text)]">{AP_LIBRARY_SNAPSHOT_LABEL}</p>
            <p className="mt-1 text-xs text-[var(--brand-secondary)]">
              {AP_LIBRARY_COUNTS.cases} casos · {AP_LIBRARY_COUNTS.templates} plantillas · {AP_LIBRARY_COUNTS.agents} agentes
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto border-b border-[var(--brand-border)]" role="tablist" aria-label="Contenido de Biblioteca AP">
          <div className="flex min-w-max gap-1">
            {TABS.map((tab, index) => (
              <button
                key={tab.id}
                ref={(element) => { tabButtonRefs.current[index] = element; }}
                id={`ap-library-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="ap-library-results"
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => changeTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)] ${activeTab === tab.id ? 'border-[var(--action)] text-[var(--action)]' : 'border-transparent text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'}`}
              >
                {tab.icon}
                {tab.label}
                <span className="rounded-full bg-[var(--action-soft)] px-2 py-0.5 text-[11px] tabular-nums">
                  {AP_LIBRARY_COUNTS[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_210px_auto]">
          <label className="relative block">
            <span className="sr-only">Buscar en Biblioteca AP</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-secondary)]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por caso, problema u owner"
              className="min-h-11 w-full rounded-xl border border-[var(--brand-border)] bg-white pl-10 pr-3 text-base text-[var(--brand-text)] outline-none placeholder:text-[#65758f] focus:border-[var(--action)] focus:ring-2 focus:ring-[var(--action-soft)]"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por unidad</span>
            <select value={unit} onChange={(event) => setUnit(event.target.value as APUnit | 'all')} className="min-h-11 w-full rounded-xl border border-[var(--brand-border)] bg-white px-3 text-base text-[var(--brand-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
              <option value="all">Todas las unidades</option>
              {UNITS.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select value={state} onChange={(event) => setState(event.target.value as APLibraryState | 'all')} className="min-h-11 w-full rounded-xl border border-[var(--brand-border)] bg-white px-3 text-base text-[var(--brand-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
              <option value="all">Todos los estados</option>
              {STATES.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
            </select>
          </label>
          {!detailOpen && selectedItem ? (
            <button ref={reopenButtonRef} type="button" onClick={reopenDetail} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--action)] px-4 text-sm font-semibold text-[var(--action)] hover:bg-[var(--action-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" /> Ver detalle
            </button>
          ) : <span />}
        </div>
      </header>

      <div
        id="ap-library-results"
        role="tabpanel"
        aria-labelledby={`ap-library-tab-${activeTab}`}
        className={`mx-auto mt-6 grid max-w-[1500px] items-start gap-6 ${detailOpen && selectedItem ? 'xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]' : 'grid-cols-1'}`}
      >
        <section className="order-last xl:order-none" aria-label={`Resultados: ${TABS.find((tab) => tab.id === activeTab)?.label ?? ''}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-secondary)]">
              {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {(query || unit !== 'all' || state !== 'all') && (
              <button type="button" onClick={() => { setQuery(''); setUnit('all'); setState('all'); }} className="min-h-11 px-2 text-sm font-semibold text-[var(--action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--brand-border)] bg-white px-6 py-14 text-center">
              <Search className="mx-auto h-6 w-6 text-[var(--brand-secondary)]" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold text-[var(--brand-text)]">No encontramos resultados</h2>
              <p className="mt-2 text-sm text-[var(--brand-secondary)]">Prueba otra palabra o limpia los filtros activos.</p>
            </div>
          ) : (
            <div className={`grid gap-3 ${detailOpen ? 'grid-cols-1 2xl:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  aria-pressed={selectedItem?.id === item.id && detailOpen}
                  className={`group min-h-[168px] rounded-2xl border bg-white p-5 text-left shadow-sm transition-[border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${selectedItem?.id === item.id && detailOpen ? 'border-[var(--action)] shadow-[0_14px_32px_rgba(33,101,255,0.12)]' : 'border-[var(--brand-border)] hover:-translate-y-0.5 hover:border-[#8eb3ff] hover:shadow-md'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-[#e9f0ff] px-2 py-1 text-[11px] font-bold text-[#0e2a6b]">{item.unit}</span>
                      <StateBadge state={item.state} />
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--brand-secondary)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-base font-bold leading-6 text-[var(--brand-text)]">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-5 text-[var(--brand-secondary)]">{item.summary}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {detailOpen && selectedItem ? (
          <LibraryDetail
            item={selectedItem}
            closeButtonRef={closeButtonRef}
            onClose={closeDetail}
            onCreateMap={() => onCreateLocalMap(buildLibraryMapDsl(selectedItem))}
          />
        ) : null}
      </div>
    </div>
  );
}

function StateBadge({ state }: { state: APLibraryState }): React.ReactElement {
  const classes: Record<APLibraryState, string> = {
    Confirmado: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Documentado: 'bg-blue-50 text-blue-800 border-blue-200',
    WIP: 'bg-amber-50 text-amber-900 border-amber-200',
    'Requiere validación': 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <span className={`rounded-md border px-2 py-1 text-[11px] font-bold ${classes[state]}`}>{state}</span>;
}

interface LibraryDetailProps {
  item: APLibraryItem;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onCreateMap: () => void;
}

function LibraryDetail({ item, closeButtonRef, onClose, onCreateMap }: LibraryDetailProps): React.ReactElement {
  const agent = item.kind === 'agent' ? item as APAgent : null;
  const template = item.kind === 'template' ? item as APTemplate : null;
  return (
    <aside aria-label={`Detalle de ${item.title}`} className="order-first max-h-none overflow-y-visible rounded-2xl border border-[var(--brand-border)] bg-white shadow-[0_22px_60px_rgba(14,42,107,0.12)] xl:sticky xl:top-5 xl:order-none xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--brand-border)] bg-white/95 px-5 py-4 backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-secondary)]">Detalle seleccionable</p>
        <button ref={closeButtonRef} type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[var(--brand-secondary)] hover:bg-[var(--action-soft)] hover:text-[var(--action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]" aria-label="Cerrar detalle">
          <X className="h-4 w-4" aria-hidden="true" /> Cerrar
        </button>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2"><span className="rounded-md bg-[#e9f0ff] px-2 py-1 text-xs font-bold text-[#0e2a6b]">{item.unit}</span><StateBadge state={item.state} /></div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--brand-text)]">{item.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--brand-secondary)]">{item.summary}</p>

        <DetailSection title="Problema / propósito"><p>{item.purpose}</p></DetailSection>
        <DetailSection title="Disparador"><p>{item.trigger}</p></DetailSection>
        <DetailSection title="Entradas"><BulletList values={item.inputs} /></DetailSection>
        {agent ? <DetailSection title="Capacidades disponibles"><BulletList values={agent.capabilities} /><p className="mt-2 text-xs text-[var(--brand-secondary)]">No implica que una conexión externa esté configurada.</p></DetailSection> : null}
        {agent ? <DetailSection title="Resultado esperado"><p>{agent.output}</p></DetailSection> : null}
        {template ? <DetailSection title="Campos de la plantilla"><BulletList values={template.fields} /></DetailSection> : null}
        <DetailSection title="Etapas">
          <ol className="space-y-3">
            {item.stages.map((stage, index) => (
              <li key={`${item.id}-${stage.title}`} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--action-soft)] text-xs font-bold text-[var(--action)]">{index + 1}</span>
                <div><p className="font-semibold text-[var(--brand-text)]">{stage.title}</p><p className="mt-1 text-xs text-[var(--brand-secondary)]">{stage.owner} · {stage.evidence}</p></div>
              </li>
            ))}
          </ol>
        </DetailSection>
        <DetailSection title="Evidencia"><BulletList values={item.evidence} /></DetailSection>
        <DetailSection title="Decisión humana"><p>{item.humanGate}</p></DetailSection>
        <DetailSection title="Fallback"><p>{item.fallback}</p></DetailSection>
        <DetailSection title="Siguiente acción"><p className="font-semibold text-[var(--brand-text)]">{item.nextAction}</p></DetailSection>
        <div className="mt-6 rounded-xl border border-blue-100 bg-[#f7faff] p-4 text-xs leading-5 text-[var(--brand-secondary)]">
          <p className="flex items-center gap-2 font-bold text-[var(--brand-text)]"><ShieldCheck className="h-4 w-4 text-[var(--action)]" aria-hidden="true" /> Trazabilidad sanitizada</p>
          <p className="mt-1">{item.source}. El mapa resultante es un borrador editable y requiere revisión.</p>
        </div>
        <button type="button" onClick={onCreateMap} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--action)] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(33,101,255,0.24)] transition-[background-color,transform] hover:bg-[#1b57df] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2">
          Crear mapa editable <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return <section className="mt-6 border-t border-[var(--brand-border)] pt-5 text-sm leading-6 text-[var(--brand-secondary)]"><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-text)]">{title}</h3>{children}</section>;
}

function BulletList({ values }: { values: string[] }): React.ReactElement {
  return <ul className="space-y-2">{values.map((value) => <li key={value} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--action)]" aria-hidden="true" /><span>{value}</span></li>)}</ul>;
}
