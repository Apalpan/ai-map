import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MobileWorkspaceGate } from './MobileWorkspaceGate';
import { MOBILE_WORKSPACE_GATE_COPY } from './mobileWorkspaceGateCopy';

describe('MobileWorkspaceGate', () => {
    it('renders the mobile workspace message and actions', () => {
        render(
            <MobileWorkspaceGate onOpenLibrary={vi.fn()} onGoHome={vi.fn()}>
                <div>Desktop workspace</div>
            </MobileWorkspaceGate>
        );

        expect(screen.getByText(MOBILE_WORKSPACE_GATE_COPY.title)).toBeTruthy();
        expect(screen.getByText(MOBILE_WORKSPACE_GATE_COPY.description)).toBeTruthy();
        expect(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.openLibrary })).toBeTruthy();
        expect(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.goHome })).toBeTruthy();
        expect(screen.queryByText(/OpenFlowKit/i)).toBeNull();
    });

    it('invokes navigation actions from the mobile prompt', () => {
        const onOpenLibrary = vi.fn();
        const onGoHome = vi.fn();

        render(
            <MobileWorkspaceGate onOpenLibrary={onOpenLibrary} onGoHome={onGoHome}>
                <div>Desktop workspace</div>
            </MobileWorkspaceGate>
        );

        fireEvent.click(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.openLibrary }));
        fireEvent.click(screen.getByRole('button', { name: MOBILE_WORKSPACE_GATE_COPY.goHome }));

        expect(onOpenLibrary).toHaveBeenCalledTimes(1);
        expect(onGoHome).toHaveBeenCalledTimes(1);
    });
});
