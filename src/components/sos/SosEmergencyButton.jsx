import React, { useState, useEffect, useRef } from 'react';
import { Phone, X, AlertTriangle, PhoneCall } from 'lucide-react';
import { synthesizeSpeech } from '../../services/bhashiniService.js';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function SosEmergencyButton({
  isOpen = false,
  onClose = null,
  profileId = 'default_patient',
  caregiverPhone = '+91 98640 12345',
  countdownSeconds = 5
}) {
  const { language } = useI18n();
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isExpired, setIsExpired] = useState(countdownSeconds <= 0);
  const loggedRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      const expiredNow = countdownSeconds <= 0;
      setIsExpired(expiredNow);
      loggedRef.current = false;

      if (!expiredNow) {
        const text = 'সহায় বিচৰা হৈছে... অনুগ্ৰহ কৰি অপেক্ষা কৰক।';
        synthesizeSpeech(text, language);
      } else {
        loggedRef.current = true;
        recordBiomarkerEvent({
          profileId,
          taskType: 'sos_emergency',
          alertFlag: true,
          latencyMs: 0,
          errorCount: 0,
          ddaAdjustment: 'none'
        });
      }
    }
  }, [isOpen, countdownSeconds, language, profileId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isExpired) return;

    if (countdown <= 0) {
      setIsExpired(true);
      if (!loggedRef.current) {
        loggedRef.current = true;
        recordBiomarkerEvent({
          profileId,
          taskType: 'sos_emergency',
          alertFlag: true,
          latencyMs: 0,
          errorCount: 0,
          ddaAdjustment: 'none'
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown, isExpired, profileId]);

  const handleCancel = () => {
    setIsExpired(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}
    >
      <div
        className="w-full max-w-lg rounded-card p-8 space-y-6 text-center"
        style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-flat)' }}
      >
        {!isExpired ? (
          /* Grace Period Countdown View */
          <>
            <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full" style={{ backgroundColor: 'var(--color-gamosa-red)', color: 'white' }}>
              <AlertTriangle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                সহায় বিচৰা হৈছে...
              </h2>
              <p className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
                Connecting to Emergency Assistance & Caregiver in:
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center justify-center py-4">
              <div
                data-testid="sos-countdown"
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-soft"
                style={{ backgroundColor: 'var(--color-gamosa-red)' }}
              >
                {countdown}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-normal">
              Tap cancel below if pressed by mistake.
            </p>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-4 rounded-btn text-lg font-bold flex items-center justify-center gap-2 border shadow-flat active:scale-95 transition-transform cursor-pointer"
              style={{
                borderColor: 'var(--border-hairline)',
                backgroundColor: 'var(--surface-sunken)',
                minHeight: '60px',
                color: 'var(--ink-primary)'
              }}
            >
              <X size={24} />
              <span>বাতিল কৰক (Cancel Alert)</span>
            </button>
          </>
        ) : (
          /* Active Emergency Call View after expiration */
          <>
            <div className="flex items-center justify-center mx-auto w-16 h-16 rounded-full" style={{ backgroundColor: 'var(--color-gamosa-red)', color: 'white' }}>
              <PhoneCall size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Elderline (এল্ডাৰলাইন)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                National Senior Citizen Helpline • Active Emergency Intent
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Elderline Anchor 1: Name contains "কল কৰক" */}
              <a
                href="tel:14567"
                className="w-full py-4 px-6 rounded-btn text-lg font-bold flex items-center justify-center gap-3 text-white shadow-flat active:scale-95 transition-transform cursor-pointer"
                style={{ backgroundColor: 'var(--color-gamosa-red)', minHeight: '60px' }}
              >
                <Phone size={24} />
                <span>কল কৰক</span>
              </a>

              {/* Elderline Anchor 2: Name contains "14567" */}
              <div className="text-center">
                <a
                  href="tel:14567"
                  className="text-lg font-mono font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                >
                  14567
                </a>
              </div>

              {/* Caregiver Anchor 1: Name contains "ফোন কৰক" */}
              <a
                href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                className="w-full py-4 px-6 rounded-btn text-base font-bold flex items-center justify-center gap-3 border shadow-flat active:scale-95 transition-transform cursor-pointer"
                style={{ borderColor: 'var(--color-bamboo)', backgroundColor: 'var(--surface-card)', minHeight: '60px', color: 'var(--color-bamboo)' }}
              >
                <Phone size={24} />
                <span>ফোন কৰক</span>
              </a>

              {/* Caregiver Anchor 2: Name contains caregiverPhone */}
              <div className="text-center">
                <a
                  href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                  className="text-sm font-mono font-bold underline cursor-pointer"
                  style={{ color: 'var(--color-bamboo)' }}
                >
                  {caregiverPhone}
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3 rounded-btn text-sm font-semibold border shadow-flat transition cursor-pointer"
                  style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--surface-sunken)', minHeight: '48px', color: 'var(--ink-secondary)' }}
                >
                  Close & Return
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
