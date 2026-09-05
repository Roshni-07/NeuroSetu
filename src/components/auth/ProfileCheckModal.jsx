import React, { useState, useEffect } from 'react';
import { hasExistingProfile, getFirstProfile } from '../../db/indexedDb.js';
import { hasConfiguredPin } from '../../services/authService.js';

export default function ProfileCheckModal({
  isOpen = false,
  onClose = null,
  onRouteToPin = null,
  onRouteToSignup = null
}) {
  const [isChecking, setIsChecking] = useState(true);
  const [existingProfile, setExistingProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkDevice() {
      if (!isOpen) return;
      setIsChecking(true);
      try {
        const hasProf = await hasExistingProfile();
        const hasPin = hasConfiguredPin();
        if (hasProf || hasPin) {
          const prof = await getFirstProfile();
          if (isMounted) setExistingProfile(prof || { name: 'Existing Patient' });
        } else {
          if (isMounted) setExistingProfile(null);
        }
      } catch (e) {
        if (isMounted) setExistingProfile(null);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    checkDevice();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="check-profile-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-xl space-y-6 text-center animate-slide-up">
        {/* Visual Icon */}
        <div className="w-14 h-14 mx-auto bg-teal-50 border border-teal-100/80 rounded-2xl flex items-center justify-center text-2xl shadow-xs text-teal-700">
          <span role="img" aria-label="Device Profile Check">🔍</span>
        </div>

        {/* Heading */}
        <div>
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50/70 border border-teal-100/70 px-2.5 py-0.5 rounded-full inline-block">
            ডিভাইচ পৰীক্ষা (Device Profile Check)
          </span>
          <h2 id="check-profile-heading" className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            ৰোগীৰ পৰিচয় পৰীক্ষা (Patient Status)
          </h2>
        </div>

        {/* Dynamic Checking State */}
        {isChecking ? (
          <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-500 text-xs font-medium animate-pulse">
            ডিভাইচত পূৰ্বৰ পৰিচয় বিচৰা হৈছে... (Checking local IndexedDB storage...)
          </div>
        ) : existingProfile ? (
          /* Profile Found on Device */
          <div className="space-y-4">
            <div className="p-4 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-left space-y-1">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide block">
                ✓ সংৰক্ষিত পৰিচয় পোৱা গৈছে (Profile Found)
              </span>
              <p className="text-base font-bold text-slate-900">
                👤 {existingProfile.name}
              </p>
              {existingProfile.homeState && (
                <p className="text-xs text-slate-600">
                  {existingProfile.villageTown ? `${existingProfile.villageTown}, ` : ''}{existingProfile.homeState}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              এই ডিভাইচত ৰোগীৰ পৰিচয় ইতিমধ্যে আছে। খেল আৰম্ভ কৰিবলৈ পিন দিয়ক।
              (An existing profile is registered on this device. Enter PIN to unlock.)
            </p>

            <button
              type="button"
              onClick={onRouteToPin}
              className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm shadow-soft hover:shadow-soft-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔑 পিন প্ৰৱেশ কৰি খুলক (Enter PIN)</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={onRouteToSignup}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline py-1 transition"
            >
              নতুন ৰোগীৰ পঞ্জীয়ন কৰক (Register New Patient Instead)
            </button>
          </div>
        ) : (
          /* No Profile Found on Device */
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                নতুন ৰোগী (No Profile Found)
              </span>
              <p className="text-sm font-semibold text-slate-800">
                এই ডিভাইচত এতিয়াও কোনো ৰোগীৰ পৰিচয় সংৰক্ষণ হোৱা নাই।
              </p>
              <p className="text-xs text-slate-500 font-normal">
                No patient profile is registered on this device yet.
              </p>
            </div>

            <button
              type="button"
              onClick={onRouteToSignup}
              className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm shadow-soft hover:shadow-soft-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>নতুন ৰোগীৰ পঞ্জীয়ন আৰম্ভ কৰক (Start Registration)</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={onRouteToPin}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline py-1 transition"
            >
              মোৰ ইতিমধ্যে পিন আছে (I already have a PIN)
            </button>
          </div>
        )}

        {/* Dismiss Button */}
        {onClose && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold py-1 transition"
            >
              বন্ধ কৰক (Close)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
