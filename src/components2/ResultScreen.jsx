import React, { useEffect } from 'react';
import { sounds } from '../utils/soundEffects.js';
import { getUIString } from '../data/gamesLocalization.js';

/**
 * ResultScreen - Warm, gentle completion screen
 * 
 * Never punitive:
 * - "Well done!" / "বৰ ভাল হ'ল!" / "बहुत बढ़िया!"
 * - Celebratory star awards and gentle metrics
 * - Large 56px+ tap buttons to replay or return to hub
 */
export default function ResultScreen({
  gameName = '',
  score = 100,
  maxScore = 100,
  accuracy = 100,
  stars = 3,
  language = 'en',
  onPlayAgain,
  onBackToHub,
  message = '',
  subtext = ''
}) {
  useEffect(() => {
    sounds.playSuccessChime();
  }, []);

  const getStarCount = () => {
    if (accuracy >= 80) return 3;
    if (accuracy >= 50) return 2;
    return 1;
  };

  const currentStars = stars || getStarCount();
  const celebrationTitle = getUIString('wellDone', language);
  const defaultMessage = message || 'Exercising your mind helps keep it vibrant.';

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-10 max-w-xl mx-auto my-6 bg-white border-4 border-teal-200 rounded-3xl shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
      {/* Gentle Celebration Icon */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-200 to-teal-400 rounded-full flex items-center justify-center text-5xl mb-4 shadow-md">
        🌸
      </div>

      {/* Gentle Title */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
        {celebrationTitle}
      </h2>
      <p className="text-xl font-semibold text-teal-800 mt-1">
        {gameName}
      </p>

      {/* Stars Display */}
      <div className="flex justify-center items-center space-x-2 my-5" aria-label={`${currentStars} out of 3 stars`}>
        {[1, 2, 3].map((star) => (
          <span
            key={star}
            className={`text-4xl sm:text-5xl transition-all transform ${
              star <= currentStars ? 'scale-110 text-teal-400 drop-shadow' : 'text-slate-200'
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Encouraging Message */}
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-200 text-slate-800 text-lg sm:text-xl font-medium mb-6 leading-relaxed">
        <p>{defaultMessage}</p>
        {subtext && <p className="text-base text-slate-600 mt-2 font-normal">{subtext}</p>}
      </div>

      {/* Score Summary Badge */}
      <div className="flex items-center justify-center space-x-6 py-3 px-6 bg-slate-50 rounded-2xl border border-slate-200 mb-8">
        <div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {getUIString('score', language)}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">{score} pts</div>
        </div>
        {accuracy !== undefined && (
          <>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {getUIString('accuracy', language)}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">{accuracy}%</div>
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
          className="flex-1 min-h-[56px] px-6 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-2xl font-bold text-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>🔄</span>
          <span>{getUIString('playAgain', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playGentleTap();
            onBackToHub();
          }}
          className="flex-1 min-h-[56px] px-6 py-3.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl font-bold text-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <span>🏠</span>
          <span>{getUIString('gamesHub', language)}</span>
        </button>
      </div>
    </div>
  );
}
