import type { APTechnicalBlueprintTemplate } from '@/data/apLibrary';
import type { FlowEdge, FlowNode } from '@/lib/types';

export interface AIProcessGraph {
  id: string;
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface AIProcessLaneSpec {
  key: string;
  title: string;
  stageTitles: readonly string[];
}

interface AIProcessCaseSpec {
  lanes: readonly [AIProcessLaneSpec, AIProcessLaneSpec, AIProcessLaneSpec, AIProcessLaneSpec];
  layerLaneByTitle: Readonly<Record<string, number>>;
  documentationLane: number;
  integrationsLane: number;
}

interface AuxiliaryCard {
  id: string;
  laneIndex: number;
  label: string;
  subLabel: string;
  color?: 'blue' | 'slate';
}

const PROCESS_SPECS: Readonly<Record<string, AIProcessCaseSpec>> = {
  'tpl-blueprint-visionpro': {
    lanes: [
      {
        key: 'sponsor-governance',
        title: 'Sponsor y gobierno',
        stageTitles: ['Definir caso y criterio', 'Decidir escala'],
      },
      {
        key: 'field-edge',
        title: 'Campo y captura edge',
        stageTitles: ['Validar readiness de cámaras y datos', 'Configurar edge y NVR'],
      },
      {
        key: 'vision-platform',
        title: 'Plataforma VisionPro, IA y datos',
        stageTitles: ['Diseñar solución', 'Calibrar modelos', 'Ejecutar piloto', 'Detectar evento'],
      },
      {
        key: 'site-operations',
        title: 'Operación de obra',
        stageTitles: ['Revisar con humano', 'Asignar acción y SLA', 'Cerrar con evidencia'],
      },
    ],
    layerLaneByTitle: {
      'Captura y edge': 1,
      'Ingesta y evidencia': 2,
      'Computer vision y MLOps': 2,
      'Aplicación operativa': 3,
      'Gobierno y seguridad': 0,
      'Cloud, multiobra y recovery': 2,
    },
    documentationLane: 2,
    integrationsLane: 2,
  },
  'tpl-blueprint-aecode-f3': {
    lanes: [
      {
        key: 'professional',
        title: 'Profesional',
        stageTitles: [
          'Entrar y registrarse',
          'Completar onboarding y diagnóstico',
          'Iniciar skill y cápsulas',
          'Practicar',
          'Subir evidencia',
        ],
      },
      {
        key: 'learning-os',
        title: 'Learning OS',
        stageTitles: ['Recibir ruta', 'Actualizar Skill Passport y siguiente ruta'],
      },
      {
        key: 'ai-data-adapters',
        title: 'IA, datos y adaptadores',
        stageTitles: ['Recibir evaluación IA preliminar'],
      },
      {
        key: 'academic-operations',
        title: 'Academia y operaciones',
        stageTitles: ['Revisar con rúbrica humana', 'Validar skill'],
      },
    ],
    layerLaneByTitle: {
      Experiencia: 0,
      Aplicación: 1,
      'Dominio de aprendizaje': 1,
      Puertos: 2,
      Adaptadores: 2,
      'Eventos y analítica': 2,
      'Identidad, RBAC y despliegue': 3,
    },
    documentationLane: 2,
    integrationsLane: 2,
  },
  'tpl-blueprint-esparq': {
    lanes: [
      {
        key: 'planning-control',
        title: 'Planificación y control',
        stageTitles: [
          'Cargar cronograma meta',
          'Dimensionar producción',
          'Programar trabajo',
          'Analizar histograma',
          'Generar alertas y reporte',
        ],
      },
      {
        key: 'field-crews',
        title: 'Campo y cuadrillas',
        stageTitles: [
          'Asignar cuadrillas y HH',
          'Capturar avance',
          'Adjuntar evidencia',
          'Conciliar tareo y asistencia',
        ],
      },
      {
        key: 'esparq-platform',
        title: 'Plataforma ESPARQ',
        stageTitles: ['Consolidar vista multiobra'],
      },
      { key: 'integrations-governance', title: 'Integraciones y gobierno', stageTitles: [] },
    ],
    layerLaneByTitle: {
      'Campo y entradas': 1,
      'Interfaz Next.js': 2,
      'Dominio de planificación y control': 2,
      'Adaptadores Netlog / Bildin': 3,
      'Datos SQL y archivos': 2,
      'Identidad, roles y auditoría': 3,
      'Infraestructura y operación': 2,
    },
    documentationLane: 0,
    integrationsLane: 3,
  },
};

const LANE_X = 0;
const LANE_Y = 70;
const LANE_GAP = 54;
const LANE_WIDTH = 3_620;
const LANE_MIN_HEIGHT = 540;
const STAGE_X = 110;
const STAGE_Y = 92;
const STAGE_STEP = 305;
const STAGE_WIDTH = 250;
const STAGE_HEIGHT = 138;
const AUX_X = 110;
const AUX_Y = 272;
const AUX_COLUMNS = 6;
const AUX_WIDTH = 515;
const AUX_HEIGHT = 205;
const AUX_GAP_X = 60;
const AUX_GAP_Y = 32;

function projectName(template: APTechnicalBlueprintTemplate): string {
  return template.title.split('·').at(-1)?.trim() || template.title;
}

function stateLine(state: string): string {
  return `Estado: ${state}`;
}

function joinEntries(entries: readonly string[]): string {
  return entries.join(' · ');
}

function laneForStage(spec: AIProcessCaseSpec, title: string): number {
  const laneIndex = spec.lanes.findIndex((lane) => lane.stageTitles.includes(title));
  if (laneIndex < 0) {
    throw new Error(`AI Process stage has no lane assignment: ${title}`);
  }
  return laneIndex;
}

function chunk<T>(values: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function createAuxiliaryCards(
  template: APTechnicalBlueprintTemplate,
  spec: AIProcessCaseSpec
): AuxiliaryCard[] {
  const cards: AuxiliaryCard[] = [
    {
      id: 'current-truth',
      laneIndex: 0,
      label: 'Realidad actual',
      subLabel: `${stateLine(template.state)}\n${template.blueprint.currentTruth}`,
    },
    {
      id: 'target-outcome',
      laneIndex: 0,
      label: 'Resultado objetivo',
      subLabel: template.blueprint.targetOutcome,
    },
    ...template.blueprint.layers.map((layer, index) => ({
      id: `architecture-${index + 1}`,
      laneIndex: spec.layerLaneByTitle[layer.title] ?? 2,
      label: `Arquitectura · ${layer.title}`,
      subLabel: `${stateLine(layer.state)}\n${layer.purpose}\nComponentes: ${joinEntries(layer.components)}`,
    })),
    {
      id: 'data-entities',
      laneIndex: 2,
      label: 'Datos y entidades',
      subLabel: joinEntries(template.blueprint.entities),
    },
    {
      id: 'integrations',
      laneIndex: spec.integrationsLane,
      label: 'Integraciones',
      subLabel: template.blueprint.integrations
        .map((integration) => `${integration.name} — ${integration.state}: ${integration.purpose}`)
        .join('\n'),
    },
    {
      id: 'deployment',
      laneIndex: 0,
      label: 'Despliegue · Prototipo / MVP / Escala',
      subLabel: template.blueprint.deployment
        .map((phase) => `${phase.horizon} — ${phase.state}: ${phase.description}`)
        .join('\n'),
    },
  ];

  chunk(template.blueprint.technicalDocumentation, 4).forEach((documents, index) => {
    cards.push({
      id: `documentation-${index + 1}`,
      laneIndex: spec.documentationLane,
      label: index === 0 ? 'Documentación técnica' : 'Documentación técnica · continuación',
      subLabel: documents
        .map((document) => `${document.title} — ${document.state}: ${document.contribution}`)
        .join('\n'),
    });
  });

  chunk(template.blueprint.validationGates, 3).forEach((gates, index) => {
    cards.push({
      id: `validation-gates-${index + 1}`,
      laneIndex: 3,
      label: index === 0 ? 'Gates de validación' : 'Gates de validación · continuación',
      subLabel: gates.map((gate) => `${gate.title} — ${gate.state}: ${gate.evidence}`).join('\n'),
    });
  });

  cards.push(
    {
      id: 'human-gate',
      laneIndex: 3,
      label: 'Decisión humana',
      subLabel: template.humanGate,
    },
    {
      id: 'fallback',
      laneIndex: 3,
      label: 'Fallback',
      subLabel: template.fallback,
      color: 'slate',
    },
    {
      id: 'next-action',
      laneIndex: 3,
      label: 'Siguiente acción',
      subLabel: template.nextAction,
    },
    {
      id: 'truth-boundaries',
      laneIndex: 3,
      label: 'Límites de verdad',
      subLabel: template.blueprint.exclusions.map((entry) => `• ${entry}`).join('\n'),
      color: 'slate',
    }
  );

  return cards;
}

function createLaneNode(
  template: APTechnicalBlueprintTemplate,
  lane: AIProcessLaneSpec,
  laneIndex: number,
  laneHeight: number
): FlowNode {
  return {
    id: `${template.id}:lane:${lane.key}`,
    type: 'section',
    position: { x: LANE_X, y: LANE_Y + laneIndex * (laneHeight + LANE_GAP) },
    data: {
      label: `${laneIndex + 1}. ${lane.title}`,
      subLabel: 'Lane del sistema de producción',
      color: 'blue',
      colorMode: 'subtle',
      fontFamily: 'plus-jakarta',
      align: 'center',
      sectionSizingMode: 'manual',
      sectionLayoutMode: 'freeform',
      sectionOrder: laneIndex,
      sectionLocked: false,
      sectionHidden: false,
      sectionCollapsed: false,
      aiProcessLane: true,
      aiProcessLaneKey: lane.key,
    },
    style: { width: LANE_WIDTH, height: laneHeight },
    zIndex: -10,
  };
}

function createChildNode(params: {
  id: string;
  parentId: string;
  position: { x: number; y: number };
  label: string;
  subLabel: string;
  width: number;
  height: number;
  color?: 'blue' | 'slate';
}): FlowNode {
  return {
    id: params.id,
    parentId: params.parentId,
    type: 'process',
    position: params.position,
    data: {
      label: params.label,
      subLabel: params.subLabel,
      color: params.color ?? 'blue',
      colorMode: 'subtle',
      shape: 'rounded',
      align: 'center',
      fontFamily: 'plus-jakarta',
      subLabelFontFamily: 'plus-jakarta',
      fontSize: '15',
      fontWeight: '700',
      subLabelFontSize: '11',
      subLabelFontWeight: '500',
    },
    style: { width: params.width, height: params.height },
    zIndex: 1,
  };
}

function createEdge(id: string, source: string, target: string, label?: string): FlowEdge {
  return {
    id,
    source,
    target,
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'smoothstep',
    animated: false,
    label,
    data: {
      routingMode: 'manual',
      connectionType: 'fixed',
      strokeWidth: 2,
      opacity: 0.86,
    },
  };
}

export function isTechnicalBlueprintTemplate(
  template: APTechnicalBlueprintTemplate | null | undefined
): template is APTechnicalBlueprintTemplate {
  return template?.kind === 'template' && template.templateType === 'technical-blueprint';
}

export function buildAIProcessGraph(template: APTechnicalBlueprintTemplate): AIProcessGraph {
  const spec = PROCESS_SPECS[template.id];
  if (!spec) {
    throw new Error(`No native AI Process specification exists for ${template.id}`);
  }

  const auxiliaryCards = createAuxiliaryCards(template, spec);
  const maxAuxiliaryRows = Math.max(
    ...spec.lanes.map((_, laneIndex) =>
      Math.ceil(auxiliaryCards.filter((card) => card.laneIndex === laneIndex).length / AUX_COLUMNS)
    ),
    1
  );
  const laneHeight = Math.max(
    LANE_MIN_HEIGHT,
    AUX_Y + maxAuxiliaryRows * (AUX_HEIGHT + AUX_GAP_Y) + 28
  );
  const laneNodes = spec.lanes.map((lane, laneIndex) =>
    createLaneNode(template, lane, laneIndex, laneHeight)
  );
  const laneIds = laneNodes.map((lane) => lane.id);
  const title = `AI Process · ${projectName(template)}`;
  const titleNode: FlowNode = {
    id: `${template.id}:title`,
    type: 'text',
    position: { x: (LANE_WIDTH - 940) / 2, y: -84 },
    data: {
      label: `${title}\nSistema de producción · flujo horizontal de izquierda a derecha`,
      color: 'blue',
      align: 'center',
      fontFamily: 'plus-jakarta',
      fontSize: '18',
      fontWeight: '700',
    },
    style: { width: 940, height: 72 },
    zIndex: 2,
  };

  const stageNodes = template.stages.map((stage, index) => {
    const laneIndex = laneForStage(spec, stage.title);
    return createChildNode({
      id: `${template.id}:stage:${index + 1}`,
      parentId: laneIds[laneIndex],
      position: { x: STAGE_X + index * STAGE_STEP, y: STAGE_Y },
      label: `ETAPA ${String(index + 1).padStart(2, '0')} · ${stage.title}`,
      subLabel: `${stage.owner}\nEvidencia: ${stage.evidence}\n${stateLine(template.state)}`,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
    });
  });

  const cardsByLanePosition = new Map<number, number>();
  const auxiliaryNodes = auxiliaryCards.map((card) => {
    const currentIndex = cardsByLanePosition.get(card.laneIndex) ?? 0;
    cardsByLanePosition.set(card.laneIndex, currentIndex + 1);
    const column = currentIndex % AUX_COLUMNS;
    const row = Math.floor(currentIndex / AUX_COLUMNS);
    return createChildNode({
      id: `${template.id}:support:${card.id}`,
      parentId: laneIds[card.laneIndex],
      position: {
        x: AUX_X + column * (AUX_WIDTH + AUX_GAP_X),
        y: AUX_Y + row * (AUX_HEIGHT + AUX_GAP_Y),
      },
      label: card.label,
      subLabel: card.subLabel,
      width: AUX_WIDTH,
      height: AUX_HEIGHT,
      color: card.color,
    });
  });

  const stageEdges = stageNodes
    .slice(0, -1)
    .map((node, index) =>
      createEdge(`${template.id}:edge:stage:${index + 1}`, node.id, stageNodes[index + 1].id)
    );
  const humanGateId = `${template.id}:support:human-gate`;
  const fallbackId = `${template.id}:support:fallback`;
  const nextActionId = `${template.id}:support:next-action`;
  const decisionEdges = [
    createEdge(`${template.id}:edge:decision`, stageNodes.at(-1)!.id, humanGateId, 'revisión'),
    createEdge(`${template.id}:edge:approved`, humanGateId, nextActionId, 'aprobado'),
    createEdge(`${template.id}:edge:fallback`, humanGateId, fallbackId, 'no concluyente'),
  ];

  return {
    id: `ai-process:${template.id}`,
    title,
    // React Flow requires parents before their children.
    nodes: [titleNode, ...laneNodes, ...stageNodes, ...auxiliaryNodes],
    edges: [...stageEdges, ...decisionEdges],
  };
}
