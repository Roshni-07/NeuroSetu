import React, { useState, useEffect, useCallback } from 'react';
import {
  authenticatePin,
  getLockoutStatus,
  hasConfiguredPin
} from '../../services/authService.js';

export default function PinAuthModal({
  isOpen,
  onSuccess,
  onClose,
  profileName = 'Primary Patient'
}) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(!hasConfiguredPin());

  // Check lockout status on mount & interval
  useEffect(() => {
    const checkLockout = () => {
      const status = getLockoutStatus();
      if (status.isLocked) {
        setLockoutRemaining(status.remainingSeconds);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitPress = useCallback((digit) => {
    if (lockoutRemaining > 0 || isSubmitting) return;
    setErrorMsg('');
    setPin((prev) => {
      if (prev.length >= 4) return prev;
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

  const handleSubmit = useCallback(async (currentPin) => {
    const pinToTest = currentPin || pin;
    if (pinToTest.length !== 4) {
      setErrorMsg('Please enter 4 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await authenticatePin(pinToTest, profileName);
      if (result.success) {
        setPin('');
        setIsSubmitting(false);
        if (onSuccess) onSuccess(result.session);
      } else {
        setErrorMsg(result.error || "Let's try that again together.");
        setPin('');
        if (result.isLocked) {
          const status = getLockoutStatus();
          setLockoutRemaining(status.remainingSeconds);
        }
        setIsSubmitting(false);
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setPin('');
      setIsSubmitting(false);
    }
  }, [pin, profileName, onSuccess]);

  // Auto submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit(pin);
    }
  }, [pin, handleSubmit]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigitPress, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-soft-xl border border-slate-200/80 text-center animate-slide-up">
        {/* Header */}
        <div className="mb-5">
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-bold border border-teal-100/80 shadow-xs">
            🔒
          </div>
          <h2 id="pin-modal-title" className="text-xl font-bold tracking-tight text-slate-900">
            {isSetupMode ? 'Create Profile PIN' : 'Enter 4-Digit PIN'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {isSetupMode
              ? 'Choose a memorable 4-digit code for your daily session.'
              : `Profile: ${profileName}`}
          </p>
        </div>

        {/* PIN Digit Indicators */}
        <div className="flex justify-center items-center gap-3.5 my-6" aria-label="PIN Entry Dots">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                data-testid={`pin-dot-${index}`}
                className={`w-5 h-5 rounded-full border transition-all duration-200 ${
                  isFilled
                    ? 'bg-teal-600 border-teal-600 scale-110 shadow-xs'
                    : 'bg-slate-100 border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Gentle Feedback Message / Lockout Alert */}
        <div className="min-h-[32px] mb-4 flex items-center justify-center">
          {lockoutRemaining > 0 ? (
            <p className="text-xs font-semibold text-amber-900 bg-amber-50/80 py-1.5 px-3 rounded-xl border border-amber-200/70">
              ⏳ Locked for {lockoutRemaining}s. Take a breath and wait.
            </p>
          ) : errorMsg ? (
            <p className="text-xs font-medium text-slate-700 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
              ℹ {errorMsg}
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-normal">
              Touch the numbers below or speak your PIN.
            </p>
          )}
        </div>

        {/* 3x4 Accessible Keypad */}
        <div className="grid grid-cols-3 gap-2.5 my-2" role="group" aria-label="Numeric Keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={lockoutRemaining > 0 || isSubmitting}
              onClick={() => handleDigitPress(digit)}
              className="min-h-[54px] bg-slate-50 hover:bg-slate-100 active:bg-teal-50 border border-slate-200/80 rounded-2xl text-2xl font-semibold text-slate-800 shadow-soft hover:shadow-soft-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
            onClick={handleClear}
            className="min-h-[54px] bg-slate-100/70 hover:bg-slate-200/70 active:bg-slate-200 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-600 shadow-soft active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting}
            onClick={() => handleDigitPress('0')}
            className="min-h-[54px] bg-slate-50 hover:bg-slate-100 active:bg-teal-50 border border-slate-200/80 rounded-2xl text-2xl font-semibold text-slate-800 shadow-soft hover:shadow-soft-md active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="min-h-[54px] bg-slate-100/70 hover:bg-slate-200/70 active:bg-slate-200 border border-slate-200/80 rounded-2xl text-base font-bold text-slate-600 shadow-soft active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            ⌫
          </button>
        </div>

        {/* Optional Cancel/Close Button if provided */}
        {onClose && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 px-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
