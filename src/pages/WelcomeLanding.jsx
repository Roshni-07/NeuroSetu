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
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between p-4 sm:p-8 font-sans antialiased text-slate-800">
      {/* Top Header with In-Page Portal Navigation */}
      <header className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-200/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 font-black text-lg shadow-xs">
            <span role="img" aria-label="NeuroSetu Logo">🧠</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">NeuroSetu</span>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
            নিওৰোসেতু
          </span>
        </div>

        {/* Portal Switching CTAs */}
        <div className="flex items-center flex-wrap gap-2">
          {onOpenSetup && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-soft transition"
            >
              ⚙️ Profile Setup
            </button>
          )}
          {onOpenDashboard && (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50/80 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl border border-teal-200/70 shadow-soft transition"
            >
              ASHA Dashboard →
            </button>
          )}
          {onOpenMarketing && (
            <button
              type="button"
              onClick={onOpenMarketing}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-200/70 shadow-soft transition"
            >
              About Platform
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="max-w-3xl mx-auto w-full my-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft-xl space-y-7 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-teal-50/70 border border-teal-100 rounded-full text-xs font-semibold text-teal-800">
            <span>🌾</span>
            <span>North East Regional Dementia Healthcare</span>
          </div>

          {/* Heading */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
              ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
              Culturally grounded cognitive stimulation and passive digital biomarker care for North East India.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-1">
            <div className="p-4 bg-slate-50/60 border border-slate-200/70 rounded-2xl space-y-1.5 shadow-soft">
              <span className="text-2xl block" role="img" aria-label="Reminiscence">🥁</span>
              <h3 className="text-xs font-bold text-slate-900">সাংস্কৃতিক স্মৃতি খেল</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Authentic instruments, handlooms, and life routines across 8 NER states.
              </p>
            </div>

            <div className="p-4 bg-slate-50/60 border border-slate-200/70 rounded-2xl space-y-1.5 shadow-soft">
              <span className="text-2xl block" role="img" aria-label="Voice First">🎙️</span>
              <h3 className="text-xs font-bold text-slate-900">মাত আৰু শ্ৰৱণ সহায়</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Voice-first prompts in Assamese & English with errorless learning support.
              </p>
            </div>

            <div className="p-4 bg-slate-50/60 border border-slate-200/70 rounded-2xl space-y-1.5 shadow-soft">
              <span className="text-2xl block" role="img" aria-label="Offline Secure">📶</span>
              <h3 className="text-xs font-bold text-slate-900">১০০% অফলাইন সুৰক্ষা</h3>
              <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                Works without internet. Patient memories and family names remain private.
              </p>
            </div>
          </div>

          {/* User Navigation Calls-to-Action */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 max-w-md mx-auto">
            {/* Primary Action: Get Started / Device Check */}
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full min-h-[48px] py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm shadow-soft hover:shadow-soft-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>প্ৰথমবাৰ আৰম্ভ কৰক (Get Started)</span>
              <span>→</span>
            </button>

            {/* Launch Patient App */}
            {onLaunchPatient && (
              <button
                type="button"
                onClick={onLaunchPatient}
                className="w-full min-h-[48px] py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl text-xs shadow-soft hover:shadow-soft-md transition-all active:scale-95 flex items-center justify-center gap-2"
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
                className="w-full min-h-[48px] py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold rounded-2xl text-xs shadow-soft transition"
              >
                🔑 পিন প্ৰৱেশ কৰক (Already have a PIN? Unlock)
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Navigation Links */}
      <footer className="max-w-4xl mx-auto w-full pt-4 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} NeuroSetu Cognitive Health Platform • Built for Rural NER Healthcare (SIH PS26003)</span>
        <div className="flex items-center space-x-4">
          {onLaunchPatient && (
            <button type="button" onClick={onLaunchPatient} className="hover:text-slate-700 underline transition">
              Patient App
            </button>
          )}
          {onOpenDashboard && (
            <button type="button" onClick={onOpenDashboard} className="hover:text-slate-700 underline transition">
              ASHA Dashboard
            </button>
          )}
          {onOpenSetup && (
            <button type="button" onClick={onOpenSetup} className="hover:text-slate-700 underline transition">
              Profile Setup
            </button>
          )}
          {onOpenMarketing && (
            <button type="button" onClick={onOpenMarketing} className="hover:text-slate-700 underline transition">
              Clinical Mission
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
