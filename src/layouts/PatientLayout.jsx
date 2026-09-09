import React, { useState } from 'react';
import { synthesizeSpeech } from '../services/bhashiniService.js';
import { SUPPORTED_LANGUAGES, getAudioHelpText } from '../data/multilingualAudioHelp.js';

export default function PatientLayout({
  children,
  profileName = 'Primary Patient',
  language = 'en',
  onLanguageChange = null,
  activeSection = 'games', // 'games' | 'reminders' | 'progress' | 'help'
  onNavigate = null,
  onOpenSos = null,
  onLogout = null,
  isOnline = true
}) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isEn = language === 'en';

  const handleAudioGuide = () => {
    const textToSpeak = getAudioHelpText(activeSection, language);
    synthesizeSpeech(textToSpeak, language);
  };

  const handleSelectLanguage = (newLangCode) => {
    setIsLangMenuOpen(false);
    if (onLanguageChange) {
      onLanguageChange(newLangCode);
    }
    // Greet in the chosen language
    const greeting = getAudioHelpText('welcome', newLangCode);
    synthesizeSpeech(greeting, newLangCode);
  };

  return (
    <div className="min-h-screen bg-patient-canvas text-slate-900 flex flex-col font-sans selection:bg-teal-100">
      {/* Top Patient Bar (High Contrast, Large Targets, Clean Apple Health Design) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5 sticky top-0 z-30 shadow-soft">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Patient Identity (Click to return to Home) */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('home') : (window.location.hash = '#/home')}
            aria-label="Return to NeuroSetu Home"
            className="flex items-center space-x-3 text-left hover:opacity-85 transition rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <div className="w-10 h-10 bg-teal-50 text-teal-700 border border-teal-200/80 rounded-xl flex items-center justify-center text-lg font-bold shadow-soft">
              ন
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                NeuroSetu
              </span>
              <span className="text-xs font-medium text-slate-500">
                👤 {profileName}
              </span>
            </div>
          </button>

          {/* Quick Controls: Language Switcher, Audio Guide & SOS Call Trigger */}
          <div className="flex items-center space-x-2">
            {/* Multilingual Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                aria-label="Change Language"
                title="Change Spoken Language"
                className="min-h-touch px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-soft"
              >
                <span>{currentLangObj.icon}</span>
                <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {/* Language Dropdown Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-soft-lg z-50 p-1.5 space-y-1 animate-fade-in max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Select Audio & UI Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((langItem) => (
                    <button
                      key={langItem.code}
                      type="button"
                      onClick={() => handleSelectLanguage(langItem.code)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        language === langItem.code
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                          : 'hover:bg-slate-50 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{langItem.icon}</span>
                        <div>
                          <p className="leading-tight">{langItem.nativeName}</p>
                          <p className="text-[10px] text-slate-400">{langItem.label}</p>
                        </div>
                      </div>
                      {language === langItem.code && <span className="text-teal-700">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders / Roadmap View Toggle Button (Relocated from bottom nav) */}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate(activeSection === 'reminders' ? 'games' : 'reminders')}
                aria-label={activeSection === 'reminders' ? 'Switch to Roadmap Games' : 'Switch to Reminders and Routine'}
                title={activeSection === 'reminders' ? 'Roadmap Games' : 'Reminders'}
                className={`min-h-touch px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-soft transition cursor-pointer ${
                  activeSection === 'reminders'
                    ? 'bg-teal-700 text-white border-teal-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <span className="text-base" role="img" aria-hidden="true">
                  {activeSection === 'reminders' ? '🗺️' : '⏰'}
                </span>
                <span className="hidden sm:inline">
                  {activeSection === 'reminders'
                    ? (isEn ? 'Roadmap' : 'যাত্ৰা')
                    : (isEn ? 'Reminders' : 'সোঁৱৰণী')}
                </span>
              </button>
            )}

            {/* Audio Guide Button */}
            <button
              type="button"
              onClick={handleAudioGuide}
              aria-label={`Listen to Audio Guide in ${currentLangObj.label}`}
              title="Audio Guide"
              className="min-h-touch min-w-touch px-3 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 shadow-soft transition"
            >
              <span className="text-base" role="img" aria-hidden="true">🔊</span>
              <span className="hidden sm:inline">Audio Help</span>
            </button>

            {/* Emergency SOS Button */}
            {onOpenSos && (
              <button
                type="button"
                onClick={onOpenSos}
                aria-label="Emergency Assistance SOS"
                className="min-h-touch min-w-touch px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-soft transition"
              >
                <span className="text-sm" role="img" aria-hidden="true">🆘</span>
                <span>SOS</span>
              </button>
            )}

            {/* Logout Session Button (Single unambiguous action, no modal/choice) */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout (Lock / Logout)"
                title="Logout Session"
                className="min-h-touch px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-slate-700 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-soft transition cursor-pointer"
              >
                <span className="text-sm" role="img" aria-hidden="true">🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Patient Surface Viewport (Max 3 levels deep) */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
