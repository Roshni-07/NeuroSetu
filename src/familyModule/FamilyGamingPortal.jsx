import React, { useState, useEffect } from 'react';
import IdentityRecallGame from './games/identityRecall/IdentityRecallGame';
import CategorySortingGame from './games/categorySorting/CategorySortingGame';
import FamilyTreeBuilderGame from './games/familyTree/FamilyTreeBuilderGame';
import LifeStoryTimelineGame from './games/lifeTimeline/LifeStoryTimelineGame';

/**
 * FamilyGamingPortal
 * The elder-friendly patient hub hosting the 4 Phase 3 Family & Identity Games.
 */
const FamilyGamingPortal = ({ onBackToMainApp, onOpenFamilyAdmin, initialGame = 'menu' }) => {
  // 'menu' | 'identity' | 'category' | 'tree' | 'timeline'
  const [activeGame, setActiveGame] = useState(initialGame || 'menu');

  useEffect(() => {
    if (initialGame) {
      setActiveGame(initialGame);
    }
  }, [initialGame]);

  if (activeGame === 'identity') {
    return <IdentityRecallGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  if (activeGame === 'category') {
    return <CategorySortingGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  if (activeGame === 'tree') {
    return <FamilyTreeBuilderGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  if (activeGame === 'timeline') {
    return <LifeStoryTimelineGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          {onBackToMainApp && (
            <button
              onClick={onBackToMainApp}
              className="text-xs font-bold text-patient-secondary hover:text-patient-primary flex items-center gap-1 mb-2 px-2.5 py-1 rounded-lg bg-patient-canvas border border-patient-border"
            >
              ← Back to NeuroSetu Home
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
              🌾 North-East India Cultural Suite • Phase 3
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-patient-primary mt-1">
            Family & Identity Games
          </h1>
          <p className="text-sm sm:text-base text-patient-secondary mt-1">
            Therapeutic memory exercises rooted in real family photos, relations, and lifelong stories.
          </p>
        </div>

        {onOpenFamilyAdmin && (
          <button
            type="button"
            onClick={onOpenFamilyAdmin}
            className="px-4 py-2.5 bg-patient-canvas hover:bg-patient-border-subtle text-patient-primary border-2 border-patient-border rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all shrink-0"
          >
            <span>⚙️</span>
            <span>Family Data Portal</span>
          </button>
        )}
      </div>

      {/* 4 Featured Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Game 1: Identity & Recall */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-patient-accent shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-3xl border border-teal-100 shadow-xs">
                🖼️
              </div>
            </div>
            <h3 className="text-xl font-bold text-patient-primary mb-2">
              Identity & Recall
            </h3>
            <p className="text-sm text-patient-secondary leading-relaxed mb-6">
              Reveal obscured photos step-by-step and recognize family members with affectionate cultural hints and bio stories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('identity')}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play</span>
            <span>➔</span>
          </button>
        </div>

        {/* Game 2: Category Sorting */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-amber-400 shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl border border-amber-100 shadow-xs">
                🧺
              </div>
            </div>
            <h3 className="text-xl font-bold text-patient-primary mb-2">
              Category Sorting
            </h3>
            <p className="text-sm text-patient-secondary leading-relaxed mb-6">
              Sort loved ones into social groups (Immediate Family, School Friends, Relatives) with drag-and-drop or tap-to-select.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('category')}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-sm min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play</span>
            <span>➔</span>
          </button>
        </div>

        {/* Game 3: Family Tree Builder */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-emerald-400 shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl border border-emerald-100 shadow-xs">
                🌳
              </div>
            </div>
            <h3 className="text-xl font-bold text-patient-primary mb-2">
              Family Tree Builder
            </h3>
            <p className="text-sm text-patient-secondary leading-relaxed mb-6">
              Organize multi-generational tree branches from elders and parents down to children and grandchildren.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('tree')}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play</span>
            <span>➔</span>
          </button>
        </div>

        {/* Game 4: Life Story Timeline */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-indigo-400 shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-3xl border border-indigo-100 shadow-xs">
                📜
              </div>
            </div>
            <h3 className="text-xl font-bold text-patient-primary mb-2">
              Life Story Timeline
            </h3>
            <p className="text-sm text-patient-secondary leading-relaxed mb-6">
              Arrange lifetime milestones into chronological sequence, discovering key dates and family achievements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('timeline')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyGamingPortal;

