import React, { useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderOpen,
  Network,
  Rocket,
  ShieldCheck,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  createFolderSource,
  createTextSource,
  inspectFolderFiles,
  type AIMapSource,
  type FolderIntakeResult,
} from '@/services/aiMap/sourceIntake';
import { buildAIMapStudioPrompt, buildLocalInventoryDsl } from '@/services/aiMap/prompt';

type SourceMode = 'text' | 'folder';

interface AIMapIntakeProps {
  onGenerateWithAI: (prompt: string) => void;
  onCreateLocalMap: (dsl: string) => void;
}

const MIN_TEXT_LENGTH = 20;
const MIN_OBJECTIVE_LENGTH = 8;

export function AIMapIntake({
  onGenerateWithAI,
  onCreateLocalMap,
}: AIMapIntakeProps): React.ReactElement {
  const textAreaId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const launchLockRef = useRef(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('text');
  const [objective, setObjective] = useState('');
  const [text, setText] = useState('');
  const [inventory, setInventory] = useState<FolderIntakeResult | null>(null);
  const [isReadingFolder, setIsReadingFolder] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const source = getCurrentSource(sourceMode, objective, text, inventory);
  const canGenerate = source !== null && !isReadingFolder && !isLaunching;

  function switchMode(nextMode: SourceMode): void {
    setSourceMode(nextMode);
    setError(null);
  }

  function validateSource(): AIMapSource | null {
    if (objective.trim().length < MIN_OBJECTIVE_LENGTH) {
      setError('Explica brevemente qué necesitas entender, decidir o mejorar con este mapa.');
      return null;
    }

    if (sourceMode === 'text' && text.trim().length < MIN_TEXT_LENGTH) {
      setError('Agrega al menos 20 caracteres de contexto para crear un mapa útil.');
      return null;
    }

    if (sourceMode === 'folder' && !inventory) {
      setError('Selecciona una carpeta para revisar su inventario antes de mapearla.');
      return null;
    }

    if (sourceMode === 'folder' && inventory?.includedCount === 0) {
      setError('No encontramos archivos textuales seguros para analizar en esta carpeta.');
      return null;
    }

    setError(null);
    return source;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (launchLockRef.current) return;
    const validSource = validateSource();
    if (!validSource) return;
    launchLockRef.current = true;
    setIsLaunching(true);
    onCreateLocalMap(buildLocalInventoryDsl(validSource));
  }

  function handleImproveWithAI(): void {
    if (launchLockRef.current) return;
    const validSource = validateSource();
    if (!validSource) return;
    launchLockRef.current = true;
    setIsLaunching(true);
    onGenerateWithAI(buildAIMapStudioPrompt(validSource));
  }

  function openFolderPicker(): void {
    const input = fileInputRef.current;
    if (!input) return;
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.click();
  }

  async function handleFolderChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('No se seleccionó una carpeta. Puedes intentarlo de nuevo.');
      return;
    }

    setIsReadingFolder(true);
    setError(null);
    setInventory(null);
    try {
      const nextInventory = await inspectFolderFiles(selectedFiles);
      setInventory(nextInventory);
      if (nextInventory.includedCount === 0) {
        setError('La carpeta no contiene archivos textuales seguros compatibles.');
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo leer la carpeta.';
      setError(`No se pudo preparar el inventario: ${message}`);
    } finally {
      setIsReadingFolder(false);
      event.target.value = '';
    }
  }

  return (
    <section
      aria-labelledby="ai-map-intake-title"
      className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-[var(--shadow-lg)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-primary-200)] bg-[var(--action-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)]">
                <Network className="h-3.5 w-3.5" aria-hidden="true" />
                Intake trazable
              </div>
              <h2
                id="ai-map-intake-title"
                className="text-balance text-[clamp(1.65rem,3vw,2.65rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--brand-text)]"
              >
                Convierte cualquier contexto en un mapa que sí se entiende.
              </h2>
              <p className="mt-3 max-w-[62ch] text-pretty text-sm leading-6 text-[var(--brand-secondary)] sm:text-base">
                Pega un alcance o selecciona una carpeta. AI Map prepara un borrador editable con
                procesos, vacíos, evidencia y la siguiente decisión; tú validas antes de publicar.
              </p>
            </div>
          </div>

          <ol
            className="mb-6 grid grid-cols-4 overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]"
            aria-label="Flujo de trabajo de AI Map"
          >
            {['Fuente', 'Mapa', 'Validación', 'Entrega'].map((step, index) => (
              <li
                key={step}
                className="relative flex min-h-11 items-center justify-center px-1 text-center text-[11px] font-semibold text-[var(--brand-text)] sm:text-xs"
              >
                {step}
                {index < 3 ? (
                  <ArrowRight
                    className="absolute -right-2 z-10 h-4 w-4 rounded-full bg-[var(--brand-background)] text-[var(--action)]"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ol>

          <div
            className="mb-5 inline-flex rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] p-1"
            role="group"
            aria-label="Tipo de fuente"
          >
            <SourceTab
              active={sourceMode === 'text'}
              icon={<FileText className="h-4 w-4" aria-hidden="true" />}
              label="Texto o brief"
              onClick={() => switchMode('text')}
            />
            <SourceTab
              active={sourceMode === 'folder'}
              icon={<FolderOpen className="h-4 w-4" aria-hidden="true" />}
              label="Carpeta local"
              onClick={() => switchMode('folder')}
            />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor={`${textAreaId}-objective`}
                className="mb-2 block text-sm font-semibold text-[var(--brand-text)]"
              >
                ¿Qué necesitas entender o decidir?
              </label>
              <input
                id={`${textAreaId}-objective`}
                type="text"
                value={objective}
                onChange={(event) => {
                  setObjective(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ejemplo: detectar cuellos de botella y definir la siguiente acción"
                className="h-12 w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-base text-[var(--brand-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--brand-secondary)] focus:border-[var(--focus)] focus:ring-4 focus:ring-[var(--action-soft)]"
                aria-invalid={Boolean(error)}
                required
              />
            </div>

            {sourceMode === 'text' ? (
              <div>
                <label
                  htmlFor={textAreaId}
                  className="mb-2 block text-sm font-semibold text-[var(--brand-text)]"
                >
                  Contexto del proyecto o proceso
                </label>
                <textarea
                  id={textAreaId}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (error) setError(null);
                  }}
                  rows={8}
                  placeholder="Ejemplo: recibimos solicitudes por WhatsApp, operaciones valida el alcance, se prepara una propuesta y gerencia aprueba antes del envío..."
                  className="min-h-48 w-full resize-y rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-base leading-6 text-[var(--brand-text)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--brand-secondary)] focus:border-[var(--focus)] focus:ring-4 focus:ring-[var(--action-soft)]"
                  aria-describedby="ai-map-text-help"
                  aria-invalid={Boolean(error)}
                />
                <div
                  id="ai-map-text-help"
                  className="mt-2 flex items-center justify-between gap-4 text-xs text-[var(--brand-secondary)]"
                >
                  <span>Describe entradas, pasos, roles, decisiones o problemas conocidos.</span>
                  <span className="shrink-0 tabular-nums">
                    {text.length.toLocaleString()} caracteres
                  </span>
                </div>
              </div>
            ) : (
              <FolderPickerState
                inventory={inventory}
                isReading={isReadingFolder}
                onSelectFolder={openFolderPicker}
              />
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => void handleFolderChange(event)}
            />

            <div aria-live="polite" className="min-h-8">
              {error ? (
                <div
                  className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--color-surface-warning-border)] bg-[var(--color-surface-warning-bg)] px-3 py-2 text-sm text-[var(--color-surface-warning-text)]"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                disabled={!canGenerate}
                className="min-h-12 flex-1 bg-[var(--action)] text-sm text-[var(--action-text)] hover:bg-[var(--action-hover)] hover:brightness-100 sm:flex-none"
              >
                <Network className="h-4 w-4" aria-hidden="true" />
                {isLaunching ? 'Creando mapa…' : 'Crear mapa base'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                disabled={!canGenerate}
                onClick={handleImproveWithAI}
                className="min-h-12 border-[var(--brand-border)] text-sm text-[var(--brand-text)] sm:flex-none"
              >
                <WandSparkles className="h-4 w-4" aria-hidden="true" />
                Mejorar con AI Mapper
              </Button>
            </div>
          </form>
        </div>

        <aside className="border-t border-[var(--brand-border)] bg-[var(--brand-background)] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
          <h3 className="text-sm font-semibold text-[var(--brand-text)]">Qué controla AI Map</h3>
          <div className="mt-5 space-y-5">
            <AssuranceItem
              icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              title="Fuente bajo control"
              description="Texto y carpetas se preparan localmente. Revisa siempre el inventario y las exclusiones."
            />
            <AssuranceItem
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              title="Validación explícita"
              description="CONFIRMADO, INFERIDO, ASUMIDO y NO VERIFICADO permanecen visibles."
            />
            <AssuranceItem
              icon={<Rocket className="h-4 w-4" aria-hidden="true" />}
              title="Entrega bajo control"
              description="Exporta JSON, Mermaid o imagen desde el editor. GitHub y Vercel requieren tu confirmación."
            />
          </div>

          <div className="mt-7 border-t border-[var(--brand-border)] pt-5 text-xs leading-5 text-[var(--brand-secondary)]">
            Ningún filtro garantiza detectar todos los secretos. El borrador local no usa una API ni
            interpreta el negocio: organiza la entrada para que puedas revisarla de inmediato.
          </div>
        </aside>
      </div>
    </section>
  );
}

function getCurrentSource(
  sourceMode: SourceMode,
  objective: string,
  text: string,
  inventory: FolderIntakeResult | null
): AIMapSource | null {
  if (objective.trim().length < MIN_OBJECTIVE_LENGTH) {
    return null;
  }

  if (sourceMode === 'text') {
    return text.trim().length >= MIN_TEXT_LENGTH ? createTextSource(text, objective) : null;
  }

  return inventory && inventory.includedCount > 0 ? createFolderSource(inventory, objective) : null;
}

interface SourceTabProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function SourceTab({ active, icon, label, onClick }: SourceTabProps): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 ${
        active
          ? 'bg-[var(--brand-surface)] text-[var(--brand-text)] shadow-[var(--shadow-xs)]'
          : 'text-[var(--brand-secondary)] hover:text-[var(--brand-text)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

interface FolderPickerStateProps {
  inventory: FolderIntakeResult | null;
  isReading: boolean;
  onSelectFolder: () => void;
}

function FolderPickerState({
  inventory,
  isReading,
  onSelectFolder,
}: FolderPickerStateProps): React.ReactElement {
  if (isReading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-6 text-center"
        aria-busy="true"
      >
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary-200)] border-t-[var(--action)]" />
          <p className="mt-3 text-sm font-semibold text-[var(--brand-text)]">
            Preparando inventario seguro…
          </p>
          <p className="mt-1 text-xs text-[var(--brand-secondary)]">
            Filtramos formatos, secretos y límites antes de preparar contenido.
          </p>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <button
        type="button"
        onClick={onSelectFolder}
        className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-background)] px-6 text-center transition-[border-color,background-color] duration-150 hover:border-[var(--action)] hover:bg-[var(--action-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--action-soft)]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--action-soft)] text-[var(--action)]">
          <FolderOpen className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="mt-4 text-base font-semibold text-[var(--brand-text)]">
          Seleccionar carpeta
        </span>
        <span className="mt-1 max-w-md text-sm leading-6 text-[var(--brand-secondary)]">
          Compatible con código y documentos textuales. Nada se publica automáticamente.
        </span>
      </button>
    );
  }

  const visibleFiles = inventory.files.slice(0, 6);
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="flex flex-col gap-4 border-b border-[var(--brand-border)] bg-[var(--brand-background)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-text)]">
            <FolderOpen className="h-4 w-4 shrink-0 text-[var(--action)]" aria-hidden="true" />
            <span className="truncate">{inventory.folderName}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--brand-secondary)]">
            Inventario preparado localmente
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onSelectFolder}
          className="shrink-0 border-[var(--brand-border)]"
        >
          Cambiar carpeta
        </Button>
      </div>

      <div className="grid grid-cols-4 divide-x divide-[var(--brand-border)] border-b border-[var(--brand-border)]">
        <InventoryMetric value={inventory.includedCount} label="Leídos" tone="positive" />
        <InventoryMetric value={inventory.excludedCount} label="Omitidos" tone="neutral" />
        <InventoryMetric value={inventory.truncatedCount} label="Truncados" tone="warning" />
        <InventoryMetric value={inventory.redactedCount} label="Redactados" tone="warning" />
      </div>

      <div
        className="max-h-48 divide-y divide-[var(--brand-border)] overflow-y-auto"
        aria-label="Resumen del inventario"
      >
        {visibleFiles.map((file) => (
          <div
            key={file.path}
            className="flex items-start justify-between gap-4 px-4 py-2.5 text-xs"
          >
            <span className="min-w-0 break-all text-[var(--brand-text)]">{file.path}</span>
            <span className={`shrink-0 font-semibold ${getOutcomeClassName(file.outcome)}`}>
              {getOutcomeLabel(file.outcome)}
            </span>
          </div>
        ))}
        {inventory.files.length > visibleFiles.length ? (
          <div className="px-4 py-2.5 text-xs text-[var(--brand-secondary)]">
            +{inventory.files.length - visibleFiles.length} archivos adicionales en el inventario
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InventoryMetric({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'positive' | 'neutral' | 'warning';
}): React.ReactElement {
  const toneClassName = {
    positive: 'text-emerald-700',
    neutral: 'text-[var(--brand-secondary)]',
    warning: 'text-[var(--color-surface-warning-text)]',
  }[tone];

  return (
    <div className="px-3 py-3 text-center">
      <div className={`text-lg font-semibold tabular-nums ${toneClassName}`}>{value}</div>
      <div className="text-[11px] font-medium text-[var(--brand-secondary)]">{label}</div>
    </div>
  );
}

function getOutcomeLabel(outcome: 'included' | 'excluded' | 'truncated'): string {
  if (outcome === 'included') return 'Leído';
  if (outcome === 'truncated') return 'Truncado';
  return 'Omitido';
}

function getOutcomeClassName(outcome: 'included' | 'excluded' | 'truncated'): string {
  if (outcome === 'included') return 'text-emerald-700';
  if (outcome === 'truncated') return 'text-amber-700';
  return 'text-[var(--brand-secondary)]';
}

function AssuranceItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--action-soft)] text-[var(--action)]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--brand-text)]">{title}</div>
        <p className="mt-1 text-xs leading-5 text-[var(--brand-secondary)]">{description}</p>
      </div>
    </div>
  );
}
