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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-xl text-center space-y-6">
        {/* Top Emergency Badge */}
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-rose-200 shadow-soft">
          🆘
        </div>

        <div>
          <h2 id="sos-title" className="text-xl font-bold text-slate-900">
            {isTriggered ? 'জৰুৰীকালীন সাহায্য (Emergency Help)' : 'সহায় বিচৰা হৈছে... (SOS Alert)'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isTriggered
              ? 'তলৰ নম্বৰত তাৎক্ষণিকভাৱে যোগাযোগ কৰক (Immediate Helpline)'
              : 'ভুলবশতঃ স্পৰ্শ কৰিলে তলৰ বাতিল বুটাম টিপক (Grace Countdown Active)'}
          </p>
        </div>

        {/* Grace Period Countdown or Connecting State */}
        {!isTriggered ? (
          <div className="p-5 bg-rose-50/40 border border-rose-200/80 rounded-2xl space-y-3">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              স্বয়ংক্ৰিয় সংযোগ হ’বলৈ বাকী (Connecting in)
            </span>
            <div
              data-testid="sos-countdown"
              className="text-5xl font-extrabold text-rose-700 tracking-tight"
            >
              {remainingTime}
            </div>
            <p className="text-xs text-slate-500">
              ছেকেণ্ড (Seconds remaining to cancel)
            </p>

            <button
              type="button"
              onClick={handleCancel}
              className="min-h-touch w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition shadow-soft active:scale-95"
            >
              ❌ বাতিল কৰক (Cancel Alert)
            </button>
          </div>
        ) : (
          <div className="space-y-3.5 text-left">
            {/* National Elderline Card (14567) */}
            <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl flex items-center justify-between shadow-soft">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">ৰাষ্ট্ৰীয় বৃদ্ধ কল্যাণ হেল্পলাইন</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">Elderline (এল্ডাৰলাইন)</p>
                <span className="text-xs font-semibold text-teal-700">
                  টোল-ফ্ৰী নম্বৰ:{' '}
                  <a href="tel:14567" className="underline hover:text-teal-900 font-bold">
                    14567
                  </a>
                </span>
              </div>
              <a
                href="tel:14567"
                className="min-h-touch px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs shadow-soft flex items-center gap-1.5 shrink-0"
              >
                📞 কল কৰক
              </a>
            </div>

            {/* Family Caregiver Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-soft">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">পৰিয়ালৰ যোগাযোগ (Caregiver)</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">মুখ্য সেৱাকাৰী (Family)</p>
                <span className="text-xs text-slate-600 font-medium">
                  <a
                    href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                    className="underline hover:text-slate-900"
                  >
                    {caregiverPhone}
                  </a>
                </span>
              </div>
              <a
                href={`tel:${caregiverPhone.replace(/\s+/g, '')}`}
                className="min-h-touch px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs shadow-soft flex items-center gap-1.5 shrink-0"
              >
                📞 ফোন কৰক
              </a>
            </div>

            {/* Close / Dismiss */}
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-touch w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              স্ক্রীন বন্ধ কৰক (Close Screen)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
