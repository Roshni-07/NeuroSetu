import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validatePinFormat,
  setProfilePin,
  hasConfiguredPin,
  authenticatePin,
  createSession,
  getActiveSession,
  getLockoutStatus,
  logout,
  resetAllAuthData,
  DEFAULT_ROLE_PINS,
  DEV_BYPASS_PINS
} from '../../src/services/authService.js';

describe('Task 5 & 6: PIN Authentication & Session Lifecycle', () => {
  beforeEach(() => {
    resetAllAuthData();
    vi.restoreAllMocks();
  });

  it('1. validatePinFormat accepts 6 numeric digits and rejects invalid formats', () => {
    expect(validatePinFormat('123456')).toBe(true);
    expect(validatePinFormat('000000')).toBe(true);
    expect(validatePinFormat('999999')).toBe(true);

    expect(validatePinFormat('12345')).toBe(false); // Too short
    expect(validatePinFormat('1234567')).toBe(false); // Too long
    expect(validatePinFormat('12a456')).toBe(false); // Non-digit
    expect(validatePinFormat('')).toBe(false);
    expect(validatePinFormat(null)).toBe(false);
    expect(validatePinFormat(123456)).toBe(false); // Must be string
  });

  it('2. setProfilePin saves salt and hash in localStorage', async () => {
    expect(hasConfiguredPin()).toBe(false);
    const success = await setProfilePin('432100');
    expect(success).toBe(true);
    expect(hasConfiguredPin()).toBe(true);
  });

  it('3. authenticatePin auto-configures PIN on first use if not already set', async () => {
    expect(hasConfiguredPin()).toBe(false);
    const result = await authenticatePin('112233', 'Rongali Patient');

    expect(result.success).toBe(true);
    expect(result.isInitialSetup).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session.profileName).toBe('Rongali Patient');
    expect(hasConfiguredPin()).toBe(true);

    const activeSession = getActiveSession();
    expect(activeSession.profileName).toBe('Rongali Patient');
  });

  it('4. authenticatePin validates correct PIN and rejects incorrect PIN', async () => {
    await setProfilePin('789012');

    // Attempt with incorrect PIN
    const failResult = await authenticatePin('654321');
    expect(failResult.success).toBe(false);
    expect(failResult.attemptsRemaining).toBe(4);
    expect(getActiveSession()).toBeNull();

    // Attempt with correct PIN
    const passResult = await authenticatePin('789012', 'Arogya Patient');
    expect(passResult.success).toBe(true);
    expect(passResult.session.profileName).toBe('Arogya Patient');
    expect(getActiveSession()).not.toBeNull();
  });

  it('5. authenticatePin locks out after 5 consecutive failures for 30s', async () => {
    await setProfilePin('555555');

    // Fail 5 times
    await authenticatePin('000001');
    await authenticatePin('000002');
    await authenticatePin('000003');
    await authenticatePin('000004');
    const finalFail = await authenticatePin('000005');

    expect(finalFail.success).toBe(false);
    expect(finalFail.isLocked).toBe(true);

    const status = getLockoutStatus();
    expect(status.isLocked).toBe(true);
    expect(status.remainingSeconds).toBeGreaterThan(0);

    // Further attempts while locked should fail immediately
    const lockedAttempt = await authenticatePin('555555');
    expect(lockedAttempt.success).toBe(false);
    expect(lockedAttempt.isLocked).toBe(true);
  });

  it('6. logout clears active session from sessionStorage', async () => {
    await setProfilePin('987654');
    await authenticatePin('987654');
    expect(getActiveSession()).not.toBeNull();

    logout();
    expect(getActiveSession()).toBeNull();
  });

  describe('Role-based Multi-Profile Authentication', () => {
    it('7. createSession adds role field defaulting to patient and supports caregiver / asha_worker', () => {
      // Test default role
      const s1 = createSession('Pranjal Saikia');
      expect(s1.role).toBe('patient');
      expect(s1.profileName).toBe('Pranjal Saikia');
      expect(s1.token).toMatch(/^sess_/);
      expect(getActiveSession().role).toBe('patient');

      // Test caregiver role
      const s2 = createSession('Rima Saikia', 'caregiver');
      expect(s2.role).toBe('caregiver');
      expect(s2.profileName).toBe('Rima Saikia');
      expect(getActiveSession().role).toBe('caregiver');

      // Test asha_worker role
      const s3 = createSession('Ananya ASHA', 'asha_worker');
      expect(s3.role).toBe('asha_worker');
      expect(getActiveSession().role).toBe('asha_worker');

      // Invalid role falls back to patient
      const s4 = createSession('Unknown User', 'invalid_role');
      expect(s4.role).toBe('patient');
    });

    it('8. stores per-role PIN hash under distinct localStorage keys without collapsing', async () => {
      // Configure Patient PIN
      await setProfilePin('111111', 'patient');
      expect(hasConfiguredPin('patient')).toBe(true);
      expect(hasConfiguredPin('caregiver')).toBe(false);
      expect(hasConfiguredPin('asha_worker')).toBe(false);

      // Verify distinct localStorage key for patient
      const patientHash = localStorage.getItem('neurosetu_pin_hash_patient');
      expect(patientHash).toBeTruthy();
      expect(localStorage.getItem('neurosetu_pin_hash_caregiver')).toBeNull();
      expect(localStorage.getItem('neurosetu_pin_hash_asha_worker')).toBeNull();

      // Configure Caregiver PIN with different value
      await setProfilePin('222222', 'caregiver');
      expect(hasConfiguredPin('caregiver')).toBe(true);
      expect(hasConfiguredPin('asha_worker')).toBe(false);

      const caregiverHash = localStorage.getItem('neurosetu_pin_hash_caregiver');
      expect(caregiverHash).toBeTruthy();
      expect(caregiverHash).not.toEqual(patientHash);

      // Configure ASHA Worker PIN
      await setProfilePin('333333', 'asha_worker');
      expect(hasConfiguredPin('asha_worker')).toBe(true);

      const ashaHash = localStorage.getItem('neurosetu_pin_hash_asha_worker');
      expect(ashaHash).toBeTruthy();
      expect(ashaHash).not.toEqual(patientHash);
      expect(ashaHash).not.toEqual(caregiverHash);
    });

    it('9. session object contains role field matching authenticated role', async () => {
      await setProfilePin('123456', 'patient');
      await setProfilePin('567890', 'caregiver');
      await setProfilePin('901234', 'asha_worker');

      // Authenticate as Caregiver
      const caregiverResult = await authenticatePin('567890', 'Maya Devi', 'caregiver');
      expect(caregiverResult.success).toBe(true);
      expect(caregiverResult.session.role).toBe('caregiver');
      expect(caregiverResult.session.profileName).toBe('Maya Devi');
      expect(getActiveSession().role).toBe('caregiver');

      // Authenticate as ASHA Worker
      const ashaResult = await authenticatePin('901234', 'ASHA Rina', 'asha_worker');
      expect(ashaResult.success).toBe(true);
      expect(ashaResult.session.role).toBe('asha_worker');
      expect(getActiveSession().role).toBe('asha_worker');

      // Authenticate as Patient
      const patientResult = await authenticatePin('123456', 'Bhabesh Kalita', 'patient');
      expect(patientResult.success).toBe(true);
      expect(patientResult.session.role).toBe('patient');
      expect(getActiveSession().role).toBe('patient');
    });

    it('10. PIN entered for one role cannot authenticate another role', async () => {
      await setProfilePin('111111', 'patient');
      await setProfilePin('222222', 'caregiver');

      // Entering patient PIN (111111) for caregiver should fail
      const wrongRoleAuth = await authenticatePin('111111', 'Caregiver User', 'caregiver');
      expect(wrongRoleAuth.success).toBe(false);
      expect(wrongRoleAuth.attemptsRemaining).toBe(4);

      // Entering caregiver PIN (222222) for patient should fail
      const wrongRoleAuth2 = await authenticatePin('222222', 'Patient User', 'patient');
      expect(wrongRoleAuth2.success).toBe(false);
      expect(wrongRoleAuth2.attemptsRemaining).toBe(4);
    });

    it('11. Lockout on one role does not lock out other roles', async () => {
      await setProfilePin('111111', 'patient');
      await setProfilePin('222222', 'caregiver');

      // Fail caregiver 5 times
      for (let i = 0; i < 5; i++) {
        await authenticatePin('999999', 'Caregiver', 'caregiver');
      }

      // Caregiver must be locked out
      const caregiverLock = getLockoutStatus('caregiver');
      expect(caregiverLock.isLocked).toBe(true);
      expect(caregiverLock.remainingSeconds).toBeGreaterThan(0);

      // Patient must NOT be locked out
      const patientLock = getLockoutStatus('patient');
      expect(patientLock.isLocked).toBe(false);
      expect(patientLock.remainingSeconds).toBe(0);

      // Patient can authenticate normally
      const patientAuth = await authenticatePin('111111', 'Patient', 'patient');
      expect(patientAuth.success).toBe(true);
    });

    it('12. resetAllAuthData clears storage across all roles', async () => {
      await setProfilePin('111111', 'patient');
      await setProfilePin('222222', 'caregiver');
      await setProfilePin('333333', 'asha_worker');

      expect(hasConfiguredPin('patient')).toBe(true);
      expect(hasConfiguredPin('caregiver')).toBe(true);
      expect(hasConfiguredPin('asha_worker')).toBe(true);

      resetAllAuthData();

      expect(hasConfiguredPin('patient')).toBe(false);
      expect(hasConfiguredPin('caregiver')).toBe(false);
      expect(hasConfiguredPin('asha_worker')).toBe(false);
      expect(getActiveSession()).toBeNull();
    });

    it('13. exports DEFAULT_ROLE_PINS and DEV_BYPASS_PINS constants', () => {
      expect(DEFAULT_ROLE_PINS).toBeDefined();
      expect(DEFAULT_ROLE_PINS.patient).toBe('100100');
      expect(DEFAULT_ROLE_PINS.caregiver).toBe('1234');
      expect(DEFAULT_ROLE_PINS.asha_worker).toBe('9999');

      expect(DEV_BYPASS_PINS).toContain('000000');
      expect(DEV_BYPASS_PINS).toContain('0000');
      expect(DEV_BYPASS_PINS).toContain('123456');
    });

    it('14. DEV bypass authenticates immediately in development mode and clears locks', async () => {
      // Set existing PIN to something different
      await setProfilePin('888888', 'patient');

      // Temporarily simulate development environment
      const originalMode = import.meta.env.MODE;
      try {
        import.meta.env.MODE = 'development';

        const bypassResult = await authenticatePin('000000', 'Bypass Patient', 'patient');
        expect(bypassResult.success).toBe(true);
        expect(bypassResult.isDevBypass).toBe(true);
        expect(getActiveSession()).not.toBeNull();
        expect(getActiveSession().profileName).toBe('Bypass Patient');
      } finally {
        import.meta.env.MODE = originalMode;
      }
    });
  });
});
