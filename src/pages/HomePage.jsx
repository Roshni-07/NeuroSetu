import React, { useState } from 'react';

export default function HomePage({
  onLaunchPatient = null,
  onLaunchDashboard = null,
  onLaunchHub = null,
  onOpenSetup = null,
  onOpenRoleSelector = null,
  initialLanguage = 'en',
  onLanguageChange = null
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage || 'en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLanguageToggle = (lang) => {
    setSelectedLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const isEn = selectedLanguage === 'en';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-600 selection:text-white font-sans antialiased">
      {/* 1. Home Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/home';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="NeuroSetu Home"
            className="flex items-center space-x-3 text-left hover:opacity-90 transition rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg shadow-inner">
              ন
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              NeuroSetu <span className="text-[11px] font-semibold text-teal-400 px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-800/60">NER Edition</span>
            </span>
          </button>

          {/* Desktop Nav Items (hidden on screens < sm) */}
          <div className="hidden sm:flex items-center flex-wrap gap-2.5">
            {/* Quick Language Toggle & Multilingual Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${isEn ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('as')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${!isEn && selectedLanguage === 'as' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                অসমীয়া
              </button>
            </div>

            {/* Extended Multilingual Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageToggle(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer shadow-xs"
              aria-label="More Languages"
            >
              <option value="en">🇬🇧 English</option>
              <option value="as">🌿 অসমীয়া (Assamese)</option>
              <option value="bn">🌸 বাংলা (Bengali)</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="mni">🌺 মৈতৈলোন্ (Manipuri)</option>
              <option value="lus">🌄 Mizo (Mizoram)</option>
              <option value="kha">🌧️ Khasi (Meghalaya)</option>
              <option value="grt">🥁 Garo (A·chik)</option>
              <option value="brx">🌾 बर’ (Bodo)</option>
            </select>

            {onLaunchHub && (
              <button
                type="button"
                onClick={onLaunchHub}
                className="text-xs font-bold text-teal-300 bg-teal-950/60 border border-teal-600/50 hover:bg-teal-900/60 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                🌾 {isEn ? 'Game Suite (15 Games)' : 'খেলৰ কেন্দ্ৰ (১৫ খেল)'}
              </button>
            )}

            {onOpenSetup && (
              <button
                type="button"
                onClick={onOpenSetup}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 transition"
              >
                {isEn ? 'Profile Setup' : 'প্ৰফাইল ছেটিংছ'}
              </button>
            )}

            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 transition"
              >
                {isEn ? 'ASHA Dashboard' : 'আশা ডেচবৰ্ড'}
              </button>
            )}
          </div>

          {/* Mobile Hamburger Toggle (< sm) */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="min-h-touch min-w-touch px-3 py-1.5 text-slate-200 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <span className="text-base leading-none" aria-hidden="true">{isMobileMenuOpen ? '✕' : '☰'}</span>
              <span>{isMobileMenuOpen ? (isEn ? 'Close' : 'বন্ধ') : (isEn ? 'Menu' : 'মেনু')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (< sm) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-800 space-y-2.5 max-w-6xl mx-auto animate-fadeIn">
            {/* Mobile Language Toggle */}
            <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">{isEn ? 'Language:' : 'ভাষা:'}</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageToggle(e.target.value)}
                className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-teal-500"
                aria-label="Select Language"
              >
                <option value="en">🇬🇧 English</option>
                <option value="as">🌿 অসমীয়া (Assamese)</option>
                <option value="bn">🌸 বাংলা (Bengali)</option>
                <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="mni">🌺 মৈতৈলোন্ (Manipuri)</option>
                <option value="lus">🌄 Mizo (Mizoram)</option>
                <option value="kha">🌧️ Khasi (Meghalaya)</option>
                <option value="grt">🥁 Garo (A·chik)</option>
                <option value="brx">🌾 बर’ (Bodo)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {onLaunchHub && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLaunchHub();
                  }}
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-bold text-teal-300 bg-teal-950/60 border border-teal-600/50 hover:bg-teal-900/60 rounded-xl transition"
                >
                  🌾 {isEn ? 'Game Suite (15 Games)' : 'খেলৰ কেন্দ্ৰ (১৫ খেল)'}
                </button>
              )}

              {onOpenSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSetup();
                  }}
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 rounded-xl transition"
                >
                  ⚙️ {isEn ? 'Profile Setup' : 'প্ৰফাইল ছেটিংছ'}
                </button>
              )}

              {onLaunchDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLaunchDashboard();
                  }}
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-900 rounded-xl transition"
                >
                  📊 {isEn ? 'ASHA Dashboard' : 'আশা ডেচবৰ্ড'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-teal-400">
          <span>🌿 {isEn ? 'Culturally Grounded Cognitive Healthcare for North East India' : 'উত্তৰ-পূৰ্বাঞ্চলৰ আঞ্চলিক ডিমেনচিয়া স্বাস্থ্য সেৱা'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          {isEn ? 'Cognitive Games That Speak Your Language.' : 'ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু।'}
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {isEn
            ? 'Voice-first reminiscence therapy powered by Bhashini AI, tailored with authentic Assamese, Mizo, and Manipuri folklore, instruments, and textile motifs — engineered to function 100% offline in rural North East India.'
            : 'ভাৰতৰ উত্তৰ-পূৰ্বাঞ্চলৰ গ্ৰাম্য অঞ্চলৰ বাবে প্ৰস্তুত কৰা ১০০% অফলাইন, মাতৃভাষা-আধাৰিত সাংস্কৃতিক স্মৃতি আৰু জ্ঞানীয় স্বাস্থ্য প্লেটফৰ্ম।'}
        </p>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          {onLaunchPatient && (
            <button
              type="button"
              onClick={onLaunchPatient}
              className="min-h-[50px] px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-sm font-bold shadow-soft hover:shadow-soft-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>🎮 {isEn ? 'Launch Patient Experience' : 'ৰোগীৰ খেল আৰম্ভ কৰক'}</span>
            </button>
          )}

          {onOpenRoleSelector && (
            <button
              type="button"
              onClick={onOpenRoleSelector}
              className="min-h-[50px] px-6 py-3.5 bg-teal-950/70 hover:bg-teal-900/80 border border-teal-500/50 text-teal-200 hover:text-white rounded-2xl text-sm font-semibold shadow-soft transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>👥 {isEn ? 'Select Role & Log In' : 'ভূমিকা বাছক আৰু প্ৰৱেশ কৰক'}</span>
            </button>
          )}

          {onLaunchDashboard && (
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="min-h-[50px] px-6 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-2xl text-sm font-semibold shadow-soft transition active:scale-95 flex items-center gap-2"
            >
              <span>📊 {isEn ? 'View ASHA Triage Dashboard' : 'আশা ট্ৰায়াজ ডেচবৰ্ড'}</span>
            </button>
          )}
        </div>

        {/* Hero Clinical Badge Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">✓ WCAG 2.1 AA Gerontology-Tuned</span>
          <span className="flex items-center gap-1.5">✓ Zero-Punitive Errorless Learning</span>
          <span className="flex items-center gap-1.5">
            ✓ Elderline (<a href="tel:14567" className="text-teal-400 hover:text-teal-300 underline font-semibold">14567</a>) SOS Routing
          </span>
          <span className="flex items-center gap-1.5">✓ 100% Offline Service Worker PWA</span>
        </div>
      </section>

      {/* 3. 4-Pillar Feature Matrix */}
      <section className="px-6 py-16 bg-slate-900/40 border-y border-slate-850">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for the Realities of Rural Dementia Care
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Voice & Multilingual */}
            <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-850 flex items-center justify-center text-xl">
                🎙
              </div>
              <h3 className="font-bold text-white text-sm">Voice-First Bhashini AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                ASHA workers and elderly patients navigate games using natural voice input and authentic Indian English and regional TTS.
              </p>
            </div>

            {/* Pillar 2: Offline Resilience */}
            <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-850 flex items-center justify-center text-xl">
                📶
              </div>
              <h3 className="font-bold text-white text-sm">Zero-Connectivity PWA</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Runs entirely offline with Service Worker caching and IndexedDB storage. Automatic delta synchronization pushes when online.
              </p>
            </div>

            {/* Pillar 3: Cultural Reminiscence */}
            <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-850 flex items-center justify-center text-xl">
                🌾
              </div>
              <h3 className="font-bold text-white text-sm">8 NER State Traditions</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Stimuli tailored with authentic instruments (Dhol, Pepa, Gogona), textiles (Muga, Puanchei), and occupational routines.
              </p>
            </div>

            {/* Pillar 4: Biomarker Telemetry */}
            <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-850 flex items-center justify-center text-xl">
                📈
              </div>
              <h3 className="font-bold text-white text-sm">Passive Biomarkers</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Dynamic Difficulty Adjustment (DDA) tracks response latency and motor tremor silently to flag longitudinal decline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Cultural Memory Heritage Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Localized Reminiscence Therapy
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Stimuli That Resonate with NER Heritage
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-normal">
            Reminiscence therapy triggers deeply consolidated procedural and episodic memories by presenting stimuli from the patient’s formative youth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">🥁</span>
            <h4 className="font-bold text-white text-sm">Regional Instruments & Festivals</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Dhol, Pepa, Gogona, and Kopou Phool orchids evoke joyful Rongali Bihu and regional springtime celebrations.
            </p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">🧵</span>
            <h4 className="font-bold text-white text-sm">Traditional Handloom Motifs</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Golden Muga silk Kingkhap motifs, Mizo Puanchei chequered shawls, and Naga warrior textiles.
            </p>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">☕</span>
            <h4 className="font-bold text-white text-sm">Daily Living & Routine Sequencing</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Chronological tea preparation and agrarian routines reinforce daily executive functioning and independence.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer & Helpline Notice */}
      <footer className="border-t border-slate-850 bg-slate-950/90 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-300">NeuroSetu (নিওৰোসেতু) — North East India Dementia Stimulation Platform</p>
            <p>
              National Toll-Free Senior Helpline:{' '}
              <a
                href="tel:14567"
                className="text-teal-400 hover:text-teal-300 font-bold underline focus:outline-none focus:ring-1 focus:ring-teal-500 rounded"
              >
                Elderline (14567)
              </a>
            </p>
            <p className="text-slate-400 text-[11px]">
              © {new Date().getFullYear()} NeuroSetu. All rights reserved. Smart India Hackathon PS26003.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {onLaunchPatient && (
              <button
                type="button"
                onClick={onLaunchPatient}
                className="hover:text-white underline transition"
              >
                Patient App
              </button>
            )}
            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="hover:text-white underline transition"
              >
                ASHA Dashboard
              </button>
            )}
            {onOpenSetup && (
              <button
                type="button"
                onClick={onOpenSetup}
                className="hover:text-white underline transition"
              >
                Profile Setup
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
