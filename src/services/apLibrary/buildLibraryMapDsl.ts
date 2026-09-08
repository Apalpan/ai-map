import type { APLibraryItem } from '@/data/apLibrary';

function clean(value: string, max = 112): string {
  return value.replace(/[{}]/g, '').replace(/\[|\]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildLibraryMapDsl(item: APLibraryItem): string {
  const lines = [
    `flow: "${clean(item.title, 56)}"`,
    'direction: LR',
    `[start] source: Fuente: ${clean(item.source)} | Estado: ${item.state}`,
    `[note] context: Propósito: ${clean(item.purpose)} | Owner: ${clean(item.owner)}`,
    `[note] inputs: Entradas: ${clean(item.inputs.join(' · '))}`,
  ];

  item.stages.forEach((stage, index) => {
    lines.push(
      `[process] stage_${index + 1}: ${clean(stage.title)} | Owner: ${clean(stage.owner)} | Evidencia: ${clean(stage.evidence)}`
    );
  });

  lines.push(
    `[decision] human_gate: Decisión humana: ${clean(item.humanGate)}`,
    `[note] evidence: Evidencia requerida: ${clean(item.evidence.join(' · '))}`,
    `[note] fallback: Fallback: ${clean(item.fallback)}`,
    `[end] next_action: Siguiente acción: ${clean(item.nextAction)}`,
    'source -> context',
    'context -> inputs',
    'inputs -> stage_1'
  );

  for (let index = 1; index < item.stages.length; index += 1) {
    lines.push(`stage_${index} -> stage_${index + 1}`);
  }

  const lastStage = `stage_${item.stages.length}`;
  lines.push(
    `${lastStage} -> human_gate`,
    'human_gate -> |Aprobado| evidence',
    'human_gate -> |Requiere corrección| fallback',
    'evidence -> next_action',
    'fallback -> next_action'
  );

  return lines.join('\n');
}
