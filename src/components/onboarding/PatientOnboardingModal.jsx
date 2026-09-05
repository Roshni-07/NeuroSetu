import React, { useState } from 'react';
import { NER_STATES } from '../../data/reminiscenceContent.js';
import { SUPPORTED_LANGUAGES } from '../../data/multilingualAudioHelp.js';
import { saveProfile } from '../../db/indexedDb.js';
import { setProfilePin, validatePinFormat, createSession } from '../../services/authService.js';

export default function PatientOnboardingModal({
  isOpen = false,
  isInitialSignup = false,
  onClose = null,
  onSave = null,
  initialProfile = null
}) {
  const [step, setStep] = useState(1);
  const maxSteps = isInitialSignup ? 5 : 4;

  const [formData, setFormData] = useState({
    id: initialProfile?.id || `patient_${Date.now()}`,
    name: initialProfile?.name || '',
    homeState: initialProfile?.homeState || NER_STATES.ASSAM,
    villageTown: initialProfile?.villageTown || '',
    language: initialProfile?.language || 'en',
    age: initialProfile?.age || '',
    familyMemberName: initialProfile?.familyMembers?.[0]?.name || '',
    familyMemberRel: initialProfile?.familyMembers?.[0]?.relationship || 'daughter',
    formerOccupation: initialProfile?.formerOccupation || 'farmer',
    favoriteFestival: initialProfile?.favoriteFestival || '',
    favoriteFood: initialProfile?.favoriteFood || '',
    pin: '',
    confirmPin: ''
  });

  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    setValidationError('');
    if (step === 1) {
      if (!formData.name.trim()) {
        setValidationError('অনুগ্ৰহ কৰি ৰোগীৰ নামটো দিয়ক (Please enter patient name)');
        return;
      }
      if (!formData.villageTown.trim()) {
        setValidationError('অনুগ্ৰহ কৰি গৃহগাঁও বা চহৰৰ নাম দিয়ক (Please enter village/town)');
        return;
      }
    } else if (step === 2) {
      if (!formData.familyMemberName.trim()) {
        setValidationError('অনুগ্ৰহ কৰি এজন পৰিয়ালৰ সদস্যৰ নাম দিয়ক (Please enter family member name)');
        return;
      }
    }
    setStep(prev => Math.min(maxSteps, prev + 1));
  };

  const handleBack = () => {
    setValidationError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSaveProfile = async () => {
    setValidationError('');

    // If initial signup, validate PIN setup in Step 5
    if (isInitialSignup) {
      if (!validatePinFormat(formData.pin)) {
        setValidationError('পিনটো ঠিক ৪টা সংখ্যা হ’ব লাগিব (PIN must be exactly 4 numeric digits)');
        return;
      }
      if (formData.pin !== formData.confirmPin) {
        setValidationError('দুয়োটা পিন মিল খোৱা নাই (PINs do not match)');
        return;
      }
    }

    const profileToSave = {
      id: formData.id,
      name: formData.name.trim(),
      homeState: formData.homeState,
      villageTown: formData.villageTown.trim(),
      language: formData.language,
      age: Number(formData.age) || null,
      familyMembers: [
        {
          name: formData.familyMemberName.trim(),
          relationship: formData.familyMemberRel
        }
      ],
      formerOccupation: formData.formerOccupation,
      favoriteFestival: formData.favoriteFestival.trim() || 'Traditional Festival',
      favoriteFood: formData.favoriteFood.trim() || 'Regional Food'
    };

    await saveProfile(profileToSave);

    if (isInitialSignup && formData.pin) {
      await setProfilePin(formData.pin);
      createSession(profileToSave.name);
    }

    if (onSave) onSave(profileToSave);
    if (onClose) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-xl space-y-6 animate-slide-up">
        {/* Header & Step Indicator */}
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50/70 border border-teal-100/70 px-2 py-0.5 rounded-full inline-block">
              ব্যক্তিগত পৰিচয় আৰু সংস্কৃতি (Patient Localization)
            </span>
            <h2 id="onboarding-title" className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
              {step === 1 && '১. আঞ্চলিক পৰিচয় (Regional Origin)'}
              {step === 2 && '২. পৰিয়ালৰ সদস্য (Family Ties)'}
              {step === 3 && '৩. পূৰ্বৰ জীৱিকা (Life Background)'}
              {step === 4 && '৪. প্ৰিয় উৎসৱ আৰু খাদ্য (Cultural Anchors)'}
              {step === 5 && '৫. ৪-সংখ্যাৰ পিন নিৰ্ধাৰণ (Set 4-Digit Security PIN)'}
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-700 rounded-xl border border-teal-200/70 shrink-0">
            খোজ {step} / {maxSteps}
          </span>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Step 1: Regional Origin & Language */}
        {step === 1 && (
          <div className="space-y-4 text-left">
            <div>
              <label htmlFor="patient-name" className="text-xs font-bold text-slate-800 block mb-1.5">
                ৰোগীৰ সম্পূৰ্ণ নাম (Patient Name) *
              </label>
              <input
                id="patient-name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bhaben Kalita"
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            <div>
              <label htmlFor="patient-state" className="text-xs font-bold text-slate-800 block mb-1.5">
                উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্য (NER State) *
              </label>
              <select
                id="patient-state"
                value={formData.homeState}
                onChange={e => setFormData({ ...formData, homeState: e.target.value })}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition cursor-pointer"
              >
                {Object.values(NER_STATES).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="patient-village" className="text-xs font-bold text-slate-800 block mb-1.5">
                গৃহগাঁও বা চহৰ (Hometown / Village) *
              </label>
              <input
                id="patient-village"
                type="text"
                value={formData.villageTown}
                onChange={e => setFormData({ ...formData, villageTown: e.target.value })}
                placeholder="e.g. Sualkuchi / Hajo / Reiek"
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            <div>
              <label htmlFor="patient-language" className="text-xs font-bold text-slate-800 block mb-1.5">
                পছন্দৰ ভাষা / भाषा चुनें (Preferred Language) *
              </label>
              <select
                id="patient-language"
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((langItem) => (
                  <option key={langItem.code} value={langItem.code}>
                    {langItem.icon} {langItem.nativeName} ({langItem.label}) — {langItem.region}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 font-normal">
                All game prompts, voice audio help, and daily reminders will speak in your chosen language.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Close Family Ties */}
        {step === 2 && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-xs text-teal-900 leading-relaxed">
              🔒 <strong>গোপনীয়তা সংৰক্ষণ (Privacy Notice):</strong> পৰিয়ালৰ সদস্যৰ নামসমূহ কেৱল স্মৃতি উদ্দীপনাৰ বাবে স্থানীয় ডিভাইচত ব্যৱহাৰ কৰা হ’ব। (Names are stored locally for autobiographical recall prompts only.)
            </div>

            <div>
              <label htmlFor="family-name" className="text-xs font-bold text-slate-800 block mb-1.5">
                নিকট আত্মীয়ৰ নাম (Close Family Member Name) *
              </label>
              <input
                id="family-name"
                type="text"
                value={formData.familyMemberName}
                onChange={e => setFormData({ ...formData, familyMemberName: e.target.value })}
                placeholder="e.g. Rumi / Dipak"
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            <div>
              <label htmlFor="family-rel" className="text-xs font-bold text-slate-800 block mb-1.5">
                সম্পৰ্ক (Relationship) *
              </label>
              <select
                id="family-rel"
                value={formData.familyMemberRel}
                onChange={e => setFormData({ ...formData, familyMemberRel: e.target.value })}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition cursor-pointer"
              >
                <option value="daughter">জীয়েক (Daughter)</option>
                <option value="son">পুতেক (Son)</option>
                <option value="spouse">স্বামী/পত্নী (Spouse)</option>
                <option value="grandchild">নাতি/নাতিনী (Grandchild)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Life Journey & Background */}
        {step === 3 && (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 font-normal">
              ৰোগীৰ পূৰ্বৰ কৰ্মৰ লগত মিলাই দৈনন্দিন ক্ৰম সজোৱা খেলসমূহ নিৰ্বাচন কৰা হ’ব (Daily sequencing games will match former work habits):
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { id: 'farmer', title: 'চাহ বাগিচাৰ কৰ্মী / কৃষক', subtitle: 'Tea Worker / Farmer (Leaf plucking & sorting)' },
                { id: 'weaver', title: 'তাঁতশিল্পী / শাল বোৱা', subtitle: 'Handloom Weaver (Loom & bobbin threading)' },
                { id: 'teacher_clerk', title: 'শিক্ষক / কাৰ্যালয় কৰ্মী', subtitle: 'Teacher / Clerk (Lesson & register prep)' },
                { id: 'homemaker', title: 'গৃহিণী / পৰিয়াল যতন', subtitle: 'Homemaker (Tea & traditional cooking)' }
              ].map(occ => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, formerOccupation: occ.id })}
                  className={`min-h-[50px] p-3.5 rounded-2xl border text-left transition-all ${
                    formData.formerOccupation === occ.id
                      ? 'border-teal-600 bg-teal-50/50 shadow-soft'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-bold text-slate-900 text-sm block">{occ.title}</span>
                  <span className="text-xs text-slate-500 font-normal">{occ.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Cultural Anchors & Favorites */}
        {step === 4 && (
          <div className="space-y-4 text-left">
            <div>
              <label htmlFor="fav-festival" className="text-xs font-bold text-slate-800 block mb-1.5">
                প্ৰিয় উৎসৱ (Favorite Cultural Festival)
              </label>
              <input
                id="fav-festival"
                type="text"
                value={formData.favoriteFestival}
                onChange={e => setFormData({ ...formData, favoriteFestival: e.target.value })}
                placeholder="e.g. Rongali Bihu / Chapchar Kut / Yaoshang"
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            <div>
              <label htmlFor="fav-food" className="text-xs font-bold text-slate-800 block mb-1.5">
                প্ৰিয় খাদ্য বা সোৱাদ (Favorite Traditional Dish)
              </label>
              <input
                id="fav-food"
                type="text"
                value={formData.favoriteFood}
                onChange={e => setFormData({ ...formData, favoriteFood: e.target.value })}
                placeholder="e.g. Masor Tenga / Bai / Kangshoi"
                className="w-full min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            {/* Deferral note for photo uploads */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500">
              📸 <strong>Phase 2 Feature Notice:</strong> পাৰিবাৰিক ফটো আপলোডৰ সুবিধা পৰৱৰ্তী সংস্কৰণত সংযোজন কৰা হ’ব। (Personal family photo uploads are designated for Phase 2.)
            </div>
          </div>
        )}

        {/* Step 5 (Only during initial signup): Set 4-Digit Security PIN */}
        {step === 5 && isInitialSignup && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-xs text-teal-900">
              🔑 <strong>সুৰক্ষা পিন নিৰ্ধাৰণ (Create Security PIN):</strong> ৰোগীৰ পৰিচয় আৰু তথ্যৰ সুৰক্ষাৰ বাবে এটা সহজ ৪-সংখ্যাৰ পিন নিৰ্বাচন কৰক। (Set a simple 4-digit PIN to lock and protect this profile.)
            </div>

            <div>
              <label htmlFor="signup-pin" className="text-xs font-bold text-slate-800 block mb-1.5">
                ৪-সংখ্যাৰ নতুন পিন (New 4-Digit PIN) *
              </label>
              <input
                id="signup-pin"
                type="password"
                maxLength={4}
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                placeholder="••••"
                className="w-full min-h-[48px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-center text-2xl tracking-widest font-mono font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>

            <div>
              <label htmlFor="confirm-pin" className="text-xs font-bold text-slate-800 block mb-1.5">
                পিন পুনৰ দিয়ক (Confirm 4-Digit PIN) *
              </label>
              <input
                id="confirm-pin"
                type="password"
                maxLength={4}
                value={formData.confirmPin}
                onChange={e => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                placeholder="••••"
                className="w-full min-h-[48px] px-4 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-xl text-center text-2xl tracking-widest font-mono font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/20 transition"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                ← পিছলৈ (Back)
              </button>
            ) : (
              onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-slate-400 hover:text-slate-700 font-semibold text-xs transition"
                >
                  বাতিল (Cancel)
                </button>
              )
            )}
          </div>

          <div>
            {step < maxSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-soft hover:shadow-soft-md transition-all active:scale-95"
              >
                পৰৱৰ্তী (Next) →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveProfile}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-soft hover:shadow-soft-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isInitialSignup ? '✓ সংৰক্ষণ আৰু প্ৰৱেশ (Save & Launch)' : '✓ সংৰক্ষণ কৰক (Save Profile)'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
