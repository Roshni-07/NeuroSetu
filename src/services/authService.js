/**
 * authService.js - Local PIN-based Authentication & Session Management
 * Built for NeuroSetu (Prototype Tier: No external OAuth/ABDM dependency)
 */

const STORAGE_KEYS = {
  PIN_HASH: 'neurosetu_pin_hash',
  PIN_SALT: 'neurosetu_pin_salt',
  SESSION: 'neurosetu_active_session',
  ATTEMPTS: 'neurosetu_auth_attempts',
  LOCKOUT_UNTIL: 'neurosetu_auth_lockout'
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Generate a random salt for PIN hashing
 */
function generateSalt() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 18);
}

/**
 * Hash a PIN with salt using SHA-256 (via Web Crypto API if available, fallback for test envs)
 */
export async function hashPin(pin, salt) {
  const combined = `${pin}:${salt}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(combined);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback
    }
  }
  // Simple deterministic fallback for headless environments
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
}

/**
 * Validate that a PIN is strictly a 4-digit string
 */
export function validatePinFormat(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

/**
 * Check if a profile PIN has been configured
 */
export function hasConfiguredPin() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.PIN_HASH));
  } catch (e) {
    return false;
  }
}

/**
 * Configure or reset a new 4-digit PIN
 */
export async function setProfilePin(pin) {
  if (!validatePinFormat(pin)) {
    throw new Error('PIN must be exactly 4 numeric digits (0-9).');
  }

  const salt = generateSalt();
  const hash = await hashPin(pin, salt);

  localStorage.setItem(STORAGE_KEYS.PIN_SALT, salt);
  localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

  return true;
}

/**
 * Check if currently in a lockout state due to repeated failed attempts
 */
export function getLockoutStatus() {
  const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
  const now = Date.now();
  if (lockoutUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((lockoutUntil - now) / 1000)
    };
  }
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Authenticate entered PIN against stored hash
 */
export async function authenticatePin(pin, profileName = 'Primary Patient') {
  if (!validatePinFormat(pin)) {
    return { success: false, error: 'PIN must be exactly 4 numeric digits.' };
  }

  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Please wait ${lockout.remainingSeconds} seconds.`,
      isLocked: true
    };
  }

  const storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
  const storedSalt = localStorage.getItem(STORAGE_KEYS.PIN_SALT);

  // If no PIN is configured yet, auto-configure this PIN as initial profile PIN
  if (!storedHash || !storedSalt) {
    await setProfilePin(pin);
    const session = createSession(profileName);
    return { success: true, session, isInitialSetup: true };
  }

  const enteredHash = await hashPin(pin, storedSalt);

  if (enteredHash === storedHash) {
    // Reset failed attempts on success
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    const session = createSession(profileName);
    return { success: true, session };
  }

  // Increment failed attempts
  const currentAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10) + 1;
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, currentAttempts.toString());

  if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockUntil.toString());
    return {
      success: false,
      error: `Too many failed attempts. Locked for 30 seconds.`,
      isLocked: true
    };
  }

  const remaining = MAX_FAILED_ATTEMPTS - currentAttempts;
  return {
    success: false,
    error: `Incorrect PIN. Let's try that again. (${remaining} attempts left)`,
    attemptsRemaining: remaining
  };
}

/**
 * Create and persist an active session
 */
export function createSession(profileName) {
  const session = {
    profileName,
    authenticatedAt: new Date().toISOString(),
    token: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return session;
}

/**
 * Retrieve active authenticated session
 */
export function getActiveSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Terminate active session
 */
export function logout() {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Clear all authentication and profile data (for test/reset only)
 */
export function resetAllAuthData() {
  Object.values(STORAGE_KEYS).forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}
