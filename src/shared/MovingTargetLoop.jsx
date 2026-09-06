import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * MovingTargetLoop - Animates items along a path, detects timed taps.
 * 
 * Elder-friendly design:
 * - Large 80px+ tap button with high contrast
 * - Comfortable timing window (2.5s per item, configurable)
 * - Visual progress bar for current item duration
 * - Clear target vs decoy display with icons and labels
 */
export default function MovingTargetLoop({
  targetIcon = '🍃',
  targetLabel = 'Fresh Tea Leaf',
  decoys = [
    { icon: '🍂', label: 'Dry Leaf' },
    { icon: '🪨', label: 'River Stone' }
  ],
  rounds = 8,
  itemDuration = 2500, // ms each item is shown
  onComplete,
  language = 'en',
  className = ''
}) {
  const [sequence, setSequence] = useState([]); // pre-generated isTarget booleans
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('countdown'); // 'countdown' | 'playing' | 'done'
  const [countdown, setCountdown] = useState(3);
  const [tapRecord, setTapRecord] = useState([]); // { index, tapped, isTarget }
  const [tappedThisItem, setTappedThisItem] = useState(false);
  const [progressFrac, setProgressFrac] = useState(0);
  const itemTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const progressStartRef = useRef(null);

  // Generate sequence: roughly 50% targets
  useEffect(() => {
    const seq = Array.from({ length: rounds }, (_, i) => {
      const isTarget = i === 0 || i === 2 || i === 4 || i === 6 || Math.random() < 0.5;
      return isTarget;
    });
    setSequence(seq);
  }, [rounds]);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      setPhase('playing');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const advanceItem = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIdx = prev + 1;
      if (nextIdx >= rounds) {
        setPhase('done');
        return prev;
      }
      return nextIdx;
    });
    setTappedThisItem(false);
    setProgressFrac(0);
    progressStartRef.current = Date.now();
  }, [rounds]);

  // Item timer
  useEffect(() => {
    if (phase !== 'playing' || sequence.length === 0) return;
    setProgressFrac(0);
    setTappedThisItem(false);
    progressStartRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current;
      setProgressFrac(Math.min(1, elapsed / itemDuration));
    }, 40);

    itemTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current);
      setTapRecord(prev => {
        const isTarget = sequence[currentIndex];
        // If player didn't tap a target, record as miss
        if (isTarget && !prev.find(r => r.index === currentIndex && r.tapped)) {
          return [...prev, { index: currentIndex, tapped: false, isTarget: true }];
        }
        return prev;
      });
      advanceItem();
    }, itemDuration);

    return () => {
      clearTimeout(itemTimerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [phase, currentIndex, sequence]);

  // Scoring when done
  useEffect(() => {
    if (phase !== 'done' || !onComplete) return;
    const targets = sequence.filter(Boolean).length;
    const hits = tapRecord.filter(r => r.isTarget && r.tapped).length;
    const falseAlarms = tapRecord.filter(r => !r.isTarget && r.tapped).length;
    const accuracy = targets > 0 ? Math.round((hits / targets) * 100) : 0;
    const penalty = Math.min(40, falseAlarms * 10);
    const score = Math.max(20, accuracy - penalty);

    let message = 'Good attention work! Watching for specific items keeps the mind sharp.';
    if (accuracy >= 80 && falseAlarms === 0) {
      message = 'Outstanding vigilance! You found every fresh leaf with no false taps.';
    } else if (accuracy >= 60) {
      message = 'Well done! You spotted most of the fresh tea leaves along the path.';
    }

    onComplete({
      score,
      maxScore: 100,
      accuracy,
      message,
      subtext: `Caught ${hits} of ${targets} targets, ${falseAlarms} false taps.`
    });
  }, [phase]);

  const handleTap = () => {
    if (phase !== 'playing' || tappedThisItem) return;
    const isTarget = sequence[currentIndex];
    setTappedThisItem(true);
    if (isTarget) {
      sounds.playMatchChime();
    } else {
      sounds.playEncouragingSoft();
    }
    setTapRecord(prev => [...prev, { index: currentIndex, tapped: true, isTarget }]);
  };

  const currentIsTarget = sequence[currentIndex];
  const currentDecoy = decoys[currentIndex % decoys.length];
  const currentItem = currentIsTarget
    ? { icon: targetIcon, label: targetLabel }
    : currentDecoy;

  const hits = tapRecord.filter(r => r.isTarget && r.tapped).length;
  const falseAlarms = tapRecord.filter(r => !r.isTarget && r.tapped).length;

  return (
    <div className={`flex flex-col items-center space-y-6 w-full max-w-xl mx-auto ${className}`}>
      {/* Progress & Stats */}
      <div className="w-full flex items-center justify-between text-sm font-bold text-slate-700 bg-teal-50 border-2 border-teal-200 rounded-2xl px-4 py-2.5">
        <span>Item {Math.min(currentIndex + 1, rounds)} / {rounds}</span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700">✓ {hits} caught</span>
          {falseAlarms > 0 && <span className="text-teal-700">⚠ {falseAlarms} false</span>}
        </div>
      </div>

      {phase === 'countdown' && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-800">Tap only when you see:</p>
            <div className="mt-3 flex items-center justify-center space-x-3 bg-teal-50 border-2 border-teal-300 rounded-2xl px-6 py-3">
              <span className="text-5xl">{targetIcon}</span>
              <span className="text-2xl font-extrabold text-teal-900">{targetLabel}</span>
            </div>
          </div>
          <div className="text-7xl font-black text-teal-700 animate-pulse">{countdown}</div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="flex flex-col items-center space-y-5 w-full">
          {/* Item Window — Tea Garden Scene */}
          <div className="relative w-full rounded-3xl bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 border-3 border-emerald-300 shadow-md flex flex-col items-center justify-center py-10 px-6 min-h-[200px] overflow-hidden">
            {/* Animated bushes bg */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around opacity-30 text-5xl pointer-events-none select-none">
              🌿🌿🌿🌿🌿🌿
            </div>

            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200 rounded-t-3xl overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-none"
                style={{ width: `${progressFrac * 100}%` }}
              />
            </div>

            {/* The item */}
            <div className={`relative z-10 flex flex-col items-center space-y-2 transition-all duration-200 ${
              tappedThisItem && currentIsTarget
                ? 'scale-125'
                : tappedThisItem && !currentIsTarget
                ? 'opacity-60'
                : ''
            }`} style={{ marginLeft: `${(progressFrac - 0.5) * 180}px` }}>
              <span className="text-7xl drop-shadow-md select-none">{currentItem.icon}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                  {currentItem.label}
                </span>
              </div>
              {tappedThisItem && currentIsTarget && (
                <span className="text-emerald-700 font-bold text-lg animate-bounce">✓ Caught!</span>
              )}
              {tappedThisItem && !currentIsTarget && (
                <span className="text-teal-700 font-semibold text-base">Not the target...</span>
              )}
            </div>
          </div>

          {/* Large Tap Button */}
          <button
            type="button"
            onClick={handleTap}
            disabled={tappedThisItem}
            className={`min-h-[72px] w-full max-w-xs rounded-3xl text-2xl font-extrabold shadow-xl border-3 transition-all active:scale-95 cursor-pointer ${
              tappedThisItem
                ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                : 'bg-teal-700 hover:bg-teal-800 text-white border-teal-500 hover:shadow-2xl'
            }`}
          >
            {tappedThisItem ? 'Tapped ✓' : '🌿 Tap! (Fresh Leaf)'}
          </button>

          <p className="text-base text-slate-500 font-medium text-center">
            Only tap when you see the <strong className="text-teal-800">{targetLabel}</strong>. Ignore all others!
          </p>
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center py-8 text-2xl font-bold text-teal-800 animate-pulse">
          🌿 Calculating your score…
        </div>
      )}
    </div>
  );
}
