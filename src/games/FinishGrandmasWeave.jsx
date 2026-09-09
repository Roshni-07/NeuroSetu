import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import PatternGrid from '../shared/PatternGrid.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 14 — Finish Grandma's Weave (Visual Pattern Recognition)
 * Player completes traditional northeastern textile weaving patterns by filling in
 * missing cells using authentic cultural yarn/motif symbols.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Missing cell count scales from 1 (Level 1) to 5 (Level 10)
 * - Yarn option choices scale from 2 (Level 1) to 5 (Level 10)
 * - Dynamic pattern masking replaces static hardcoded missing cells
 * - Guarantees 10 distinct difficulty parameter states
 */

const WEAVE_PUZZLES = [
  {
    title: "Muga Silk Border",
    description: "Complete the golden muga silk weaving pattern below.",
    completeGrid: [
      ['🟡', '🟤', '🟡', '🟤'],
      ['🟤', '🟡', '🟤', '🟡'],
      ['🟡', '🟤', '🟡', '🟤'],
      ['🟤', '🟡', '🟤', '🟡']
    ],
    candidates: [
      [1, 1], // 🟡
      [3, 2], // 🟤
      [1, 3], // 🟡
      [3, 0], // 🟤
      [2, 1]  // 🟤
    ],
    options: ['🟡', '🟤', '🟠', '🟢', '🔵'],
    explanation: 'The pattern alternates gold (🟡) and brown (🟤) in a checkerboard — like traditional muga weaving.'
  },
  {
    title: "Mekhela Motif Row",
    description: "Fill in the missing flowers in this mekhela chador flower row.",
    completeGrid: [
      ['🌸', '🌿', '🌸', '🌿', '🌸'],
      ['🌿', '🌸', '🌿', '🌸', '🌿'],
      ['🌸', '🌿', '🌸', '🌿', '🌸']
    ],
    candidates: [
      [1, 1], // 🌸
      [1, 3], // 🌸
      [0, 2], // 🌸
      [2, 0], // 🌸
      [2, 4]  // 🌸
    ],
    options: ['🌸', '🌿', '🌼', '🌺', '💐'],
    explanation: 'The flowers (🌸) and leaves (🌿) alternate — the missing cells sit where flowers should be.'
  },
  {
    title: "Eri Silk Border",
    description: "Complete this traditional Eri silk diamond pattern.",
    completeGrid: [
      ['⬜', '🔴', '⬜', '🔴', '⬜'],
      ['🔴', '⬜', '🔴', '⬜', '🔴'],
      ['⬜', '🔴', '⬜', '🔴', '⬜'],
      ['🔴', '⬜', '🔴', '⬜', '🔴']
    ],
    candidates: [
      [1, 2], // 🔴
      [2, 1], // 🔴
      [2, 3], // 🔴
      [0, 1], // 🔴
      [3, 2]  // 🔴
    ],
    options: ['🔴', '⬜', '🟠', '🟡', '⚫'],
    explanation: 'Red (🔴) sits at every alternate cell in a classic Eri diamond weave pattern.'
  },
  {
    title: "Naga Shawl Stripe",
    description: "Fill in the missing sections of this bold Naga warrior shawl stripe.",
    completeGrid: [
      ['🟥', '🟥', '⬛', '🟥', '🟥'],
      ['⬛', '⬛', '🟥', '⬛', '⬛'],
      ['🟥', '🟥', '⬛', '🟥', '🟥'],
      ['⬛', '⬛', '🟥', '⬛', '⬛']
    ],
    candidates: [
      [1, 2], // 🟥
      [2, 3], // 🟥
      [3, 0], // ⬛
      [0, 2], // ⬛
      [2, 1]  // 🟥
    ],
    options: ['🟥', '⬛', '🟨', '🟦', '🟩'],
    explanation: 'Naga shawl stripes use bold red (🟥) and black (⬛) in a mirror pattern — complete the rows symmetrically.'
  }
];

export default function FinishGrandmasWeave({
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
  const isExplicitLevel = level !== null && level !== undefined;
  const hasConfig = isExplicitLevel || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
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
  }, [isExplicitLevel, level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('finish-grandmas-weave', currentLevel);
  }, [currentLevel]);

  // Scaled missing cell count: 1 (L1) to 5 (L10). Defaults to 2 if unconfigured.
  const activeMissingCount = useMemo(() => {
    if (!hasConfig) return 2;
    return Math.max(1, Math.min(5, difficultyParams.itemCount || 2));
  }, [hasConfig, difficultyParams.itemCount]);

  // Scaled option choices: 2 (L1) to 5 (L10). Defaults to 5 if unconfigured.
  const activeOptionCount = useMemo(() => {
    if (!hasConfig) return 5;
    return Math.max(2, Math.min(5, 1 + (difficultyParams.distractorCount || 2)));
  }, [hasConfig, difficultyParams.distractorCount]);

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);

  // Auto-seed puzzle based on level
  useEffect(() => {
    if (hasConfig) {
      setPuzzleIndex((currentLevel - 1) % WEAVE_PUZZLES.length);
      setResult(null);
      setGameKey(k => k + 1);
    }
  }, [hasConfig, currentLevel]);

  const puzzle = WEAVE_PUZZLES[puzzleIndex] || WEAVE_PUZZLES[0];

  // Dynamically mask grid cells and collect correct answers
  const { generatedGrid, correctAnswers, generatedOptions } = useMemo(() => {
    const coordsToMask = puzzle.candidates.slice(0, activeMissingCount);
    const answers = [];

    const grid = puzzle.completeGrid.map((row, r) =>
      row.map((val, c) => {
        const isTarget = coordsToMask.some(([mr, mc]) => mr === r && mc === c);
        if (isTarget) {
          answers.push(val);
          return { content: val, isMissing: true };
        }
        return { content: val, isMissing: false };
      })
    );

    // Build selectable options: ensure all needed answers are included, fill with distractors
    const requiredAnswers = Array.from(new Set(answers));
    const distractors = puzzle.options.filter(o => !requiredAnswers.includes(o));
    const combinedOptions = [...requiredAnswers, ...distractors].slice(0, activeOptionCount);

    return {
      generatedGrid: grid,
      correctAnswers: answers,
      generatedOptions: combinedOptions
    };
  }, [puzzle, activeMissingCount, activeOptionCount]);

  const instructions = `Grandma started weaving a beautiful traditional textile but left some cells incomplete.

Look at the pattern carefully — can you see how it repeats? Tap a colour piece at the bottom, then tap the empty (?) cells on the weaving to fill them in.

When all cells are filled, tap "Check Pattern" to see how you did!`;

  const startTime = useRef(Date.now());

  const handleComplete = (res) => {
    const accuracy = res?.accuracy !== undefined ? res.accuracy : (res?.score || 100);
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const errorCount = res?.errorCount !== undefined ? res.errorCount : Math.max(0, Math.round(activeMissingCount * (1 - accuracy / 100)));
    const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

    const fullRes = {
      gameId: 'finish-grandmas-weave',
      ...res,
      accuracy,
      errorCount,
      responseTimeMs,
      latencyMs: responseTimeMs,
      level: currentLevel,
      tier: derivedTier,
      difficultyTier: derivedTier,
      sessionLevel: currentLevel,
      difficultyParams
    };
    setResult(fullRes);
    if (onComplete) onComplete(fullRes);
  };

  const handleRetry = () => {
    setResult(null);
    startTime.current = Date.now();
    setGameKey(k => k + 1);
  };

  return (
    <GameWrapper
      title="Finish Grandma's Weave"
      emoji="🧵"
      category="Visual Reasoning"
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
            Fill {activeMissingCount} Missing Cells • {generatedOptions.length} Yarn Choices
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Manual puzzle selector preserved when unconfigured */}
      {!hasConfig && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {WEAVE_PUZZLES.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setPuzzleIndex(i); setResult(null); setGameKey(k => k + 1); }}
              className={`min-h-[44px] px-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                i === puzzleIndex
                  ? 'bg-purple-700 text-white border-purple-600'
                  : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Loom header */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-700 text-white px-5 py-3 mb-4 flex items-center gap-3 shadow">
        <span className="text-3xl">🧵</span>
        <div>
          <p className="font-extrabold text-lg">{puzzle.title}</p>
          <p className="text-sm opacity-80">{puzzle.description}</p>
        </div>
      </div>

      <PatternGrid
        key={gameKey}
        grid={generatedGrid}
        options={generatedOptions}
        correctAnswers={correctAnswers}
        onComplete={handleComplete}
        language={language}
        title=""
      />

      {/* Pattern explanation */}
      <div className="w-full bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 mt-3">
        <p className="text-sm text-teal-700 font-medium">
          💡 <strong>Pattern hint:</strong> {puzzle.explanation}
        </p>
      </div>
    </GameWrapper>
  );
}
