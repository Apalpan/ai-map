import type { APLibraryItem } from '@/data/apLibrary';

function clean(value: string, max = 112): string {
  return value.replace(/[{}]/g, '').replace(/\[|\]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildLibraryMapDsl(item: APLibraryItem): string {
  const technicalTemplate = item.kind === 'template' && item.templateType === 'technical-blueprint'
    ? item
    : null;
  const lines = [
    `flow: "${clean(item.title, 56)}"`,
    'direction: LR',
    `[start] source: Fuente: ${clean(item.source)} | Estado: ${item.state}`,
    technicalTemplate
      ? `[note] context: Realidad actual: ${clean(technicalTemplate.blueprint.currentTruth)} | Owner: ${clean(item.owner)}`
      : `[note] context: Propósito: ${clean(item.purpose)} | Owner: ${clean(item.owner)}`,
    technicalTemplate
      ? `[note] inputs: Resultado objetivo: ${clean(technicalTemplate.blueprint.targetOutcome)}`
      : `[note] inputs: Entradas: ${clean(item.inputs.join(' · '))}`,
  ];

  item.stages.forEach((stage, index) => {
    lines.push(
      `[process] stage_${index + 1}: ${clean(stage.title)} | Owner: ${clean(stage.owner)} | Evidencia: ${clean(stage.evidence)}`
    );
  });

  if (technicalTemplate) {
    technicalTemplate.blueprint.layers.forEach((layer, index) => {
      lines.push(
        `[process] arch_${index + 1}: Capa ${index + 1}: ${clean(layer.title)} | Estado: ${layer.state} | ${clean(layer.components.join(' · '))}`
      );
    });
    lines.push(
      `[note] architecture_data: Datos: ${clean(technicalTemplate.blueprint.entities.join(' · '))}`,
      `[note] architecture_integrations: Integraciones: ${clean(technicalTemplate.blueprint.integrations.map((integration) => `${integration.name} (${integration.state})`).join(' · '))}`,
      `[note] architecture_deployment: Despliegue: ${clean(technicalTemplate.blueprint.deployment.map((phase) => `${phase.horizon} (${phase.state})`).join(' · '))}`,
      `[note] architecture_docs: Documentación: ${clean(technicalTemplate.blueprint.technicalDocumentation.map((document) => `${document.title} (${document.state})`).join(' · '))}`,
      `[decision] architecture_validation: Gates: ${clean(technicalTemplate.blueprint.validationGates.map((gate) => `${gate.title} (${gate.state})`).join(' · '))}`,
      `[note] architecture_exclusions: Exclusiones: ${clean(technicalTemplate.blueprint.exclusions.join(' · '))}`
    );
  }

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

  if (technicalTemplate) {
    lines.push('context -> arch_1');
    for (let index = 1; index < technicalTemplate.blueprint.layers.length; index += 1) {
      lines.push(`arch_${index} -> arch_${index + 1}`);
    }
    const lastLayer = `arch_${technicalTemplate.blueprint.layers.length}`;
    lines.push(
      `${lastLayer} -> architecture_data`,
      'architecture_data -> architecture_integrations',
      'architecture_integrations -> architecture_deployment',
      'architecture_deployment -> architecture_docs',
      'architecture_docs -> architecture_validation',
      'architecture_validation -> architecture_exclusions',
      'architecture_exclusions -> human_gate'
    );
  }

  return lines.join('\n');
}
