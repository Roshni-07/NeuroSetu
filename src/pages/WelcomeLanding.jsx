import React from 'react';

export default function WelcomeLanding({
  onGetStarted = null,
  onEnterPin = null,
  onOpenDashboard = null
}) {
  return (
    <div className="min-h-screen bg-patient-canvas flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2 border-b border-patient-border">
        <div className="flex items-center space-x-2">
          <span className="text-2xl" role="img" aria-label="NeuroSetu Logo">🧠</span>
          <span className="text-xl font-extrabold text-patient-primary tracking-tight">NeuroSetu</span>
          <span className="text-sm font-bold text-patient-accent bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
            নিওৰোসেতু
          </span>
        </div>

        {onOpenDashboard && (
          <button
            type="button"
            onClick={onOpenDashboard}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200"
          >
            ASHA Portal →
          </button>
        )}
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
            <p className="text-lg text-patient-secondary font-medium max-w-xl mx-auto">
              Culturally grounded cognitive stimulation and passive digital biomarker care for North East India.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 bg-patient-canvas border border-teal-100 rounded-2xl space-y-1">
              <span className="text-2xl">🥁</span>
              <h3 className="text-sm font-bold text-patient-primary">সাংস্কৃতিক স্মৃতি খেল</h3>
              <p className="text-xs text-patient-secondary">
                Authentic instruments, handlooms, and life routines across 8 NER states.
              </p>
            </div>

            <div className="p-4 bg-patient-canvas border border-amber-100 rounded-2xl space-y-1">
              <span className="text-2xl">🎙️</span>
              <h3 className="text-sm font-bold text-patient-primary">মাত আৰু শ্ৰৱণ সহায়</h3>
              <p className="text-xs text-patient-secondary">
                Voice-first prompts in Assamese & English with errorless learning support.
              </p>
            </div>

            <div className="p-4 bg-patient-canvas border border-purple-100 rounded-2xl space-y-1">
              <span className="text-2xl">📶</span>
              <h3 className="text-sm font-bold text-patient-primary">১০০% অফলাইন সুৰক্ষা</h3>
              <p className="text-xs text-patient-secondary">
                Works without internet. Patient memories and family names remain private.
              </p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-100 max-w-md mx-auto">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full min-h-touch py-4 bg-patient-accent hover:bg-patient-accent-hover text-white font-extrabold rounded-2xl text-lg shadow-md transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>প্ৰথমবাৰ আৰম্ভ কৰক (Get Started)</span>
              <span>→</span>
            </button>

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

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-patient-hint py-2">
        NeuroSetu Cognitive Health Platform • Prototype Tier • Designed with Dementia Caregivers
      </footer>
    </div>
  );
}
