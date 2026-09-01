import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validatePinFormat,
  setProfilePin,
  hasConfiguredPin,
  authenticatePin,
  getActiveSession,
  getLockoutStatus,
  logout,
  resetAllAuthData
} from '../../src/services/authService.js';

describe('Task 5 & 6: PIN Authentication & Session Lifecycle', () => {
  beforeEach(() => {
    resetAllAuthData();
    vi.restoreAllMocks();
  });

  it('1. validatePinFormat accepts 4 numeric digits and rejects invalid formats', () => {
    expect(validatePinFormat('1234')).toBe(true);
    expect(validatePinFormat('0000')).toBe(true);
    expect(validatePinFormat('9999')).toBe(true);

    expect(validatePinFormat('123')).toBe(false); // Too short
    expect(validatePinFormat('12345')).toBe(false); // Too long
    expect(validatePinFormat('12a4')).toBe(false); // Non-digit
    expect(validatePinFormat('')).toBe(false);
    expect(validatePinFormat(null)).toBe(false);
    expect(validatePinFormat(1234)).toBe(false); // Must be string
  });

  it('2. setProfilePin saves salt and hash in localStorage', async () => {
    expect(hasConfiguredPin()).toBe(false);
    const success = await setProfilePin('4321');
    expect(success).toBe(true);
    expect(hasConfiguredPin()).toBe(true);
  });

  it('3. authenticatePin auto-configures PIN on first use if not already set', async () => {
    expect(hasConfiguredPin()).toBe(false);
    const result = await authenticatePin('1122', 'Rongali Patient');

    expect(result.success).toBe(true);
    expect(result.isInitialSetup).toBe(true);
    expect(result.session).toBeDefined();
    expect(result.session.profileName).toBe('Rongali Patient');
    expect(hasConfiguredPin()).toBe(true);

    const activeSession = getActiveSession();
    expect(activeSession.profileName).toBe('Rongali Patient');
  });

  it('4. authenticatePin validates correct PIN and rejects incorrect PIN', async () => {
    await setProfilePin('7890');

    // Attempt with incorrect PIN
    const failResult = await authenticatePin('1234');
    expect(failResult.success).toBe(false);
    expect(failResult.attemptsRemaining).toBe(4);
    expect(getActiveSession()).toBeNull();

    // Attempt with correct PIN
    const passResult = await authenticatePin('7890', 'Arogya Patient');
    expect(passResult.success).toBe(true);
    expect(passResult.session.profileName).toBe('Arogya Patient');
    expect(getActiveSession()).not.toBeNull();
  });

  it('5. authenticatePin locks out after 5 consecutive failures for 30s', async () => {
    await setProfilePin('5555');

    // Fail 5 times
    await authenticatePin('0001');
    await authenticatePin('0002');
    await authenticatePin('0003');
    await authenticatePin('0004');
    const finalFail = await authenticatePin('0005');

    expect(finalFail.success).toBe(false);
    expect(finalFail.isLocked).toBe(true);

    const status = getLockoutStatus();
    expect(status.isLocked).toBe(true);
    expect(status.remainingSeconds).toBeGreaterThan(0);

    // Further attempts while locked should fail immediately
    const lockedAttempt = await authenticatePin('5555');
    expect(lockedAttempt.success).toBe(false);
    expect(lockedAttempt.isLocked).toBe(true);
  });

  it('6. logout clears active session from sessionStorage', async () => {
    await setProfilePin('9876');
    await authenticatePin('9876');
    expect(getActiveSession()).not.toBeNull();

    logout();
    expect(getActiveSession()).toBeNull();
  });
});
