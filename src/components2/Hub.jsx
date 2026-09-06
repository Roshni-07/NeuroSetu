import React, { useState, useEffect } from 'react';
import { getAllProgress } from '../utils/storage.js';
import { sounds } from '../utils/soundEffects.js';

export const CATEGORIES = [
  { id: 'Memory', title: 'Memory', titleAs: 'স্মৃতি অনুশীলন', icon: '🧠', color: 'from-teal-500 to-teal-600' },
  { id: 'Attention', title: 'Attention', titleAs: 'মনোযোগ আৰু দৃষ্টি', icon: '👁️', color: 'from-teal-600 to-teal-700' },
  { id: 'Reasoning/Executive Function', title: 'Reasoning & Executive Function', titleAs: 'যুক্তি আৰু সিদ্ধান্ত', icon: '💡', color: 'from-emerald-600 to-emerald-700' },
  { id: 'Visual Reasoning', title: 'Visual Reasoning', titleAs: 'দৃশ্যমান বিশ্লেষণ', icon: '🎨', color: 'from-rose-600 to-rose-700' },
  { id: 'Emotional Cognition', title: 'Emotional Cognition', titleAs: 'ভাৱ আৰু অনুভূতি', icon: '❤️', color: 'from-indigo-600 to-indigo-700' }
];

/**
 * Hub - Main Game Suite Navigation Screen
 *
 * Displays all 15 games grouped by the 5 cognitive categories.
 * Games with a component are playable; games with component=null are marked "Coming Soon".
 * Displays completion badges and best scores from localStorage.
 */
export default function Hub({
  games = [],
  onSelectGame,
  onOpenSettings
}) {
  const [progress, setProgress] = useState({});

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
      {/* Top Heritage Banner */}
      <header className="bg-gradient-to-r from-white via-teal-50 to-slate-100 text-slate-900 shadow-lg px-4 py-8 sm:py-10 border-b-4 border-teal-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-sm font-bold uppercase tracking-wider mb-2">
              <span>🌾</span>
              <span>North-East India Cultural Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              NeuroSetu Cognitive Hub
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Gentle, elder-friendly mind exercises inspired by Assam tea gardens, Bihu festivals, handloom weaves & village memories.
            </p>
          </div>

          {/* Activity Badge */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-2 border-teal-200 rounded-2xl p-4 sm:p-5 text-center min-w-[200px]">
            <div className="text-sm font-bold uppercase tracking-wider text-teal-700">
              Exercises Done
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              {completedCount} <span className="text-xl font-normal text-teal-700">/ 15</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 font-medium">
              Active Games Played
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-12">
        {CATEGORIES.map((category) => {
          const categoryGames = getCategoryGames(category.id);
          if (categoryGames.length === 0) return null;

          return (
            <section key={category.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center space-x-3 pb-2 border-b-2 border-slate-200">
                <span className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                  {category.icon}
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {category.title}
                  </h2>
                  <span className="text-base text-slate-500 font-semibold">
                    {category.titleAs}
                  </span>
                </div>
              </div>

              {/* Game Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryGames.map((game) => {
                  const isLocked = !game.component;
                  const gameProgress = progress[game.id];
                  const isCompleted = gameProgress?.completed;

                  return (
                    <div
                      key={game.id}
                      onClick={() => {
                        if (!isLocked) {
                          sounds.playGentleTap();
                          onSelectGame(game);
                        }
                      }}
                      className={`relative flex flex-col justify-between p-5 rounded-3xl border-3 transition-all duration-200 min-h-[160px] ${
                        isLocked
                          ? 'bg-slate-100/80 border-slate-300 opacity-75 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:border-teal-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-[0.98]'
                      }`}
                      role={isLocked ? 'presentation' : 'button'}
                      tabIndex={isLocked ? -1 : 0}
                      aria-label={`${game.name}${isLocked ? ' (Coming Soon)' : ''}`}
                    >
                      {/* Top Row: Icon & Status Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                            isLocked
                              ? 'bg-slate-200 text-slate-400'
                              : 'bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          {game.icon}
                        </div>

                        {/* Badges */}
                        {isLocked ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-600 border border-slate-300">
                            <span>🔒</span>
                            <span>Soon</span>
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
                            <span>✓</span>
                            <span>Best: {gameProgress.bestScore} pts</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                            <span>▶ Ready</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                          {game.name}
                        </h3>
                        {game.subtitle && (
                          <p className="text-base text-slate-600 mt-1 font-medium leading-normal">
                            {game.subtitle}
                          </p>
                        )}
                        {game.culturalTag && (
                          <span className="inline-block mt-2 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/60">
                            🌿 {game.culturalTag}
                          </span>
                        )}
                      </div>

                      {/* Action Hint */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-base font-bold">
                        {isLocked ? (
                          <span className="text-slate-400 text-sm italic">
                            Coming in Phase 2
                          </span>
                        ) : (
                          <>
                            <span className="text-teal-700 group-hover:text-teal-800">
                              {isCompleted ? 'Play again' : 'Tap to play'}
                            </span>
                            <span className="text-teal-700 text-xl">➔</span>
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
      </main>
    </div>
  );
}
