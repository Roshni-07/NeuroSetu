import React from 'react';
import { ArrowRight, ArrowLeft, Volume2, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';
import SpeakButton from './SpeakButton.jsx';
import { getUIString } from '../data/gamesLocalization.js';
import { useI18n } from '../i18n/I18nContext.jsx';

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
  language = null,
  voiceText = ''
}) {
  const { language: globalLang, t } = useI18n();
  const currentLang = language || globalLang;

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

  const modalHeading = gameName || title || t('howToPlay') || getUIString('howToPlay', currentLang);
  const modalTip = tip || t('tipRelax') || getUIString('tipRelax', currentLang);
  const speechText = voiceText || `${modalHeading}. ${steps.join('. ')}. ${modalTip}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}
    >
      <div 
        className="relative w-full max-w-xl rounded-card p-6 sm:p-8 shadow-flat border-2 space-y-6"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)' }}
      >
        {/* Cultural Header Badge */}
        {culturalTag && (
          <div 
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-pill text-xs font-bold tracking-wide uppercase border"
            style={{ backgroundColor: 'var(--color-bamboo-light)', color: 'var(--color-bamboo)', borderColor: 'var(--color-bamboo)' }}
          >
            <span>{culturalTag}</span>
          </div>
        )}

        {/* Game Title & Prompt */}
        <div>
          <h2 id="modal-title" className="text-2xl font-bold leading-tight" style={{ color: 'var(--ink-primary)' }}>
            {modalHeading}
          </h2>
          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--ink-secondary)' }}>
              {t('howToPlay')}:
            </p>
            <SpeakButton
              text={speechText}
              language={currentLang}
              label={t('audioHelp')}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3.5 p-4 rounded-btn border"
              style={{ backgroundColor: 'var(--surface-page)', borderColor: 'var(--border-hairline)' }}
            >
              <div 
                className="flex-shrink-0 w-9 h-9 rounded-btn font-bold text-base flex items-center justify-center shadow-flat"
                style={{ backgroundColor: 'var(--color-muga)', color: 'var(--ink-primary)' }}
              >
                {idx + 1}
              </div>
              <div className="text-base sm:text-lg font-semibold leading-snug pt-1" style={{ color: 'var(--ink-primary)' }}>
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* Reassuring Tip */}
        <div 
          className="flex items-center space-x-3 p-3.5 rounded-btn border text-sm font-medium"
          style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}
        >
          <Sparkles size={20} color="var(--color-muga-dark)" className="shrink-0" />
          <span>{modalTip}</span>
        </div>

        {/* Actions: Back to Hub & Big Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {(onBackToHub || onExit || onClose) && (
            <button
              type="button"
              onClick={() => {
                sounds.playGentleTap();
                if (onBackToHub) onBackToHub();
                else if (onExit) onExit();
                else if (onClose) onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-btn text-sm font-bold border border-slate-300 shadow-flat transition cursor-pointer"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}
              aria-label={onBackToHub || onExit ? '← Exit to Hub' : (t('returnToHome') || 'Return to Home')}
            >
              <span>←</span>
              <span>{onBackToHub || onExit ? 'Exit to Hub' : (t('returnToHome') || 'Return to Home')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:flex-1 min-h-[52px] px-6 py-3 rounded-btn font-bold text-lg shadow-flat active:scale-95 transition-transform flex items-center justify-center space-x-3 cursor-pointer border-2"
            style={{ 
              backgroundColor: 'var(--color-muga)', 
              color: 'var(--ink-primary)',
              borderColor: 'var(--color-muga-dark)'
            }}
          >
            <span>{t('startPlaying')}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
