import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects.js';

const DIFFERENCES = [
  {
    id: 'diff_bird',
    name: 'Hornbill Bird in Sky',
    nameAs: 'আকাশৰ ধনেশ পক্ষী',
    sceneAIcon: '🦤',
    sceneBIcon: '☁️',
    description: 'Flying Hornbill in Scene A vs White Cloud in Scene B'
  },
  {
    id: 'diff_flower',
    name: 'Tea Bush Blossom',
    nameAs: 'চাহ গছৰ ফুল',
    sceneAIcon: '🌸',
    sceneBIcon: '🌺',
    description: 'Pink flower in Scene A vs Red Hibiscus in Scene B'
  },
  {
    id: 'diff_steam',
    name: 'Kettle Warm Steam',
    nameAs: 'চাহ কেটলীৰ ভাপ',
    sceneAIcon: '♨️',
    sceneBIcon: '⚪',
    description: 'Hot steam rising in Scene A vs Cold kettle in Scene B'
  },
  {
    id: 'diff_pet',
    name: 'Homestead Companion',
    nameAs: 'চোতালৰ জীৱ-জন্তু',
    sceneAIcon: '🐈',
    sceneBIcon: '🐕',
    description: 'Sleeping Cat in Scene A vs Little Puppy in Scene B'
  }
];

export default function FindTheDifference({ onComplete, onExit }) {
  const [foundIds, setFoundIds] = useState([]);

  const handleSpotClick = (diffId) => {
    if (foundIds.includes(diffId)) return;

    sounds.playMatchChime();
    const nextFound = [...foundIds, diffId];
    setFoundIds(nextFound);

    if (nextFound.length === DIFFERENCES.length) {
      setTimeout(() => {
        sounds.playSuccessChime();
        onComplete({
          score: 100,
          maxScore: 100,
          accuracy: 100,
          message: 'Sharp attention! You noticed all 4 tea garden village differences.',
          subtext: 'Visual attention exercises help preserve perceptive clarity.'
        });
      }, 700);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        </div>
      )}

      {/* Top Status Header */}
      <div className="p-5 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-full">
            Visual Attention Exercise
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Tea Garden Village Differences
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            Found {foundIds.length} of {DIFFERENCES.length} differences • Tap any differing spot on either scene!
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-white px-3 py-2 rounded-xl border border-teal-200 shadow-xs">
          {DIFFERENCES.map((d) => (
            <span
              key={d.id}
              className={`text-2xl transition-all ${
                foundIds.includes(d.id) ? 'text-amber-500 scale-110 font-bold' : 'text-slate-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Side-by-Side Visual Scenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scene A (Original) */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-teal-300 shadow-sm flex flex-col justify-between min-h-[320px] transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Scene 1 (Original)
            </span>
            <span className="text-2xl" title="Sun">☀️</span>
          </div>

          {/* Interactive Spot 1: Bird */}
          <div className="flex justify-between items-start px-2">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_bird')}
              className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                foundIds.includes('diff_bird')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Bird in sky"
              aria-label="Spot difference: Bird in sky"
            >
              <span className="text-4xl">🦤</span>
            </button>
            <span className="text-3xl opacity-75">⛰️</span>
          </div>

          {/* Cottage & Kettle with Steam */}
          <div className="flex items-center justify-around my-3">
            <span className="text-5xl">🏡</span>
            <button
              type="button"
              onClick={() => handleSpotClick('diff_steam')}
              className={`min-h-[52px] min-w-[52px] flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_steam')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Kettle steam"
              aria-label="Spot difference: Kettle steam"
            >
              <span className="text-xl">♨️</span>
              <span className="text-3xl">🫖</span>
            </button>
          </div>

          {/* Tea Bush with Flower & Sleeping Cat */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_flower')}
              className={`min-h-[52px] min-w-[52px] flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_flower')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Tea bush flower"
              aria-label="Spot difference: Tea bush flower"
            >
              <span className="text-3xl">🌿</span>
              <span className="text-3xl">🌸</span>
            </button>

            <button
              type="button"
              onClick={() => handleSpotClick('diff_pet')}
              className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                foundIds.includes('diff_pet')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Sleeping cat"
              aria-label="Spot difference: Sleeping cat"
            >
              <span className="text-4xl">🐈</span>
            </button>
          </div>
        </div>

        {/* Scene B (Altered) */}
        <div className="p-5 rounded-3xl bg-white border-2 border-teal-300 shadow-sm flex flex-col justify-between min-h-[320px] transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-teal-100">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Scene 2 (Spot Differences)
            </span>
            <span className="text-2xl" title="Sun">☀️</span>
          </div>

          {/* Interactive Spot 1: Cloud instead of Bird */}
          <div className="flex justify-between items-start px-2">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_bird')}
              className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                foundIds.includes('diff_bird')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Cloud instead of bird"
              aria-label="Spot difference: Cloud instead of bird"
            >
              <span className="text-4xl">☁️</span>
            </button>
            <span className="text-3xl opacity-75">⛰️</span>
          </div>

          {/* Cottage & Kettle WITHOUT steam */}
          <div className="flex items-center justify-around my-3">
            <span className="text-5xl">🏡</span>
            <button
              type="button"
              onClick={() => handleSpotClick('diff_steam')}
              className={`min-h-[52px] min-w-[52px] flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_steam')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: No steam"
              aria-label="Spot difference: No steam"
            >
              <span className="text-xl opacity-0">♨️</span>
              <span className="text-3xl">🫖</span>
            </button>
          </div>

          {/* Tea Bush with Red Hibiscus & Puppy */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-teal-100">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_flower')}
              className={`min-h-[52px] min-w-[52px] flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_flower')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Red hibiscus"
              aria-label="Spot difference: Red hibiscus"
            >
              <span className="text-3xl">🌿</span>
              <span className="text-3xl">🌺</span>
            </button>

            <button
              type="button"
              onClick={() => handleSpotClick('diff_pet')}
              className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                foundIds.includes('diff_pet')
                  ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                  : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-600'
              }`}
              title="Spot difference: Playful puppy"
              aria-label="Spot difference: Playful puppy"
            >
              <span className="text-4xl">🐕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Check List for Motor/Vision Ease */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="text-lg font-bold text-slate-900">
          Discovered Clues ({foundIds.length} of {DIFFERENCES.length} found):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIFFERENCES.map((diff) => {
            const isFound = foundIds.includes(diff.id);
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => handleSpotClick(diff.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all min-h-[52px] cursor-pointer ${
                  isFound
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-500 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {isFound ? diff.sceneBIcon : '❓'}
                  </span>
                  <div>
                    <div className="text-base sm:text-lg leading-tight">
                      {diff.name}
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      {isFound ? diff.description : diff.nameAs}
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold">
                  {isFound ? '✓' : 'Tap'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
