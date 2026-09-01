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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-2xl space-y-6 text-center">
        {/* Visual Icon */}
        <div className="w-16 h-16 mx-auto bg-teal-50 border-2 border-teal-200 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
          <span role="img" aria-label="Device Profile Check">🔍</span>
        </div>

        {/* Heading */}
        <div>
          <span className="text-xs font-bold text-patient-accent uppercase tracking-wider">
            ডিভাইচ পৰীক্ষা (Device Profile Check)
          </span>
          <h2 id="check-profile-heading" className="text-xl font-extrabold text-patient-primary mt-1">
            ৰোগীৰ পৰিচয় পৰীক্ষা (Patient Status)
          </h2>
        </div>

        {/* Dynamic Checking State */}
        {isChecking ? (
          <div className="p-6 bg-patient-canvas rounded-2xl text-patient-hint text-sm font-semibold animate-pulse">
            ডিভাইচত পূৰ্বৰ পৰিচয় বিচৰা হৈছে... (Checking local IndexedDB storage...)
          </div>
        ) : existingProfile ? (
          /* Profile Found on Device */
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-2xl text-left space-y-1">
              <span className="text-xs font-bold text-teal-800 uppercase block">
                ✓ সংৰক্ষিত পৰিচয় পোৱা গৈছে (Profile Found)
              </span>
              <p className="text-base font-extrabold text-patient-primary">
                👤 {existingProfile.name}
              </p>
              {existingProfile.homeState && (
                <p className="text-xs text-patient-secondary">
                  {existingProfile.villageTown ? `${existingProfile.villageTown}, ` : ''}{existingProfile.homeState}
                </p>
              )}
            </div>

            <p className="text-xs text-patient-hint">
              এই ডিভাইচত ৰোগীৰ পৰিচয় ইতিমধ্যে আছে। খেল আৰম্ভ কৰিবলৈ পিন দিয়ক।
              (An existing profile is registered on this device. Enter PIN to unlock.)
            </p>

            <button
              type="button"
              onClick={onRouteToPin}
              className="w-full min-h-touch py-3 bg-patient-accent hover:bg-patient-accent-hover text-white font-extrabold rounded-2xl text-base shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔑 পিন প্ৰৱেশ কৰি খুলক (Enter PIN)</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={onRouteToSignup}
              className="text-xs font-bold text-patient-secondary hover:text-patient-primary underline py-1"
            >
              নতুন ৰোগীৰ পঞ্জীয়ন কৰক (Register New Patient Instead)
            </button>
          </div>
        ) : (
          /* No Profile Found on Device */
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-left space-y-1">
              <span className="text-xs font-bold text-patient-hint uppercase block">
                নতুন ৰোগী (No Profile Found)
              </span>
              <p className="text-sm font-bold text-patient-primary">
                এই ডিভাইচত এতিয়াও কোনো ৰোগীৰ পৰিচয় সংৰক্ষণ হোৱা নাই।
              </p>
              <p className="text-xs text-patient-secondary">
                No patient profile is registered on this device yet.
              </p>
            </div>

            <button
              type="button"
              onClick={onRouteToSignup}
              className="w-full min-h-touch py-3 bg-patient-accent hover:bg-patient-accent-hover text-white font-extrabold rounded-2xl text-base shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>নতুন ৰোগীৰ পঞ্জীয়ন আৰম্ভ কৰক (Start Registration)</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={onRouteToPin}
              className="text-xs font-bold text-patient-secondary hover:text-patient-primary underline py-1"
            >
              মোৰ ইতিমধ্যে পিন আছে (I already have a PIN)
            </button>
          </div>
        )}

        {/* Dismiss Button */}
        {onClose && (
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-patient-hint hover:text-patient-primary font-semibold py-1"
            >
              বন্ধ কৰক (Close)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
