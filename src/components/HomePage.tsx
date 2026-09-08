import React, { useState } from 'react';
import { useFlowStore } from '../store';
import { useWorkspaceDocumentActions, useWorkspaceDocumentsState } from '@/store/documentHooks';
import { HomeDashboard, type HomeFlowCard } from './home/HomeDashboard';
import { HomeFlowDeleteDialog, HomeFlowRenameDialog } from './home/HomeFlowDialogs';
import { HomeMCPView } from './home/HomeMCPView';
import { HomeSettingsView } from './home/HomeSettingsView';
import { HomeSidebar } from './home/HomeSidebar';
import { APLibraryView } from './home/APLibraryView';
import { PanelLeftOpen } from 'lucide-react';

type HomePageTab = 'home' | 'library' | 'templates' | 'settings' | 'mcp';
type HomeSettingsTab = 'general' | 'canvas' | 'shortcuts' | 'ai' | 'mcp';

interface HomePageProps {
  onLaunch: () => void;
  onLaunchWithTemplates: () => void;
  onLaunchWithTemplate: (templateId: string) => void;
  onLaunchWithAI: () => void;
  onGenerateAIMap: (prompt: string) => void;
  onCreateLocalMap: (dsl: string) => void;
  onImportJSON: () => void;
  onOpenFlow: (flowId: string) => void;
  activeTab?: HomePageTab;
  onSwitchTab?: (tab: HomePageTab) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunch,
  onLaunchWithTemplates,
  onLaunchWithAI,
  onGenerateAIMap,
  onCreateLocalMap,
  onImportJSON,
  onOpenFlow,
  activeTab: propActiveTab,
  onSwitchTab,
}) => {
  const { documents } = useWorkspaceDocumentsState();
  const { renameDocument, deleteDocument, duplicateDocument } = useWorkspaceDocumentActions();
  const hasWorkspaceDocuments = useFlowStore((state) => state.documents.length > 0);
  const [internalActiveTab, setInternalActiveTab] = useState<HomePageTab>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<HomeSettingsTab>('general');
  const [flowPendingRename, setFlowPendingRename] = useState<HomeFlowCard | null>(null);
  const [flowPendingDelete, setFlowPendingDelete] = useState<HomeFlowCard | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeTab = propActiveTab ?? internalActiveTab;
  const flows: HomeFlowCard[] = hasWorkspaceDocuments ? documents : [];

  function handleTabChange(tab: HomePageTab): void {
    if (onSwitchTab) {
      onSwitchTab(tab);
    } else {
      setInternalActiveTab(tab);
    }
  }

  function handleRenameFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) {
      return;
    }

    setFlowPendingRename(flow);
  }

  function handleDeleteFlow(flowId: string): void {
    const flow = flows.find((entry) => entry.id === flowId);
    if (!flow) {
      return;
    }

    setFlowPendingDelete(flow);
  }

  function submitFlowRename(nextName: string): void {
    if (!flowPendingRename) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === flowPendingRename.name) {
      setFlowPendingRename(null);
      return;
    }

    renameDocument(flowPendingRename.id, trimmedName);
    setFlowPendingRename(null);
  }

  function confirmFlowDelete(): void {
    if (!flowPendingDelete) {
      return;
    }

    deleteDocument(flowPendingDelete.id);
    setFlowPendingDelete(null);
  }

  function handleDuplicateFlow(flowId: string): void {
    const newFlowId = duplicateDocument(flowId);
    if (newFlowId) {
      onOpenFlow(newFlowId);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] flex flex-col text-[var(--brand-text)] md:flex-row">
      {sidebarOpen ? (
        <HomeSidebar activeTab={activeTab} onTabChange={handleTabChange} onHide={() => setSidebarOpen(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-3 top-3 z-30 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--brand-border)] bg-white px-3 text-sm font-semibold text-[var(--brand-text)] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          aria-label="Mostrar navegación"
        >
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Menú</span>
        </button>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`flex min-w-0 flex-1 flex-col bg-[var(--brand-surface)] transition-[margin] ${sidebarOpen ? 'md:ml-64' : ''}`}
      >
        {activeTab === 'home' && (
          <HomeDashboard
            flows={flows}
            onCreateNew={onLaunch}
            onOpenTemplates={onLaunchWithTemplates}
            onPromptWithAI={onLaunchWithAI}
            onGenerateAIMap={onGenerateAIMap}
            onCreateLocalMap={onCreateLocalMap}
            onImportJSON={onImportJSON}
            onOpenFlow={onOpenFlow}
            onRenameFlow={handleRenameFlow}
            onDuplicateFlow={handleDuplicateFlow}
            onDeleteFlow={handleDeleteFlow}
            onOpenLibrary={() => handleTabChange('library')}
          />
        )}

        {activeTab === 'library' && <APLibraryView onCreateLocalMap={onCreateLocalMap} />}

        {activeTab === 'templates' && <APLibraryView onCreateLocalMap={onCreateLocalMap} initialTab="templates" />}

        {activeTab === 'mcp' && <HomeMCPView onOpenLibrary={() => handleTabChange('library')} />}

        {activeTab === 'settings' && (
          <HomeSettingsView
            activeSettingsTab={activeSettingsTab}
            onSettingsTabChange={setActiveSettingsTab}
          />
        )}
      </main>
      <HomeFlowRenameDialog
        key={flowPendingRename?.id ?? 'rename-closed'}
        flowName={flowPendingRename?.name ?? ''}
        isOpen={flowPendingRename !== null}
        onClose={() => setFlowPendingRename(null)}
        onSubmit={submitFlowRename}
      />
      <HomeFlowDeleteDialog
        key={flowPendingDelete?.id ?? 'delete-closed'}
        flowName={flowPendingDelete?.name ?? ''}
        isOpen={flowPendingDelete !== null}
        onClose={() => setFlowPendingDelete(null)}
        onConfirm={confirmFlowDelete}
      />
    </div>
  );
};
