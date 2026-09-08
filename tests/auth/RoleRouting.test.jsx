import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';
import { setProfilePin, resetAllAuthData, getActiveSession } from '../../src/services/authService.js';

describe('Role Selection to Route Wiring Tests', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    resetAllAuthData();
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('1. Selecting Caregiver role and authenticating routes to #/dashboard', async () => {
    render(<App />);

    // Click "Select Role" from top bar
    const selectRoleBtn = screen.getAllByRole('button', { name: /Select Role/i })[0];
    fireEvent.click(selectRoleBtn);

    // RoleSelector is open
    expect(screen.getByRole('heading', { name: /Select Your Role/i })).toBeInTheDocument();

    // Select Caregiver card
    fireEvent.click(screen.getByTestId('role-card-caregiver'));

    // Auth modal opens with Caregiver context
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: /Caregiver/i })).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    // Enter alphanumeric credentials for caregiver
    const emailInput = within(dialog).getByLabelText(/Email \/ Username/i);
    const passInput = within(dialog).getByLabelText(/Password/i);
    const submitBtn = within(dialog).getByRole('button', { name: /Sign In with Password/i });

    fireEvent.change(emailInput, { target: { value: 'caregiver' } });
    fireEvent.change(passInput, { target: { value: 'caregiver123' } });
    fireEvent.click(submitBtn);

    // Should navigate to dashboard
    await waitFor(() => {
      expect(window.location.hash).toBe('#/dashboard');
      expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
    });

    const session = getActiveSession();
    expect(session.role).toBe('caregiver');
  });

  it('2. Selecting ASHA Worker role and authenticating routes to #/dashboard', async () => {
    render(<App />);

    // Click "Select Role" from top bar
    const selectRoleBtn = screen.getAllByRole('button', { name: /Select Role/i })[0];
    fireEvent.click(selectRoleBtn);

    // Select ASHA Worker card
    fireEvent.click(screen.getByTestId('role-card-asha_worker'));

    // Auth modal opens with ASHA Worker context
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: /ASHA Worker/i })).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    // Enter alphanumeric credentials for ASHA
    const emailInput = within(dialog).getByLabelText(/Email \/ Username/i);
    const passInput = within(dialog).getByLabelText(/Password/i);
    const submitBtn = within(dialog).getByRole('button', { name: /Sign In with Password/i });

    fireEvent.change(emailInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'asha123' } });
    fireEvent.click(submitBtn);

    // Should navigate to dashboard
    await waitFor(() => {
      expect(window.location.hash).toBe('#/dashboard');
      expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
    });

    const session = getActiveSession();
    expect(session.role).toBe('asha_worker');
  });

  it('3. Selecting Patient role and authenticating routes to #/patient', async () => {
    await setProfilePin('100100', 'patient');
    render(<App />);

    // Click "Select Role" from top bar
    const selectRoleBtn = screen.getAllByRole('button', { name: /Select Role/i })[0];
    fireEvent.click(selectRoleBtn);

    // Select Patient card
    fireEvent.click(screen.getByTestId('role-card-patient'));

    // PIN modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(within(screen.getByRole('dialog')).getByText(/Enter 6-Digit PIN/i)).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    // Enter 6-digit PIN: 1-0-0-1-0-0
    fireEvent.click(within(dialog).getByRole('button', { name: '1' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '0' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '0' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '1' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '0' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '0' }));

    // Should navigate to patient portal
    await waitFor(() => {
      expect(window.location.hash).toBe('#/patient');
      expect(screen.getByText(/Welcome to NeuroSetu/i)).toBeInTheDocument();
    });

    const session = getActiveSession();
    expect(session.role).toBe('patient');
  });
});
