import React from 'react';
import { sounds } from '../utils/soundEffects.js';
import SpeakButton from './SpeakButton.jsx';
import { getUIString } from '../data/gamesLocalization.js';

/**
 * InstructionsModal - Displayed before gameplay to orient elderly players
 * 
 * WCAG 2.1 AA / Gerontology-tuned:
 * - 20px+ font size for easy reading
 * - High contrast (dark slate text on soft warm background)
 * - Large 56px+ tap targets
 * - Clear, numbered steps with icons
 * - One-touch Audio Explanation in user's active language
 */
export default function InstructionsModal({
  isOpen = true,
  onClose,
  onBackToHub = null,
  onExit = null,
  title = '',
  gameName = '',
  culturalTag = '',
  steps = [],
  tip = '',
  language = 'en',
  voiceText = ''
}) {
  if (!isOpen) return null;

  const handleStart = () => {
    sounds.playGentleTap();
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        sounds.playGentleTap();
        if (onBackToHub) onBackToHub();
        else if (onExit) onExit();
        else if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onBackToHub, onExit, onClose]);

  const modalHeading = gameName || title || getUIString('howToPlay', language);
  const modalTip = tip || getUIString('tipRelax', language);
  const speechText = voiceText || `${modalHeading}. ${steps.join('. ')}. ${modalTip}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-xl bg-white border-4 border-teal-300 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Cultural Header Badge */}
        {culturalTag && (
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-900 text-sm font-bold tracking-wide uppercase mb-3">
            <span>🌿</span>
            <span>{culturalTag}</span>
          </div>
        )}

        {/* Game Title & Prompt */}
        <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
          {modalHeading}
        </h2>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            {getUIString('howToPlay', language)}:
          </p>
          <SpeakButton
            text={speechText}
            language={language}
            label={getUIString('voiceGuide', language)}
            className="bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 font-bold text-xs"
          />
        </div>

        {/* Steps List */}
        <div className="my-4 space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {idx + 1}
              </div>
              <div className="text-base sm:text-lg font-semibold text-slate-800 leading-snug pt-1">
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* Reassuring Tip */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium text-sm mb-4">
          <span className="text-xl">🌸</span>
          <span>{modalTip}</span>
        </div>

        {/* Actions: Back to Hub & Big Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {(onBackToHub || onExit || onClose) && (
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                if (onBackToHub) onBackToHub();
                else if (onExit) onExit();
                else if (onClose) onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
              aria-label="Exit to Hub"
            >
              <span className="text-lg leading-none">←</span>
              <span>{getUIString('gamesHub', language) || 'Exit to Hub'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStart}
            className="flex-1 min-h-[52px] px-5 py-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 cursor-pointer"
          >
            <span>{getUIString('startPlaying', language)}</span>
            <span className="text-2xl">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
