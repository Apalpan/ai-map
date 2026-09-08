import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { APLibraryView } from './APLibraryView';

describe('APLibraryView', () => {
  it('filters the source-grounded catalog and exposes empty state', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} />);
    expect(screen.getAllByText('Venta B2B GEN+')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Buscar en Biblioteca AP'), { target: { value: 'texto imposible 123' } });
    expect(screen.getByText('No encontramos resultados')).toBeTruthy();
  });

  it('switches agent tab, shows truthful details and creates editable DSL', () => {
    const onCreateLocalMap = vi.fn();
    render(<APLibraryView onCreateLocalMap={onCreateLocalMap} />);

    fireEvent.click(screen.getByRole('tab', { name: /Agentes/ }));
    fireEvent.click(screen.getByRole('button', { name: /Vault Researcher/ }));
    expect(screen.getByText('No implica que una conexión externa esté configurada.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Crear mapa editable' }));

    expect(onCreateLocalMap).toHaveBeenCalledTimes(1);
    expect(onCreateLocalMap.mock.calls[0][0]).toContain('Decisión humana:');
  });

  it('closes and reopens detail accessibly', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByLabelText(/Detalle de/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }));
    expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toBeTruthy();
  });

  it('supports arrow-key navigation across library tabs', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} />);
    const casesTab = screen.getByRole('tab', { name: /Casos/ });

    fireEvent.keyDown(casesTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /Procesos/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('ap-library-tab-processes');
  });
});
