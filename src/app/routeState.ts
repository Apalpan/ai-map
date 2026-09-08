export interface FlowEditorRouteState {
  openImportDialog?: boolean;
  openTemplates?: boolean;
  openStudioAI?: boolean;
  initialAIPrompt?: string;
  initialTemplateId?: string;
  initialOpenFlowDsl?: string;
}

export function createFlowEditorImportRouteState(): FlowEditorRouteState {
  return { openImportDialog: true };
}

export function createFlowEditorInitialTemplateRouteState(templateId: string): FlowEditorRouteState {
  return { initialTemplateId: templateId };
}

export function createFlowEditorAIRouteState(): FlowEditorRouteState {
  return { openStudioAI: true };
}

export function createFlowEditorAIMapRouteState(prompt: string): FlowEditorRouteState {
  return { openStudioAI: true, initialAIPrompt: prompt };
}

export function createFlowEditorOpenFlowDslRouteState(dsl: string): FlowEditorRouteState {
  return { initialOpenFlowDsl: dsl };
}

export function shouldOpenFlowEditorImportDialog(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return (state as FlowEditorRouteState).openImportDialog === true;
}

export function shouldOpenFlowEditorTemplates(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return (state as FlowEditorRouteState).openTemplates === true;
}

export function shouldOpenFlowEditorAI(state: unknown): boolean {
  if (!state || typeof state !== 'object') return false;
  return (state as FlowEditorRouteState).openStudioAI === true;
}

export function getInitialFlowEditorAIPrompt(state: unknown): string | null {
  if (!state || typeof state !== 'object') return null;
  const prompt = (state as FlowEditorRouteState).initialAIPrompt;
  return typeof prompt === 'string' && prompt.trim().length > 0 ? prompt : null;
}

export function getInitialFlowEditorTemplateId(state: unknown): string | null {
  if (!state || typeof state !== 'object') return null;
  return typeof (state as FlowEditorRouteState).initialTemplateId === 'string'
    ? (state as FlowEditorRouteState).initialTemplateId as string
    : null;
}

export function getInitialFlowEditorOpenFlowDsl(state: unknown): string | null {
  if (!state || typeof state !== 'object') return null;
  return typeof (state as FlowEditorRouteState).initialOpenFlowDsl === 'string'
    ? (state as FlowEditorRouteState).initialOpenFlowDsl as string
    : null;
}
