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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-patient-border text-center animate-fade-in">
        {/* Header */}
        <div className="mb-4">
          <div className="w-14 h-14 bg-teal-50 text-patient-accent rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold border border-teal-200">
            🔒
          </div>
          <h2 id="pin-modal-title" className="text-patient-prompt text-patient-primary">
            {isSetupMode ? 'Create Profile PIN' : 'Enter 4-Digit PIN'}
          </h2>
          <p className="text-sm text-patient-secondary mt-1">
            {isSetupMode
              ? 'Choose a memorable 4-digit code for your daily session.'
              : `Profile: ${profileName}`}
          </p>
        </div>

        {/* PIN Digit Indicators */}
        <div className="flex justify-center items-center gap-4 my-5" aria-label="PIN Entry Dots">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                data-testid={`pin-dot-${index}`}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-patient-accent border-patient-accent scale-110'
                    : 'bg-patient-canvas border-gray-300'
                }`}
              />
            );
          })}
        </div>

        {/* Gentle Feedback Message / Lockout Alert */}
        <div className="min-h-[28px] mb-3">
          {lockoutRemaining > 0 ? (
            <p className="text-sm font-semibold text-patient-terracotta bg-orange-50 py-1.5 px-3 rounded-lg border border-orange-200">
              ⏳ Locked for {lockoutRemaining}s. Take a breath and wait.
            </p>
          ) : errorMsg ? (
            <p className="text-sm font-medium text-patient-hint bg-gray-50 py-1 px-3 rounded-lg border border-gray-200">
              ℹ {errorMsg}
            </p>
          ) : (
            <p className="text-xs text-patient-secondary">
              Touch the numbers below or speak your PIN.
            </p>
          )}
        </div>

        {/* 3x4 Accessible Keypad */}
        <div className="grid grid-cols-3 gap-3 my-2" role="group" aria-label="Numeric Keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={lockoutRemaining > 0 || isSubmitting}
              onClick={() => handleDigitPress(digit)}
              className="min-h-touch min-w-touch py-3.5 bg-patient-canvas hover:bg-gray-100 active:bg-teal-50 border border-gray-300 rounded-2xl text-2xl font-bold text-patient-primary shadow-sm active:scale-95 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
            onClick={handleClear}
            className="min-h-touch py-3.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-2xl text-sm font-bold text-patient-secondary shadow-sm active:scale-95 transition flex items-center justify-center disabled:opacity-40"
          >
            Clear
          </button>

          {/* 0 Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting}
            onClick={() => handleDigitPress('0')}
            className="min-h-touch py-3.5 bg-patient-canvas hover:bg-gray-100 active:bg-teal-50 border border-gray-300 rounded-2xl text-2xl font-bold text-patient-primary shadow-sm active:scale-95 transition flex items-center justify-center disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || isSubmitting || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Delete last digit"
            className="min-h-touch py-3.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-2xl text-lg font-bold text-patient-secondary shadow-sm active:scale-95 transition flex items-center justify-center disabled:opacity-40"
          >
            ⌫
          </button>
        </div>

        {/* Optional Cancel/Close Button if provided */}
        {onClose && (
          <div className="mt-4 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-patient-hint hover:text-patient-primary py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
