import React, { useState, useEffect, useCallback } from 'react';
import { authenticatePin, ROLES } from '../../services/authService.js';

export default function PatientIdleLockModal({
  isOpen = false,
  profileName = 'Primary Patient',
  patientId = null,
  onUnlock,
  onExitToHome,
  language = 'en'
}) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEn = language === 'en';

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleDigitPress = useCallback((digit) => {
    if (isSubmitting) return;
    setErrorMsg('');
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + digit;
    });
  }, [isSubmitting]);

  const handleBackspace = useCallback(() => {
    if (isSubmitting) return;
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  }, [isSubmitting]);

  const handleClear = useCallback(() => {
    if (isSubmitting) return;
    setErrorMsg('');
    setPin('');
  }, [isSubmitting]);

  const handleSubmit = useCallback(async (currentPin) => {
    if (isSubmitting) return;
    const pinToVerify = currentPin || pin;
    if (pinToVerify.length !== 6) {
      setErrorMsg(isEn ? 'Please enter 6 digits.' : 'অনুগ্ৰহ কৰি ৬টা সংখ্যা দিয়ক।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authenticatePin(pinToVerify, profileName, ROLES.PATIENT);
      if (res && res.success) {
        setPin('');
        setErrorMsg('');
        if (onUnlock) onUnlock();
      } else {
        setErrorMsg(res?.error || (isEn ? "Let's try that again. Take all the time you need." : 'পিন অশুদ্ধ। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।'));
        setPin('');
      }
    } catch (err) {
      setErrorMsg(isEn ? 'Verification error. Please try again.' : 'প্ৰমাণীকৰণত সমস্যা হৈছে।');
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, pin, profileName, onUnlock, isEn]);

  // Auto-submit when 6th digit is entered
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit(pin);
    }
  }, [pin, handleSubmit]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-lock-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white rounded-3xl border-2 border-teal-200/80 shadow-2xl max-w-sm w-full p-6 text-center space-y-5 animate-scale-up">
        {/* Soothing Avatar & Header */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-3xl mx-auto shadow-xs">
            🌿
          </div>
          <h2 id="idle-lock-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isEn ? `Resting, ${profileName}?` : `অলপ জিৰণি লৈছে নেকি, ${profileName}?`}
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
            {isEn
              ? 'Take your time. When you are ready, enter your 6-digit PIN to continue.'
              : 'যেতিয়া সাজু হ’ব, আপোনাৰ খেললৈ উভতি যাবলৈ ৬-সংখ্যাৰ পিন দিয়ক।'}
          </p>
        </div>

        {/* 6 PIN Dot Indicators */}
        <div className="flex justify-center items-center gap-3 py-1" aria-label={`PIN entered: ${pin.length} of 6 digits`}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                index < pin.length
                  ? 'bg-teal-600 border-teal-600 scale-110 shadow-xs'
                  : 'border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 animate-shake">
            {errorMsg}
          </div>
        )}

        {/* 3x4 Accessible Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(String(digit))}
              className="min-h-[52px] rounded-2xl bg-slate-50 hover:bg-teal-50 active:bg-teal-100 text-slate-800 text-xl font-bold border border-slate-200 hover:border-teal-300 shadow-xs transition active:scale-95 cursor-pointer"
              aria-label={`Digit ${digit}`}
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[52px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-xs font-bold border border-slate-200 transition active:scale-95 cursor-pointer"
            aria-label="Clear PIN"
          >
            {isEn ? 'Clear' : 'মচি পেলাওক'}
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="min-h-[52px] rounded-2xl bg-slate-50 hover:bg-teal-50 active:bg-teal-100 text-slate-800 text-xl font-bold border border-slate-200 hover:border-teal-300 shadow-xs transition active:scale-95 cursor-pointer"
            aria-label="Digit 0"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="min-h-[52px] rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 text-lg font-bold border border-slate-200 transition active:scale-95 cursor-pointer"
            aria-label="Delete last digit"
          >
            ⌫
          </button>
        </div>

        {/* Graceful Exit to Home Option */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onExitToHome}
            className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
          >
            ← {isEn ? 'Return to Home' : 'মুখ্য পৃষ্ঠালৈ উভতি যাওক'}
          </button>
        </div>
      </div>
    </div>
  );
}
