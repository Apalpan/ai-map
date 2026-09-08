import type { DesignSystem, GlobalEdgeOptions } from '@/lib/types';
import { sanitizeAISettings } from './aiSettings';
import type { AISettings, Layer, ViewSettings } from './types';

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  id: 'default',
  name: 'AI Map GEN+',
  description: 'Sistema visual GEN+ para mapas nuevos de AI Map.',
  colors: {
    primary: '#2165FF',
    secondary: '#5B6C87',
    accent: '#4D84FF',
    background: '#F7F9FD',
    surface: '#ffffff',
    border: '#DCE5F2',
    text: {
      primary: '#0E2A6B',
      secondary: '#5B6C87',
    },
    nodeBackground: '#ffffff',
    nodeBorder: '#DCE5F2',
    nodeText: '#0E2A6B',
    edge: '#5B6C87',
  },
  typography: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: {
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '20px',
    },
  },
  components: {
    node: {
      borderRadius: '8px',
      borderWidth: '1px',
      boxShadow:
        '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.04)',
      padding: '1rem',
    },
    edge: {
      strokeWidth: 2,
    },
  },
};

export const DEFAULT_AI_SETTINGS: AISettings = sanitizeAISettings(
  { provider: 'gemini' },
  {
    provider: 'gemini',
    storageMode: 'local',
    apiKey: undefined,
    model: undefined,
    customBaseUrl: undefined,
    customHeaders: [],
  }
);

export const INITIAL_VIEW_SETTINGS: ViewSettings = {
  showGrid: true,
  snapToGrid: true,
  alignmentGuidesEnabled: true,
  isShortcutsHelpOpen: false,
  defaultIconsEnabled: true,
  smartRoutingEnabled: true,
  smartRoutingProfile: 'standard',
  smartRoutingBundlingEnabled: false,
  architectureStrictMode: false,
  mermaidImportMode: 'renderer_first',
  largeGraphSafetyMode: 'auto',
  largeGraphSafetyProfile: 'balanced',
  exportSerializationMode: 'deterministic',
  language: 'en',
  lintRules: '',
};

export const INITIAL_GLOBAL_EDGE_OPTIONS: GlobalEdgeOptions = {
  // Mermaid-parity default: smooth B-spline through the routing corridor.
  // Matches Mermaid's `flowchart.curve = 'basis'` baseline so a fresh diagram
  // looks like the Mermaid render users compare us against.
  type: 'bezier',
  curve: 'basis',
  animated: false,
  strokeWidth: 1.5,
};

export const INITIAL_LAYERS: Layer[] = [
  {
    id: 'default',
    name: 'Default',
    visible: true,
    locked: false,
  },
];
