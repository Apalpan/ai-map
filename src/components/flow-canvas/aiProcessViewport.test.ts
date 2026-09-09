import { describe, expect, it } from 'vitest';
import type { FlowNode } from '@/lib/types';
import { buildAIProcessGraph } from '@/services/apLibrary/buildAIProcessGraph';
import { AP_TEMPLATES, type APTechnicalBlueprintTemplate } from '@/data/apLibrary';
import { getAIProcessInitialViewport, isAIProcessGraph } from './aiProcessViewport';

describe('AI Process initial viewport', () => {
  it('anchors the first two lanes at the upper-left with readable zoom', () => {
    const template = AP_TEMPLATES.find(
      (item): item is APTechnicalBlueprintTemplate => item.id === 'tpl-blueprint-visionpro'
    );
    const graph = buildAIProcessGraph(template!);

    const viewport = getAIProcessInitialViewport(graph.nodes);

    expect(isAIProcessGraph(graph.nodes)).toBe(true);
    expect(viewport?.zoom).toBeGreaterThanOrEqual(0.72);
    expect(viewport?.x).toBe(48);
    expect(viewport?.y).toBeCloseTo(-42.4);

    const firstLane = graph.nodes.find((node) => node.data.aiProcessLaneKey === 'sponsor-governance');
    const secondLane = graph.nodes.find((node) => node.data.aiProcessLaneKey === 'field-edge');
    const firstStage = graph.nodes.find((node) => node.id.endsWith(':stage:1'));
    const secondStage = graph.nodes.find((node) => node.id.endsWith(':stage:2'));
    expect(firstStage?.parentId).toBe(firstLane?.id);
    expect(secondStage?.parentId).toBe(secondLane?.id);
    expect((firstLane!.position.y + firstStage!.position.y) * viewport!.zoom + viewport!.y).toBeGreaterThan(60);
    expect((secondLane!.position.y + secondStage!.position.y) * viewport!.zoom + viewport!.y).toBeLessThan(720);
  });

  it('does not alter the initial fit contract for regular diagrams', () => {
    const regularNode = {
      id: 'regular',
      type: 'process',
      position: { x: 0, y: 0 },
      data: { label: 'Regular' },
    } as FlowNode;

    expect(isAIProcessGraph([regularNode])).toBe(false);
    expect(getAIProcessInitialViewport([regularNode])).toBeUndefined();
  });
});
