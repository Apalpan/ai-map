import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useFlowStore } from './store';

vi.mock('@/components/auth/AccessGate', () => ({
  AccessGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAccessSession: () => ({ isLoggingOut: false, logout: vi.fn() }),
}));

vi.mock('./components/HomePage', () => ({
  HomePage: ({
    onLaunch,
    onLaunchWithTemplates,
    onImportJSON,
    onCreateAIProcess,
  }: {
    onLaunch: () => void;
    onLaunchWithTemplates: () => void;
    onImportJSON: () => void;
    onCreateAIProcess: (graph: {
      id: string;
      title: string;
      nodes: Array<Record<string, unknown>>;
      edges: Array<Record<string, unknown>>;
    }) => void;
  }) => (
    <div data-testid="home-page">
      <button type="button" onClick={onLaunch}>
        Create Flow
      </button>
      <button type="button" onClick={onLaunchWithTemplates}>
        Open Templates
      </button>
      <button type="button" onClick={onImportJSON}>
        Import Flow
      </button>
      <button
        type="button"
        onClick={() => onCreateAIProcess({
          id: 'ai-process:test',
          title: 'AI Process · Test',
          nodes: [
            ...Array.from({ length: 4 }, (_, index) => ({
              id: `lane-${index + 1}`,
              type: 'section',
              position: { x: 0, y: 70 + index * 600 },
              data: { label: `Lane ${index + 1}`, aiProcessLane: true },
            })),
            {
              id: 'stage-1',
              type: 'process',
              parentId: 'lane-1',
              position: { x: 110, y: 92 },
              data: { label: 'Stage 1' },
            },
          ],
          edges: [{ id: 'edge-1', source: 'stage-1', target: 'stage-1' }],
        })}
      >
        Create AI Process
      </button>
    </div>
  ),
}));

vi.mock('./components/FlowEditor', () => ({
  FlowEditor: () => <div data-testid="flow-editor">Editor</div>,
}));

vi.mock('@/components/app/MobileWorkspaceGate', () => ({
  MobileWorkspaceGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/app/DocsSiteRedirect', () => ({
  DocsSiteRedirect: () => <div data-testid="docs-redirect" />,
}));

function resetEmptyWorkspace(): void {
  useFlowStore.setState({
    ...useFlowStore.getInitialState(),
    documents: [],
    activeDocumentId: '',
    tabs: [],
    activeTabId: '',
    nodes: [],
    edges: [],
  });
}

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    resetEmptyWorkspace();
  });

  it('redirects /canvas to home when no active document exists', async () => {
    window.history.pushState({}, '', '/#/canvas');

    render(<App />);

    expect(await screen.findByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('flow-editor')).toBeNull();
  });

  it('redirects invalid flow routes to home when no matching document exists', async () => {
    window.history.pushState({}, '', '/#/flow/missing-flow');

    render(<App />);

    expect(await screen.findByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('flow-editor')).toBeNull();
  });

  it('creates a document before opening the import flow from home', async () => {
    window.history.pushState({}, '', '/#/home');

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Import Flow' }));

    expect(await screen.findByTestId('flow-editor')).toBeTruthy();
    await waitFor(() => {
      expect(useFlowStore.getState().documents).toHaveLength(1);
      expect(useFlowStore.getState().activeDocumentId).not.toBe('');
      expect(window.location.hash).toMatch(/^#\/flow\//);
    });
  });

  it('navigates to the templates page from home without creating a document', async () => {
    window.history.pushState({}, '', '/#/home');

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Open Templates' }));

    await waitFor(() => {
      expect(window.location.hash).toBe('#/templates');
      expect(useFlowStore.getState().documents).toHaveLength(0);
      expect(useFlowStore.getState().activeDocumentId).toBe('');
    });
  });

  it('creates and names a document before opening a native AI Process', async () => {
    window.history.pushState({}, '', '/#/home');

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create AI Process' }));

    expect(await screen.findByTestId('flow-editor')).toBeTruthy();
    await waitFor(() => {
      const [document] = useFlowStore.getState().documents;
      expect(document?.name).toBe('AI Process · Test');
      expect(document?.pages[0]?.name).toBe('AI Process · Test');
      expect(useFlowStore.getState().nodes).toHaveLength(5);
      expect(useFlowStore.getState().nodes.filter((node) => node.type === 'section')).toHaveLength(4);
      expect(useFlowStore.getState().edges).toHaveLength(1);
      expect(window.location.hash).toMatch(/^#\/flow\//);
    });
  });
});
