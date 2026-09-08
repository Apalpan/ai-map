import { describe, expect, it } from 'vitest';
import { AP_AGENTS, AP_CASES, AP_LIBRARY_BY_TAB } from '@/data/apLibrary';
import { parseOpenFlowDslV2 } from '@/lib/flowmindDSLParserV2';
import { buildLibraryMapDsl } from './buildLibraryMapDsl';

describe('buildLibraryMapDsl', () => {
  it('includes source, state, owner, evidence, human gate, fallback and next action', () => {
    const dsl = buildLibraryMapDsl(AP_CASES[0]);

    expect(dsl).toContain('Fuente:');
    expect(dsl).toContain('Estado: Documentado');
    expect(dsl).toContain('Owner:');
    expect(dsl).toContain('Evidencia:');
    expect(dsl).toContain('[decision] human_gate: Decisión humana:');
    expect(dsl).toContain('[note] fallback: Fallback:');
    expect(dsl).toContain('[end] next_action: Siguiente acción:');
  });

  it('creates an editable agent map without claiming tool connections', () => {
    const dsl = buildLibraryMapDsl(AP_AGENTS[0]);
    expect(dsl).toContain('Vault Researcher');
    expect(dsl).not.toContain('C:\\');
  });

  it('produces valid DSL for every public catalog item without implicit nodes', () => {
    Object.values(AP_LIBRARY_BY_TAB).flat().forEach((item) => {
      const parsed = parseOpenFlowDslV2(buildLibraryMapDsl(item));
      expect(parsed.errors, item.title).toHaveLength(0);
      expect(parsed.nodes, item.title).toHaveLength(item.stages.length + 7);
      expect(parsed.edges, item.title).toHaveLength(item.stages.length + 7);
    });
  });
});
