import React from 'react';

export default function WelcomeLanding({
  onGetStarted = null,
  onEnterPin = null,
  onOpenDashboard = null,
  onLaunchPatient = null,
  onOpenSetup = null,
  onOpenMarketing = null
}) {
  return (
    <div className="min-h-screen bg-patient-canvas flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header with In-Page Portal Navigation */}
      <header className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 py-3 border-b border-patient-border">
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl" role="img" aria-label="NeuroSetu Logo">🧠</span>
          <span className="text-xl font-extrabold text-patient-primary tracking-tight">NeuroSetu</span>
          <span className="text-xs font-bold text-patient-accent bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
            নিওৰোসেতু
          </span>
        </div>

        {/* Portal Switching CTAs */}
        <div className="flex items-center flex-wrap gap-2">
          {onOpenSetup && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 shadow-xs transition"
            >
              ⚙️ Profile Setup
            </button>
          )}
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs transition"
            >
              ASHA Dashboard →
            </button>
          )}
          {onOpenMarketing && (
            <button
              type="button"
              onClick={onOpenMarketing}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs transition"
            >
              About Platform
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-3xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border-2 border-patient-border shadow-xl space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-patient-accent">
            <span>🌾</span>
            <span>North East Regional Dementia Healthcare</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-patient-primary leading-tight">
              ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু
            </h1>
            <p className="text-base sm:text-lg text-patient-secondary font-medium max-w-xl mx-auto">
              Culturally grounded cognitive stimulation and passive digital biomarker care for North East India.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 bg-patient-canvas border border-teal-100 rounded-2xl space-y-1">
              <span className="text-2xl" role="img" aria-label="Reminiscence">🥁</span>
              <h3 className="text-sm font-bold text-patient-primary">সাংস্কৃতিক স্মৃতি খেল</h3>
              <p className="text-xs text-patient-secondary">
                Authentic instruments, handlooms, and life routines across 8 NER states.
              </p>
            </div>

            <div className="p-4 bg-patient-canvas border border-amber-100 rounded-2xl space-y-1">
              <span className="text-2xl" role="img" aria-label="Voice First">🎙️</span>
              <h3 className="text-sm font-bold text-patient-primary">মাত আৰু শ্ৰৱণ সহায়</h3>
              <p className="text-xs text-patient-secondary">
                Voice-first prompts in Assamese & English with errorless learning support.
              </p>
            </div>

            <div className="p-4 bg-patient-canvas border border-purple-100 rounded-2xl space-y-1">
              <span className="text-2xl" role="img" aria-label="Offline Secure">📶</span>
              <h3 className="text-sm font-bold text-patient-primary">১০০% অফলাইন সুৰক্ষা</h3>
              <p className="text-xs text-patient-secondary">
                Works without internet. Patient memories and family names remain private.
              </p>
            </div>
          </div>

          {/* User Navigation Calls-to-Action */}
          <div className="space-y-3 pt-4 border-t border-gray-100 max-w-md mx-auto">
            {/* Primary Action: Get Started / Device Check */}
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full min-h-touch py-3.5 bg-patient-accent hover:bg-patient-accent-hover text-white font-extrabold rounded-2xl text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>প্ৰথমবাৰ আৰম্ভ কৰক (Get Started)</span>
              <span>→</span>
            </button>

            {/* Launch Patient App */}
            {onLaunchPatient && (
              <button
                type="button"
                onClick={onLaunchPatient}
                className="w-full min-h-touch py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🎮 খেল পৃষ্ঠালৈ যাওক (Launch Patient App)</span>
                <span>→</span>
              </button>
            )}

            {/* Direct PIN Unlock */}
            {onEnterPin && (
              <button
                type="button"
                onClick={onEnterPin}
                className="w-full min-h-touch py-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-patient-primary font-bold rounded-2xl text-sm transition"
              >
                🔑 পিন প্ৰৱেশ কৰক (Already have a PIN? Unlock)
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Navigation Links */}
      <footer className="max-w-4xl mx-auto w-full pt-4 pb-2 border-t border-patient-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-patient-hint">
        <span>NeuroSetu Cognitive Health Platform • Built for Rural NER Healthcare</span>
        <div className="flex items-center space-x-4">
          {onLaunchPatient && (
            <button type="button" onClick={onLaunchPatient} className="hover:text-patient-primary underline">
              Patient App
            </button>
          )}
          {onOpenDashboard && (
            <button type="button" onClick={onOpenDashboard} className="hover:text-patient-primary underline">
              ASHA Dashboard
            </button>
          )}
          {onOpenSetup && (
            <button type="button" onClick={onOpenSetup} className="hover:text-patient-primary underline">
              Profile Setup
            </button>
          )}
          {onOpenMarketing && (
            <button type="button" onClick={onOpenMarketing} className="hover:text-patient-primary underline">
              Clinical Mission
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
