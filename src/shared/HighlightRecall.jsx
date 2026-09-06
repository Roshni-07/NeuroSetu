import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * HighlightRecall - Briefly highlight an item, shuffle positions smoothly, then require identification.
 * 
 * Specially designed for elderly users:
 * - Clear, large items (min 72px touch targets)
 * - Paced, gentle CSS translations (700ms smooth swaps, zero disorientation)
 * - Friendly step indicators: "Watch" -> "Moving..." -> "Tap the shell"
 */
export default function HighlightRecall({
  items = [], // Array of items: [{ id: 'shell_1', label: 'River Shell 1', icon: '🐚' }, ...]
  targetId = null,
  onComplete,
  shuffleCount = 3,
  highlightTime = 2400,
  language = 'en',
  className = ''
}) {
  const [stage, setStage] = useState('highlight'); // 'highlight' | 'shuffling' | 'guess' | 'revealed'
  const [positions, setPositions] = useState([]); // indices order
  const [selectedId, setSelectedId] = useState(null);
  const [shuffleStep, setShuffleStep] = useState(0);
  const isRunningRef = useRef(false);

  // Initialize positions
  useEffect(() => {
    setPositions(items.map((_, i) => i));
    setStage('highlight');
    setSelectedId(null);
    setShuffleStep(0);
    isRunningRef.current = true;

    // Start highlight countdown
    const highlightTimer = setTimeout(() => {
      if (!isRunningRef.current) return;
      startShuffling();
    }, highlightTime);

    return () => {
      isRunningRef.current = false;
      clearTimeout(highlightTimer);
    };
  }, [items, targetId]);

  const startShuffling = () => {
    setStage('shuffling');
    let currentPositions = items.map((_, i) => i);
    let step = 0;

    const performSwap = () => {
      if (!isRunningRef.current) return;
      if (step >= shuffleCount) {
        setStage('guess');
        return;
      }

      // Pick two distinct indices to swap
      const n = currentPositions.length;
      const idx1 = Math.floor(Math.random() * n);
      let idx2 = Math.floor(Math.random() * n);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * n);
      }

      const next = [...currentPositions];
      const temp = next[idx1];
      next[idx1] = next[idx2];
      next[idx2] = temp;

      currentPositions = next;
      setPositions(next);
      setShuffleStep(step + 1);
      step++;

      sounds.playCardFlip();
      setTimeout(performSwap, 850);
    };

    setTimeout(performSwap, 400);
  };

  const handleSelect = (item) => {
    if (stage !== 'guess') return;
    setSelectedId(item.id);
    setStage('revealed');

    const isCorrect = item.id === targetId;
    if (isCorrect) {
      sounds.playSuccessChime();
    } else {
      sounds.playEncouragingSoft();
    }

    if (onComplete) {
      setTimeout(() => {
        onComplete(item.id, isCorrect);
      }, 1400);
    }
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-2xl mx-auto ${className}`}>
      {/* Gentle Status Banner */}
      <div className="mb-4 px-4 py-2.5 rounded-2xl bg-teal-50 border-2 border-teal-300 text-center shadow-sm w-full">
        {stage === 'highlight' && (
          <div className="text-lg sm:text-xl font-bold text-teal-900 animate-pulse flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>Watch closely! Notice which shell glows with the golden pearl.</span>
          </div>
        )}
        {stage === 'shuffling' && (
          <div className="text-lg sm:text-xl font-bold text-teal-900 flex items-center justify-center space-x-2">
            <span className="animate-spin text-2xl">🌀</span>
            <span>Follow the shells as they gently move...</span>
          </div>
        )}
        {stage === 'guess' && (
          <div className="text-lg sm:text-xl font-bold text-teal-800 flex items-center justify-center space-x-2">
            <span>👉</span>
            <span>Tap the shell that held the golden pearl!</span>
          </div>
        )}
        {stage === 'revealed' && (
          <div className="text-lg sm:text-xl font-bold text-slate-800 flex items-center justify-center space-x-2">
            {selectedId === targetId ? (
              <span className="text-emerald-700">🌟 Wonderful! You tracked the pearl!</span>
            ) : (
              <span className="text-teal-800">🌿 Good try! Here is where the pearl rested.</span>
            )}
          </div>
        )}
      </div>

      {/* Shells Display on Traditional Riverbed Mat */}
      <div className="relative w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-teal-100/80 via-teal-50 to-orange-100/60 border-4 border-teal-200 shadow-inner flex flex-wrap justify-center items-center gap-4 sm:gap-6 min-h-[220px]">
        {items.map((item, originalIndex) => {
          const currentPosIndex = positions.indexOf(originalIndex);
          const isTarget = item.id === targetId;
          const isHighlighted = stage === 'highlight' && isTarget;
          const isRevealedTarget = stage === 'revealed' && isTarget;
          const isPlayerSelection = selectedId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={stage !== 'guess'}
              onClick={() => handleSelect(item)}
              style={{
                order: currentPosIndex >= 0 ? currentPosIndex : originalIndex,
                transition: 'all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className={`relative flex flex-col items-center justify-center w-24 h-28 sm:w-28 sm:h-32 rounded-2xl border-3 select-none transition-all duration-500 transform ${
                stage === 'guess'
                  ? 'hover:scale-110 active:scale-95 cursor-pointer bg-white border-teal-500 shadow-md hover:shadow-xl hover:bg-teal-50'
                  : 'cursor-default bg-white/90 border-teal-300 shadow'
              } ${
                isHighlighted
                  ? 'ring-8 ring-teal-400 bg-teal-100 border-teal-500 scale-110 shadow-2xl'
                  : ''
              } ${
                isRevealedTarget
                  ? 'ring-8 ring-emerald-400 bg-emerald-100 border-emerald-600 scale-110 shadow-2xl'
                  : ''
              } ${
                isPlayerSelection && !isTarget
                  ? 'ring-4 ring-teal-400 bg-teal-50 border-teal-500'
                  : ''
              }`}
            >
              {/* Pearl or Glow Indicator */}
              {(isHighlighted || isRevealedTarget) && (
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-teal-400 border-2 border-white shadow-lg flex items-center justify-center text-sm animate-bounce">
                  ✨
                </div>
              )}

              {/* Shell Icon */}
              <span className="text-4xl sm:text-5xl drop-shadow-sm mb-1">
                {item.icon || '🐚'}
              </span>

              {/* Label */}
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
