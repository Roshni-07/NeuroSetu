import React, { useState } from 'react';
import { NER_STATES, NER_OCCUPATIONS } from '../../data/reminiscenceContent.js';
import { SUPPORTED_LANGUAGES } from '../../data/multilingualAudioHelp.js';
import { saveProfile } from '../../db/indexedDb.js';
import { setProfilePin, validatePinFormat, createSession } from '../../services/authService.js';

export default function PatientOnboardingModal({
  isOpen = false,
  isInitialSignup = false,
  onClose = null,
  onBack = null,
  onSave = null,
  initialProfile = null
}) {
  const [step, setStep] = useState(1);
  const maxSteps = isInitialSignup ? 6 : 5;

  const [formData, setFormData] = useState(() => {
    const occ = initialProfile?.formerOccupation || '';
    const isStandardOcc = NER_OCCUPATIONS.some(o => o.id === occ && o.id !== 'other');
    const initialFormerOcc = isStandardOcc ? occ : (occ ? 'other' : '');
    const initialOtherOcc = initialProfile?.otherOccupation || (!isStandardOcc ? occ : '');

    return {
      id: initialProfile?.id || `patient_${Date.now()}`,
      name: initialProfile?.name || '',
      homeState: initialProfile?.homeState || '',
      villageTown: initialProfile?.villageTown || '',
      language: initialProfile?.language || '',
      age: initialProfile?.age || '',
      familyMemberName: initialProfile?.familyMembers?.[0]?.name || '',
      familyMemberRel: initialProfile?.familyMembers?.[0]?.relationship || '',
      formerOccupation: initialFormerOcc,
      otherOccupation: initialOtherOcc,
      favoriteFestival: initialProfile?.favoriteFestival || '',
      favoriteFood: initialProfile?.favoriteFood || '',
      dailyRoutine: initialProfile?.dailyRoutine && initialProfile.dailyRoutine.length >= 2
        ? initialProfile.dailyRoutine
        : [
            { id: 'act_1', label: 'পুৱাৰ চাহ (Morning Chai)', time: 'Dawn (6:00 AM)', icon: '☕' },
            { id: 'act_2', label: 'বাৰীত ফুৰা (Garden Walk & Flowers)', time: 'Early Morning (7:30 AM)', icon: '🌿' },
            { id: 'act_3', label: 'দৰব গ্ৰহণ (Morning Medicine)', time: 'Forenoon (9:00 AM)', icon: '💊' },
            { id: 'act_4', label: 'দুপৰীয়াৰ আহাৰ (Midday Lunch)', time: 'Afternoon (1:00 PM)', icon: '🍲' },
            { id: 'act_5', label: 'ৰাতিৰ বিশ্ৰাম (Night Rest & Sleep)', time: 'Night (9:00 PM)', icon: '🌙' }
          ],
      starting_difficulty_tier: initialProfile?.starting_difficulty_tier || 1,
      pin: '',
      confirmPin: ''
    };
  });

  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const handleNext = () => {
    setValidationError('');
    setFieldErrors({});
    const errors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'অনুগ্ৰহ কৰি ৰোগীৰ নামটো দিয়ক (Please enter patient name)';
      }
      if (!formData.homeState) {
        errors.homeState = 'অনুগ্ৰহ কৰি ৰাজ্য বাছনি কৰক (Please select state)';
      }
      if (!formData.villageTown.trim()) {
        errors.villageTown = 'অনুগ্ৰহ কৰি গৃহগাঁও বা চহৰৰ নাম দিয়ক (Please enter village/town)';
      }
      if (!formData.language) {
        errors.language = 'অনুগ্ৰহ কৰি ভাষা বাছনি কৰক (Please select preferred language)';
      }
    } else if (step === 2) {
      if (!formData.familyMemberName.trim()) {
        errors.familyMemberName = 'অনুগ্ৰহ কৰি এজন পৰিয়ালৰ সদস্যৰ নাম দিয়ক (Please enter family member name)';
      }
      if (!formData.familyMemberRel) {
        errors.familyMemberRel = 'অনুগ্ৰহ কৰি সম্পৰ্ক বাছনি কৰক (Please select relationship)';
      }
    } else if (step === 3) {
      if (!formData.formerOccupation) {
        errors.formerOccupation = 'অনুগ্ৰহ কৰি পূৰ্বৰ কৰ্ম বা জীৱিকা বাছনি কৰক (Please select former occupation / life background)';
      } else if (formData.formerOccupation === 'other' && !formData.otherOccupation.trim()) {
        errors.otherOccupation = 'অনুগ্ৰহ কৰি আপোনাৰ জীৱিকা উল্লেখ কৰক (Please specify your occupation)';
      }
    } else if (step === 5) {
      if (!formData.dailyRoutine || formData.dailyRoutine.length < 2) {
        errors.dailyRoutine = 'অনুগ্ৰহ কৰি কমেও ২টা দৈনন্দিন কাৰ্যসূচী ৰাখক (Please maintain at least 2 daily routine activities)';
      } else if (formData.dailyRoutine.some(act => !act.label.trim())) {
        errors.dailyRoutine = 'অনুগ্ৰহ কৰি সকলো কাৰ্যৰ বিৱৰণ দিয়ক (Please provide description for each routine activity)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationError(Object.values(errors)[0]);
      return;
    }

    setStep(prev => Math.min(maxSteps, prev + 1));
  };

  const handleBack = () => {
    setValidationError('');
    setFieldErrors({});
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSaveProfile = async () => {
    setValidationError('');
    setFieldErrors({});
    const errors = {};

    // Validate daily routine
    if (!formData.dailyRoutine || formData.dailyRoutine.length < 2) {
      errors.dailyRoutine = 'অনুগ্ৰহ কৰি কমেও ২টা দৈনন্দিন কাৰ্যসূচী ৰাখক (Please maintain at least 2 daily routine activities)';
    }

    // If initial signup, validate PIN setup in Step 6
    if (isInitialSignup) {
      if (!validatePinFormat(formData.pin)) {
        errors.pin = 'পিনটো ঠিক ৬টা সংখ্যা হ’ব লাগিব (PIN must be exactly 6 numeric digits)';
      }
      if (formData.pin !== formData.confirmPin) {
        errors.confirmPin = 'দুয়োটা পিন মিল খোৱা নাই (PINs do not match)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationError(Object.values(errors)[0]);
      return;
    }

    const resolvedOccupation = formData.formerOccupation === 'other'
      ? (formData.otherOccupation.trim() || 'other')
      : formData.formerOccupation;

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
      formerOccupation: resolvedOccupation,
      otherOccupation: formData.formerOccupation === 'other' ? formData.otherOccupation.trim() : '',
      favoriteFestival: formData.favoriteFestival.trim() || 'Traditional Festival',
      favoriteFood: formData.favoriteFood.trim() || 'Regional Food',
      starting_difficulty_tier: Number(formData.starting_difficulty_tier) || 1,
      dailyRoutine: (formData.dailyRoutine || []).map((item, idx) => ({
        id: item.id || `routine_${idx + 1}`,
        label: item.label.trim(),
        time: item.time ? item.time.trim() : `Step ${idx + 1}`,
        icon: item.icon || '🗓️',
        correctSlot: `slot_${idx + 1}`
      }))
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
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-xl space-y-6 animate-slide-up">
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
              {step === 5 && '৫. দৈনন্দিন কাৰ্যসূচী (Elder\'s Daily Routine)'}
              {step === 6 && '৬. ৬-সংখ্যাৰ পিন নিৰ্ধাৰণ (Set 6-Digit Security PIN)'}
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
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Bhaben Kalita"
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition ${
                  fieldErrors.name
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              />
              {fieldErrors.name && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="patient-state" className="text-xs font-bold text-slate-800 block mb-1.5">
                উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্য (NER State) *
              </label>
              <select
                id="patient-state"
                value={formData.homeState}
                onChange={e => {
                  setFormData({ ...formData, homeState: e.target.value });
                  if (fieldErrors.homeState) setFieldErrors(prev => ({ ...prev, homeState: '' }));
                }}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition cursor-pointer ${
                  fieldErrors.homeState
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              >
                <option value="">ৰাজ্য বাছনি কৰক (Select State)...</option>
                {Object.values(NER_STATES).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {fieldErrors.homeState && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.homeState}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="patient-village" className="text-xs font-bold text-slate-800 block mb-1.5">
                গৃহগাঁও বা চহৰ (Hometown / Village) *
              </label>
              <input
                id="patient-village"
                type="text"
                value={formData.villageTown}
                onChange={e => {
                  setFormData({ ...formData, villageTown: e.target.value });
                  if (fieldErrors.villageTown) setFieldErrors(prev => ({ ...prev, villageTown: '' }));
                }}
                placeholder="e.g. Sualkuchi / Hajo / Reiek"
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition ${
                  fieldErrors.villageTown
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              />
              {fieldErrors.villageTown && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.villageTown}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="patient-language" className="text-xs font-bold text-slate-800 block mb-1.5">
                পছন্দৰ ভাষা / भाषा चुनें (Preferred Language) *
              </label>
              <select
                id="patient-language"
                value={formData.language}
                onChange={e => {
                  setFormData({ ...formData, language: e.target.value });
                  if (fieldErrors.language) setFieldErrors(prev => ({ ...prev, language: '' }));
                }}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition cursor-pointer ${
                  fieldErrors.language
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              >
                <option value="">ভাষা বাছনি কৰক (Select Language)...</option>
                {SUPPORTED_LANGUAGES.map((langItem) => (
                  <option key={langItem.code} value={langItem.code}>
                    {langItem.icon} {langItem.nativeName} ({langItem.label}) — {langItem.region}
                  </option>
                ))}
              </select>
              {fieldErrors.language && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.language}</span>
                </p>
              )}
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
                onChange={e => {
                  setFormData({ ...formData, familyMemberName: e.target.value });
                  if (fieldErrors.familyMemberName) setFieldErrors(prev => ({ ...prev, familyMemberName: '' }));
                }}
                placeholder="e.g. Rumi / Dipak"
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition ${
                  fieldErrors.familyMemberName
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              />
              {fieldErrors.familyMemberName && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.familyMemberName}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="family-rel" className="text-xs font-bold text-slate-800 block mb-1.5">
                সম্পৰ্ক (Relationship) *
              </label>
              <select
                id="family-rel"
                value={formData.familyMemberRel}
                onChange={e => {
                  setFormData({ ...formData, familyMemberRel: e.target.value });
                  if (fieldErrors.familyMemberRel) setFieldErrors(prev => ({ ...prev, familyMemberRel: '' }));
                }}
                className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition cursor-pointer ${
                  fieldErrors.familyMemberRel
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              >
                <option value="">সম্পৰ্ক বাছনি কৰক (Select Relationship)...</option>
                <option value="daughter">জীয়েক (Daughter)</option>
                <option value="son">পুতেক (Son)</option>
                <option value="spouse">স্বামী/পত্নী (Spouse)</option>
                <option value="grandchild">নাতি/নাতিনী (Grandchild)</option>
                <option value="caregiver">যত্নকৰ্তা (Caregiver)</option>
                <option value="other">অন্যান্য (Other)</option>
              </select>
              {fieldErrors.familyMemberRel && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.familyMemberRel}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Life Journey & Background */}
        {step === 3 && (
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-500 font-normal">
              ৰোগীৰ পূৰ্বৰ কৰ্মৰ লগত মিলাই দৈনন্দিন ক্ৰম সজোৱা খেলসমূহ নিৰ্বাচন কৰা হ’ব (Daily sequencing games will match former work habits) *:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {NER_OCCUPATIONS.map(occ => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, formerOccupation: occ.id });
                    if (fieldErrors.formerOccupation) setFieldErrors(prev => ({ ...prev, formerOccupation: '' }));
                  }}
                  className={`min-h-[50px] p-3.5 rounded-2xl border text-left transition-all ${
                    formData.formerOccupation === occ.id
                      ? 'border-teal-600 bg-teal-50/50 shadow-soft ring-1 ring-teal-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl" aria-hidden="true">{occ.icon}</span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{occ.labelAs}</span>
                      <span className="text-xs text-slate-500 font-normal">{occ.label}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {fieldErrors.formerOccupation && (
              <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <span>⚠️</span>
                <span>{fieldErrors.formerOccupation}</span>
              </p>
            )}

            {/* Conditionally reveal free-text input when "Other" is selected */}
            {formData.formerOccupation === 'other' && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                <label htmlFor="other-occupation" className="text-xs font-bold text-slate-800 block mb-1.5">
                  জীৱিকাৰ বিৱৰণ দিয়ক (Specify Occupation / Livelihood) *
                </label>
                {/* NOTE: Stored locally in profile (formerOccupation + otherOccupation). Will map to future other_occupation column when backend migration lands. */}
                <input
                  id="other-occupation"
                  data-testid="other-occupation-input"
                  type="text"
                  value={formData.otherOccupation}
                  onChange={e => {
                    setFormData({ ...formData, otherOccupation: e.target.value });
                    if (fieldErrors.otherOccupation) setFieldErrors(prev => ({ ...prev, otherOccupation: '' }));
                  }}
                  placeholder="e.g. Traditional herbalist, pottery artisan, bamboo craftsman, folk musician..."
                  className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 focus-visible:outline-none transition ${
                    fieldErrors.otherOccupation
                      ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                      : 'bg-white border border-slate-200 focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20'
                  }`}
                />
                {fieldErrors.otherOccupation && (
                  <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.otherOccupation}</span>
                  </p>
                )}
              </div>
            )}
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

        {/* Step 5: Elder's Daily Routine (Ordered Activities) */}
        {step === 5 && (
          <div className="space-y-4 text-left">
            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-900 leading-relaxed">
              🗓️ <strong>দৈনন্দিন ক্ৰম নিৰ্ধাৰণ (Daily Rhythm Setup):</strong> বৃদ্ধ সদস্যজনৰ প্ৰকৃত দিনটোৰ নিয়মীয়া কামসমূহ নিৰ্বাচন বা সম্পাদনা কৰক। এই ক্ৰমটো তেওঁৰ ব্যক্তিগত স্মৃতি-ক্ৰম খেলত ব্যৱহাৰ হ’ব। (Capture the elder's actual daily activities to personalize their Daily Routine Recall game. Add as many activities as needed.)
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {formData.dailyRoutine.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl"
                >
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xl shrink-0">{item.icon || '⏰'}</span>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...formData.dailyRoutine];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setFormData({ ...formData, dailyRoutine: updated });
                      }}
                      placeholder="Activity (e.g. Morning Tea)"
                      aria-label={`Routine activity ${idx + 1}`}
                      className="w-full min-h-[36px] px-3 py-1 bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-xs font-bold text-slate-900 focus-visible:outline-none"
                    />
                    <input
                      type="text"
                      value={item.time || ''}
                      onChange={(e) => {
                        const updated = [...formData.dailyRoutine];
                        updated[idx] = { ...updated[idx], time: e.target.value };
                        setFormData({ ...formData, dailyRoutine: updated });
                      }}
                      placeholder="Approximate Time (e.g. 7:00 AM)"
                      aria-label={`Routine time ${idx + 1}`}
                      className="w-full min-h-[30px] px-3 py-0.5 bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-[11px] text-slate-600 focus-visible:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...formData.dailyRoutine];
                        const temp = updated[idx - 1];
                        updated[idx - 1] = updated[idx];
                        updated[idx] = temp;
                        setFormData({ ...formData, dailyRoutine: updated });
                      }}
                      aria-label={`Move activity ${idx + 1} up`}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={idx === formData.dailyRoutine.length - 1}
                      onClick={() => {
                        const updated = [...formData.dailyRoutine];
                        const temp = updated[idx + 1];
                        updated[idx + 1] = updated[idx];
                        updated[idx] = temp;
                        setFormData({ ...formData, dailyRoutine: updated });
                      }}
                      aria-label={`Move activity ${idx + 1} down`}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={formData.dailyRoutine.length <= 2}
                    onClick={() => {
                      if (formData.dailyRoutine.length <= 2) return;
                      const updated = formData.dailyRoutine.filter((_, i) => i !== idx);
                      setFormData({ ...formData, dailyRoutine: updated });
                    }}
                    aria-label={`Remove activity ${idx + 1}`}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const newActivity = {
                  id: `act_${Date.now()}`,
                  label: '',
                  time: '',
                  icon: '⏰'
                };
                setFormData({
                  ...formData,
                  dailyRoutine: [...formData.dailyRoutine, newActivity]
                });
              }}
              className="w-full min-h-[44px] py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>＋</span>
              <span>নতুন কাৰ্য যোগ কৰক (Add Routine Activity — {formData.dailyRoutine.length})</span>
            </button>
          </div>
        )}

        {/* Step 6 (Only during initial signup): Set 6-Digit Security PIN */}
        {step === 6 && isInitialSignup && (
          <div className="space-y-4 text-left">
            <div className="p-3.5 bg-teal-50/60 border border-teal-200/70 rounded-2xl text-xs text-teal-900">
              🔑 <strong>সুৰক্ষা পিন নিৰ্ধাৰণ (Create Security PIN):</strong> ৰোগীৰ পৰিচয় আৰু তথ্যৰ সুৰক্ষাৰ বাবে এটা সহজ ৬-সংখ্যাৰ পিন নিৰ্বাচন কৰক। (Set a simple 6-digit PIN to lock and protect this profile.)
            </div>

            <div>
              <label htmlFor="signup-pin" className="text-xs font-bold text-slate-800 block mb-1.5">
                ৬-সংখ্যাৰ নতুন পিন (New 6-Digit PIN) *
              </label>
              <input
                id="signup-pin"
                type="password"
                maxLength={6}
                value={formData.pin}
                onChange={e => {
                  setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') });
                  if (fieldErrors.pin) setFieldErrors(prev => ({ ...prev, pin: '' }));
                }}
                placeholder="••••••"
                className={`w-full min-h-[48px] px-4 py-2 rounded-xl text-center text-2xl tracking-widest font-mono font-bold text-slate-900 focus-visible:outline-none transition ${
                  fieldErrors.pin
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              />
              {fieldErrors.pin && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center justify-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.pin}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm-pin" className="text-xs font-bold text-slate-800 block mb-1.5">
                পিন পুনৰ দিয়ক (Confirm 6-Digit PIN) *
              </label>
              <input
                id="confirm-pin"
                type="password"
                maxLength={6}
                value={formData.confirmPin}
                onChange={e => {
                  setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') });
                  if (fieldErrors.confirmPin) setFieldErrors(prev => ({ ...prev, confirmPin: '' }));
                }}
                placeholder="••••••"
                className={`w-full min-h-[48px] px-4 py-2 rounded-xl text-center text-2xl tracking-widest font-mono font-bold text-slate-900 focus-visible:outline-none transition ${
                  fieldErrors.confirmPin
                    ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-200'
                    : 'bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white focus-visible:ring-2 focus-visible:ring-teal-600/20'
                }`}
              />
              {fieldErrors.confirmPin && (
                <p role="alert" className="text-xs text-rose-600 font-semibold mt-1 flex items-center justify-center gap-1">
                  <span>⚠️</span>
                  <span>{fieldErrors.confirmPin}</span>
                </p>
              )}
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
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
                aria-label="Go back"
              >
                <span className="text-lg leading-none">←</span>
                <span>পিছলৈ (Back)</span>
              </button>
            ) : (
              (onClose || onBack) && (
                <button
                  type="button"
                  onClick={() => {
                    if (onBack) onBack();
                    if (onClose) onClose();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
                  aria-label="Go back"
                >
                  <span className="text-lg leading-none">←</span>
                  <span>পিছলৈ (Back)</span>
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
