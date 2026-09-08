import React from 'react';
import { Book, Home, LayoutTemplate, LogOut, LoaderCircle, Plug, Settings, Library, PanelLeftClose } from 'lucide-react';
import { SidebarFooter } from './SidebarFooter';
import { GithubCard } from './GithubCard';
import { SidebarItem } from '../ui/SidebarItem';
import { APP_NAME, GENPLUS_LOGO_PRIMARY_URL } from '@/lib/brand';
import { useAccessSession } from '@/components/auth/AccessGate';

type HomeSidebarTab = 'home' | 'library' | 'templates' | 'settings' | 'mcp';

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  tab?: HomeSidebarTab;
  testId: string;
  to?: string;
}

interface HomeSidebarProps {
  activeTab: HomeSidebarTab;
  onTabChange: (tab: HomeSidebarTab) => void;
  onHide: () => void;
}

export function HomeSidebar({ activeTab, onTabChange, onHide }: HomeSidebarProps): React.ReactElement {
  const localizedAppName = APP_NAME;
  const { isLoggingOut, logout } = useAccessSession();
  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="w-4 h-4" />,
      label: 'Inicio',
      tab: 'home',
      testId: 'sidebar-home',
    },
    {
      icon: <Library className="w-4 h-4" />,
      label: 'Biblioteca AP',
      tab: 'library',
      testId: 'sidebar-library',
    },
    {
      icon: <LayoutTemplate className="w-4 h-4" />,
      label: 'Plantillas técnicas',
      tab: 'templates',
      testId: 'sidebar-templates',
    },
    {
      icon: <Plug className="w-4 h-4" />,
      label: 'Agentes y conexiones',
      tab: 'mcp',
      testId: 'sidebar-mcp',
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: 'Configuración',
      tab: 'settings',
      testId: 'sidebar-settings',
    },
    {
      icon: <Book className="w-4 h-4" />,
      label: 'Guía del producto',
      testId: 'sidebar-docs',
      to: 'https://github.com/Apalpan/ai-map#readme',
    },
  ];

  return (
    <aside className="sticky top-0 z-20 flex w-full flex-col border-b border-[var(--color-brand-border)] bg-[var(--brand-surface)] md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-14 items-center gap-3 border-b border-[var(--color-brand-border)] px-4 pr-24 md:pr-12">
        <img
          src={GENPLUS_LOGO_PRIMARY_URL}
          alt="GEN+"
          className="h-5 w-[74px] shrink-0 object-contain object-left"
        />

        <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-[var(--brand-text)]">
          {localizedAppName}
        </span>

        <div className="flex items-center justify-center rounded-[5px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_20%)] bg-[color-mix(in_srgb,var(--brand-surface),transparent_50%)] px-[5px] py-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]">
          <span className="text-[9.5px] font-bold uppercase leading-none tracking-[0.02em] text-[color-mix(in_srgb,var(--brand-secondary),var(--brand-text))]">
            v1.0
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onHide}
        className="absolute right-2 top-1.5 hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--brand-secondary)] hover:bg-[var(--action-soft)] hover:text-[var(--action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] md:flex"
        aria-label="Ocultar navegación lateral"
      >
        <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex gap-2 overflow-x-auto p-3 md:block md:flex-1 md:space-y-5 md:overflow-y-auto">
        <div className="flex gap-2 md:block md:space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.testId}
              icon={item.icon}
              isActive={item.tab ? activeTab === item.tab : false}
              onClick={item.tab ? () => onTabChange(item.tab) : undefined}
              to={item.to}
              testId={item.testId}
              className="min-w-fit md:min-w-0"
            >
              {item.label}
            </SidebarItem>
          ))}
        </div>
      </div>

      <div className="absolute right-2 top-1.5 flex items-center md:hidden">
        <button
          type="button"
          onClick={onHide}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--brand-secondary)] hover:bg-[var(--action-soft)] hover:text-[var(--action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          aria-label="Ocultar navegación móvil"
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isLoggingOut}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[var(--brand-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--action-soft)] hover:text-[var(--action)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          aria-label="Cerrar sesión"
        >
          {isLoggingOut ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="hidden md:mt-auto md:block">
        <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-[var(--brand-border)] bg-[#f7faff] p-3">
          <img
            src="/brand/alejandro-palpan.png"
            alt="Retrato de Alejandro Palpan"
            width="40"
            height="40"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[var(--brand-text)]">Alejandro Palpan</p>
            <p className="mt-0.5 text-[10px] leading-4 text-[var(--brand-secondary)]">Owner del workspace · acceso compartido GEN+</p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => void logout()}
            disabled={isLoggingOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-[var(--brand-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--action-soft)] hover:text-[var(--action)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            {isLoggingOut ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
        <GithubCard />
        <SidebarFooter />
      </div>
    </aside>
  );
}
