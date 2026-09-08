export type AIMapSourceKind = 'text' | 'folder';

export type IntakeFileOutcome = 'included' | 'truncated' | 'excluded';

export interface IntakeFileRecord {
  path: string;
  size: number;
  outcome: IntakeFileOutcome;
  reason?: string;
  redactedCount?: number;
}

export interface FolderIntakeResult {
  folderName: string;
  totalFiles: number;
  includedCount: number;
  excludedCount: number;
  truncatedCount: number;
  redactedCount: number;
  context: string;
  files: IntakeFileRecord[];
}

export interface AIMapTextSource {
  kind: 'text';
  name: string;
  objective: string;
  content: string;
  redactedCount: number;
}

export interface AIMapFolderSource {
  kind: 'folder';
  name: string;
  objective: string;
  content: string;
  redactedCount: number;
  inventory: FolderIntakeResult;
}

export type AIMapSource = AIMapTextSource | AIMapFolderSource;

const ALLOWED_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.csv',
  '.html',
  '.java',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.php',
  '.prisma',
  '.py',
  '.rb',
  '.rs',
  '.scss',
  '.sql',
  '.svelte',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.vue',
  '.xml',
  '.yaml',
  '.yml',
]);

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.vercel',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
]);

const SENSITIVE_FILE_PATTERNS = [
  /^\.env(?:\..+)?$/i,
  /^id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?$/i,
  /(?:^|[-_.])credentials?(?:[-_.]|$)/i,
  /(?:^|[-_.])secrets?(?:[-_.]|$)/i,
  /(?:^|[-_.])service[-_.]?account(?:[-_.]|$)/i,
  /(?:^|[-_.])tokens?(?:[-_.]|$)/i,
];

const SENSITIVE_EXTENSIONS = new Set(['.key', '.keystore', '.p12', '.pfx', '.pem']);

const MAX_FILE_READ_BYTES = 128_000;
const MAX_CHARS_PER_FILE = 12_000;
const MAX_CONTEXT_CHARS = 80_000;
const MAX_FILES = 160;

function normalizePath(file: File): string {
  return (file.webkitRelativePath || file.name).replaceAll('\\', '/');
}

function getExtension(path: string): string {
  const fileName = path.split('/').at(-1) ?? path;
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(dotIndex).toLowerCase() : '';
}

function getExclusionReason(path: string): string | null {
  const segments = path.split('/').filter(Boolean);
  const fileName = segments.at(-1) ?? path;
  const extension = getExtension(path);

  if (segments.some((segment) => EXCLUDED_DIRECTORIES.has(segment.toLowerCase()))) {
    return 'Carpeta técnica excluida';
  }

  if (
    SENSITIVE_EXTENSIONS.has(extension) ||
    SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(fileName))
  ) {
    return 'Posible secreto o credencial';
  }

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return 'Formato no textual o no compatible';
  }

  return null;
}

function redactSensitiveValues(value: string): { text: string; redactedCount: number } {
  let redactedCount = 0;
  const replaceWithCount = (_match: string, prefix?: string): string => {
    redactedCount += 1;
    return prefix ? `${prefix}[REDACTADO]` : '[REDACTADO]';
  };
  const assignmentPattern = /((?:^|\n)[^\r\n]{0,160}?(?:password|passwd|pwd|token|api[_-]?key|authorization|secret|client[_-]?secret|access[_-]?key|private[_-]?key)\s*["'`]?\s*[:=]\s*)(?:(?:["'`])[^"'`\r\n]*(?:["'`])|[^\r\n,;}]+)/gi;
  const obviousTokenPattern = /\b(?:ghp_[a-z0-9]{20,}|github_pat_[a-z0-9_]{20,}|glpat-[a-z0-9_-]{16,}|sk-[a-z0-9_-]{16,}|xox[baprs]-[a-z0-9-]{16,}|AKIA[0-9A-Z]{16})\b/gi;
  const bearerPattern = /\bBearer\s+[a-z0-9._~+/-]{8,}=*/gi;
  const jwtPattern = /\beyJ[a-z0-9_-]{8,}\.eyJ[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\b/gi;
  const privateKeyPattern = /-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----[\s\S]*?-----END(?: [A-Z0-9]+)? PRIVATE KEY-----/gi;
  const withoutAssignments = value.replace(
    assignmentPattern,
    (match, prefix: string) => replaceWithCount(match, prefix)
  );
  const withoutObviousTokens = withoutAssignments.replace(obviousTokenPattern, (match) =>
    replaceWithCount(match)
  );
  const withoutBearerTokens = withoutObviousTokens.replace(bearerPattern, (match) =>
    replaceWithCount(match)
  );
  const withoutJwts = withoutBearerTokens.replace(jwtPattern, (match) => replaceWithCount(match));
  const text = withoutJwts.replace(privateKeyPattern, (match) => replaceWithCount(match));
  return { text: text.replaceAll('\u0000', '').trim(), redactedCount };
}

function inferFolderName(paths: string[]): string {
  const firstSegment = paths[0]?.split('/').filter(Boolean)[0];
  return firstSegment || 'Carpeta seleccionada';
}

function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return blob.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsText(blob);
  });
}

export async function inspectFolderFiles(input: FileList | File[]): Promise<FolderIntakeResult> {
  const sourceFiles = Array.from(input)
    .map((file) => ({ file, path: normalizePath(file) }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const files: IntakeFileRecord[] = [];
  const contextParts: string[] = [];
  let contextLength = 0;
  let redactedCount = 0;

  for (const [index, entry] of sourceFiles.entries()) {
    if (index >= MAX_FILES) {
      files.push({
        path: entry.path,
        size: entry.file.size,
        outcome: 'excluded',
        reason: `Límite de ${MAX_FILES} archivos`,
      });
      continue;
    }

    const exclusionReason = getExclusionReason(entry.path);
    if (exclusionReason) {
      files.push({
        path: entry.path,
        size: entry.file.size,
        outcome: 'excluded',
        reason: exclusionReason,
      });
      continue;
    }

    if (contextLength >= MAX_CONTEXT_CHARS) {
      files.push({
        path: entry.path,
        size: entry.file.size,
        outcome: 'excluded',
        reason: 'Límite seguro de contexto alcanzado',
      });
      continue;
    }

    const rawText = await readBlobText(entry.file.slice(0, MAX_FILE_READ_BYTES));
    const sanitized = redactSensitiveValues(rawText);
    const cleanText = sanitized.text;
    redactedCount += sanitized.redactedCount;
    if (!cleanText) {
      files.push({
        path: entry.path,
        size: entry.file.size,
        outcome: 'excluded',
        reason: 'Archivo vacío',
      });
      continue;
    }

    const header = `\n### ARCHIVO: ${entry.path}\n`;
    const remainingChars = Math.max(MAX_CONTEXT_CHARS - contextLength - header.length, 0);
    const allowedChars = Math.min(MAX_CHARS_PER_FILE, remainingChars);

    if (allowedChars < 160) {
      files.push({
        path: entry.path,
        size: entry.file.size,
        outcome: 'excluded',
        reason: 'Límite seguro de contexto alcanzado',
      });
      continue;
    }

    const content = cleanText.slice(0, allowedChars);
    const wasTruncated =
      entry.file.size > MAX_FILE_READ_BYTES || cleanText.length > allowedChars;
    const part = `${header}${content}${wasTruncated ? '\n[CONTENIDO TRUNCADO]' : ''}`;
    contextParts.push(part);
    contextLength += part.length;
    files.push({
      path: entry.path,
      size: entry.file.size,
      outcome: wasTruncated ? 'truncated' : 'included',
      reason: wasTruncated ? 'Contenido limitado para proteger rendimiento y contexto' : undefined,
      redactedCount: sanitized.redactedCount || undefined,
    });
  }

  const paths = sourceFiles.map((entry) => entry.path);
  const includedCount = files.filter((file) => file.outcome !== 'excluded').length;
  const excludedCount = files.filter((file) => file.outcome === 'excluded').length;
  const truncatedCount = files.filter((file) => file.outcome === 'truncated').length;

  return {
    folderName: inferFolderName(paths),
    totalFiles: sourceFiles.length,
    includedCount,
    excludedCount,
    truncatedCount,
    redactedCount,
    context: contextParts.join('\n').trim(),
    files,
  };
}

export function createTextSource(content: string, objective: string): AIMapTextSource {
  const sanitized = redactSensitiveValues(content);
  const normalized = sanitized.text;
  const firstLine = normalized.split('\n').find((line) => line.trim().length > 0)?.trim();

  return {
    kind: 'text',
    name: firstLine?.slice(0, 72) || 'Contexto pegado',
    objective: objective.trim(),
    content: normalized,
    redactedCount: sanitized.redactedCount,
  };
}

export function createFolderSource(
  inventory: FolderIntakeResult,
  objective: string
): AIMapFolderSource {
  return {
    kind: 'folder',
    name: inventory.folderName,
    objective: objective.trim(),
    content: inventory.context,
    redactedCount: inventory.redactedCount,
    inventory,
  };
}
