import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { useFlowStore } from '@/store';
import type { FlowTab } from '@/lib/types';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';
import { recordOnboardingEvent } from '@/services/onboarding/events';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, fallback?: string) => fallback ?? _key,
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
      },
    }),
  };
});

vi.mock('./LanguageSelector', () => ({
  LanguageSelector: () => null,
}));

describe('HomePage integration flows', () => {
  function setEmptyHomeState(): void {
    useFlowStore.setState({
      documents: [],
      activeDocumentId: '',
      tabs: [],
      activeTabId: null,
      nodes: [],
      edges: [],
    });
  }

  beforeEach(() => {
    localStorage.clear();
    useFlowStore.setState({});
  });

  async function renderHomePage(
    props?: Partial<React.ComponentProps<typeof HomePage>>
  ): Promise<void> {
    await act(async () => {
      render(
        <MemoryRouter>
          <HomePage
            onLaunch={vi.fn()}
            onLaunchWithTemplates={vi.fn()}
            onLaunchWithTemplate={vi.fn()}
            onLaunchWithAI={vi.fn()}
            onGenerateAIMap={vi.fn()}
            onCreateLocalMap={vi.fn()}
            onImportJSON={vi.fn()}
            onOpenFlow={vi.fn()}
            {...props}
          />
        </MemoryRouter>
      );
    });
  }

  function createDocumentFromPages(id: string, name: string, pages: FlowTab[]): FlowDocument {
    return {
      id,
      name,
      createdAt: '2026-03-27T00:00:00.000Z',
      updatedAt: pages[0]?.updatedAt ?? '2026-03-27T00:00:00.000Z',
      activePageId: pages[0]?.id ?? '',
      pages,
    };
  }

  it('switches between home, templates, and settings views via sidebar', async () => {
    await renderHomePage();

    fireEvent.click(screen.getByTestId('sidebar-templates'));
    expect(screen.getByRole('heading', { name: 'Templates' })).toBeTruthy();
    expect(screen.getByText('Featured Templates')).toBeTruthy();

    fireEvent.click(screen.getByTestId('sidebar-settings'));
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(screen.getByText('AI Mapper')).toBeTruthy();
  });

  it('opens Biblioteca AP and creates a source-grounded editable map', async () => {
    const onCreateLocalMap = vi.fn();
    await renderHomePage({ onCreateLocalMap });

    fireEvent.click(screen.getByTestId('sidebar-library'));
    expect(screen.getByRole('heading', { name: 'Casos, procesos y agentes explicados para actuar.' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Crear mapa editable' }));

    expect(onCreateLocalMap).toHaveBeenCalledTimes(1);
    expect(onCreateLocalMap.mock.calls[0][0]).toContain('Decisión humana:');
  });

  it('hides and reopens the home sidebar while freeing the content area', async () => {
    await renderHomePage();

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar navegación lateral' }));
    expect(screen.queryByTestId('sidebar-home')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar navegación' }));
    expect(screen.getByTestId('sidebar-home')).toBeTruthy();
    expect(screen.getByAltText('Retrato de Alejandro Palpan')).toBeTruthy();
  });

  it('shows AI Map intake immediately on a first visit without a blocking legacy modal', async () => {
    setEmptyHomeState();

    await renderHomePage();

    expect(
      screen.getByRole('heading', {
        name: 'Convierte cualquier contexto en un mapa que sí se entiende.',
      })
    ).toBeTruthy();
    expect(screen.queryByText('Welcome to OpenFlowKit')).toBeNull();
  });

  it('opens the selected template flow from the homepage templates tab', async () => {
    const onLaunchWithTemplate = vi.fn();

    await renderHomePage({ onLaunchWithTemplate });

    fireEvent.click(screen.getByTestId('sidebar-templates'));
    fireEvent.click(screen.getByRole('button', { name: /AWS Event-Driven SaaS Platform/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Use Template' }));

    expect(onLaunchWithTemplate).toHaveBeenCalledTimes(1);
    expect(onLaunchWithTemplate).toHaveBeenCalledWith('aws-event-driven-saas-platform');
  });

  it('shows only explicitly featured templates on the homepage templates tab', async () => {
    await renderHomePage();

    fireEvent.click(screen.getByTestId('sidebar-templates'));

    expect(screen.getByRole('button', { name: /AWS Event-Driven SaaS Platform/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Product Discovery Workshop Map/i })).toBeNull();
  });

  it('exposes templates and the progressive AI Mapper path in the empty dashboard state', async () => {
    const onLaunchWithTemplates = vi.fn();
    const onGenerateAIMap = vi.fn();
    setEmptyHomeState();

    await renderHomePage({ onLaunchWithTemplates, onGenerateAIMap });

    fireEvent.click(await screen.findByTestId('home-open-templates'));
    fireEvent.change(screen.getByLabelText('¿Qué necesitas entender o decidir?'), {
      target: { value: 'Detectar cuellos de botella' },
    });
    fireEvent.change(screen.getByLabelText('Contexto del proyecto o proceso'), {
      target: { value: 'El equipo recibe solicitudes, valida el alcance y prepara la propuesta.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Mejorar con AI Mapper' }));

    expect(onLaunchWithTemplates).toHaveBeenCalledTimes(1);
    expect(onGenerateAIMap).toHaveBeenCalledTimes(1);
  });

  it('keeps the deterministic map primary and AI Mapper progressive', async () => {
    setEmptyHomeState();
    recordOnboardingEvent('welcome_prompt_selected', { source: 'welcome-modal' });
    recordOnboardingEvent('welcome_template_selected', { source: 'welcome-modal' });

    await renderHomePage();

    expect(screen.queryByText('Continue with a recent action')).toBeNull();
    expect(screen.getByRole('button', { name: 'Crear mapa base' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mejorar con AI Mapper' })).toBeTruthy();
    expect(screen.getByTestId('home-open-templates')).toBeTruthy();
  });

  it('opens persisted flows from the dashboard list', async () => {
    const onOpenFlow = vi.fn();
    useFlowStore.setState({
      documents: [
        createDocumentFromPages('tab-1', 'My Flow', [
          {
            id: 'tab-1',
            name: 'My Flow',
            diagramType: 'flowchart',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
          },
        ]),
      ],
      activeDocumentId: 'tab-1',
      tabs: [
        {
          id: 'tab-1',
          name: 'My Flow',
          diagramType: 'flowchart',
          nodes: [],
          edges: [],
          history: { past: [], future: [] },
        },
      ],
      activeTabId: 'tab-1',
      nodes: [],
      edges: [],
    });

    await renderHomePage({ onOpenFlow });

    fireEvent.click(await screen.findByText('My Flow'));
    expect(onOpenFlow).toHaveBeenCalledWith('tab-1');
  });

  it('duplicates and deletes flows from the dashboard actions', async () => {
    const onOpenFlow = vi.fn();
    useFlowStore.setState({
      documents: [
        createDocumentFromPages('tab-1', 'Flow One', [
          {
            id: 'tab-1',
            name: 'Flow One',
            diagramType: 'flowchart',
            updatedAt: '2026-03-07T00:00:00.000Z',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
          },
        ]),
        createDocumentFromPages('tab-2', 'Flow Two', [
          {
            id: 'tab-2',
            name: 'Flow Two',
            diagramType: 'flowchart',
            updatedAt: '2026-03-06T00:00:00.000Z',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
          },
        ]),
      ],
      activeDocumentId: 'tab-1',
      tabs: [
        {
          id: 'tab-1',
          name: 'Flow One',
          diagramType: 'flowchart',
          updatedAt: '2026-03-07T00:00:00.000Z',
          nodes: [],
          edges: [],
          history: { past: [], future: [] },
        },
        {
          id: 'tab-2',
          name: 'Flow Two',
          diagramType: 'flowchart',
          updatedAt: '2026-03-06T00:00:00.000Z',
          nodes: [],
          edges: [],
          history: { past: [], future: [] },
        },
      ],
      activeTabId: 'tab-1',
      nodes: [],
      edges: [],
    });

    await renderHomePage({ onOpenFlow });

    fireEvent.click(screen.getAllByLabelText('Duplicar')[0]);
    expect(onOpenFlow).toHaveBeenCalledTimes(1);

    const flowOneCard = screen.getByText('Flow One').closest('.group') as HTMLElement;
    fireEvent.click(within(flowOneCard).getByLabelText('Eliminar'));
    const deleteDialog = screen.getByRole('dialog', { name: 'Delete flow' });
    fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Delete' }));
    expect(useFlowStore.getState().tabs.some((tab) => tab.id === 'tab-1')).toBe(false);
  });

  it('renames flows from the dashboard actions with an app-native dialog', async () => {
    useFlowStore.setState({
      documents: [
        createDocumentFromPages('tab-1', 'Flow One', [
          {
            id: 'tab-1',
            name: 'Flow One',
            diagramType: 'flowchart',
            updatedAt: '2026-03-07T00:00:00.000Z',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
          },
        ]),
      ],
      activeDocumentId: 'tab-1',
      tabs: [
        {
          id: 'tab-1',
          name: 'Flow One',
          diagramType: 'flowchart',
          updatedAt: '2026-03-07T00:00:00.000Z',
          nodes: [],
          edges: [],
          history: { past: [], future: [] },
        },
      ],
      activeTabId: 'tab-1',
      nodes: [],
      edges: [],
    });

    await renderHomePage();

    const flowCard = screen.getByText('Flow One').closest('.group') as HTMLElement;
    fireEvent.click(within(flowCard).getByLabelText('Renombrar'));

    const renameDialog = screen.getByRole('dialog', { name: 'Rename flow' });
    const renameInput = within(renameDialog).getByLabelText('Flow name');
    fireEvent.change(renameInput, { target: { value: '  Renamed Flow  ' } });
    fireEvent.click(within(renameDialog).getByRole('button', { name: 'Save' }));

    expect(useFlowStore.getState().tabs[0]?.name).toBe('Renamed Flow');
    expect(screen.getByText('Renamed Flow')).toBeTruthy();
  });

  it('removes the final remaining flow and shows the empty dashboard state when deleted', async () => {
    useFlowStore.setState({
      documents: [
        createDocumentFromPages('tab-1', 'Solo Flow', [
          {
            id: 'tab-1',
            name: 'Solo Flow',
            diagramType: 'flowchart',
            updatedAt: '2026-03-07T00:00:00.000Z',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
          },
        ]),
      ],
      activeDocumentId: 'tab-1',
      tabs: [
        {
          id: 'tab-1',
          name: 'Solo Flow',
          diagramType: 'flowchart',
          updatedAt: '2026-03-07T00:00:00.000Z',
          nodes: [],
          edges: [],
          history: { past: [], future: [] },
        },
      ],
      activeTabId: 'tab-1',
      nodes: [],
      edges: [],
    });

    await renderHomePage();

    const flowCard = screen.getByText('Solo Flow').closest('.group') as HTMLElement;
    fireEvent.click(within(flowCard).getByLabelText('Eliminar'));

    const deleteDialog = screen.getByRole('dialog', { name: 'Delete flow' });
    fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Delete' }));

    const { tabs, activeTabId, nodes, edges } = useFlowStore.getState();
    expect(tabs).toHaveLength(0);
    expect(activeTabId).toBe('');
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
    expect(screen.queryByText('Solo Flow')).toBeNull();
    expect(screen.getByTestId('home-create-new-main')).toBeTruthy();
  });
});
