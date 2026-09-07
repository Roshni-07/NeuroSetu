import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RoleSelector, { ROLE_DEFINITIONS } from '../../src/components/auth/RoleSelector.jsx';
import { ROLES } from '../../src/services/authService.js';

describe('RoleSelector UI Component & Accessibility Tests', () => {
  it('1. Renders dialog with 3 role cards (Patient, Caregiver, ASHA Worker)', () => {
    render(<RoleSelector isOpen={true} onSelectRole={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Select Your Role/i })).toBeInTheDocument();

    // Verify all 3 role cards are present
    expect(screen.getByTestId('role-card-patient')).toBeInTheDocument();
    expect(screen.getByTestId('role-card-caregiver')).toBeInTheDocument();
    expect(screen.getByTestId('role-card-asha_worker')).toBeInTheDocument();

    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Family Caregiver')).toBeInTheDocument();
    expect(screen.getByText('ASHA Worker')).toBeInTheDocument();
  });

  it('2. Each role card satisfies touch target requirement (>= 44px)', () => {
    render(<RoleSelector isOpen={true} onSelectRole={vi.fn()} />);

    [ROLES.PATIENT, ROLES.CAREGIVER, ROLES.ASHA_WORKER].forEach((roleId) => {
      const card = screen.getByTestId(`role-card-${roleId}`);
      expect(card).toBeInTheDocument();

      // Verify accessibility touch classes: min-h-[64px] or min-h-touch (48px)
      const className = card.className;
      const hasTouchClass =
        className.includes('min-h-[64px]') ||
        className.includes('min-h-touch') ||
        className.includes('min-h-[48px]') ||
        className.includes('min-h-[44px]');
      expect(hasTouchClass).toBe(true);
    });
  });

  it('3. Clicking Patient card fires onSelectRole with "patient"', () => {
    const handleSelect = vi.fn();
    render(<RoleSelector isOpen={true} onSelectRole={handleSelect} />);

    fireEvent.click(screen.getByTestId('role-card-patient'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(ROLES.PATIENT);
  });

  it('4. Clicking Caregiver card fires onSelectRole with "caregiver"', () => {
    const handleSelect = vi.fn();
    render(<RoleSelector isOpen={true} onSelectRole={handleSelect} />);

    fireEvent.click(screen.getByTestId('role-card-caregiver'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(ROLES.CAREGIVER);
  });

  it('5. Clicking ASHA Worker card fires onSelectRole with "asha_worker"', () => {
    const handleSelect = vi.fn();
    render(<RoleSelector isOpen={true} onSelectRole={handleSelect} />);

    fireEvent.click(screen.getByTestId('role-card-asha_worker'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(ROLES.ASHA_WORKER);
  });

  it('6. Close button calls onClose callback', () => {
    const handleClose = vi.fn();
    render(<RoleSelector isOpen={true} onSelectRole={vi.fn()} onClose={handleClose} />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('7. Returns null when isOpen is false', () => {
    const { container } = render(<RoleSelector isOpen={false} onSelectRole={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
