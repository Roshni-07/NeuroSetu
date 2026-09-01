import React from 'react';
import { synthesizeSpeech } from '../services/bhashiniService.js';

export default function PatientLayout({
  children,
  profileName = 'Primary Patient',
  activeSection = 'games', // 'games' | 'progress' | 'help'
  onNavigate = null,
  onOpenSos = null,
  isOnline = true
}) {
  const handleAudioGuide = () => {
    synthesizeSpeech('নমস্কাৰ। আপোনাৰ দিনটো শুভ হওক। খেলিবলৈ যিকোনো এটা কাৰ্ড স্পৰ্শ কৰক।', 'as');
  };

  return (
    <div className="min-h-screen bg-patient-canvas text-patient-primary flex flex-col font-sans selection:bg-teal-200">
      {/* 1. Offline / Network Status Banner */}
      <div
        role="status"
        aria-live="polite"
        data-testid="network-status"
        className={`w-full py-2 px-4 text-center font-bold text-sm transition-colors shadow-xs ${
          isOnline
            ? 'bg-patient-success text-white'
            : 'bg-patient-terracotta text-white'
        }`}
      >
        {isOnline
          ? '● অনলাইন — ক্লাউড ছিংক সাজু (Online — Cloud Sync Ready)'
          : '● অফলাইন ম’ড সক্ৰিয় — (Offline Mode Active — Service Worker Serving Shell)'}
      </div>

      {/* 2. Top Patient Bar (High Contrast, Large Targets, No Hamburger Menu) */}
      <header className="bg-white border-b-2 border-patient-border px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Patient Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-teal-50 text-patient-accent border-2 border-teal-300 rounded-2xl flex items-center justify-center text-xl font-bold">
              ন
            </div>
            <div>
              <span className="text-xl font-extrabold text-patient-accent tracking-tight block leading-tight">
                NeuroSetu
              </span>
              <span className="text-xs font-semibold text-patient-secondary">
                👤 {profileName} (অসমীয়া)
              </span>
            </div>
          </div>

          {/* Quick Audio Guide & SOS Call Trigger */}
          <div className="flex items-center space-x-2.5">
            {/* Audio Guide Button */}
            <button
              type="button"
              onClick={handleAudioGuide}
              aria-label="Listen to Audio Guide in Assamese"
              title="শুনক (Listen to Guide)"
              className="min-h-touch min-w-touch px-3 py-2 bg-teal-50 hover:bg-teal-100 text-patient-accent border-2 border-teal-300 rounded-2xl text-sm font-bold flex items-center gap-1.5 active:scale-95 shadow-xs transition"
            >
              <span className="text-xl" role="img" aria-hidden="true">🔊</span>
              <span className="hidden sm:inline">সহায় শুনক</span>
            </button>

            {/* Emergency SOS Button */}
            {onOpenSos && (
              <button
                type="button"
                onClick={onOpenSos}
                aria-label="Emergency Assistance SOS"
                className="min-h-touch min-w-touch px-4 py-2 bg-patient-terracotta hover:bg-patient-terracotta-hover text-white rounded-2xl text-sm font-extrabold flex items-center gap-1.5 active:scale-95 shadow-sm transition animate-pulse"
              >
                <span className="text-lg" role="img" aria-hidden="true">🆘</span>
                <span>সহায় (SOS)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Patient Surface Viewport (Max 3 levels deep) */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 mb-24">
        {children}
      </main>

      {/* 4. Persistent Labeled Bottom Navigation Bar (WCAG 2.1 AA Dual Coding) */}
      <nav
        aria-label="Primary Navigation"
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-patient-border py-2 px-4 z-40 shadow-lg"
      >
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          {/* Nav Item 1: Games */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('games')}
            aria-current={activeSection === 'games' ? 'page' : undefined}
            className={`min-h-touch py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeSection === 'games'
                ? 'bg-teal-50 text-patient-accent border-2 border-teal-300 font-extrabold shadow-xs'
                : 'text-patient-secondary hover:bg-gray-100 font-semibold'
            }`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">🎮</span>
            <span className="text-xs mt-0.5">খেল (Games)</span>
          </button>

          {/* Nav Item 2: Progress */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('progress')}
            aria-current={activeSection === 'progress' ? 'page' : undefined}
            className={`min-h-touch py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeSection === 'progress'
                ? 'bg-teal-50 text-patient-accent border-2 border-teal-300 font-extrabold shadow-xs'
                : 'text-patient-secondary hover:bg-gray-100 font-semibold'
            }`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">📊</span>
            <span className="text-xs mt-0.5">অগ্ৰগতি (Progress)</span>
          </button>

          {/* Nav Item 3: Caregiver / Helpline Contact */}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('help')}
            aria-current={activeSection === 'help' ? 'page' : undefined}
            className={`min-h-touch py-2 px-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
              activeSection === 'help'
                ? 'bg-teal-50 text-patient-accent border-2 border-teal-300 font-extrabold shadow-xs'
                : 'text-patient-secondary hover:bg-gray-100 font-semibold'
            }`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">🤝</span>
            <span className="text-xs mt-0.5">পৰিয়াল (Family)</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
