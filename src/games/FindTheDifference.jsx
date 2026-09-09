import React, { useState, useMemo, useEffect } from 'react';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 11 — Find the Difference (Visual Attention)
 * Expanded to 8 regional differences across Assam tea garden village life.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Differences to find scale from 2 (Level 1) up to 8 (Level 10)
 * - Pacing & hint assistance adjusts smoothly
 * - Full telemetry & completion contract preserved
 */
const ALL_DIFFERENCES = [
  {
    id: 'diff_bird',
    name: 'Hornbill Bird in Sky',
    nameAs: 'আকাশৰ ধনেশ পক্ষী',
    sceneAIcon: '🦤',
    sceneBIcon: '☁️',
    description: 'Flying Hornbill in Scene 1 vs White Cloud in Scene 2'
  },
  {
    id: 'diff_flower',
    name: 'Tea Bush Blossom',
    nameAs: 'চাহ গছৰ ফুল',
    sceneAIcon: '🌸',
    sceneBIcon: '🌺',
    description: 'Pink flower in Scene 1 vs Red Hibiscus in Scene 2'
  },
  {
    id: 'diff_steam',
    name: 'Kettle Warm Steam',
    nameAs: 'চাহ কেটলীৰ ভাপ',
    sceneAIcon: '♨️',
    sceneBIcon: '⚪',
    description: 'Hot steam in Scene 1 vs Cold kettle in Scene 2'
  },
  {
    id: 'diff_pet',
    name: 'Homestead Companion',
    nameAs: 'চোতালৰ জীৱ-জন্তু',
    sceneAIcon: '🐈',
    sceneBIcon: '🐕',
    description: 'Sleeping Cat in Scene 1 vs Playful Puppy in Scene 2'
  },
  {
    id: 'diff_hat',
    name: 'Worker Jaapi Hat',
    nameAs: 'অসমীয়া জাপি',
    sceneAIcon: '👒',
    sceneBIcon: '🧢',
    description: 'Traditional woven Jaapi in Scene 1 vs Modern Cap in Scene 2'
  },
  {
    id: 'diff_basket',
    name: 'Tea Plucking Basket',
    nameAs: 'চাহ তোলা পাচি',
    sceneAIcon: '🧺',
    sceneBIcon: '🎒',
    description: 'Bamboo Basket in Scene 1 vs Canvas Bag in Scene 2'
  },
  {
    id: 'diff_river',
    name: 'River Boat on Water',
    nameAs: 'নৈৰ নাও',
    sceneAIcon: '🛶',
    sceneBIcon: '🐟',
    description: 'Wooden Boat in Scene 1 vs Swimming Fish in Scene 2'
  },
  {
    id: 'diff_tree',
    name: 'Shade Tree Fruit',
    nameAs: 'ছাঁ গছৰ ফল',
    sceneAIcon: '🥭',
    sceneBIcon: '🍃',
    description: 'Ripe Mango in Scene 1 vs Green Foliage in Scene 2'
  }
];

export default function FindTheDifference({
  onComplete,
  onExit,
  language = 'en',
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  onLevelChange = null
}) {
  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (level && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    const legacyTier = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'critical' ? 1 : patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : null);
    if (legacyTier) {
      const t = Number(legacyTier);
      if (t === 1) return 1;
      if (t === 3) return 10;
      return 5;
    }
    return 5;
  }, [level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('find-the-difference', currentLevel);
  }, [currentLevel]);

  const hasConfig = level !== null || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Scaled difference count: 2 differences at L1, up to 8 differences at L10. Defaults to 4 for unconfigured mounts.
  const activeCount = hasConfig
    ? Math.max(2, Math.min(ALL_DIFFERENCES.length, difficultyParams.itemCount || 3))
    : 4;
  const activeDifferences = useMemo(() => {
    return ALL_DIFFERENCES.slice(0, activeCount);
  }, [activeCount]);

  const [foundIds, setFoundIds] = useState([]);

  const handleSpotClick = (diffId) => {
    if (foundIds.includes(diffId)) return;
    if (!activeDifferences.some(d => d.id === diffId)) return;

    sounds.playMatchChime();
    const nextFound = [...foundIds, diffId];
    setFoundIds(nextFound);

    if (nextFound.length === activeDifferences.length) {
      setTimeout(() => {
        sounds.playSuccessChime();
        const res = {
          score: 100,
          maxScore: 100,
          accuracy: 100,
          message: `Sharp attention! You noticed all ${activeDifferences.length} differences in the village scene.`,
          subtext: `Visual attention exercise completed at Level ${currentLevel}.`,
          level: currentLevel,
          difficultyParams
        };
        if (onComplete) onComplete(res);
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

      {/* Adaptive Level Header */}
      <div className="p-5 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-teal-700 px-2.5 py-0.5 rounded-full">
              Level {currentLevel}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-full">
              Visual Attention
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Tea Garden Village Differences
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            Found {foundIds.length} of {activeDifferences.length} differences • Tap any differing spot on either scene!
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-white px-3 py-2 rounded-xl border border-teal-200 shadow-xs">
          {activeDifferences.map((d) => (
            <span
              key={d.id}
              className={`text-xl sm:text-2xl transition-all ${
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
        {/* Scene 1 (Original) */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-teal-300 shadow-sm flex flex-col justify-between min-h-[360px] transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Scene 1 (Original)
            </span>
            <span className="text-2xl" title="Sun">☀️</span>
          </div>

          {/* Sky Layer: Bird & Tree */}
          <div className="flex justify-between items-start px-2">
            {activeDifferences.some(d => d.id === 'diff_bird') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_bird')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_bird')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Hornbill"
                aria-label="Spot difference: Hornbill"
              >
                <span className="text-4xl">🦤</span>
              </button>
            ) : (
              <span className="text-4xl opacity-80">🦤</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_tree') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_tree')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_tree')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Ripe mango"
                aria-label="Spot difference: Ripe mango"
              >
                <span className="text-3xl">🥭</span>
              </button>
            ) : (
              <span className="text-3xl opacity-75">⛰️</span>
            )}
          </div>

          {/* Cottage & Worker with Hat & Steam */}
          <div className="flex items-center justify-around my-3">
            <span className="text-5xl">🏡</span>
            {activeDifferences.some(d => d.id === 'diff_hat') && (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_hat')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_hat')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Jaapi hat"
                aria-label="Spot difference: Jaapi hat"
              >
                <span className="text-3xl">👒</span>
              </button>
            )}

            {activeDifferences.some(d => d.id === 'diff_steam') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_steam')}
                className={`min-h-[52px] min-w-[52px] flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                  foundIds.includes('diff_steam')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Kettle steam"
                aria-label="Spot difference: Kettle steam"
              >
                <span className="text-xl">♨️</span>
                <span className="text-3xl">🫖</span>
              </button>
            ) : (
              <span className="text-3xl">🫖</span>
            )}
          </div>

          {/* River & Boat layer */}
          <div className="flex items-center justify-between px-2 py-1">
            {activeDifferences.some(d => d.id === 'diff_river') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_river')}
                className={`min-h-[48px] min-w-[48px] p-1.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_river')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: River boat"
                aria-label="Spot difference: River boat"
              >
                <span className="text-3xl">🛶</span>
              </button>
            ) : (
              <span className="text-2xl opacity-60">🌊</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_basket') && (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_basket')}
                className={`min-h-[48px] min-w-[48px] p-1.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_basket')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Plucking basket"
                aria-label="Spot difference: Plucking basket"
              >
                <span className="text-3xl">🧺</span>
              </button>
            )}
          </div>

          {/* Ground Layer: Blossom & Pet */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-slate-100">
            {activeDifferences.some(d => d.id === 'diff_flower') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_flower')}
                className={`min-h-[52px] min-w-[52px] flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                  foundIds.includes('diff_flower')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Tea blossom"
                aria-label="Spot difference: Tea blossom"
              >
                <span className="text-3xl">🌿</span>
                <span className="text-3xl">🌸</span>
              </button>
            ) : (
              <span className="text-3xl">🌿</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_pet') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_pet')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_pet')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Sleeping cat"
                aria-label="Spot difference: Sleeping cat"
              >
                <span className="text-4xl">🐈</span>
              </button>
            ) : (
              <span className="text-3xl opacity-60">🌾</span>
            )}
          </div>
        </div>

        {/* Scene 2 (Altered) */}
        <div className="p-5 rounded-3xl bg-white border-2 border-teal-300 shadow-sm flex flex-col justify-between min-h-[360px] transition-colors">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-teal-100">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Scene 2 (Spot Differences)
            </span>
            <span className="text-2xl" title="Sun">☀️</span>
          </div>

          {/* Sky Layer: Cloud & Leaves */}
          <div className="flex justify-between items-start px-2">
            {activeDifferences.some(d => d.id === 'diff_bird') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_bird')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_bird')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: White cloud"
                aria-label="Spot difference: White cloud"
              >
                <span className="text-4xl">☁️</span>
              </button>
            ) : (
              <span className="text-4xl opacity-80">🦤</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_tree') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_tree')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_tree')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Green leaf"
                aria-label="Spot difference: Green leaf"
              >
                <span className="text-3xl">🍃</span>
              </button>
            ) : (
              <span className="text-3xl opacity-75">⛰️</span>
            )}
          </div>

          {/* Cottage & Worker with Cap & No Steam */}
          <div className="flex items-center justify-around my-3">
            <span className="text-5xl">🏡</span>
            {activeDifferences.some(d => d.id === 'diff_hat') && (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_hat')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_hat')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Cap"
                aria-label="Spot difference: Cap"
              >
                <span className="text-3xl">🧢</span>
              </button>
            )}

            {activeDifferences.some(d => d.id === 'diff_steam') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_steam')}
                className={`min-h-[52px] min-w-[52px] flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer ${
                  foundIds.includes('diff_steam')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: No steam"
                aria-label="Spot difference: No steam"
              >
                <span className="text-xl opacity-0">♨️</span>
                <span className="text-3xl">🫖</span>
              </button>
            ) : (
              <span className="text-3xl">🫖</span>
            )}
          </div>

          {/* River & Fish layer */}
          <div className="flex items-center justify-between px-2 py-1">
            {activeDifferences.some(d => d.id === 'diff_river') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_river')}
                className={`min-h-[48px] min-w-[48px] p-1.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_river')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Swimming fish"
                aria-label="Spot difference: Swimming fish"
              >
                <span className="text-3xl">🐟</span>
              </button>
            ) : (
              <span className="text-2xl opacity-60">🌊</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_basket') && (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_basket')}
                className={`min-h-[48px] min-w-[48px] p-1.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_basket')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Canvas bag"
                aria-label="Spot difference: Canvas bag"
              >
                <span className="text-3xl">🎒</span>
              </button>
            )}
          </div>

          {/* Ground Layer: Hibiscus & Puppy */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-teal-100">
            {activeDifferences.some(d => d.id === 'diff_flower') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_flower')}
                className={`min-h-[52px] min-w-[52px] flex items-center space-x-1 p-2 rounded-2xl transition-all cursor-pointer ${
                  foundIds.includes('diff_flower')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Red hibiscus"
                aria-label="Spot difference: Red hibiscus"
              >
                <span className="text-3xl">🌿</span>
                <span className="text-3xl">🌺</span>
              </button>
            ) : (
              <span className="text-3xl">🌿</span>
            )}

            {activeDifferences.some(d => d.id === 'diff_pet') ? (
              <button
                type="button"
                onClick={() => handleSpotClick('diff_pet')}
                className={`min-h-[52px] min-w-[52px] p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  foundIds.includes('diff_pet')
                    ? 'bg-emerald-100 border-2 border-emerald-500 ring-2 ring-emerald-300 scale-105'
                    : 'bg-slate-50 hover:bg-teal-50 border-2 border-dashed border-slate-200 hover:border-teal-300'
                }`}
                title="Spot difference: Playful puppy"
                aria-label="Spot difference: Playful puppy"
              >
                <span className="text-4xl">🐕</span>
              </button>
            ) : (
              <span className="text-3xl opacity-60">🌾</span>
            )}
          </div>
        </div>
      </div>

      {/* Accessible Check List */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <h4 className="text-lg font-bold text-slate-900">
          Discovered Clues ({foundIds.length} of {activeDifferences.length} found):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeDifferences.map((diff) => {
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

