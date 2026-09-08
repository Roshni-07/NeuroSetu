import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import App from '../../src/App.jsx';
import {
  clearAllLocalData,
  closeDB,
  getDB,
  STORES,
  getActiveProfile,
  seedPresetProfiles,
  updatePatientMastery,
  saveProfile
} from '../../src/db/indexedDb.js';
import {
  authenticatePin,
  authenticatePassword,
  createSession,
  getActiveSession,
  logout,
  resetAllAuthData,
  ROLES,
  DEFAULT_ROLE_PINS,
  DEV_BYPASS_PINS,
  DEFAULT_ACCOUNTS
} from '../../src/services/authService.js';
import {
  getAllProgress,
  getGameProgress,
  saveGameScore,
  clearAllProgress
} from '../../src/utils/storage.js';
import { PRESET_PATIENTS } from '../../src/data/presetPatients.js';

describe('Patient Scoping, Authentic Login & Clinical Re-Auth Guard Suite', () => {
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

  // --------------------------------------------------------------------------
  // 1. Session Migration (User Addition 1)
  // --------------------------------------------------------------------------
  describe('1. Session Migration Guard', () => {
    it('detects legacy patient session without patientId, purges it, and forces re-login', () => {
      // Seed a legacy session directly in sessionStorage
      const legacySession = {
        profileName: 'Old Legacy Patient',
        role: ROLES.PATIENT,
        authenticatedAt: new Date().toISOString(),
        token: 'sess_legacy_123'
      };
      sessionStorage.setItem('neurosetu_active_session', JSON.stringify(legacySession));

      // Calling getActiveSession() should identify missing patientId, purge storage, and return null
      const session = getActiveSession();
      expect(session).toBeNull();
      expect(sessionStorage.getItem('neurosetu_active_session')).toBeNull();
    });

    it('retains valid modern patient session with patientId', () => {
      const modernSession = createSession('Anil Kumar', ROLES.PATIENT, 'preset-3');
      const retrieved = getActiveSession();
      expect(retrieved).not.toBeNull();
      expect(retrieved.patientId).toBe('preset-3');
      expect(retrieved.profileName).toBe('Anil Kumar');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Non-Destructive seedPresetProfiles (User Addition 3)
  // --------------------------------------------------------------------------
  describe('2. Non-Destructive Preset Seeding', () => {
    it('seeds preset profiles without overwriting existing caregiver edits or custom progress', async () => {
      // 1. Pre-save a modified profile for preset-1 with custom masteryScore and custom routine
      const customProfile = {
        id: 'preset-1',
        name: 'Ramesh Patel (Caregiver Customized)',
        pin: '100100',
        age: 69,
        stage: 'Mild / Early Stage',
        dailyCap: 4,
        masteryScore: 88, // Custom score edited by caregiver
        gameMasteryScores: { 'grandmas-shopping-list': 92 },
        dailyRoutine: [
          { id: 'temple_visit', label: 'Morning Temple', icon: '🪔', time: 'Dawn (6:00 AM)', correctSlot: 'slot_1' }
        ]
      };
      await saveProfile(customProfile);

      // 2. Run seedPresetProfiles()
      await seedPresetProfiles();

      // 3. Verify preset-1 was NOT overwritten by standard default
      const preserved = await getActiveProfile('preset-1');
      expect(preserved.name).toBe('Ramesh Patel (Caregiver Customized)');
      expect(preserved.masteryScore).toBe(88);
      expect(preserved.gameMasteryScores['grandmas-shopping-list']).toBe(92);
      expect(preserved.dailyRoutine[0].label).toBe('Morning Temple');

      // 4. Verify unseeded profiles (preset-2, preset-3) were cleanly initialized
      const preset2 = await getActiveProfile('preset-2');
      expect(preset2.name).toBe('Savitri Devi');
      expect(preset2.masteryScore).toBe(45);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Unique Demo Credentials (User Addition 4 & Section 6)
  // --------------------------------------------------------------------------
  describe('3. Unique Demo Credentials Reference', () => {
    it('has non-colliding unique credentials across all roles', () => {
      expect(DEFAULT_ROLE_PINS[ROLES.PATIENT]).toBe('100100');
      expect(DEFAULT_ROLE_PINS[ROLES.CAREGIVER]).toBe('1234');
      expect(DEFAULT_ROLE_PINS[ROLES.ASHA_WORKER]).toBe('9999');
      expect(DEV_BYPASS_PINS).toContain('000000');
      expect(DEV_BYPASS_PINS).toContain('0000');

      // ASHA & Caregiver unique passwords
      expect(DEFAULT_ACCOUNTS[ROLES.ASHA_WORKER].password).toBe('asha123');
      expect(DEFAULT_ACCOUNTS[ROLES.CAREGIVER].password).toBe('caregiver123');

      // Check unique patient PINs
      const pins = PRESET_PATIENTS.map(p => p.pin);
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBe(pins.length);

      // Confirm dev bypass 000000 does not collide with any patient or staff PIN
      expect(uniquePins.has('000000')).toBe(false);
      expect(pins).not.toContain(DEFAULT_ROLE_PINS[ROLES.CAREGIVER]);
      expect(pins).not.toContain(DEFAULT_ROLE_PINS[ROLES.ASHA_WORKER]);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Bug A: MasteryScore and Progress Scoping
  // --------------------------------------------------------------------------
  describe('4. Bug A: Data Scoping Per-Patient and Per-Game', () => {
    it('isolates cognitive game progress between Patient A and Patient B', () => {
      // Patient A (preset-1: Ramesh) plays level 1
      saveGameScore('grandmas-shopping-list', 95, { stars: 3, level: 1 }, 'preset-1');

      const progressA = getAllProgress('preset-1');
      expect(progressA['grandmas-shopping-list']).toBeDefined();
      expect(progressA['grandmas-shopping-list'].bestScore).toBe(95);

      // Patient B (preset-3: Anil Kumar) reads progress
      const progressB = getAllProgress('preset-3');
      expect(progressB['grandmas-shopping-list']).toBeUndefined();
      expect(getGameProgress('grandmas-shopping-list', 'preset-3')).toBeNull();
    });

    it('updatePatientMastery scopes both per-game score and aggregate patient score', async () => {
      await seedPresetProfiles();

      // Anil Kumar starts at baseline 20
      const updatedAnil = await updatePatientMastery('preset-3', 'whose-morning-is-it', 'correct_fast', { consecutiveFast: 3 });
      expect(updatedAnil.gameMasteryScores['whose-morning-is-it']).toBe(28); // 20 + 8

      // Ramesh Patel (preset-1) baseline remains completely unaffected
      const ramesh = await getActiveProfile('preset-1');
      expect(ramesh.masteryScore).toBe(65);
      expect(ramesh.gameMasteryScores['whose-morning-is-it']).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Bug B: Authentic Patient Login (No Default to Bhaben Kalita)
  // --------------------------------------------------------------------------
  describe('5. Bug B: Patient PIN Login Authentic Binding', () => {
    it('PIN 100100 binds Ramesh Patel (Mild)', async () => {
      const res = await authenticatePin('100100', 'Primary Patient', ROLES.PATIENT);
      expect(res.success).toBe(true);
      expect(res.session.profileName).toBe('Ramesh Patel');
      expect(res.session.patientId).toBe('preset-1');
    });

    it('PIN 200200 binds Savitri Devi (Moderate)', async () => {
      const res = await authenticatePin('200200', 'Primary Patient', ROLES.PATIENT);
      expect(res.success).toBe(true);
      expect(res.session.profileName).toBe('Savitri Devi');
      expect(res.session.patientId).toBe('preset-2');
    });

    it('PIN 300300 binds Anil Kumar (Severe) — NEVER defaults to Bhaben Kalita', async () => {
      const res = await authenticatePin('300300', 'Primary Patient', ROLES.PATIENT);
      expect(res.success).toBe(true);
      expect(res.session.profileName).toBe('Anil Kumar');
      expect(res.session.patientId).toBe('preset-3');
      expect(res.session.profileName).not.toBe('Bhaben Kalita');
    });

    it('PIN 400400 binds Bhaben Kalita specifically for Default Assam Profile', async () => {
      const res = await authenticatePin('400400', 'Primary Patient', ROLES.PATIENT);
      expect(res.success).toBe(true);
      expect(res.session.profileName).toBe('Bhaben Kalita');
      expect(res.session.patientId).toBe('default_patient');
    });

    it('unauthenticated access to #/patient displays Locked gate, not Patient #1', async () => {
      window.location.hash = '#/patient';
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
        expect(screen.queryByText(/Welcome to NeuroSetu/i)).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // 6. Bug C: Clinical Dashboard Route Guard & Re-Auth
  // --------------------------------------------------------------------------
  describe('6. Bug C: Dashboard Re-Auth and Multi-Patient Exception', () => {
    it('blocks patient session from viewing clinical dashboard and prompts re-auth', async () => {
      // Log in as patient Ramesh Patel
      createSession('Ramesh Patel', ROLES.PATIENT, 'preset-1');
      window.location.hash = '#/dashboard';
      render(<App />);

      // Route guard should intercept and render staff authentication required
      await waitFor(() => {
        expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
        expect(screen.getByText(/access the clinical dashboard/i)).toBeInTheDocument();
        expect(screen.queryByText(/North East Dementia Triage & Telemetry Portal/i)).not.toBeInTheDocument();
      });
    });

    it('allows authorized ASHA worker to access dashboard and view multi-patient triage list', async () => {
      createSession('ASHA Rina Borah', ROLES.ASHA_WORKER, null);
      window.location.hash = '#/dashboard';
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/All Patients/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Bhaben Kalita/i).length).toBeGreaterThanOrEqual(1);
    });

    it('allows authorized Caregiver to access dashboard and view multi-patient triage list', async () => {
      createSession('Caregiver Maya', ROLES.CAREGIVER, null);
      window.location.hash = '#/dashboard';
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/North East Dementia Triage & Telemetry Portal/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/All Patients/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Bhaben Kalita/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Password Authentication for Staff Roles
  // --------------------------------------------------------------------------
  describe('7. Staff Password Authentication', () => {
    it('authenticates ASHA worker with admin / asha123', async () => {
      const res = await authenticatePassword('admin', 'asha123', ROLES.ASHA_WORKER);
      expect(res.success).toBe(true);
      expect(res.session.role).toBe(ROLES.ASHA_WORKER);
      expect(res.session.profileName).toBe('ASHA Rina Borah');
    });

    it('authenticates Caregiver with caregiver / caregiver123', async () => {
      const res = await authenticatePassword('caregiver', 'caregiver123', ROLES.CAREGIVER);
      expect(res.success).toBe(true);
      expect(res.session.role).toBe(ROLES.CAREGIVER);
      expect(res.session.profileName).toBe('Caregiver Maya');
    });

    it('rejects incorrect staff credentials gracefully', async () => {
      const res = await authenticatePassword('admin', 'wrongpass', ROLES.ASHA_WORKER);
      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });
});
