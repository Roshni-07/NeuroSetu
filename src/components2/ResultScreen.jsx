import React, { useEffect } from 'react';
import { Sparkles, RotateCcw, Home, Star } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';
import { getUIString } from '../data/gamesLocalization.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function ResultScreen({
  gameName = '',
  score = 100,
  maxScore = 100,
  accuracy = 100,
  stars = 3,
  language = null,
  onPlayAgain,
  onBackToHub,
  message = '',
  subtext = ''
}) {
  const { language: globalLang, t } = useI18n();
  const currentLang = language || globalLang;

  useEffect(() => {
    sounds.playSuccessChime();
  }, []);

  const getStarCount = () => {
    if (accuracy >= 80) return 3;
    if (accuracy >= 50) return 2;
    return 1;
  };

  const currentStars = stars || getStarCount();
  const celebrationTitle = t('wellDone') || getUIString('wellDone', currentLang);
  const defaultMessage = message || (currentLang === 'as' ? 'মনৰ ব্যায়ামে স্মৃতি সতেজ কৰি ৰাখে।' : 'Exercising your mind helps keep it vibrant.');

  return (
    <div 
      className="flex flex-col items-center justify-center p-6 sm:p-10 max-w-xl mx-auto my-6 rounded-card border-2 shadow-flat text-center"
      style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-hairline)', fontFamily: 'var(--font-sans)', color: 'var(--ink-primary)' }}
    >
      {/* Gentle Celebration Icon */}
      <div 
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 border shadow-flat"
        style={{ backgroundColor: 'var(--color-muga)', color: 'var(--ink-primary)', borderColor: 'var(--color-muga-dark)' }}
      >
        <Sparkles size={40} />
      </div>

      {/* Gentle Title */}
      <h2 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: 'var(--ink-primary)' }}>
        {celebrationTitle}
      </h2>
      <p className="text-xl font-semibold mt-1" style={{ color: 'var(--color-bamboo)' }}>
        {gameName}
      </p>

      {/* Stars Display */}
      <div className="flex justify-center items-center space-x-2 my-5" aria-label={`${currentStars} out of 3 stars`}>
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            size={36}
            className={star <= currentStars ? 'fill-current' : ''}
            style={{ 
              color: star <= currentStars ? 'var(--color-muga)' : 'var(--border-hairline)',
              fill: star <= currentStars ? 'var(--color-muga)' : 'transparent'
            }}
          />
        ))}
      </div>

      {/* Encouraging Message */}
      <div 
        className="p-4 rounded-btn border text-base sm:text-lg font-medium mb-6 leading-relaxed w-full"
        style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)', color: 'var(--ink-secondary)' }}
      >
        <p>{defaultMessage}</p>
        {subtext && <p className="text-sm mt-2 font-normal" style={{ color: 'var(--ink-secondary)' }}>{subtext}</p>}
      </div>

      {/* Score Summary Badge */}
      <div 
        className="flex items-center justify-center space-x-6 py-3 px-6 rounded-btn border mb-8 w-full"
        style={{ backgroundColor: 'var(--surface-page)', borderColor: 'var(--border-hairline)' }}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
            {t('score') || getUIString('score', currentLang)}
          </div>
          <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>{score} pts</div>
        </div>
        {accuracy !== undefined && (
          <>
            <div className="h-8 w-px" style={{ backgroundColor: 'var(--border-hairline)' }} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                {t('accuracy') || getUIString('accuracy', currentLang)}
              </div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-bamboo)' }}>{accuracy}%</div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          onClick={() => {
            sounds.playGentleTap();
            onPlayAgain();
          }}
          className="flex-1 min-h-[56px] px-6 py-3.5 rounded-btn font-bold text-lg shadow-flat transition-transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2 border"
          style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-hairline)', color: 'var(--ink-primary)' }}
        >
          <RotateCcw size={20} />
          <span>{t('playAgain') || getUIString('playAgain', currentLang)}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playGentleTap();
            onBackToHub();
          }}
          className="flex-1 min-h-[56px] px-6 py-3.5 rounded-btn font-bold text-lg shadow-flat transition-transform active:scale-95 cursor-pointer flex items-center justify-center space-x-2 border-2"
          style={{ backgroundColor: 'var(--color-muga)', borderColor: 'var(--color-muga-dark)', color: 'var(--ink-primary)' }}
        >
          <Home size={20} />
          <span>{t('returnToHome') || getUIString('gamesHub', currentLang)}</span>
        </button>
      </div>
    </div>
  );
}
