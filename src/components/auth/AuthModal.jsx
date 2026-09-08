import React, { useState, useEffect, useCallback } from 'react';
import {
  authenticatePin,
  authenticatePassword,
  getLockoutStatus,
  hasConfiguredPin,
  DEFAULT_ROLE_PINS,
  DEV_BYPASS_PINS,
  DEFAULT_ACCOUNTS,
  ROLES
} from '../../services/authService.js';
import { PRESET_PATIENTS } from '../../data/presetPatients.js';

export default function AuthModal({
  isOpen,
  onSuccess,
  onClose,
  profileName = 'Primary Patient',
  role = 'patient',
  onChangeRole = null,
  openedFromRoleSelector = false,
  onBackToRoleSelector = null,
  origin = null
}) {
  const isFromRoleSelector = openedFromRoleSelector || origin === 'RoleSelector' || Boolean(onBackToRoleSelector);
  const isPatient = role === ROLES.PATIENT || role === 'patient';
  const roleLabel = role === ROLES.CAREGIVER ? 'Caregiver' : role === ROLES.ASHA_WORKER ? 'ASHA Worker' : 'Patient';

  // State
  const [pin, setPin] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(!hasConfiguredPin(role));
  const [showDemoPins, setShowDemoPins] = useState(false);

  // Print valid default credentials in browser console in development mode
  // Print valid default credentials in browser console in development mode
  useEffect(() => {
    if (isOpen && import.meta.env?.DEV) {
      if (typeof console !== 'undefined' && console.group && console.info) {
        console.group('🔑 [NeuroSetu Dev Auth] Active Role & Credentials Reference');
        console.info(`Active Role: %c${role} (${roleLabel})`, 'font-weight: bold; color: #0d9488');
        console.info('Seeded Staff Accounts (Email/Password):', DEFAULT_ACCOUNTS);
        console.info('Default Role PINs:', DEFAULT_ROLE_PINS);
        console.info('Preset Dementia Patient PINs (Roadmap):', {
          'Ramesh Patel (Mild Stage)': '100100',
          'Savitri Devi (Moderate Stage)': '200200',
          'Anil Kumar (Severe Stage)': '300300'
        });
        console.info('Dev Universal Bypass PINs / Passwords:', { PIN: DEV_BYPASS_PINS, Password: 'admin123 or 0000' });
        console.info('💡 Tip: Use the Dev Mode badge inside the modal to autofill demo credentials with 1 click.');
        console.groupEnd();
      }
    }
  }, [isOpen, role, roleLabel]);

  // Reset fields on modal open or role change
  useEffect(() => {
    if (isOpen) {
      setIsSetupMode(!hasConfiguredPin(role));
      setPin('');
      setIdentifier('');
      setPassword('');
      setErrorMsg('');
      setShowDemoPins(false);
    }
  }, [isOpen, role]);

  // Check lockout status on mount & interval for PIN
  useEffect(() => {
    const checkLockout = () => {
      const status = getLockoutStatus(role);
      if (status.isLocked) {
        setLockoutRemaining(status.remainingSeconds);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [role]);

  // -------------------------------------------------------------
  // PIN Handlers (Patients Only)
  // -------------------------------------------------------------
  const handleDigitPress = useCallback((digit) => {
    if (lockoutRemaining > 0 || isSubmitting) return;
    setErrorMsg('');
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, [lockoutRemaining, isSubmitting]);

  const handleBackspace = useCallback(() => {
    if (lockoutRemaining > 0 || isSubmitting) return;
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  }, [lockoutRemaining, isSubmitting]);

  const handleClear = useCallback(() => {
    if (lockoutRemaining > 0 || isSubmitting) return;
    setErrorMsg('');
    setPin('');
  }, [lockoutRemaining, isSubmitting]);

  const handleSubmitPin = useCallback(async (currentPin) => {
    if (isSubmitting) return;
    const pinToTest = currentPin || pin;
    if (pinToTest.length !== 6) {
      setErrorMsg('Please enter 6 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await authenticatePin(pinToTest, profileName, role);
      if (result.success) {
        setPin('');
        setIsSubmitting(false);
        if (onSuccess) onSuccess(result.session);
      } else {
        setErrorMsg(result.error || "Let's try that again together.");
        setPin('');
        if (result.isLocked) {
          const status = getLockoutStatus(role);
          setLockoutRemaining(status.remainingSeconds);
        }
        setIsSubmitting(false);
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setPin('');
      setIsSubmitting(false);
    }
  }, [isSubmitting, pin, profileName, role, onSuccess]);

  // Auto-submit PIN when 6 digits are entered (patient only)
  useEffect(() => {
    if (isPatient && pin.length === 6) {
      handleSubmitPin(pin);
    }
  }, [isPatient, pin, handleSubmitPin]);

  const handleQuickFill = useCallback((quickPin) => {
    setErrorMsg('');
    setPin(quickPin);
    handleSubmitPin(quickPin);
  }, [handleSubmitPin]);

  // -------------------------------------------------------------
  // Password Handler (ASHA Workers & Caregivers)
  // -------------------------------------------------------------
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await authenticatePassword(identifier, password, role);
      if (result.success) {
        setIdentifier('');
        setPassword('');
        setIsSubmitting(false);
        if (onSuccess) onSuccess(result.session);
      } else {
        setErrorMsg(result.error || 'Invalid credentials. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuickFillPassword = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMsg('');
  };

  // Keyboard navigation support for PIN entry
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Escape works everywhere
      if (e.key === 'Escape') {
        if (isFromRoleSelector && (onBackToRoleSelector || onChangeRole)) {
          (onBackToRoleSelector || onChangeRole)();
        } else if (onClose) {
          onClose();
        }
        return;
      }

      // If in staff mode or focusing on input element, let standard typing work
      if (!isPatient || (e.target && e.target.tagName === 'INPUT')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPatient, handleDigitPress, handleBackspace, onClose, isFromRoleSelector, onBackToRoleSelector, onChangeRole]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-soft-xl border border-slate-200/80 text-center animate-slide-up my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-xl font-bold border border-teal-100/80 shadow-xs">
            {isPatient ? '🔒' : role === ROLES.ASHA_WORKER ? '🩺' : '🏡'}
          </div>
          <h2
            id="auth-modal-title"
            aria-label={isPatient ? (isSetupMode ? 'Create Profile PIN' : 'Enter 6-Digit PIN') : `${roleLabel} PIN / Login`}
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            {isPatient
              ? isSetupMode
                ? 'Create Profile PIN'
                : 'Enter 6-Digit PIN'
              : `${roleLabel} Portal Login`}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {isPatient
              ? isSetupMode
                ? 'Choose a memorable 6-digit code for your daily session.'
                : `Profile: ${profileName}`
              : `Sign in with your ${roleLabel.toLowerCase()} credentials to access the clinical portal.`}
          </p>
          {onChangeRole && (
            <button
              type="button"
              onClick={onChangeRole}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 underline mt-1.5 cursor-pointer"
            >
              <span>⇄</span>
              <span>Switch Role</span>
            </button>
          )}
        </div>

        {/* Feedback Message / Error State */}
        <div className="min-h-[28px] mb-3 flex items-center justify-center">
          {lockoutRemaining > 0 ? (
            <p role="alert" className="text-xs font-semibold text-amber-900 bg-amber-50/90 py-1 px-3 rounded-xl border border-amber-300">
              ⏳ Locked for {lockoutRemaining}s. Please wait.
            </p>
          ) : errorMsg ? (
            <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 py-1 px-3 rounded-xl border border-rose-200 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-normal">
              {isPatient ? 'Touch the numbers below or speak your PIN.' : 'Sign in with your email or username and password.'}
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* NON-PATIENT STAFF LOGIN FORM (Email / Password) */}
        {/* ------------------------------------------------------------- */}
        {!isPatient && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5 mb-2 text-left">
            <div>
              <label htmlFor="auth-identifier" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email / Username
              </label>
              <input
                id="auth-identifier"
                name="username"
                autoComplete="username"
                data-testid="auth-identifier-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === ROLES.ASHA_WORKER ? 'asha@neurosetu.org or admin' : 'caregiver@neurosetu.org'}
                className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition font-medium text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                autoComplete="current-password"
                data-testid="auth-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              data-testid="submit-password-btn"
              disabled={isSubmitting}
              className="w-full min-h-[46px] py-2.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-soft transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In with Password'}</span>
              <span>→</span>
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6-DIGIT PIN ENTRY (Exclusively for Elderly Patients) */}
        {/* ------------------------------------------------------------- */}
        {isPatient && (
          <>
            {/* PIN Digit Indicators (6 Dots) */}
            <div
              className={`flex justify-center items-center gap-2.5 sm:gap-3 my-3 p-2 rounded-2xl transition-all duration-200 ${
                errorMsg ? 'border border-rose-300 bg-rose-50/40' : ''
              }`}
              aria-label="PIN Entry Dots"
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    data-testid={`pin-dot-${index}`}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-all duration-200 ${
                      errorMsg
                        ? 'border-rose-400 bg-rose-100'
                        : isFilled
                        ? 'bg-teal-600 border-teal-600 scale-110 shadow-xs'
                        : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* 3x4 Accessible Keypad */}
            <div className="grid grid-cols-3 gap-2 my-2" role="group" aria-label="Numeric Keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={lockoutRemaining > 0 || isSubmitting}
                  onClick={() => handleDigitPress(digit)}
                  className="min-h-[50px] bg-slate-50 hover:bg-slate-100 active:bg-teal-50 border border-slate-200/80 rounded-2xl text-2xl font-semibold text-slate-800 shadow-soft hover:shadow-soft-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                >
                  {digit}
                </button>
              ))}

              {/* Clear Button */}
              <button
                type="button"
                disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
                onClick={handleClear}
                className="min-h-[50px] bg-slate-100/70 hover:bg-slate-200/70 active:bg-slate-200 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-600 shadow-soft active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                Clear
              </button>

              {/* 0 Button */}
              <button
                type="button"
                disabled={lockoutRemaining > 0 || isSubmitting}
                onClick={() => handleDigitPress('0')}
                className="min-h-[50px] bg-slate-50 hover:bg-slate-100 active:bg-teal-50 border border-slate-200/80 rounded-2xl text-2xl font-semibold text-slate-800 shadow-soft hover:shadow-soft-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                0
              </button>

              {/* Backspace Button */}
              <button
                type="button"
                disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
                onClick={handleBackspace}
                aria-label="Delete last digit"
                className="min-h-[50px] bg-slate-100/70 hover:bg-slate-200/70 active:bg-slate-200 border border-slate-200/80 rounded-2xl text-base font-bold text-slate-600 shadow-soft active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
              >
                ⌫
              </button>
            </div>
          </>
        )}

        {/* Development Mode Demo Credentials Hint Badge */}
        {Boolean(import.meta.env?.DEV) && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 text-left">
            <div className="flex items-center justify-between">
              <button
                type="button"
                data-testid="show-demo-pins-btn"
                onClick={() => setShowDemoPins((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg border border-teal-200/80 transition cursor-pointer"
                aria-expanded={showDemoPins}
                aria-label="Show Demo PINs"
              >
                <span>🛠️</span>
                <span>{showDemoPins ? 'Hide Demo Logins' : isPatient ? 'Show Demo PINs' : 'Show Demo Credentials'}</span>
                <span className="text-[9px] text-teal-700 bg-teal-100/80 px-1 py-0.2 rounded font-mono font-bold">DEV</span>
              </button>
              <span className="text-[10px] text-slate-400 font-mono">{isPatient ? 'Bypass: 000000' : 'Bypass: admin123'}</span>
            </div>

            {showDemoPins && (
              <div data-testid="demo-pins-container" className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 animate-fade-in text-[11px]">
                {!isPatient ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Quick Password Autofill:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role === ROLES.ASHA_WORKER ? (
                        <button
                          type="button"
                          onClick={() => handleQuickFillPassword('admin', 'asha123')}
                          className="px-2 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        >
                          ASHA: admin / asha123
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickFillPassword('caregiver', 'caregiver123')}
                          className="px-2 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        >
                          Caregiver: caregiver / caregiver123
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Quick-Fill Demo PINs ({roleLabel}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        data-testid="quick-fill-100100"
                        onClick={() => handleQuickFill('100100')}
                        className="px-2 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        title="Ramesh Patel (Mild Stage)"
                      >
                        100100 <span className="text-[10px] font-sans font-normal text-slate-400">(Mild)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="quick-fill-200200"
                        onClick={() => handleQuickFill('200200')}
                        className="px-2 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        title="Savitri Devi (Moderate Stage)"
                      >
                        200200 <span className="text-[10px] font-sans font-normal text-slate-400">(Mod)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="quick-fill-300300"
                        onClick={() => handleQuickFill('300300')}
                        className="px-2 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        title="Anil Kumar (Severe Stage)"
                      >
                        300300 <span className="text-[10px] font-sans font-normal text-slate-400">(Sev)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="quick-fill-400400"
                        onClick={() => handleQuickFill('400400')}
                        className="px-2 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        title="Bhaben Kalita (Default Assam)"
                      >
                        400400 <span className="text-[10px] font-sans font-normal text-slate-400">(Assam)</span>
                      </button>
                      <button
                        type="button"
                        data-testid="quick-fill-000000"
                        onClick={() => handleQuickFill('000000')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
                        title="Universal Dev Bypass"
                      >
                        000000 <span className="text-[10px] font-sans font-normal text-amber-700">(Bypass)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Back to Role Selection OR Cancel Footer */}
        {isFromRoleSelector ? (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToRoleSelector || onChangeRole || onClose}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label="Back to role selection"
            >
              <span className="text-lg leading-none">←</span>
              <span>Back to role selection</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 py-1.5 px-3 rounded-xl transition"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          onClose && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 px-4 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
