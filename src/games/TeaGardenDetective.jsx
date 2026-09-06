import React, { useState } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MovingTargetLoop from '../shared/MovingTargetLoop.jsx';

/**
 * Game 9 — Tea Garden Detective (Attention)
 * Uses MovingTargetLoop to animate items along a tea garden path.
 * Player taps only when the target fresh leaf appears; scored on accuracy + false taps.
 */
const LEVELS = [
  { rounds: 6, itemDuration: 3000, label: 'Gentle' },
  { rounds: 9, itemDuration: 2000, label: 'Moderate' },
  { rounds: 12, itemDuration: 1500, label: 'Watchful' }
];

const DECOYS = [
  { icon: '🍂', label: 'Dry Leaf' },
  { icon: '🪨', label: 'River Stone' },
  { icon: '🐛', label: 'Garden Bug' },
  { icon: '🌾', label: 'Grass Stem' }
];

export default function TeaGardenDetective({ onComplete, language = 'en' }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const level = LEVELS[levelIndex];

  const instructions = `You are walking through Assam's lush tea garden. A worker passes by carrying items — some are fresh tea leaves 🍃, some are other things.

TAP only when you see the 🍃 Fresh Tea Leaf.
Do NOT tap for anything else!

Take your time — watch each item carefully.`;

  const handleComplete = (res) => {
    setResult(res);
    if (onComplete) onComplete(res);
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
    >
      {/* Level selector */}
      <div className="flex justify-center gap-2 mb-4">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setLevelIndex(i); setResult(null); setGameKey(k => k + 1); }}
            className={`min-h-[44px] px-4 rounded-xl text-base font-bold border-2 transition-colors ${
              i === levelIndex
                ? 'bg-teal-700 text-white border-teal-600'
                : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
            }`}
          >
            {l.label}
          </button>
        ))}
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
        decoys={DECOYS}
        rounds={level.rounds}
        itemDuration={level.itemDuration}
        onComplete={handleComplete}
        language={language}
      />
    </GameWrapper>
  );
}
