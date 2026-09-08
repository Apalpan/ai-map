import { describe, expect, it } from 'vitest';
import { AP_AGENTS, AP_CASES, AP_LIBRARY_COUNTS, AP_PROCESSES, AP_TEMPLATES } from './apLibrary';

describe('AP Library public snapshot', () => {
  it('contains the confirmed catalog scope and no private local paths', () => {
    expect(AP_LIBRARY_COUNTS).toEqual({ cases: 12, processes: 12, templates: 7, agents: 11 });
    const serialized = JSON.stringify({ AP_CASES, AP_PROCESSES, AP_TEMPLATES, AP_AGENTS });
    expect(serialized).not.toMatch(/[A-Z]:\\/);
    expect(serialized).not.toContain('AP_Knowledge_OS');
  });

  it('keeps AgentFlow and ICEBOT non-operational and VisionPro limited to pilot wording', () => {
    expect(AP_CASES.find((item) => item.id === 'automatizacion-agentflow')?.state).toBe('WIP');
    expect(AP_CASES.find((item) => item.id === 'icebot')?.state).toBe('WIP');
    expect(AP_CASES.find((item) => item.id === 'visionpro-evento-cierre')?.outcome).toContain('Prototipo operativo en piloto');
  });

  it('keeps a differentiated sanitized source label for every priority case', () => {
    const sourceLabels = new Set(AP_CASES.map((item) => item.source));
    expect(sourceLabels.size).toBe(AP_CASES.length);
    expect([...sourceLabels].every((label) => label.includes('síntesis sanitizada'))).toBe(true);
  });
});
