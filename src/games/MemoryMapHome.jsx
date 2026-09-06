import React, { useState, useEffect } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MapRoute from '../shared/MapRoute.jsx';
import { sounds } from '../utils/soundEffects.js';

/**
 * Game 10 — Memory Map of Home (Memory)
 * Uses MapRoute. Shows a path through a village/home map; player then taps nodes in order.
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
  ['well', 'garden', 'kitchen'],       // Easy: 3 nodes
  ['well', 'garden', 'bedroom', 'porch'],   // Medium: 4
  ['well', 'garden', 'kitchen', 'bedroom', 'porch'], // Hard: 5
];

export default function MemoryMapHome({ onComplete, language = 'en' }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'show' | 'select' | 'done'
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);

  const sequence = SEQUENCES[levelIndex];

  const instructions = `A character walks through your village home. Watch the path carefully!

When the path is done, tap the locations in the SAME ORDER the character visited them.

Start from the first place and follow the journey step by step.`;

  const handleStart = () => {
    setPhase('show');
    setAttempts(a => a + 1);
  };

  const handleShowDone = () => {
    sounds.playEncouragingSoft();
    setPhase('select');
  };

  const handleSequenceComplete = ({ correct, total }) => {
    const accuracy = Math.round((correct / total) * 100);
    const score = Math.max(30, accuracy - (attempts - 1) * 15);
    const message = accuracy === 100
      ? 'You remembered the whole path perfectly! Wonderful spatial memory.'
      : 'Good effort tracing the path through the village!';
    const res = {
      score: Math.min(100, score),
      maxScore: 100,
      message,
      subtext: `Completed path with ${correct}/${total} steps correct.`
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
    >
      {/* Level selector */}
      <div className="flex justify-center gap-2 mb-4">
        {['Easy (3)', 'Medium (4)', 'Full Path (5)'].map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setLevelIndex(i); handleRetry(); }}
            className={`min-h-[44px] px-3 rounded-xl text-sm font-bold border-2 transition-colors ${
              i === levelIndex
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {phase === 'idle' && (
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-5 py-5 text-center max-w-sm">
            <span className="text-5xl">🏡</span>
            <p className="text-lg font-bold text-teal-900 mt-3">Ready to trace the village path?</p>
            <p className="text-base text-teal-700 mt-1">
              Watch the character walk through {sequence.length} locations, then recreate the journey.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="min-h-[60px] px-10 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
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
            showDuration={1000}
            mapTitle="Your Village Home"
          />

          {phase === 'select' && (
            <button
              type="button"
              onClick={handleStart}
              className="w-full min-h-[48px] rounded-xl bg-teal-100 hover:bg-teal-200 border-2 border-teal-300 text-teal-900 text-base font-semibold transition-colors"
            >
              👁️ Watch Path Again
            </button>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
