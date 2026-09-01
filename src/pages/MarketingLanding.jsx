import React, { useState } from 'react';

export default function MarketingLanding({
  onLaunchPatient = null,
  onLaunchDashboard = null
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('as');

  return (
    <div className="min-h-screen bg-marketing-canvas text-marketing-primary selection:bg-teal-500 selection:text-white font-sans">
      {/* 1. Marketing Navigation Bar */}
      <nav className="border-b border-marketing-card-border bg-marketing-canvas/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-black text-xl shadow-inner">
              ন
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              NeuroSetu <span className="text-xs font-semibold text-teal-400 px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800">NER Edition</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="text-xs sm:text-sm font-semibold text-marketing-secondary hover:text-white px-3 py-2 transition"
            >
              ASHA Dashboard
            </button>
            <button
              type="button"
              onClick={onLaunchPatient}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
            >
              Launch Patient App →
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-marketing-card border border-marketing-card-border text-xs font-semibold text-teal-400 mb-2">
          <span>🌿 Culturally Grounded Cognitive Healthcare for North East India</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Cognitive Games That Speak Your Language.
        </h1>

        <p className="text-lg sm:text-xl text-marketing-secondary max-w-2xl mx-auto font-normal leading-relaxed">
          Voice-first reminiscence therapy powered by Bhashini AI, tailored with authentic Assamese, Mizo, and Manipuri folklore, instruments, and textile motifs — engineered to function 100% offline in rural North East India.
        </p>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={onLaunchPatient}
            className="min-h-touch px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-teal-900/40 transition active:scale-95 flex items-center gap-2"
          >
            <span>🎮 Launch Patient Experience</span>
          </button>

          <button
            type="button"
            onClick={onLaunchDashboard}
            className="min-h-touch px-7 py-4 bg-marketing-card hover:bg-marketing-card-border border border-marketing-card-border text-white rounded-2xl text-base font-semibold shadow-sm transition active:scale-95 flex items-center gap-2"
          >
            <span>📊 View ASHA Triage Dashboard</span>
          </button>
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
              <h3 className="font-bold text-white text-lg">Voice-First Bhashini AI</h3>
              <p className="text-sm text-marketing-secondary leading-relaxed">
                Elderly patients speak naturally in Assamese and regional dialects. Speech recognition runs via Bhashini with an offline keyword spotter fallback.
              </p>
            </div>

            {/* Pillar 2: Offline Resilience */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h3 className="font-bold text-white text-lg">100% Offline-Native</h3>
              <p className="text-sm text-marketing-secondary leading-relaxed">
                Workbox Service Worker precaching caches all game modules and sounds. Zero network dependency during household visits in remote hills.
              </p>
            </div>

            {/* Pillar 3: Errorless Learning */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center text-2xl">
                🧠
              </div>
              <h3 className="font-bold text-white text-lg">Errorless Learning & DDA</h3>
              <p className="text-sm text-marketing-secondary leading-relaxed">
                Never buzzes or shames. Distractors are pruned gently with supportive hints. Difficulty drops automatically when latency exceeds 15 seconds.
              </p>
            </div>

            {/* Pillar 4: Silent Biomarker Telemetry */}
            <div className="p-6 bg-marketing-card border border-marketing-card-border rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-950 text-orange-400 border border-orange-800 flex items-center justify-center text-2xl">
                📈
              </div>
              <h3 className="font-bold text-white text-lg">Passive Telemetry & Triage</h3>
              <p className="text-sm text-marketing-secondary leading-relaxed">
                Silently logs response delay spikes into local IndexedDB. Delta-syncs to Supabase to alert ASHA workers for timely clinical interventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Reminiscence Therapy Showcase */}
      <section className="px-6 py-16 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Cultural Authenticity
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
            <h4 className="font-bold text-white text-base">Bihu Instruments & Festivals</h4>
            <p className="text-xs text-marketing-secondary">
              Dhol, Pepa, Gogona, and Kopou Phool orchids evoke joyful Rongali Bihu springtime celebrations.
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
            <h4 className="font-bold text-white text-base">Daily Living & Culinary Sequencing</h4>
            <p className="text-xs text-marketing-secondary">
              Chronological tea preparation routines reinforce daily executive functioning and independence.
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
            <button onClick={onLaunchPatient} className="hover:text-white underline">
              Patient App
            </button>
            <button onClick={onLaunchDashboard} className="hover:text-white underline">
              ASHA Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
