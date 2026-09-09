import type { FlowNode } from '@/lib/types';

export interface AIProcessInitialViewport {
  x: number;
  y: number;
  zoom: number;
}

const INITIAL_AI_PROCESS_ZOOM = 0.72;

export function isAIProcessGraph(nodes: FlowNode[]): boolean {
  return nodes.some((node) => node.type === 'section' && node.data.aiProcessLane === true);
}

export function getAIProcessInitialViewport(
  nodes: FlowNode[]
): AIProcessInitialViewport | undefined {
  if (!isAIProcessGraph(nodes)) {
    return undefined;
  }

  const firstLane = nodes.find(
    (node) => node.type === 'section' && node.data.aiProcessLane === true
  );
  if (!firstLane) {
    return undefined;
  }

  return {
    x: 48 - firstLane.position.x * INITIAL_AI_PROCESS_ZOOM,
    y: 8 - firstLane.position.y * INITIAL_AI_PROCESS_ZOOM,
    zoom: INITIAL_AI_PROCESS_ZOOM,
  };
}
