import React, { useState, useEffect, useMemo } from 'react';
import { getAllProgress } from '../utils/storage.js';
import { sounds } from '../utils/soundEffects.js';
import SpeakButton from './SpeakButton.jsx';
import { SUPPORTED_LANGUAGES } from '../data/multilingualAudioHelp.js';
import {
  getLocalizedGame,
  getCategoryLocalized,
  getUIString,
  getGameVoiceExplanation
} from '../data/gamesLocalization.js';
import { assignDailyGames } from '../engine/dailyAssignmentEngine.js';

export const CATEGORIES = [
  { id: 'Memory', title: 'Memory', titleAs: 'স্মৃতি অনুশীলন', icon: '🧠', color: 'from-teal-500 to-teal-600' },
  { id: 'Attention', title: 'Attention', titleAs: 'মনোযোগ আৰু দৃষ্টি', icon: '👁️', color: 'from-teal-600 to-teal-700' },
  { id: 'Reasoning/Executive Function', title: 'Reasoning & Executive Function', titleAs: 'যুক্তি আৰু সিদ্ধান্ত', icon: '💡', color: 'from-emerald-600 to-emerald-700' },
  { id: 'Visual Reasoning', title: 'Visual Reasoning', titleAs: 'দৃশ্যমান বিশ্লেষণ', icon: '🎨', color: 'from-rose-600 to-rose-700' },
  { id: 'Emotional Cognition', title: 'Emotional Cognition', titleAs: 'ভাৱ আৰু অনুভূতি', icon: '❤️', color: 'from-indigo-600 to-indigo-700' }
];

export const CATEGORY_IDS = CATEGORIES;

/**
 * Hub - Main Game Suite Navigation Screen with Full Multilingual Support & Voice Guides
 *
 * Displays all 15 games grouped by the 5 cognitive categories.
 * Each game card features:
 * - Localized Title, Subtitle, Cultural Tag
 * - One-touch "🔊 Voice Guide" button that speaks how the game works in the selected language
 * - Status badges & Best score
 */
export default function Hub({
  games = [],
  patientProfile = null,
  onSelectGame,
  onOpenSettings = null,
  language = 'en',
  onLanguageChange = null,
  isLoading = false
}) {
  const [progress, setProgress] = useState({});
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const dailyAssignedGames = useMemo(() => {
    return assignDailyGames({
      patientProfile,
      gamesConfig: games,
      date: new Date()
    });
  }, [patientProfile, games]);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const refreshProgress = () => {
    setProgress(getAllProgress());
  };

  useEffect(() => {
    refreshProgress();
    const handleProgressUpdate = () => refreshProgress();
    window.addEventListener('neurosetu:progress-updated', handleProgressUpdate);
    return () => {
      window.removeEventListener('neurosetu:progress-updated', handleProgressUpdate);
    };
  }, []);

  const getCategoryGames = (catId) => {
    return games.filter((g) => g.category === catId);
  };

  // Compute stats
  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 pb-16">
      {/* Top Heritage Banner & Language Selector */}
      <header className="bg-gradient-to-r from-white via-teal-50 to-slate-100 text-slate-900 shadow-lg px-4 py-6 sm:py-8 border-b-4 border-teal-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold uppercase tracking-wider">
                <span>🌾</span>
                <span>North-East India Cultural Suite</span>
              </div>

              {/* Multilingual Selector Dropdown */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  aria-label="Change Language"
                  title="Change Spoken Language"
                  className="min-h-[38px] px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-teal-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>{currentLangObj.icon}</span>
                  <span>{currentLangObj.nativeName}</span>
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {isLangMenuOpen && (
                  <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in max-h-80 overflow-y-auto text-left">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Select Audio & Game Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((langItem) => (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => {
                          setIsLangMenuOpen(false);
                          if (onLanguageChange) onLanguageChange(langItem.code);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
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
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              {getUIString('hubTitle', language)}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
              {getUIString('hubSubtitle', language)}
            </p>
          </div>

          {/* Activity Badge */}
          <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-2 border-teal-200 rounded-2xl p-4 sm:p-5 text-center w-full sm:w-auto min-w-[190px] shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
              {getUIString('exercisesDone', language)}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-900 mt-0.5">
              {completedCount} <span className="text-base font-normal text-teal-700">/ 15</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              {getUIString('activePlayed', language)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-12">
        {isLoading ? (
          <div data-testid="hub-loading" className="space-y-6 animate-pulse">
            <div className="h-32 bg-teal-50 border-2 border-teal-200 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
              ))}
            </div>
          </div>
        ) : (!games || games.length === 0) ? (
          <div data-testid="hub-empty" className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-soft space-y-3">
            <span className="text-4xl block">🎮</span>
            <h2 className="text-lg font-bold text-slate-800">No games found in the suite</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No games are currently loaded. Please ensure the game configuration is active.
            </p>
          </div>
        ) : (
          <>
            {/* Prescribed 5-Domain Daily Cognitive Plan */}
            {dailyAssignedGames.length > 0 && (
              <section className="bg-gradient-to-br from-teal-50/90 via-white to-teal-50/50 border-2 border-teal-300 rounded-3xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700 text-white text-xs font-bold uppercase tracking-wider mb-1">
                  <span>✨</span>
                  <span>Today's Prescribed 5-Domain Plan</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {patientProfile?.name ? `${patientProfile.name}'s Daily Regimen` : "Today's Prescribed Regimen"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Curated daily set covering all 5 cognitive domains, tailored to your starting tier.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 bg-teal-100 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold text-center">
                  <span className="block text-[10px] uppercase text-teal-700 font-semibold">Assigned Tier</span>
                  Tier {dailyAssignedGames[0]?.assignedTier || 1} • {dailyAssignedGames[0]?.tierMetadata?.name || 'Standard'}
                </div>
              </div>
            </div>

            {/* 5 Daily Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {dailyAssignedGames.map((game) => {
                const localizedGame = getLocalizedGame(game, language);
                const gameProgress = progress[game.id];
                const isCompleted = gameProgress?.completed;

                return (
                  <div
                    key={game.id}
                    onClick={() => {
                      sounds.playGentleTap();
                      onSelectGame(game);
                    }}
                    className="p-3 bg-white rounded-2xl border-2 border-teal-200/80 hover:border-teal-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-2xl p-1.5 bg-teal-50 rounded-xl group-hover:scale-110 transition-transform">
                          {game.icon}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {game.category.split('/')[0]}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {localizedGame.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-medium">
                        {game.culturalTag}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {isCompleted ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span>✓</span> Done
                        </span>
                      ) : (
                        <span className="text-teal-700 font-bold group-hover:underline">
                          Play Today ➔
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {CATEGORY_IDS.map((catItem) => {
          const categoryGames = getCategoryGames(catItem.id);
          if (categoryGames.length === 0) return null;

          const catLoc = getCategoryLocalized(catItem.id, language);

          return (
            <section key={catItem.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-slate-200">
                <span className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                  {catItem.icon}
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                    {catLoc.title}
                  </h2>
                  {catLoc.desc && (
                    <span className="text-xs sm:text-sm text-slate-500 font-medium">
                      {catLoc.desc}
                    </span>
                  )}
                </div>
              </div>

              {/* Game Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryGames.map((gameConfig) => {
                  const localizedGame = getLocalizedGame(gameConfig, language);
                  const isLocked = !gameConfig.component;
                  const gameProgress = progress[gameConfig.id];
                  const isCompleted = gameProgress?.completed;
                  const voiceText = getGameVoiceExplanation(gameConfig.id, language);

                  return (
                    <div
                      key={gameConfig.id}
                      onClick={() => {
                        if (!isLocked) {
                          sounds.playGentleTap();
                          onSelectGame(gameConfig);
                        }
                      }}
                      className={`relative flex flex-col justify-between p-5 rounded-3xl border-3 transition-all duration-200 min-h-[170px] ${
                        isLocked
                          ? 'bg-slate-100/80 border-slate-300 opacity-75 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:border-teal-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-[0.98]'
                      }`}
                      role={isLocked ? 'presentation' : 'button'}
                      tabIndex={isLocked ? -1 : 0}
                      aria-label={`${localizedGame.name}${isLocked ? ' (Coming Soon)' : ''}`}
                    >
                      {/* Top Row: Icon, Status Badge, and Dedicated Voice Guide Button */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                            isLocked
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          {localizedGame.icon}
                        </div>

                        {/* Badges + Voice Guide Button */}
                        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Dedicated Voice Guide Button on EVERY Game Card */}
                          <SpeakButton
                            text={voiceText}
                            language={language}
                            label={`${getUIString('voiceGuide', language)}: ${localizedGame.name}`}
                            className="bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 text-xs px-2 py-1 h-8 rounded-xl shadow-xs"
                          />

                          {isLocked ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 border border-slate-300">
                              <span>🔒 Soon</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
                              <span>✓ {gameProgress.bestScore}p</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                              <span>▶</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {localizedGame.name}
                        </h3>
                        {localizedGame.subtitle && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-normal">
                            {localizedGame.subtitle}
                          </p>
                        )}
                        {localizedGame.culturalTag && (
                          <span className="inline-block mt-2 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200/60">
                            🌿 {localizedGame.culturalTag}
                          </span>
                        )}
                      </div>

                      {/* Action Hint */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold">
                        {isLocked ? (
                          <span className="text-slate-400 italic">
                            Phase 2
                          </span>
                        ) : (
                          <>
                            <span className="text-teal-700">
                              {isCompleted ? getUIString('playAgain', language) : getUIString('tapToPlay', language)}
                            </span>
                            <span className="text-teal-700 text-lg">➔</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
          </>
        )}
      </main>
    </div>
  );
}
