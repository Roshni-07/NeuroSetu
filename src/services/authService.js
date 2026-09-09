/**
 * authService.js - Local PIN-based Authentication & Session Management
 * Built for NeuroSetu (Prototype Tier: No external OAuth/ABDM dependency)
 */

import { PRESET_PATIENTS, getPresetPatientByPin } from '../data/presetPatients.js';

export const ROLES = {
  PATIENT: 'patient',
  CAREGIVER: 'caregiver',
  ASHA_WORKER: 'asha_worker'
};

export const VALID_ROLES = Object.values(ROLES);

/**
 * Standard default / demo PIN credentials by role
 */
export const DEFAULT_ROLE_PINS = {
  [ROLES.PATIENT]: '100100', // Preset 1: Ramesh Patel (Mild), 200200: Savitri (Moderate), 300300: Anil (Severe), 400400: Bhaben (Assam)
  [ROLES.CAREGIVER]: '1234',
  [ROLES.ASHA_WORKER]: '9999'
};

/**
 * Inactivity timeout duration for patient sessions (5 minutes default, configurable)
 */
export const PATIENT_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Universal bypass PINs for development / testing environments
 */
export const DEV_BYPASS_PINS = ['000000', '0000', '123456', '1234'];

/**
 * SIH-DEMO-ONLY: Seeded demo credentials for Smart India Hackathon evaluation; not for production deployment
 */
export const DEFAULT_ACCOUNTS = {
  [ROLES.ASHA_WORKER]: {
    username: 'admin',
    email: 'asha@neurosetu.org',
    password: 'asha123',
    profileName: 'ASHA Rina Borah'
  },
  [ROLES.CAREGIVER]: {
    username: 'caregiver',
    email: 'caregiver@neurosetu.org',
    password: 'caregiver123',
    profileName: 'Caregiver Maya'
  }
};

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
 * Get role-specific localStorage keys
 */
export function getRoleStorageKeys(role = ROLES.PATIENT) {
  const normalized = VALID_ROLES.includes(role) ? role : ROLES.PATIENT;
  return {
    PIN_HASH: `neurosetu_pin_hash_${normalized}`,
    PIN_SALT: `neurosetu_pin_salt_${normalized}`,
    ATTEMPTS: `neurosetu_auth_attempts_${normalized}`,
    LOCKOUT_UNTIL: `neurosetu_auth_lockout_${normalized}`
  };
}

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
 * Validate that a PIN is strictly a 6-digit string
 */
export function validatePinFormat(pin) {
  return typeof pin === 'string' && /^\d{6}$/.test(pin);
}

/**
 * Check if a profile PIN has been configured for a role
 */
export function hasConfiguredPin(role = ROLES.PATIENT) {
  try {
    const keys = getRoleStorageKeys(role);
    const hasRolePin = Boolean(localStorage.getItem(keys.PIN_HASH));
    if (hasRolePin) return true;
    if (role === ROLES.PATIENT) {
      return Boolean(localStorage.getItem(STORAGE_KEYS.PIN_HASH));
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Configure or reset a new 6-digit PIN for a specific role
 */
export async function setProfilePin(pin, role = ROLES.PATIENT) {
  if (!validatePinFormat(pin)) {
    throw new Error('PIN must be exactly 6 numeric digits (0-9).');
  }

  const salt = generateSalt();
  const hash = await hashPin(pin, salt);

  const keys = getRoleStorageKeys(role);
  localStorage.setItem(keys.PIN_SALT, salt);
  localStorage.setItem(keys.PIN_HASH, hash);
  localStorage.removeItem(keys.ATTEMPTS);
  localStorage.removeItem(keys.LOCKOUT_UNTIL);

  if (role === ROLES.PATIENT) {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  }

  return true;
}

/**
 * Check if currently in a lockout state for a specific role
 */
export function getLockoutStatus(role = ROLES.PATIENT) {
  const keys = getRoleStorageKeys(role);
  let lockoutUntil = parseInt(localStorage.getItem(keys.LOCKOUT_UNTIL) || '0', 10);
  if (lockoutUntil === 0 && role === ROLES.PATIENT) {
    lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
  }
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
 * Authenticate entered PIN against stored hash for a role
 */
export async function authenticatePin(pin, profileName = 'Primary Patient', role = ROLES.PATIENT) {
  // Universal developer convenience bypass in local development
  const isDev = Boolean(
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.DEV &&
    import.meta.env.MODE !== 'test'
  );

  if (!validatePinFormat(pin)) {
    if (!DEV_BYPASS_PINS.includes(pin)) {
      return { success: false, error: 'PIN must be exactly 6 numeric digits.' };
    }
  }

  // 1. Patient PIN Matching (Direct Profile Resolution for Roadmap & Dementia Personas)
  if (role === ROLES.PATIENT) {
    let matchedPatient = getPresetPatientByPin(pin);

    // Fallback: 400400 (or legacy 4004) explicitly maps to Bhaben Kalita (Default Assam Profile)
    if (!matchedPatient && (pin === '400400' || pin === '4004')) {
      matchedPatient = {
        id: 'default_patient',
        name: 'Bhaben Kalita',
        pin: '400400',
        stage: 'Mild / Early Stage',
        age: 72,
        dailyCap: 3,
        homeState: 'Assam',
        villageTown: 'Hajo',
        starting_difficulty_tier: 1,
        masteryScore: 50
      };
    }

    // Dev bypass (000000 / 0000 -> Ramesh Patel, 123456 / 1234 -> default Bhaben Kalita)
    if (!matchedPatient && (isDev || DEV_BYPASS_PINS.includes(pin))) {
      if (pin === '1234' || pin === '123456') {
        matchedPatient = {
          id: 'default_patient',
          name: 'Bhaben Kalita',
          pin: '400400',
          stage: 'Mild / Early Stage',
          age: 72,
          dailyCap: 3,
          homeState: 'Assam',
          villageTown: 'Hajo',
          familyMembers: [{ name: 'Rumi', relationship: 'daughter' }],
          starting_difficulty_tier: 1,
          masteryScore: 50
        };
      } else if (DEV_BYPASS_PINS.includes(pin)) {
        matchedPatient = PRESET_PATIENTS[0];
      }
    }

    if (matchedPatient) {
      const keys = getRoleStorageKeys(role);
      localStorage.removeItem(keys.ATTEMPTS);
      localStorage.removeItem(keys.LOCKOUT_UNTIL);
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);

      try {
        localStorage.setItem('neurosetu_active_patient', JSON.stringify(matchedPatient));
      } catch (e) {}

      const targetName = (profileName && profileName !== 'Primary Patient' && profileName !== 'default_patient')
        ? profileName
        : matchedPatient.name;
      const session = createSession(targetName, role, matchedPatient.id);
      return {
        success: true,
        session,
        patient: matchedPatient,
        isDevBypass: DEV_BYPASS_PINS.includes(pin)
      };
    }
  }

  // 2. Staff Dev Bypass
  if (isDev && (DEV_BYPASS_PINS.includes(pin) || pin === DEFAULT_ROLE_PINS[role] || (role === ROLES.CAREGIVER && pin === '8888'))) {
    const keys = getRoleStorageKeys(role);
    localStorage.removeItem(keys.ATTEMPTS);
    localStorage.removeItem(keys.LOCKOUT_UNTIL);
    if (role === ROLES.PATIENT) {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    }
    const staffName = role === ROLES.ASHA_WORKER ? 'ASHA Rina Borah' : role === ROLES.CAREGIVER ? 'Caregiver Maya' : profileName;
    const session = createSession(staffName, role, role === ROLES.PATIENT ? 'preset-1' : null);
    return { success: true, session, isDevBypass: true };
  }

  const lockout = getLockoutStatus(role);
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Please wait ${lockout.remainingSeconds} seconds.`,
      isLocked: true
    };
  }

  const keys = getRoleStorageKeys(role);
  let storedHash = localStorage.getItem(keys.PIN_HASH);
  let storedSalt = localStorage.getItem(keys.PIN_SALT);

  // Fallback for legacy patient key
  if ((!storedHash || !storedSalt) && role === ROLES.PATIENT) {
    storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    storedSalt = localStorage.getItem(STORAGE_KEYS.PIN_SALT);
  }

  // If no PIN is configured yet for this role, auto-configure this PIN as initial profile PIN
  if (!storedHash || !storedSalt) {
    await setProfilePin(pin, role);
    const session = createSession(profileName, role, role === ROLES.PATIENT ? 'default_patient' : null);
    return { success: true, session, isInitialSetup: true };
  }

  const enteredHash = await hashPin(pin, storedSalt);

  if (enteredHash === storedHash) {
    // Reset failed attempts on success
    localStorage.removeItem(keys.ATTEMPTS);
    localStorage.removeItem(keys.LOCKOUT_UNTIL);
    if (role === ROLES.PATIENT) {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    }
    const session = createSession(profileName, role, role === ROLES.PATIENT ? 'default_patient' : null);
    return { success: true, session };
  }

  // Increment failed attempts for this role
  let currentAttempts = parseInt(localStorage.getItem(keys.ATTEMPTS) || '0', 10);
  if (currentAttempts === 0 && role === ROLES.PATIENT) {
    currentAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10);
  }
  currentAttempts += 1;
  localStorage.setItem(keys.ATTEMPTS, currentAttempts.toString());
  if (role === ROLES.PATIENT) {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, currentAttempts.toString());
  }

  if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(keys.LOCKOUT_UNTIL, lockUntil.toString());
    if (role === ROLES.PATIENT) {
      localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockUntil.toString());
    }
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
 * Authenticate email/username and password for clinical/caregiver staff
 */
export async function authenticatePassword(identifier, password, role = ROLES.ASHA_WORKER) {
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    return { success: false, error: 'Please enter your email or username.' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { success: false, error: 'Please enter your password.' };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check Dev Bypass in local development
  const isDev = Boolean(
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.DEV &&
    import.meta.env.MODE !== 'test'
  );

  if (isDev && (cleanPass === '0000' || cleanPass === 'admin123')) {
    const profileName = role === ROLES.ASHA_WORKER ? 'ASHA Rina Borah' : 'Caregiver Maya';
    const session = createSession(profileName, role, null);
    return { success: true, session, isDevBypass: true };
  }

  // 2. Check Seeded Default Accounts (accept both primary password and admin123 fallback)
  const seeded = DEFAULT_ACCOUNTS[role];
  if (seeded) {
    const matchesId = seeded.username.toLowerCase() === cleanId || seeded.email.toLowerCase() === cleanId;
    if (matchesId && (seeded.password === cleanPass || cleanPass === 'admin123')) {
      const session = createSession(seeded.profileName, role, null);
      return { success: true, session };
    }
  }

  // 3. Check custom accounts registered in localStorage
  try {
    const customAccountsRaw = localStorage.getItem(`neurosetu_accounts_${role}`);
    if (customAccountsRaw) {
      const accounts = JSON.parse(customAccountsRaw);
      const matched = accounts.find(
        acc => (acc.email?.toLowerCase() === cleanId || acc.username?.toLowerCase() === cleanId) && acc.password === cleanPass
      );
      if (matched) {
        const session = createSession(matched.profileName || identifier, role, null);
        return { success: true, session };
      }
    }
  } catch (e) {}

  return {
    success: false,
    error: 'Invalid email/username or password. Please check your credentials.'
  };
}

/**
 * Create and persist an active session with role and bound patientId
 */
export function createSession(profileName, role = ROLES.PATIENT, patientId = null) {
  const normalizedRole = VALID_ROLES.includes(role) ? role : ROLES.PATIENT;
  const session = {
    profileName,
    role: normalizedRole,
    patientId: normalizedRole === ROLES.PATIENT ? (patientId || 'default_patient') : null,
    authenticatedAt: new Date().toISOString(),
    token: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return session;
}

/**
 * Retrieve active authenticated session with migration guard for legacy sessions
 */
export function getActiveSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Session migration: detect legacy session missing patientId on patient role
    // and force re-login rather than proceeding with patientId: undefined
    if (parsed && parsed.role === ROLES.PATIENT && !parsed.patientId) {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }

    return parsed;
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
  VALID_ROLES.forEach(r => {
    const keys = getRoleStorageKeys(r);
    Object.values(keys).forEach(k => localStorage.removeItem(k));
  });
  Object.values(STORAGE_KEYS).forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}
