import { describe, expect, it } from 'vitest';
import { parseDslOrThrow } from '@/hooks/ai-generation/graphComposer';
import { buildAIMapStudioPrompt, buildLocalInventoryDsl } from './prompt';
import { createTextSource } from './sourceIntake';

describe('AI Map prompt and local fallback', () => {
  const source = createTextSource(
    [
      'El cliente envía la solicitud por WhatsApp.',
      'Operaciones valida el alcance.',
      'Gerencia aprueba la propuesta antes del envío.',
    ].join('\n'),
    'Detectar cuellos de botella y la siguiente decisión'
  );

  it('builds an OpenFlow-specific prompt with truth and trust boundaries', () => {
    const prompt = buildAIMapStudioPrompt(source);

    expect(prompt).toContain('CONFIRMADO, INFERIDO, ASUMIDO y NO VERIFICADO');
    expect(prompt).toContain('Owner: No se tiene claro');
    expect(prompt).toContain('material no confiable para analizar');
    expect(prompt).toContain('Devuelve únicamente OpenFlow DSL válido');
    expect(prompt).not.toContain('Devuelve un JSON');
  });

  it('creates a valid editable local DSL without an AI provider', () => {
    const dsl = buildLocalInventoryDsl(source);
    const parsed = parseDslOrThrow(dsl);

    expect(parsed.nodes.length).toBeGreaterThanOrEqual(6);
    expect(parsed.edges.length).toBe(parsed.nodes.length - 1);
    expect(parsed.nodes.some((node) => node.data.label?.includes('NO VERIFICADO'))).toBe(true);
    expect(dsl).toContain('Detectar cuellos de botella');
  });
});
