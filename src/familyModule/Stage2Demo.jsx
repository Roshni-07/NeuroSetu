import React, { useState } from 'react';
import IdentityRecallGame from './games/identityRecall/IdentityRecallGame';
import CategorySortingGame from './games/categorySorting/CategorySortingGame';

const Stage2Demo = () => {
  const [activeGame, setActiveGame] = useState('menu');

  if (activeGame === 'identity') {
    return <IdentityRecallGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  if (activeGame === 'category') {
    return <CategorySortingGame onBackToMenu={() => setActiveGame('menu')} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-patient-canvas">
      {/* Header matching NeuroSetu Cultural Suite styling */}
      <div className="bg-patient-surface rounded-3xl p-6 sm:p-8 shadow-soft border border-patient-border mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-patient-accent bg-patient-accent-light px-3 py-1 rounded-full">
            🌾 North-East India Cultural Suite • Phase 3
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-patient-primary mb-3">
          Family & Identity Games
        </h1>
        <p className="text-patient-secondary text-base sm:text-lg max-w-2xl">
          Gentle, elder-friendly cognitive games grounded in personal family photos, relations, and lifelong memories.
        </p>
      </div>

      {/* Game Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Game 1 */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-patient-accent shadow-soft transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-patient-accent-light flex items-center justify-center text-3xl mb-4">
              🖼️
            </div>
            <span className="text-xs font-bold text-patient-accent uppercase tracking-wider">
              Game 1
            </span>
            <h3 className="text-2xl font-bold text-patient-primary mt-1 mb-2">
              Identity & Recall
            </h3>
            <p className="text-patient-secondary text-sm leading-relaxed mb-6">
              Recognize family members through progressive photo reveals, multiple choice options, and affectionate story clues.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('identity')}
            className="w-full py-3.5 bg-patient-accent hover:bg-patient-accent-hover text-white font-bold rounded-xl text-base min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play Game 1</span>
            <span>→</span>
          </button>
        </div>

        {/* Game 2 */}
        <div className="bg-patient-surface rounded-3xl p-6 border-2 border-patient-border hover:border-patient-accent shadow-soft transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-patient-teal-light flex items-center justify-center text-3xl mb-4">
              🧺
            </div>
            <span className="text-xs font-bold text-patient-teal uppercase tracking-wider">
              Game 2
            </span>
            <h3 className="text-2xl font-bold text-patient-primary mt-1 mb-2">
              Category Sorting
            </h3>
            <p className="text-patient-secondary text-sm leading-relaxed mb-6">
              Group family members and lifelong friends into their social circles with drag-and-drop or simple elder-friendly tap-to-place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveGame('category')}
            className="w-full py-3.5 bg-patient-teal hover:opacity-90 text-white font-bold rounded-xl text-base min-h-touch shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Play Game 2</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage2Demo;

