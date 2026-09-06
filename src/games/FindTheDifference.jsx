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

export default function FindTheDifference({ onComplete }) {
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
      {/* Top Status Header */}
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tea Garden Village Differences:
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Found {foundIds.length} of {DIFFERENCES.length} differences • Tap any differing spot on either scene!
          </p>
        </div>
        <div className="flex items-center space-x-1">
          {DIFFERENCES.map((d) => (
            <span
              key={d.id}
              className={`text-2xl ${
                foundIds.includes(d.id) ? 'text-emerald-600 scale-110' : 'text-slate-300'
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
        <div className="p-5 rounded-3xl bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-100 border-3 border-teal-600 shadow-md flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-900 bg-teal-100 px-3 py-1 rounded-full">
              Scene 1 (Original)
            </span>
            <span className="text-2xl">☀️</span>
          </div>

          {/* Interactive Spot 1: Bird */}
          <div className="flex justify-between items-start px-4">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_bird')}
              className={`p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_bird')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">🦤</span>
            </button>
            <span className="text-3xl opacity-75">⛰️</span>
          </div>

          {/* Cottage & Kettle with Steam */}
          <div className="flex items-center justify-around my-2">
            <span className="text-5xl">🏡</span>
            <button
              type="button"
              onClick={() => handleSpotClick('diff_steam')}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_steam')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-2xl animate-pulse">♨️</span>
              <span className="text-4xl">🫖</span>
            </button>
          </div>

          {/* Tea Bush with Flower & Sleeping Cat */}
          <div className="flex items-center justify-between px-4 pt-2 border-t border-emerald-200/60">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_flower')}
              className={`flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_flower')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">🌿</span>
              <span className="text-3xl">🌸</span>
            </button>

            <button
              type="button"
              onClick={() => handleSpotClick('diff_pet')}
              className={`p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_pet')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">🐈</span>
            </button>
          </div>
        </div>

        {/* Scene B (Altered) */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-sky-100 via-teal-50 to-emerald-100 border-3 border-teal-500 shadow-md flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-900 bg-teal-200 px-3 py-1 rounded-full">
              Scene 2 (Spot Differences)
            </span>
            <span className="text-2xl">☀️</span>
          </div>

          {/* Interactive Spot 1: Cloud instead of Bird */}
          <div className="flex justify-between items-start px-4">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_bird')}
              className={`p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_bird')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500 scale-110'
                  : 'hover:bg-white/50 animate-bounce'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">☁️</span>
            </button>
            <span className="text-3xl opacity-75">⛰️</span>
          </div>

          {/* Cottage & Kettle WITHOUT steam */}
          <div className="flex items-center justify-around my-2">
            <span className="text-5xl">🏡</span>
            <button
              type="button"
              onClick={() => handleSpotClick('diff_steam')}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_steam')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500 scale-110'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-2xl opacity-0">♨️</span>
              <span className="text-4xl">🫖</span>
            </button>
          </div>

          {/* Tea Bush with Red Hibiscus & Puppy */}
          <div className="flex items-center justify-between px-4 pt-2 border-t border-emerald-200/60">
            <button
              type="button"
              onClick={() => handleSpotClick('diff_flower')}
              className={`flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_flower')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500 scale-110'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">🌿</span>
              <span className="text-3xl">🌺</span>
            </button>

            <button
              type="button"
              onClick={() => handleSpotClick('diff_pet')}
              className={`p-2 rounded-2xl transition-all cursor-pointer ${
                foundIds.includes('diff_pet')
                  ? 'bg-emerald-200 ring-4 ring-emerald-500 scale-110'
                  : 'hover:bg-white/50'
              }`}
              title="Spot difference"
            >
              <span className="text-4xl">🐕</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Check List for Motor/Vision Ease */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <h4 className="text-lg font-bold text-slate-800">
          Discovered Clues:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DIFFERENCES.map((diff) => {
            const isFound = foundIds.includes(diff.id);
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => handleSpotClick(diff.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all min-h-[52px] cursor-pointer ${
                  isFound
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-500 font-medium'
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
