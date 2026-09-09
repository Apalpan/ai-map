import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { APLibraryView } from './APLibraryView';

describe('APLibraryView', () => {
  it('filters the source-grounded catalog and exposes empty state', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} onCreateAIProcess={vi.fn()} />);
    expect(screen.getAllByText('Venta B2B GEN+')).toHaveLength(2);

    fireEvent.change(screen.getByLabelText('Buscar en Biblioteca AP'), { target: { value: 'texto imposible 123' } });
    expect(screen.getByText('No encontramos resultados')).toBeTruthy();
  });

  it('switches agent tab, shows truthful details and creates editable DSL', () => {
    const onCreateLocalMap = vi.fn();
    render(<APLibraryView onCreateLocalMap={onCreateLocalMap} onCreateAIProcess={vi.fn()} />);

    fireEvent.click(screen.getByRole('tab', { name: /Agentes/ }));
    fireEvent.click(screen.getByRole('button', { name: /Vault Researcher/ }));
    expect(screen.getByText('No implica que una conexión externa esté configurada.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Crear mapa editable' }));

    expect(onCreateLocalMap).toHaveBeenCalledTimes(1);
    expect(onCreateLocalMap.mock.calls[0][0]).toContain('Decisión humana:');
  });

  it('closes and reopens detail accessibly', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} onCreateAIProcess={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByLabelText(/Detalle de/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }));
    expect(screen.getByRole('button', { name: 'Cerrar detalle' })).toBeTruthy();
  });

  it('supports arrow-key navigation across library tabs', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} onCreateAIProcess={vi.fn()} />);
    const casesTab = screen.getByRole('tab', { name: /Casos/ });

    fireEvent.keyDown(casesTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /Procesos/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('ap-library-tab-processes');
  });

  it('opens the source-grounded VisionPro blueprint and creates a technical map', () => {
    const onCreateLocalMap = vi.fn();
    const onCreateAIProcess = vi.fn();
    render(<APLibraryView onCreateLocalMap={onCreateLocalMap} onCreateAIProcess={onCreateAIProcess} initialTab="templates" />);

    expect(screen.getByRole('heading', { name: 'Proceso y arquitectura, en una plantilla que sí se entiende.' })).toBeTruthy();
    expect(screen.getAllByText('Blueprint técnico · VisionPro').length).toBeGreaterThan(0);
    expect(screen.getByText('Arquitectura por capas')).toBeTruthy();
    expect(screen.getByText('Fuentes técnicas consideradas')).toBeTruthy();
    expect(screen.getByText('Inventario sanitizado; no incluye archivos ni rutas privadas.')).toBeTruthy();
    expect(screen.getAllByText('Requiere validación').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Crear AI Process editable' })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Crear AI Process editable' })[0]);
    expect(onCreateLocalMap).not.toHaveBeenCalled();
    expect(onCreateAIProcess).toHaveBeenCalledTimes(1);
    expect(onCreateAIProcess.mock.calls[0][0].title).toBe('AI Process · VisionPro');
  });

  it('separates technical and operational templates while keeping filtered operations visible', () => {
    render(<APLibraryView onCreateLocalMap={vi.fn()} onCreateAIProcess={vi.fn()} initialTab="templates" />);

    expect(screen.getByRole('heading', { name: '3 blueprints técnicos' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '7 plantillas operativas' })).toBeTruthy();
    const search = screen.getByLabelText('Buscar blueprint o capa');
    expect(search.getAttribute('placeholder')).toBe('Buscar blueprint o capa');

    fireEvent.change(search, { target: { value: 'Playbook operativo' } });
    expect(screen.getAllByText('Playbook operativo').length).toBeGreaterThan(0);
    expect(screen.getByText('No hay blueprints técnicos que coincidan con estos filtros.')).toBeTruthy();
  });
});
