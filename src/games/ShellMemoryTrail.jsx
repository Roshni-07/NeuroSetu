import React, { useState, useMemo, useEffect, useRef } from 'react';
import HighlightRecall from '../shared/HighlightRecall.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

const ALL_RIVER_SHELLS = [
  { id: 'shell_1', label: 'Cowrie', icon: '🐚' },
  { id: 'shell_2', label: 'Tea', icon: '🍵' },
  { id: 'shell_3', label: 'Plant', icon: '🪴' },
  { id: 'shell_4', label: 'Flower', icon: '🌹' },
  { id: 'shell_5', label: 'Cow', icon: '🐄' },
  { id: 'shell_6', label: 'River Pebble', icon: '🪨' }
];

export default function ShellMemoryTrail({
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

  const params = useMemo(() => {
    return getDifficultyParams('shell-memory-trail', currentLevel);
  }, [currentLevel]);

  const activeItems = useMemo(() => {
    if (currentLevel <= 3) {
      return [ALL_RIVER_SHELLS[0], ALL_RIVER_SHELLS[2], ALL_RIVER_SHELLS[4]]; // 3 visually distinct items (low distractor similarity)
    }
    if (currentLevel >= 8) {
      return ALL_RIVER_SHELLS; // 6 items
    }
    return ALL_RIVER_SHELLS.slice(0, 5); // 5 items
  }, [currentLevel]);

  const highlightTime = params.previewTimeMs;

  const startTime = useRef(Date.now());
  const [round, setRound] = useState(1); // 3 rounds total
  const [targetId, setTargetId] = useState(() => activeItems[0].id);
  const [roundResults, setRoundResults] = useState([]); // array of booleans
  const [gameVersion, setGameVersion] = useState(0);

  const shuffleCount = useMemo(() => {
    const baseShuffles = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;
    return baseShuffles + (round - 1);
  }, [currentLevel, round]);

  const startNextRound = (isCorrect) => {
    const updatedResults = [...roundResults, isCorrect];
    setRoundResults(updatedResults);

    if (round >= 3) {
      // Completed all 3 rounds
      const correctRounds = updatedResults.filter(Boolean).length;
      const accuracy = Math.round((correctRounds / 3) * 100);
      const score = Math.max(35, correctRounds * 33 + (accuracy === 100 ? 1 : 0));
      const responseTimeMs = Math.max(100, Date.now() - startTime.current);
      const errorCount = Math.max(0, 3 - correctRounds);
      const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

      let message = 'Great visual tracking! Tracking items keeps attention sharp.';
      if (correctRounds === 3) {
        message = 'Sensational! You followed the golden pearl perfectly in every round.';
      } else if (correctRounds >= 1) {
        message = 'Well done! You tracked the pearl with great focus.';
      }

      onComplete({
        gameId: 'shell-memory-trail',
        score,
        maxScore: 100,
        accuracy,
        errorCount,
        responseTimeMs,
        latencyMs: responseTimeMs,
        level: currentLevel,
        tier: derivedTier,
        difficultyTier: derivedTier,
        sessionLevel: currentLevel,
        message,
        subtext: `Found the pearl in ${correctRounds} of 3 rounds.`
      });
    } else {
      // Next round with randomized target
      const randomIdx = Math.floor(Math.random() * activeItems.length);
      setTargetId(activeItems[randomIdx].id);
      setRound((r) => r + 1);
      setGameVersion((v) => v + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        ) : <div />}
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Level {currentLevel}/10
        </span>
      </div>
      {/* Top Banner with Round indicators */}
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Brahmaputra Shell Trail:
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Round {round} of 3 • Track the glowing shell with the river pearl
          </p>
        </div>
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3].map((r) => (
            <div
              key={r}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                r < round
                  ? roundResults[r - 1]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-teal-400 text-slate-900'
                  : r === round
                  ? 'bg-teal-700 text-white ring-2 ring-teal-400'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {r < round ? (roundResults[r - 1] ? '✓' : '•') : r}
            </div>
          ))}
        </div>
      </div>

      <HighlightRecall
        language={language}
        key={gameVersion}
        items={activeItems}
        targetId={targetId}
        shuffleCount={shuffleCount}
        highlightTime={highlightTime}
        onComplete={(selectedId, isCorrect) => {
          startNextRound(isCorrect);
        }}
      />
    </div>
  );
}
