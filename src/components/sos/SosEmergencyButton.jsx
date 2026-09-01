import React, { useState, useEffect, useRef } from 'react';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function SosEmergencyButton({
  isOpen = false,
  onClose = null,
  profileId = 'default_patient',
  caregiverPhone = '+91 98640 12345',
  countdownSeconds = 5
}) {
  const [remainingTime, setRemainingTime] = useState(countdownSeconds);
  const [isTriggered, setIsTriggered] = useState(false);
  const [telemetrySaved, setTelemetrySaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setRemainingTime(countdownSeconds);
      setIsTriggered(false);
      setTelemetrySaved(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Voice announcement of emergency state
    synthesizeSpeech('জৰুৰীকালীন সহায়। ৫ ছেকেণ্ডৰ ভিতৰত সংযোগ কৰা হ’ব।', 'as');

    // Start 5-second grace countdown
    setRemainingTime(countdownSeconds);
    setIsTriggered(false);

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleEmergencyTrigger();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleEmergencyTrigger = async () => {
    setIsTriggered(true);
    if (!telemetrySaved) {
      setTelemetrySaved(true);
      // Record critical priority alert in local IndexedDB & sync queue
      await recordBiomarkerEvent({
        profileId,
        taskType: 'sos_emergency',
        latencyMs: 0,
        errorCount: 0,
        ddaAdjustment: 'none'
      });
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    synthesizeSpeech('সহায় বাতিল কৰা হ’ল।', 'as');
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-4 border-patient-terracotta shadow-2xl text-center space-y-5">
        {/* Top Emergency Badge */}
        <div className="w-20 h-20 bg-red-100 text-patient-terracotta rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-red-300 animate-bounce">
          🆘
        </div>

        <div>
          <h2 id="sos-title" className="text-2xl font-black text-patient-primary">
            {isTriggered ? 'জৰুৰীকালীন সাহায্য (Emergency Help)' : 'সহায় বিচৰা হৈছে... (SOS Alert)'}
          </h2>
          <p className="text-sm text-patient-secondary mt-1">
            {isTriggered
              ? 'তলৰ নম্বৰত তাৎক্ষণিকভাৱে যোগাযোগ কৰক (Immediate Helpline)'
              : 'ভুলবশতঃ স্পৰ্শ কৰিলে তলৰ বাতিল বুটাম টিপক (Grace Countdown Active)'}
          </p>
        </div>

        {/* Grace Period Countdown or Connecting State */}
        {!isTriggered ? (
          <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-patient-terracotta uppercase tracking-wider block">
              স্বয়ংক্ৰিয় সংযোগ হ’বলৈ বাকী (Connecting in)
            </span>
            <div
              data-testid="sos-countdown"
              className="text-5xl font-black text-patient-terracotta"
            >
              {remainingTime}
            </div>
            <p className="text-xs text-patient-secondary">
              ছেকেণ্ড (Seconds remaining to cancel)
            </p>

            <button
              type="button"
              onClick={handleCancel}
              className="min-h-touch w-full py-3.5 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 text-patient-primary font-bold rounded-xl text-base transition shadow-sm active:scale-95"
            >
              ❌ বাতিল কৰক (Cancel Alert)
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {/* National Elderline Card (14567) */}
            <div className="p-4 bg-teal-50 border-2 border-teal-400 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase">ৰাষ্ট্ৰীয় বৃদ্ধ কল্যাণ হেল্পলাইন</span>
                <p className="text-xl font-extrabold text-patient-primary">Elderline (এল্ডাৰলাইন)</p>
                <span className="text-sm font-bold text-teal-700">টোল-ফ্ৰী নম্বৰ: 14567</span>
              </div>
              <a
                href="tel:14567"
                className="min-h-touch px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-1 shrink-0"
              >
                📞 কল কৰক
              </a>
            </div>

            {/* Family Caregiver Card */}
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-patient-hint uppercase">পৰিয়ালৰ যোগাযোগ (Caregiver)</span>
                <p className="text-base font-bold text-patient-primary">মুখ্য সেৱাকাৰী (Family)</p>
                <span className="text-xs text-patient-secondary">{caregiverPhone}</span>
              </div>
              <a
                href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                className="min-h-touch px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-1 shrink-0"
              >
                📞 ফোন কৰক
              </a>
            </div>

            {/* Close / Dismiss */}
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-touch w-full py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-patient-primary font-bold rounded-xl text-sm transition"
            >
              স্ক্রীন বন্ধ কৰক (Close Screen)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
