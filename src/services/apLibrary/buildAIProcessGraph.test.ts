import { describe, expect, it } from 'vitest';
import { AP_TEMPLATES, type APTechnicalBlueprintTemplate } from '@/data/apLibrary';
import { buildAIProcessGraph } from './buildAIProcessGraph';

const blueprints = AP_TEMPLATES.filter(
  (template): template is APTechnicalBlueprintTemplate =>
    template.templateType === 'technical-blueprint'
);

describe('buildAIProcessGraph', () => {
  it.each(blueprints)(
    'builds $title as a native four-lane left-to-right AI Process',
    (template) => {
      const graph = buildAIProcessGraph(template);
      const lanes = graph.nodes.filter((node) => node.type === 'section');
      const stageNodes = graph.nodes.filter((node) => node.id.includes(':stage:'));

      expect(graph.title).toBe(`AI Process · ${template.title.split('·').at(-1)?.trim()}`);
      expect(lanes).toHaveLength(4);
      expect(lanes.every((lane) => lane.data.aiProcessLane === true)).toBe(true);
      expect(lanes.every((lane) => lane.data.sectionSizingMode === 'manual')).toBe(true);
      expect(lanes.every((lane) => Number(lane.style?.width) > Number(lane.style?.height))).toBe(
        true
      );
      expect(stageNodes).toHaveLength(template.stages.length);

      const parentIndexes = new Map(lanes.map((lane) => [lane.id, graph.nodes.indexOf(lane)]));
      for (const node of stageNodes) {
        expect(parentIndexes.get(node.parentId ?? '')).toBeLessThan(graph.nodes.indexOf(node));
        expect(node.data.fontFamily).toBe('plus-jakarta');
        expect(node.data.subLabelFontFamily).toBe('plus-jakarta');
        expect(node.data.align).toBe('center');
        expect(Number(node.style?.width)).toBeGreaterThanOrEqual(250);
        expect(Number(node.style?.height)).toBeGreaterThanOrEqual(138);
        expect(node.data.label).toMatch(/^ETAPA \d{2} · /);
        expect(node.data.label).not.toMatch(/^\d+\. /);
      }

      const orderedStageX = stageNodes.map((node) => node.position.x);
      expect(orderedStageX).toEqual([...orderedStageX].sort((left, right) => left - right));
      expect(new Set(orderedStageX).size).toBe(template.stages.length);
      for (const stage of template.stages) {
        expect(stageNodes.filter((node) => node.data.label.includes(stage.title))).toHaveLength(1);
      }

      expect(graph.edges.filter((edge) => edge.id.includes(':edge:stage:'))).toHaveLength(
        template.stages.length - 1
      );
    }
  );

  it.each(blueprints)(
    'includes complete enabling and evidence contracts for $title',
    (template) => {
      const graph = buildAIProcessGraph(template);
      const labels = graph.nodes.map((node) => node.data.label).join('\n');
      const content = graph.nodes
        .map((node) => `${node.data.label}\n${node.data.subLabel ?? ''}`)
        .join('\n');

      expect(labels).toContain('Realidad actual');
      expect(labels).toContain('Resultado objetivo');
      expect(labels).toContain('Datos y entidades');
      expect(labels).toContain('Integraciones');
      expect(labels).toContain('Despliegue · Prototipo / MVP / Escala');
      expect(labels).toContain('Documentación técnica');
      expect(labels).toContain('Gates de validación');
      expect(labels).toContain('Decisión humana');
      expect(labels).toContain('Fallback');
      expect(labels).toContain('Siguiente acción');
      expect(labels).toContain('Límites de verdad');
      for (const layer of template.blueprint.layers) {
        expect(labels).toContain(`Arquitectura · ${layer.title}`);
        expect(content).toContain(`Estado: ${layer.state}`);
      }
      for (const exclusion of template.blueprint.exclusions) {
        expect(content).toContain(exclusion);
      }
    }
  );

  it('keeps the approved lane assignment for each production system', () => {
    const expected: Record<string, Record<string, string[]>> = {
      'tpl-blueprint-visionpro': {
        'Sponsor y gobierno': ['Definir caso y criterio', 'Decidir escala'],
        'Campo y captura edge': ['Validar readiness de cámaras y datos', 'Configurar edge y NVR'],
        'Plataforma VisionPro, IA y datos': [
          'Diseñar solución',
          'Calibrar modelos',
          'Ejecutar piloto',
          'Detectar evento',
        ],
        'Operación de obra': ['Revisar con humano', 'Asignar acción y SLA', 'Cerrar con evidencia'],
      },
      'tpl-blueprint-aecode-f3': {
        Profesional: [
          'Entrar y registrarse',
          'Completar onboarding y diagnóstico',
          'Iniciar skill y cápsulas',
          'Practicar',
          'Subir evidencia',
        ],
        'Learning OS': ['Recibir ruta', 'Actualizar Skill Passport y siguiente ruta'],
        'IA, datos y adaptadores': ['Recibir evaluación IA preliminar'],
        'Academia y operaciones': ['Revisar con rúbrica humana', 'Validar skill'],
      },
      'tpl-blueprint-esparq': {
        'Planificación y control': [
          'Cargar cronograma meta',
          'Dimensionar producción',
          'Programar trabajo',
          'Analizar histograma',
          'Generar alertas y reporte',
        ],
        'Campo y cuadrillas': [
          'Asignar cuadrillas y HH',
          'Capturar avance',
          'Adjuntar evidencia',
          'Conciliar tareo y asistencia',
        ],
        'Plataforma ESPARQ': ['Consolidar vista multiobra'],
        'Integraciones y gobierno': [],
      },
    };

    for (const template of blueprints) {
      const graph = buildAIProcessGraph(template);
      const lanes = graph.nodes.filter((node) => node.type === 'section');
      for (const [laneTitle, stageTitles] of Object.entries(expected[template.id])) {
        const lane = lanes.find((candidate) => candidate.data.label.includes(laneTitle));
        expect(lane).toBeTruthy();
        const laneStageLabels = graph.nodes
          .filter((node) => node.parentId === lane?.id && node.id.includes(':stage:'))
          .map((node) => String(node.data.label));
        expect(laneStageLabels).toHaveLength(stageTitles.length);
        for (const title of stageTitles) {
          expect(laneStageLabels.some((label) => label.includes(title))).toBe(true);
        }
      }
    }
  });
});
