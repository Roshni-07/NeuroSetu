import React, { useState, useMemo, useEffect } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MovingTargetLoop from '../shared/MovingTargetLoop.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 9 — Tea Garden Detective (Attention)
 * Uses MovingTargetLoop to animate items along a tea garden path.
 * Player taps only when the target fresh leaf appears; scored on accuracy + false taps.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Rounds scale from 4 to 12
 * - Presentation itemDuration scales from 3500ms down to 2000ms
 * - Decoy count scales from 2 to 4
 */
const ALL_DECOYS = [
  { icon: '🍂', label: 'Dry Leaf', similarity: 'low' },
  { icon: '🪨', label: 'River Stone', similarity: 'low' },
  { icon: '🐛', label: 'Garden Bug', similarity: 'medium' },
  { icon: '🌾', label: 'Grass Stem', similarity: 'high' }
];

export default function TeaGardenDetective({
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
    return getDifficultyParams('tea-garden-detective', currentLevel);
  }, [currentLevel]);

  const activeDecoys = useMemo(() => {
    const count = Math.min(ALL_DECOYS.length, Math.max(2, difficultyParams.distractorCount || 2));
    return ALL_DECOYS.slice(0, count);
  }, [difficultyParams.distractorCount]);

  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);

  const instructions = `You are walking through Assam's lush tea garden. A worker passes by carrying items — some are fresh tea leaves 🍃, some are other things.

TAP only when you see the 🍃 Fresh Tea Leaf.
Do NOT tap for anything else!

Take your time — watch each item carefully.`;

  const handleComplete = (res) => {
    const enriched = {
      ...res,
      level: currentLevel,
      difficultyParams
    };
    setResult(enriched);
    if (onComplete) onComplete(enriched);
  };

  const handleRetry = () => {
    setResult(null);
    setGameKey(k => k + 1);
  };

  return (
    <GameWrapper
      title="Tea Garden Detective"
      emoji="🌿"
      category="Attention"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
      onBack={onExit}
    >
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

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {difficultyParams.itemCount} Items • {(difficultyParams.previewTimeMs / 1000).toFixed(1)}s Pace • {activeDecoys.length} Decoys
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Background scene header */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white px-5 py-3 mb-4 flex items-center gap-3 shadow">
        <span className="text-3xl">☕</span>
        <div>
          <p className="font-extrabold text-lg">Assam Tea Garden</p>
          <p className="text-sm opacity-80">Watch for fresh leaves carefully!</p>
        </div>
      </div>

      <MovingTargetLoop
        key={gameKey}
        targetIcon="🍃"
        targetLabel="Fresh Tea Leaf"
        decoys={activeDecoys}
        rounds={difficultyParams.itemCount}
        itemDuration={difficultyParams.previewTimeMs}
        onComplete={handleComplete}
        language={language}
      />
    </GameWrapper>
  );
}

