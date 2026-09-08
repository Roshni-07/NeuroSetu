import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import AuthModal from '../../src/components/auth/AuthModal.jsx';
import Navbar from '../../src/components/layout/Navbar.jsx';
import { clearAllLocalData, closeDB } from '../../src/db/indexedDb.js';
import {
  authenticatePassword,
  createSession,
  DEFAULT_ACCOUNTS,
  resetAllAuthData,
  getActiveSession,
  ROLES
} from '../../src/services/authService.js';

describe('Role-Based Authentication and Navigation Suite', () => {
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

  describe('authService.js: Password Authentication', () => {
    it('1. Authenticates ASHA Worker with default credentials (admin / admin123)', async () => {
      const result = await authenticatePassword('admin', 'admin123', ROLES.ASHA_WORKER);
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.role).toBe(ROLES.ASHA_WORKER);
      expect(result.session.profileName).toBe(DEFAULT_ACCOUNTS[ROLES.ASHA_WORKER].profileName);

      const active = getActiveSession();
      expect(active).not.toBeNull();
      expect(active.role).toBe(ROLES.ASHA_WORKER);
    });

    it('2. Authenticates Caregiver with default credentials (caregiver / admin123)', async () => {
      const result = await authenticatePassword('caregiver', 'admin123', ROLES.CAREGIVER);
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.role).toBe(ROLES.CAREGIVER);
      expect(result.session.profileName).toBe(DEFAULT_ACCOUNTS[ROLES.CAREGIVER].profileName);
    });

    it('3. Rejects incorrect password with descriptive error', async () => {
      const result = await authenticatePassword('admin', 'wrongpassword', ROLES.ASHA_WORKER);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Invalid email\/username or password/i);
      expect(getActiveSession()).toBeNull();
    });

    it('4. Handles case-insensitive username lookup', async () => {
      const result = await authenticatePassword('ASHA@NEUROSETU.ORG', 'admin123', ROLES.ASHA_WORKER);
      expect(result.success).toBe(true);
      expect(result.session.role).toBe(ROLES.ASHA_WORKER);
    });
  });

  describe('AuthModal.jsx: Role-Specific UI', () => {
    it('5. Renders email/password form for ASHA Worker', () => {
      render(
        <AuthModal
          isOpen={true}
          role={ROLES.ASHA_WORKER}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByLabelText(/Email \/ Username/i)).toBeInTheDocument();
      expect(within(dialog).getByLabelText(/Password/i)).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: /Sign In with Password/i })).toBeInTheDocument();
    });

    it('6. Submitting valid ASHA credentials logs in and calls onSuccess', async () => {
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
      const emailInput = within(dialog).getByLabelText(/Email \/ Username/i);
      const passInput = within(dialog).getByLabelText(/Password/i);
      const submitBtn = within(dialog).getByRole('button', { name: /Sign In with Password/i });

      fireEvent.change(emailInput, { target: { value: 'admin' } });
      fireEvent.change(passInput, { target: { value: 'admin123' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledTimes(1);
        expect(handleSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ role: ROLES.ASHA_WORKER })
        );
      });
    });

    it('7. Patient role renders accessible 4-digit PIN keypad without password inputs', () => {
      render(
        <AuthModal
          isOpen={true}
          role={ROLES.PATIENT}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).queryByLabelText(/Password/i)).toBeNull();
      expect(within(dialog).getByText(/Profile PIN/i)).toBeInTheDocument();

      // Keypad digits 1 to 9 + 0 are rendered
      for (let i = 0; i <= 9; i++) {
        expect(within(dialog).getByRole('button', { name: String(i) })).toBeInTheDocument();
      }
    });
  });

  describe('Navbar.jsx & Route Protection', () => {
    it('8. Shows "Locked / Logged Out" status and links when unauthenticated', () => {
      render(
        <Navbar
          currentRoute="home"
          session={null}
          isOnline={true}
          pendingSyncCount={0}
          onNavigate={vi.fn()}
          onOpenRoleSelector={vi.fn()}
          onOpenPinAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenSos={vi.fn()}
        />
      );

      expect(screen.getByText(/Locked \/ Logged Out/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Select Role/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enter Profile PIN/i })).toBeInTheDocument();
    });

    it('9. Shows active role badge and Sign Out button when authenticated', () => {
      const mockSession = { role: ROLES.ASHA_WORKER, profileName: 'Lead ASHA' };
      render(
        <Navbar
          currentRoute="dashboard"
          session={mockSession}
          isOnline={true}
          pendingSyncCount={0}
          onNavigate={vi.fn()}
          onOpenRoleSelector={vi.fn()}
          onOpenPinAuth={vi.fn()}
          onLogout={vi.fn()}
          onOpenSos={vi.fn()}
        />
      );

      expect(screen.getByText('ASHA')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Lock \/ Logout/i })).toBeInTheDocument();
    });
  });

  describe('App.jsx: Patient Roadmap View Integration', () => {
    it('10. Renders interactive RoadmapView when patient is authenticated on #/patient', async () => {
      window.location.hash = '#/patient';
      createSession('Joyram Das', ROLES.PATIENT);
      render(<App />);

      await waitFor(() => {
        // Welcoming card
        expect(screen.getByText(/Welcome to NeuroSetu/i)).toBeInTheDocument();
        // Roadmap container exists
        expect(screen.getByTestId('roadmap-view-container')).toBeInTheDocument();
        // Roadmap header with patient progress
        expect(screen.getByText(/Daily Progress/i)).toBeInTheDocument();
      });
    });
  });
});
