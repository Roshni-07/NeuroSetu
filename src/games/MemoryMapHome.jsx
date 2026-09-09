import React, { useState, useEffect, useMemo, useRef } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MapRoute from '../shared/MapRoute.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { evaluateDifficulty, getLevel } from '../engine/ddaEngine.js';

/**
 * Game 10 — Memory Map of Home (Memory)
 * Uses MapRoute. Shows a path through a village/home map; player then taps nodes in order.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Continuous sequence length scales from 2 to 6 nodes
 * - Pacing (showDuration) scales from 1400ms down to 550ms
 * - Fully backwards-compatible with legacy Tier DDA evaluation
 */
const MAP_NODES = [
  { id: 'well', label: 'Well', icon: '🪣', x: 20, y: 80 },
  { id: 'garden', label: 'Garden', icon: '🌻', x: 50, y: 65 },
  { id: 'kitchen', label: 'Kitchen', icon: '🫕', x: 78, y: 50 },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️', x: 60, y: 25 },
  { id: 'porch', label: 'Porch', icon: '🏡', x: 25, y: 30 },
  { id: 'courtyard', label: 'Courtyard', icon: '🌾', x: 42, y: 45 }
];

const MAP_CONNECTIONS = [
  ['well', 'garden'],
  ['garden', 'kitchen'],
  ['kitchen', 'bedroom'],
  ['bedroom', 'porch'],
  ['porch', 'well'],
  ['garden', 'courtyard'],
  ['courtyard', 'kitchen'],
  ['courtyard', 'bedroom'],
  ['porch', 'courtyard']
];

// Curated valid journeys for continuous 10-level mode (2 to 6 nodes)
const LEVEL_SEQUENCES = {
  2: ['well', 'garden'],
  3: ['well', 'garden', 'kitchen'],
  4: ['well', 'garden', 'courtyard', 'kitchen'],
  5: ['well', 'garden', 'courtyard', 'bedroom', 'porch'],
  6: ['well', 'garden', 'courtyard', 'kitchen', 'bedroom', 'porch']
};

// Curated valid journeys for legacy 3-tier mode
const TIER_SEQUENCES = {
  1: ['well', 'garden', 'kitchen'],
  2: ['well', 'garden', 'bedroom', 'porch'],
  3: ['well', 'garden', 'bedroom', 'porch', 'courtyard']
};

export default function MemoryMapHome({
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

  // Resolve legacy tier for backwards compatibility
  const resolvedLegacyTier = useMemo(() => {
    const raw = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : 1);
    return Math.max(1, Math.min(3, Number(raw) || 1));
  }, [tier, startingTier, initialTier, patientProfile]);

  const [currentTier, setCurrentTier] = useState(resolvedLegacyTier);
  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [ddaNotice, setDdaNotice] = useState(null);

  useEffect(() => {
    setCurrentTier(resolvedLegacyTier);
  }, [resolvedLegacyTier]);

  // Standardized fallback resolver for 10-level continuous engine
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    if (currentTier === 1) return 1;
    if (currentTier === 2) return 5;
    if (currentTier === 3) return 10;
    return 5;
  }, [isExplicitLevel, level, masteryScore, patientProfile, currentTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('memory-map-home', currentLevel);
  }, [currentLevel]);

  // Sequence length: continuous 2 to 6 nodes if level specified, else 3 to 5 nodes if legacy tier
  const sequenceLength = useMemo(() => {
    if (isExplicitLevel) {
      return Math.max(2, Math.min(6, difficultyParams.itemCount || 3));
    }
    return (TIER_SEQUENCES[currentTier] || TIER_SEQUENCES[1]).length;
  }, [isExplicitLevel, difficultyParams.itemCount, currentTier]);

  const sequence = useMemo(() => {
    if (isExplicitLevel) {
      return LEVEL_SEQUENCES[sequenceLength] || LEVEL_SEQUENCES[3];
    }
    return TIER_SEQUENCES[currentTier] || TIER_SEQUENCES[1];
  }, [isExplicitLevel, sequenceLength, currentTier]);

  // Per-node highlight speed in ms, calibrated from 1400ms down to 550ms
  const showDuration = useMemo(() => {
    if (!isExplicitLevel) return 1000;
    const dur = Math.round(1400 - ((currentLevel - 1) / 9) * 850);
    return Math.max(550, dur);
  }, [isExplicitLevel, currentLevel]);

  const [phase, setPhase] = useState('idle'); // 'idle' | 'show' | 'select' | 'done'
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const startTime = useRef(Date.now());
  const errorCountRef = useRef(0);

  // Monitor latency in select phase; gently reduce if > 15s (legacy behavior)
  useEffect(() => {
    if (phase !== 'select') return;
    const timer = setTimeout(() => {
      if (!isExplicitLevel && currentTier > 1) {
        const decision = evaluateDifficulty(currentTier, {
          consecutiveErrors: 0,
          latencyMs: 16000,
          consecutiveSuccesses: 0
        });
        if (decision.action === 'decreased') {
          setCurrentTier(decision.newTier);
          setConsecutiveErrors(0);
          const newLen = (TIER_SEQUENCES[decision.newTier] || TIER_SEQUENCES[1]).length;
          setDdaNotice(`Adjusted path to ${newLen} locations for comfort.`);
          setPhase('show');
          setGameKey(k => k + 1);
        }
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [phase, isExplicitLevel, currentTier, gameKey]);

  const instructions = `A character walks through your village home. Watch the path carefully!

When the path is done, tap the locations in the SAME ORDER the character visited them.

Start from the first place and follow the journey step by step.`;

  const handleStart = () => {
    setPhase('show');
    setAttempts(a => a + 1);
    setDdaNotice(null);
  };

  const handleShowDone = () => {
    sounds.playEncouragingSoft();
    setTurnStartTime(Date.now());
    setPhase('select');
  };

  const handleError = () => {
    errorCountRef.current += 1;
    const nextErrors = consecutiveErrors + 1;
    setConsecutiveErrors(nextErrors);
    setConsecutiveSuccesses(0);
    const latency = turnStartTime ? Date.now() - turnStartTime : 0;

    if (!isExplicitLevel) {
      const decision = evaluateDifficulty(currentTier, {
        consecutiveErrors: nextErrors,
        latencyMs: latency,
        consecutiveSuccesses: 0
      });

      if (decision.action === 'decreased') {
        setCurrentTier(decision.newTier);
        setConsecutiveErrors(0);
        const newLen = (TIER_SEQUENCES[decision.newTier] || TIER_SEQUENCES[1]).length;
        setDdaNotice(`Adjusted path to ${newLen} locations for comfort.`);
        setTimeout(() => {
          setPhase('show');
          setGameKey(k => k + 1);
        }, 700);
      }
    }
  };

  const handleStep = () => {
    setConsecutiveErrors(0);
  };

  const handleSequenceComplete = ({ correct, total }) => {
    const latency = turnStartTime ? Date.now() - turnStartTime : 0;
    const isPerfect = correct === total && consecutiveErrors === 0;
    const nextSuccesses = isPerfect ? consecutiveSuccesses + 1 : 0;
    setConsecutiveSuccesses(nextSuccesses);
    setConsecutiveErrors(0);

    let decision = null;
    if (!isExplicitLevel) {
      decision = evaluateDifficulty(currentTier, {
        consecutiveErrors: 0,
        latencyMs: latency,
        consecutiveSuccesses: nextSuccesses
      });
      if (decision.action === 'increased') {
        setCurrentTier(decision.newTier);
        const nextLen = (TIER_SEQUENCES[decision.newTier] || TIER_SEQUENCES[3]).length;
        setDdaNotice(`Wonderful mastery! Next journey will explore ${nextLen} locations.`);
      }
    }

    const accuracy = Math.round((correct / total) * 100);
    const score = Math.max(30, accuracy - (attempts - 1) * 15);
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const errorCount = Math.max(errorCountRef.current, total - correct);
    const derivedTier = currentTier || (currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3);
    const message = accuracy === 100
      ? 'You remembered the whole path perfectly! Wonderful spatial memory.'
      : 'Good effort tracing the path through the village!';

    const res = {
      gameId: 'memory-map-home',
      score: Math.min(100, score),
      maxScore: 100,
      accuracy,
      errorCount,
      responseTimeMs,
      latencyMs: responseTimeMs,
      message,
      subtext: !isExplicitLevel
        ? `Completed Tier ${currentTier} path with ${correct}/${total} steps correct.`
        : `Completed Level ${currentLevel} journey with ${correct}/${total} steps remembered.`,
      tier: derivedTier,
      difficultyTier: derivedTier,
      level: currentLevel,
      sessionLevel: currentLevel,
      difficultyParams,
      ddaDecision: decision || { action: 'stable', newTier: currentTier }
    };
    setResult(res);
    setPhase('done');
    if (onComplete) onComplete(res);
  };

  const handleRetry = () => {
    setResult(null);
    setPhase('idle');
    setGameKey(k => k + 1);
    setAttempts(0);
    setConsecutiveErrors(0);
    errorCountRef.current = 0;
    startTime.current = Date.now();
  };

  return (
    <GameWrapper
      title="Memory Map of Home"
      emoji="🏡"
      category="Memory"
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

      {ddaNotice && (
        <div className="p-3 bg-teal-50 border-2 border-teal-300 text-teal-900 text-sm sm:text-base font-semibold rounded-xl text-center mb-4 animate-fade-in">
          {ddaNotice}
        </div>
      )}

      {/* Adaptive Level/Tier Badge */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {sequence.length} Locations • {isExplicitLevel ? `${(showDuration / 1000).toFixed(2)}s / step` : 'Adaptive Path'}
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-5 py-5 text-center max-w-sm">
            <span className="text-5xl">🏡</span>
            <p className="text-lg font-bold text-teal-900 mt-3">Ready to trace the village path?</p>
            <p className="text-base text-teal-700 mt-1">
              Watch the character walk through {sequence.length} locations, then recreate the journey.
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-teal-200 text-teal-900 rounded-full text-xs font-bold uppercase tracking-wider">
              {isExplicitLevel ? `Level ${currentLevel} • ${sequence.length} Locations` : `Tier ${currentTier} • ${sequence.length} Locations`}
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="min-h-[60px] px-10 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            Start Journey 🚶
          </button>
        </div>
      )}

      {(phase === 'show' || phase === 'select') && (
        <div className="space-y-3" key={gameKey}>
          <div className={`text-center text-base font-bold px-4 py-2 rounded-xl ${
            phase === 'show'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-teal-50 text-teal-800 border border-teal-300'
          }`}>
            {phase === 'show'
              ? '👀 Watch the path carefully…'
              : '🖐️ Now tap the locations in the same order!'}
          </div>

          <MapRoute
            nodes={MAP_NODES}
            connections={MAP_CONNECTIONS}
            mode={phase === 'show' ? 'show' : 'select'}
            highlightSequence={phase === 'show' ? sequence : []}
            correctSequence={phase === 'select' ? sequence : []}
            onShowDone={handleShowDone}
            language={language}
            onSequenceComplete={handleSequenceComplete}
            onError={handleError}
            onStep={handleStep}
            showDuration={showDuration}
            mapTitle="Your Village Home"
          />

          {phase === 'select' && (
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[48px] rounded-xl bg-teal-100 hover:bg-teal-200 border-2 border-teal-300 text-teal-900 text-base font-semibold transition-colors cursor-pointer"
            >
              👁️ Watch Path Again
            </button>
          )}
        </div>
      )}
    </GameWrapper>
  );
}

