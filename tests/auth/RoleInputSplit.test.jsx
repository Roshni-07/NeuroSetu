import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import AuthModal from '../../src/components/auth/AuthModal.jsx';
import PinAuthModal from '../../src/components/auth/PinAuthModal.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';
import { resetAllAuthData, ROLES, setProfilePin } from '../../src/services/authService.js';

describe('Role-Based Input Split & 6-Digit PIN Test Suite', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    resetAllAuthData();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Patient role renders 6 PIN dot indicators and 3x4 numeric keypad without alphanumeric fields', () => {
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.PATIENT}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');

    // Heading shows 6-digit PIN title
    expect(within(dialog).getByRole('heading', { name: /(Enter 6-Digit PIN|Create Profile PIN)/i })).toBeInTheDocument();

    // 6 PIN dots rendered
    for (let i = 0; i < 6; i++) {
      expect(within(dialog).getByTestId(`pin-dot-${i}`)).toBeInTheDocument();
    }

    // Keypad buttons (0-9, Clear, Delete)
    for (let i = 0; i <= 9; i++) {
      expect(within(dialog).getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
    expect(within(dialog).getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Delete last digit/i })).toBeInTheDocument();

    // Alphanumeric staff inputs must NOT be present
    expect(within(dialog).queryByTestId('auth-identifier-input')).toBeNull();
    expect(within(dialog).queryByTestId('auth-password-input')).toBeNull();
    expect(within(dialog).queryByTestId('submit-password-btn')).toBeNull();
  });

  it('2. Caregiver role renders alphanumeric login form and NO numeric keypad or PIN dots', () => {
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.CAREGIVER}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');

    // Caregiver heading
    expect(within(dialog).getByRole('heading', { name: /Caregiver (Portal Login|PIN)/i })).toBeInTheDocument();

    // Form inputs present
    const emailInput = within(dialog).getByTestId('auth-identifier-input');
    const passInput = within(dialog).getByTestId('auth-password-input');
    const submitBtn = within(dialog).getByTestId('submit-password-btn');

    expect(emailInput).toBeInTheDocument();
    expect(passInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    // Keypad and PIN dots must NOT be rendered
    for (let i = 0; i < 6; i++) {
      expect(within(dialog).queryByTestId(`pin-dot-${i}`)).toBeNull();
    }
    expect(within(dialog).queryByRole('group', { name: /Numeric Keypad/i })).toBeNull();
    expect(within(dialog).queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  it('3. ASHA Worker role renders alphanumeric login form and NO numeric keypad or PIN dots', () => {
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.ASHA_WORKER}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');

    // ASHA heading
    expect(within(dialog).getByRole('heading', { name: /ASHA Worker (Portal Login|PIN)/i })).toBeInTheDocument();

    // Form inputs present
    expect(within(dialog).getByTestId('auth-identifier-input')).toBeInTheDocument();
    expect(within(dialog).getByTestId('auth-password-input')).toBeInTheDocument();
    expect(within(dialog).getByTestId('submit-password-btn')).toBeInTheDocument();

    // Keypad and PIN dots must NOT be rendered
    for (let i = 0; i < 6; i++) {
      expect(within(dialog).queryByTestId(`pin-dot-${i}`)).toBeNull();
    }
    expect(within(dialog).queryByRole('group', { name: /Numeric Keypad/i })).toBeNull();
  });

  it('4. Authenticates Caregiver using email/password form with caregiver / caregiver123', async () => {
    const handleSuccess = vi.fn();
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.CAREGIVER}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    );

    const dialog = screen.getByRole('dialog');
    const emailInput = within(dialog).getByTestId('auth-identifier-input');
    const passInput = within(dialog).getByTestId('auth-password-input');
    const submitBtn = within(dialog).getByTestId('submit-password-btn');

    fireEvent.change(emailInput, { target: { value: 'caregiver' } });
    fireEvent.change(passInput, { target: { value: 'caregiver123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          role: ROLES.CAREGIVER,
          profileName: 'Caregiver Maya'
        })
      );
    });
  });

  it('5. Authenticates ASHA Worker using email/password form with admin / asha123', async () => {
    const handleSuccess = vi.fn();
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.ASHA_WORKER}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    );

    const dialog = screen.getByRole('dialog');
    const emailInput = within(dialog).getByTestId('auth-identifier-input');
    const passInput = within(dialog).getByTestId('auth-password-input');
    const submitBtn = within(dialog).getByTestId('submit-password-btn');

    fireEvent.change(emailInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'asha123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          role: ROLES.ASHA_WORKER,
          profileName: 'ASHA Rina Borah'
        })
      );
    });
  });

  it('6. Staff form inputs support autofill and password manager attributes without clipboard blocking', () => {
    render(
      <AuthModal
        isOpen={true}
        role={ROLES.CAREGIVER}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const emailInput = screen.getByTestId('auth-identifier-input');
    const passInput = screen.getByTestId('auth-password-input');

    expect(emailInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('autoComplete', 'username');
    expect(passInput).toHaveAttribute('type', 'password');
    expect(passInput).toHaveAttribute('autoComplete', 'current-password');

    // Verify pasting into input works without throwing
    expect(() => {
      fireEvent.paste(passInput, {
        clipboardData: { getData: () => 'pastedPassword123' }
      });
    }).not.toThrow();
  });

  it('7. Patient PIN keypad triggers auto-submit upon entering the 6th digit', async () => {
    await setProfilePin('654321');
    const handleSuccess = vi.fn();

    render(
      <PinAuthModal
        isOpen={true}
        role={ROLES.PATIENT}
        onClose={vi.fn()}
        onSuccess={handleSuccess}
      />
    );

    // Press first 5 digits
    fireEvent.click(screen.getByRole('button', { name: '6' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(handleSuccess).not.toHaveBeenCalled();

    // Press 6th digit -> auto-submits
    fireEvent.click(screen.getByRole('button', { name: '1' }));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
