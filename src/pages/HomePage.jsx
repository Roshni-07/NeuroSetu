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
    <div className="min-h-screen bg-[#091312] text-slate-100 selection:bg-amber-600 selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Subtle Indigenous Textile Weave SVG Lattice Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Decorative Warm Ambient Glows (Assam Golden Muga & Majuli Riverine Tones) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-32 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* 1. Home Navigation Bar */}
      <nav className="border-b border-teal-900/40 bg-[#091312]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/home';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="NeuroSetu Home"
            className="flex items-center space-x-3 text-left hover:opacity-90 transition rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-teal-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
              ন
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                NeuroSetu <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 tracking-wide uppercase">NER Edition</span>
              </span>
              <span className="text-[10px] text-teal-400/80 font-medium block">
                {isEn ? 'North East Dementia Healthcare' : 'উত্তৰ-পূৰ্বাঞ্চলৰ ডিমেনচিয়া স্বাস্থ্য সেৱা'}
              </span>
            </div>
          </button>

          {/* Desktop Nav Items (hidden on screens < sm) */}
          <div className="hidden sm:flex items-center flex-wrap gap-2.5">
            {/* Quick Language Toggle */}
            <div className="flex items-center bg-[#0d1c1a] border border-teal-900/60 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${isEn ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('as')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${!isEn && selectedLanguage === 'as' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                অসমীয়া
              </button>
            </div>

            {/* Extended Multilingual Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageToggle(e.target.value)}
              className="bg-[#0d1c1a] text-slate-200 border border-teal-900/60 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
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
                className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-600/50 hover:bg-amber-900/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                🌾 {isEn ? 'Game Suite (15 Games)' : 'খেলৰ কেন্দ্ৰ (১৫ খেল)'}
              </button>
            )}

            {onOpenSetup && (
              <button
                type="button"
                onClick={onOpenSetup}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
              >
                {isEn ? 'Profile Setup' : 'প্ৰফাইল ছেটিংছ'}
              </button>
            )}

            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
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
              className="min-h-touch min-w-touch px-3 py-1.5 text-slate-200 bg-[#0d1c1a] border border-teal-900/60 rounded-xl flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <span className="text-base leading-none" aria-hidden="true">{isMobileMenuOpen ? '✕' : '☰'}</span>
              <span>{isMobileMenuOpen ? (isEn ? 'Close' : 'বন্ধ') : (isEn ? 'Menu' : 'মেনু')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (< sm) */}
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-teal-900/40 space-y-2.5 max-w-6xl mx-auto animate-fadeIn">
            <div className="flex items-center justify-between gap-2 p-2 bg-[#0d1c1a] rounded-xl border border-teal-900/60">
              <span className="text-xs text-slate-400 font-semibold">{isEn ? 'Language:' : 'ভাষা:'}</span>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageToggle(e.target.value)}
                className="bg-[#091312] text-slate-200 border border-teal-800 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-amber-500"
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
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-600/50 hover:bg-amber-900/60 rounded-xl transition"
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
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-semibold text-slate-300 hover:bg-[#0d1c1a] rounded-xl transition"
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
                  className="min-h-touch w-full text-left py-2 px-3 text-xs font-semibold text-slate-300 hover:bg-[#0d1c1a] rounded-xl transition"
                >
                  📊 {isEn ? 'ASHA Dashboard' : 'আশা ডেচবৰ্ড'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section - Asymmetric Layout with Cultural Heritage Tapestry */}
      <section className="relative z-10 px-6 pt-12 pb-16 sm:pt-16 sm:pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column (7 cols): Main Cultural Narrative & Consolidated Batch 2 CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1c1a] border border-amber-500/30 text-xs font-semibold text-amber-300 shadow-soft">
              <span className="text-sm">🌿</span>
              <span>{isEn ? 'Culturally Grounded Cognitive Healthcare for North East India' : 'উত্তৰ-পূৰ্বাঞ্চলৰ আঞ্চলিক ডিমেনচিয়া স্বাস্থ্য সেৱা'}</span>
            </div>

            {/* Main Headline (Exact text required for tests) */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {isEn ? 'Cognitive Games That Speak Your Language.' : 'ঘৰুৱা চিনাকি পৰিৱেশত স্মৃতিৰ সেঁতু।'}
            </h1>

            {/* Description Subtitle (Exact text required for tests) */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {isEn
                ? 'Voice-first reminiscence therapy powered by Bhashini AI, tailored with authentic Assamese, Mizo, and Manipuri folklore, instruments, and textile motifs — engineered to function 100% offline in rural North East India.'
                : 'ভাৰতৰ উত্তৰ-পূৰ্বাঞ্চলৰ গ্ৰাম্য অঞ্চলৰ বাবে প্ৰস্তুত কৰা ১০০% অফলাইন, মাতৃভাষা-আধাৰিত সাংস্কৃতিক স্মৃতি আৰু জ্ঞানীয় স্বাস্থ্য প্লেটফৰ্ম।'}
            </p>

            {/* Batch 2 Consolidated Call-to-Actions (Strictly Preserved) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              {onLaunchPatient && (
                <button
                  type="button"
                  onClick={onLaunchPatient}
                  className="min-h-[50px] px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl text-sm font-bold shadow-soft hover:shadow-soft-lg transition active:scale-95 flex items-center gap-2 cursor-pointer border border-teal-400/30"
                >
                  <span>🎮 {isEn ? 'Launch Patient Experience' : 'ৰোগীৰ খেল আৰম্ভ কৰক'}</span>
                </button>
              )}

              {onOpenRoleSelector && (
                <button
                  type="button"
                  onClick={onOpenRoleSelector}
                  className="min-h-[50px] px-6 py-3.5 bg-[#0d1c1a] hover:bg-[#122523] border border-amber-500/40 text-amber-200 hover:text-white rounded-2xl text-sm font-semibold shadow-soft transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>👥 {isEn ? 'Select Role & Log In' : 'ভূমিকা বাছক আৰু প্ৰৱেশ কৰক'}</span>
                </button>
              )}

              {onLaunchDashboard && (
                <button
                  type="button"
                  onClick={onLaunchDashboard}
                  className="min-h-[50px] px-6 py-3.5 bg-[#0d1c1a] hover:bg-[#122523] border border-teal-900/60 text-slate-200 hover:text-white rounded-2xl text-sm font-semibold shadow-soft transition active:scale-95 flex items-center gap-2"
                >
                  <span>📊 {isEn ? 'View ASHA Triage Dashboard' : 'আশা ট্ৰায়াজ ডেচবৰ্ড'}</span>
                </button>
              )}
            </div>

            {/* Hero Clinical Certification Strip */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-300/90 font-medium">✓ WCAG 2.1 AA Gerontology-Tuned</span>
              <span className="flex items-center gap-1.5 text-teal-300/90 font-medium">✓ Zero-Punitive Errorless Learning</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                ✓ Elderline (<a href="tel:14567" className="text-amber-400 hover:text-amber-300 underline font-semibold">14567</a>) SOS Routing
              </span>
              <span className="flex items-center gap-1.5 text-teal-300/90 font-medium">✓ 100% Offline Service Worker PWA</span>
            </div>
          </div>

          {/* Right Column (5 cols): Authentic Cultural Heritage Tapestry Showcase Card */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-gradient-to-b from-[#0d1e1c] via-[#0d1c1a] to-[#081211] border border-amber-600/30 rounded-3xl shadow-soft-xl space-y-5 relative overflow-hidden text-left">
              {/* Gamusa-inspired red & gold woven border header accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-400 to-red-600 rounded-full" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                    {isEn ? 'Culturally Calibrated' : 'সাংস্কৃতিক আধাৰ'}
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {isEn ? 'North East Memory Tapestry' : 'উত্তৰ-পূৰ্বাঞ্চলৰ ঐতিহ্য'}
                  </h3>
                </div>
                <span className="text-2xl" role="img" aria-label="North East Heritage">🌺</span>
              </div>

              {/* Cultural Stimuli Chip Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-[#091312] border border-teal-900/50 rounded-2xl flex items-center gap-2.5">
                  <span className="text-xl">🥁</span>
                  <div>
                    <p className="font-bold text-white">Bihu Rhythm</p>
                    <p className="text-[10px] text-slate-400">Dhol, Pepa, Gogona</p>
                  </div>
                </div>

                <div className="p-3 bg-[#091312] border border-teal-900/50 rounded-2xl flex items-center gap-2.5">
                  <span className="text-xl">🧵</span>
                  <div>
                    <p className="font-bold text-white">Golden Muga</p>
                    <p className="text-[10px] text-slate-400">Kingkhap Motifs</p>
                  </div>
                </div>

                <div className="p-3 bg-[#091312] border border-teal-900/50 rounded-2xl flex items-center gap-2.5">
                  <span className="text-xl">🌸</span>
                  <div>
                    <p className="font-bold text-white">Kopou Phool</p>
                    <p className="text-[10px] text-slate-400">Spring Blossom Recall</p>
                  </div>
                </div>

                <div className="p-3 bg-[#091312] border border-teal-900/50 rounded-2xl flex items-center gap-2.5">
                  <span className="text-xl">🛶</span>
                  <div>
                    <p className="font-bold text-white">Majuli Riverway</p>
                    <p className="text-[10px] text-slate-400">Village Ferry Path</p>
                  </div>
                </div>
              </div>

              {/* Bhashini Voice Therapy Callout */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-600/30 rounded-2xl flex items-center gap-3 text-xs">
                <span className="text-xl">🎙️</span>
                <div>
                  <span className="font-bold text-amber-200 block">
                    Bhashini Voice Therapy
                  </span>
                  <span className="text-[11px] text-amber-300/80">
                    Spoken prompts in অসমীয়া, বাংলা, Mizo, Manipuri, Khasi & Bodo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Pillar Feature Matrix */}
      <section className="relative z-10 px-6 py-16 bg-[#07100f] border-y border-teal-900/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Core Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for the Realities of Rural Dementia Care
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Voice & Multilingual */}
            <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft border-t-2 border-t-amber-500/60">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center text-xl">
                🎙
              </div>
              <h3 className="font-bold text-white text-sm">Voice-First Bhashini AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                ASHA workers and elderly patients navigate games using natural voice input and authentic Indian English and regional TTS.
              </p>
            </div>

            {/* Pillar 2: Offline Resilience */}
            <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft border-t-2 border-t-teal-500/60">
              <div className="w-10 h-10 rounded-xl bg-teal-950/60 text-teal-400 border border-teal-800/40 flex items-center justify-center text-xl">
                📶
              </div>
              <h3 className="font-bold text-white text-sm">Zero-Connectivity PWA</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Runs entirely offline with Service Worker caching and IndexedDB storage. Automatic delta synchronization pushes when online.
              </p>
            </div>

            {/* Pillar 3: Cultural Reminiscence */}
            <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft border-t-2 border-t-red-500/60">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center text-xl">
                🌾
              </div>
              <h3 className="font-bold text-white text-sm">8 NER State Traditions</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Stimuli tailored with authentic instruments (Dhol, Pepa, Gogona), textiles (Muga, Puanchei), and occupational routines.
              </p>
            </div>

            {/* Pillar 4: Biomarker Telemetry */}
            <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft border-t-2 border-t-emerald-500/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center text-xl">
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
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
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
          <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">🥁</span>
            <h4 className="font-bold text-white text-sm">Regional Instruments & Festivals</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Dhol, Pepa, Gogona, and Kopou Phool orchids evoke joyful Rongali Bihu and regional springtime celebrations.
            </p>
          </div>

          <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">🧵</span>
            <h4 className="font-bold text-white text-sm">Traditional Handloom Motifs</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Golden Muga silk Kingkhap motifs, Mizo Puanchei chequered shawls, and Naga warrior textiles.
            </p>
          </div>

          <div className="p-5 bg-[#0a1615] border border-teal-900/50 rounded-2xl space-y-2.5 shadow-soft">
            <span className="text-2xl block">☕</span>
            <h4 className="font-bold text-white text-sm">Daily Living & Routine Sequencing</h4>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Chronological tea preparation and agrarian routines reinforce daily executive functioning and independence.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer & Helpline Notice */}
      <footer className="relative z-10 border-t border-teal-900/40 bg-[#060e0d] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-semibold text-slate-300">NeuroSetu (নিওৰোসেতু) — North East India Dementia Stimulation Platform</p>
            <p>
              National Toll-Free Senior Helpline:{' '}
              <a
                href="tel:14567"
                className="text-amber-400 hover:text-amber-300 font-bold underline focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
              >
                Elderline (14567)
              </a>
            </p>
            <p className="text-slate-500 text-[11px]">
              © {new Date().getFullYear()} NeuroSetu. All rights reserved. Smart India Hackathon PS26003.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {onLaunchPatient && (
              <button
                type="button"
                onClick={onLaunchPatient}
                className="hover:text-white underline transition cursor-pointer"
              >
                Patient App
              </button>
            )}
            {onLaunchDashboard && (
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="hover:text-white underline transition cursor-pointer"
              >
                ASHA Dashboard
              </button>
            )}
            {onOpenSetup && (
              <button
                type="button"
                onClick={onOpenSetup}
                className="hover:text-white underline transition cursor-pointer"
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
