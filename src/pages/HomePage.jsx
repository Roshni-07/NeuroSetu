import React, { useState } from 'react';

export default function HomePage({
  onLaunchPatient = null,
  onLaunchDashboard = null,
  onOpenSetup = null,
  initialLanguage = 'en',
  onLanguageChange = null
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'en');

  const handleLanguageToggle = (lang) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const isEn = selectedLanguage === 'en';

  return (
    <div className="min-h-screen bg-marketing-canvas text-marketing-primary selection:bg-teal-500 selection:text-white font-sans">
      {/* 1. Home Navigation Bar */}
      <nav className="border-b border-marketing-card-border bg-marketing-canvas/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-xl shadow-inner">
              ন
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              NeuroSetu <span className="text-xs font-semibold text-teal-400 px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800">NER Edition</span>
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Language Switcher */}
            <div className="flex items-center bg-marketing-card border border-marketing-card-border rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${isEn ? 'bg-teal-600 text-white shadow-xs' : 'text-marketing-secondary hover:text-white'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('as')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${!isEn ? 'bg-teal-600 text-white shadow-xs' : 'text-marketing-secondary hover:text-white'}`}
              >
                অসমীয়া
              </button>
            </div>

            {onOpenSetup && (
              <button
                type="button"
                onClick={onOpenSetup}
                className="text-xs sm:text-sm font-semibold text-marketing-secondary hover:text-white px-3 py-1.5 transition"
              >
                {isEn ? 'Profile Setup' : 'প্ৰফাইল ছেটিংছ'}
              </button>
            )}

            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="text-xs sm:text-sm font-semibold text-marketing-secondary hover:text-white px-3 py-1.5 transition"
              >
                {isEn ? 'ASHA Dashboard' : 'আশা ডেচবৰ্ড'}
              </button>
            )}

            {onLaunchPatient && (
              <button
                type="button"
                onClick={onLaunchPatient}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
              >
                {isEn ? 'Launch Patient App →' : 'খেল আৰম্ভ কৰক →'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-marketing-card border border-marketing-card-border text-xs font-semibold text-teal-400 mb-2">
          <span>🌿 {isEn ? 'Culturally Grounded Cognitive Healthcare for North East India' : 'উত্তৰ-পূৰ্বাঞ্চলৰ আঞ্চলিক ডিমেনচিয়া স্বাস্থ্য সেৱা'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          {isEn ? 'Cognitive Games That Speak Your Language.' : 'ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু।'}
        </h1>

        <p className="text-lg sm:text-xl text-marketing-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          {isEn
            ? 'Voice-first reminiscence therapy powered by Bhashini AI, tailored with authentic Assamese, Mizo, and Manipuri folklore, instruments, and textile motifs — engineered to function 100% offline in rural North East India.'
            : 'ভাৰতৰ উত্তৰ-পূৰ্বাঞ্চলৰ গ্ৰাম্য অঞ্চলৰ বাবে প্ৰস্তুত কৰা ১০০% অফলাইন, মাতৃভাষা-আধাৰিত সাংস্কৃতিক স্মৃতি আৰু জ্ঞানীয় স্বাস্থ্য প্লেটফৰ্ম।'}
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {onLaunchPatient && (
            <button
              type="button"
              onClick={onLaunchPatient}
              className="min-h-touch px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-teal-900/40 transition active:scale-95 flex items-center gap-2"
            >
              <span>🎮 {isEn ? 'Launch Patient Experience' : 'ৰোগীৰ খেল আৰম্ভ কৰক'}</span>
            </button>
          )}

          {onLaunchDashboard && (
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="min-h-touch px-7 py-4 bg-marketing-card hover:bg-marketing-card-border border border-marketing-card-border text-white rounded-2xl text-base font-semibold shadow-sm transition active:scale-95 flex items-center gap-2"
            >
              <span>📊 {isEn ? 'View ASHA Triage Dashboard' : 'আশা ট্ৰায়াজ ডেচবৰ্ড'}</span>
            </button>
          )}

          {onOpenSetup && (
            <button
              type="button"
              onClick={onOpenSetup}
              className="min-h-touch px-6 py-4 bg-marketing-card/60 hover:bg-marketing-card border border-marketing-card-border text-gray-300 hover:text-white rounded-2xl text-base font-medium transition active:scale-95"
            >
              ⚙️ {isEn ? 'Setup Profile' : 'ব্যক্তিগত পৰিচয়'}
            </button>
          )}
        </div>

        {/* Hero Clinical Badge Strip */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-marketing-secondary">
          <span className="flex items-center gap-1.5">✓ WCAG 2.1 AA Gerontology-Tuned</span>
          <span className="flex items-center gap-1.5">✓ Zero-Punitive Errorless Learning</span>
          <span className="flex items-center gap-1.5">✓ Elderline (14567) SOS Routing</span>
          <span className="flex items-center gap-1.5">✓ 100% Offline Service Worker PWA</span>
        </div>
      </section>

      {/* 3. 4-Pillar Feature Matrix */}
      <section className="px-6 py-16 bg-marketing-card/50 border-y border-marketing-card-border">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Core Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Engineered for the Realities of Rural Dementia Care
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Voice & Multilingual */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center text-2xl">
                🎙
              </div>
              <h3 className="font-bold text-white text-base">Voice-First Bhashini AI</h3>
              <p className="text-xs text-marketing-secondary leading-relaxed">
                ASHA workers and elderly patients navigate games using natural voice input and authentic Indian English and regional TTS.
              </p>
            </div>

            {/* Pillar 2: Offline Resilience */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center text-2xl">
                📶
              </div>
              <h3 className="font-bold text-white text-base">Zero-Connectivity PWA</h3>
              <p className="text-xs text-marketing-secondary leading-relaxed">
                Runs entirely offline with Service Worker caching and IndexedDB storage. Automatic delta synchronization pushes when online.
              </p>
            </div>

            {/* Pillar 3: Cultural Reminiscence */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-2xl">
                🌾
              </div>
              <h3 className="font-bold text-white text-base">8 NER State Traditions</h3>
              <p className="text-xs text-marketing-secondary leading-relaxed">
                Stimuli tailored with authentic instruments (Dhol, Pepa, Gogona), textiles (Muga, Puanchei), and occupational routines.
              </p>
            </div>

            {/* Pillar 4: Biomarker Telemetry */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-2xl">
                📈
              </div>
              <h3 className="font-bold text-white text-base">Passive Biomarkers</h3>
              <p className="text-xs text-marketing-secondary leading-relaxed">
                Dynamic Difficulty Adjustment (DDA) tracks response latency and motor tremor silently to flag longitudinal decline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Cultural Memory Heritage Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Localized Reminiscence Therapy
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Stimuli That Resonate with NER Heritage
          </h2>
          <p className="text-sm text-marketing-secondary max-w-xl mx-auto">
            Reminiscence therapy triggers deeply consolidated procedural and episodic memories by presenting stimuli from the patient’s formative youth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
            <span className="text-3xl block">🥁</span>
            <h4 className="font-bold text-white text-base">Regional Instruments & Festivals</h4>
            <p className="text-xs text-marketing-secondary">
              Dhol, Pepa, Gogona, and Kopou Phool orchids evoke joyful Rongali Bihu and regional springtime celebrations.
            </p>
          </div>

          <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
            <span className="text-3xl block">🧵</span>
            <h4 className="font-bold text-white text-base">Traditional Handloom Motifs</h4>
            <p className="text-xs text-marketing-secondary">
              Golden Muga silk Kingkhap motifs, Mizo Puanchei chequered shawls, and Naga warrior textiles.
            </p>
          </div>

          <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
            <span className="text-3xl block">☕</span>
            <h4 className="font-bold text-white text-base">Daily Living & Routine Sequencing</h4>
            <p className="text-xs text-marketing-secondary">
              Chronological tea preparation and agrarian routines reinforce daily executive functioning and independence.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer & Helpline Notice */}
      <footer className="border-t border-marketing-card-border bg-black/40 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-marketing-secondary">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-white">NeuroSetu (নিওৰোসেতু) — North East India Dementia Stimulation Platform</p>
            <p>National Toll-Free Senior Helpline: <span className="text-teal-400 font-bold">Elderline (14567)</span></p>
          </div>

          <div className="flex items-center space-x-4">
            {onLaunchPatient && (
              <button onClick={onLaunchPatient} className="hover:text-white underline">
                Patient App
              </button>
            )}
            {onLaunchDashboard && (
              <button onClick={onLaunchDashboard} className="hover:text-white underline">
                ASHA Dashboard
              </button>
            )}
            {onOpenSetup && (
              <button onClick={onOpenSetup} className="hover:text-white underline">
                Profile Setup
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
