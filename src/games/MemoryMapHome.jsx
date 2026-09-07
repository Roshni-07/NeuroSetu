import React, { useState, useEffect, useMemo } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MapRoute from '../shared/MapRoute.jsx';
import { sounds } from '../utils/soundEffects.js';
import { evaluateDifficulty } from '../engine/ddaEngine.js';

/**
 * Game 10 — Memory Map of Home (Memory)
 * Uses MapRoute. Shows a path through a village/home map; player then taps nodes in order.
 * Difficulty is dynamically seeded by starting_difficulty_tier / clinical status,
 * and adjusted in real time via ddaEngine without manual selector exposure.
 */

const MAP_NODES = [
  { id: 'well', label: 'Well', icon: '🪣', x: 20, y: 80 },
  { id: 'garden', label: 'Garden', icon: '🌻', x: 50, y: 65 },
  { id: 'kitchen', label: 'Kitchen', icon: '🫕', x: 78, y: 50 },
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️', x: 60, y: 25 },
  { id: 'porch', label: 'Porch', icon: '🏡', x: 25, y: 30 },
];

const MAP_CONNECTIONS = [
  ['well', 'garden'],
  ['garden', 'kitchen'],
  ['kitchen', 'bedroom'],
  ['bedroom', 'porch'],
  ['porch', 'well'],
  ['garden', 'bedroom'],
];

// Three difficulty sequences (subsets of nodes, different lengths)
const SEQUENCES = [
  ['well', 'garden', 'kitchen'],       // Tier 1: 3 nodes
  ['well', 'garden', 'bedroom', 'porch'],   // Tier 2: 4 nodes
  ['well', 'garden', 'kitchen', 'bedroom', 'porch'], // Tier 3: 5 nodes
];

export default function MemoryMapHome({
  onComplete,
  onExit,
  language = 'en',
  patientProfile = null,
  startingTier = null
}) {
  const initialTier = useMemo(() => {
    if (startingTier && [1, 2, 3].includes(Number(startingTier))) {
      return Number(startingTier);
    }
    if (patientProfile?.starting_difficulty_tier && [1, 2, 3].includes(Number(patientProfile.starting_difficulty_tier))) {
      return Number(patientProfile.starting_difficulty_tier);
    }
    if (patientProfile?.startingTier && [1, 2, 3].includes(Number(patientProfile.startingTier))) {
      return Number(patientProfile.startingTier);
    }
    if (patientProfile?.status === 'critical') return 1;
    if (patientProfile?.status === 'attention') return 2;
    if (patientProfile?.status === 'stable') return 3;
    return 1;
  }, [startingTier, patientProfile]);

  const [currentTier, setCurrentTier] = useState(initialTier);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'show' | 'select' | 'done'
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(null);
  const [ddaNotice, setDdaNotice] = useState(null);

  useEffect(() => {
    setCurrentTier(initialTier);
  }, [initialTier]);

  const levelIndex = Math.min(Math.max(currentTier - 1, 0), 2);
  const sequence = SEQUENCES[levelIndex];

  // Monitor latency in select phase; gently reduce if > 15s
  useEffect(() => {
    if (phase !== 'select') return;
    const timer = setTimeout(() => {
      if (currentTier > 1) {
        const decision = evaluateDifficulty(currentTier, {
          consecutiveErrors: 0,
          latencyMs: 16000,
          consecutiveSuccesses: 0
        });
        if (decision.action === 'decreased') {
          setCurrentTier(decision.newTier);
          setConsecutiveErrors(0);
          setDdaNotice(`Adjusted path to ${SEQUENCES[decision.newTier - 1].length} locations for comfort.`);
          setPhase('show');
          setGameKey(k => k + 1);
        }
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [phase, currentTier, gameKey]);

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
    const nextErrors = consecutiveErrors + 1;
    setConsecutiveErrors(nextErrors);
    setConsecutiveSuccesses(0);
    const latency = turnStartTime ? Date.now() - turnStartTime : 0;

    const decision = evaluateDifficulty(currentTier, {
      consecutiveErrors: nextErrors,
      latencyMs: latency,
      consecutiveSuccesses: 0
    });

    if (decision.action === 'decreased') {
      setCurrentTier(decision.newTier);
      setConsecutiveErrors(0);
      setDdaNotice(`Adjusted path to ${SEQUENCES[decision.newTier - 1].length} locations for comfort.`);
      setTimeout(() => {
        setPhase('show');
        setGameKey(k => k + 1);
      }, 700);
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

    const decision = evaluateDifficulty(currentTier, {
      consecutiveErrors: 0,
      latencyMs: latency,
      consecutiveSuccesses: nextSuccesses
    });

    if (decision.action === 'increased') {
      setCurrentTier(decision.newTier);
      setDdaNotice(`Wonderful mastery! Next journey will explore ${SEQUENCES[decision.newTier - 1].length} locations.`);
    }

    const accuracy = Math.round((correct / total) * 100);
    const score = Math.max(30, accuracy - (attempts - 1) * 15);
    const message = accuracy === 100
      ? 'You remembered the whole path perfectly! Wonderful spatial memory.'
      : 'Good effort tracing the path through the village!';
    const res = {
      score: Math.min(100, score),
      maxScore: 100,
      accuracy,
      message,
      subtext: `Completed Tier ${currentTier} path with ${correct}/${total} steps correct.`,
      tier: currentTier,
      ddaDecision: decision
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
    setTurnStartTime(null);
    setDdaNotice(null);
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

      {phase === 'idle' && (
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-5 py-5 text-center max-w-sm">
            <span className="text-5xl">🏡</span>
            <p className="text-lg font-bold text-teal-900 mt-3">Ready to trace the village path?</p>
            <p className="text-base text-teal-700 mt-1">
              Watch the character walk through {sequence.length} locations, then recreate the journey.
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-teal-200 text-teal-900 rounded-full text-xs font-bold uppercase tracking-wider">
              Tier {currentTier} • {sequence.length} Locations
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
            showDuration={1000}
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
