import { describe, expect, it } from 'vitest';
import { getFlowCanvasClassName } from './flowCanvasReactFlowContracts';

describe('flow canvas workspace presentation', () => {
  it('keeps the GEN+ pastel workspace class in both interaction modes', () => {
    expect(getFlowCanvasClassName(true)).toContain('flow-canvas-workspace');
    expect(getFlowCanvasClassName(true)).toContain('flow-canvas-select-mode');
    expect(getFlowCanvasClassName(false)).toContain('flow-canvas-workspace');
    expect(getFlowCanvasClassName(false)).toContain('flow-canvas-pan-mode');
  });
});
