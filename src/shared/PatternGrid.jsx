import React, { useState, useCallback } from 'react';
import { sounds } from '../utils/soundEffects.js';

/**
 * PatternGrid — Grid pattern with missing cells and selectable fill options.
 *
 * Props:
 *   grid: 2D array where each cell is { content: string|null, isMissing?: bool }
 *   options: [string]  — selectable fill choices shown below the grid
 *   correctAnswers: [string]  — expected fill for each missing cell (in order)
 *   onComplete: ({ score, maxScore, message, subtext }) => void
 *   gridCols: number   — columns count (default auto from grid[0].length)
 *   title: string
 */
export default function PatternGrid({
  grid = [],
  options = [],
  correctAnswers = [],
  onComplete,
  language = 'en',
  title = 'Complete the Pattern',
  className = ''
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [fills, setFills] = useState({}); // { "r-c": value }
  const [revealed, setRevealed] = useState(false);

  const missingCells = [];
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell.isMissing) missingCells.push(`${r}-${c}`);
    });
  });
  const filledCount = Object.keys(fills).length;
  const allFilled = filledCount === missingCells.length;

  const handleMissingCellTap = useCallback((key) => {
    if (revealed || selectedOption === null) return;
    if (fills[key]) return; // already filled
    setFills(prev => ({ ...prev, [key]: selectedOption }));
    const idx = missingCells.indexOf(key);
    const isCorrect = correctAnswers[idx] === selectedOption;
    if (isCorrect) {
      sounds.playMatchChime();
    } else {
      sounds.playEncouragingSoft();
    }
  }, [selectedOption, fills, revealed, missingCells, correctAnswers]);

  const handleReveal = () => {
    if (!allFilled) return;
    setRevealed(true);
    if (!onComplete) return;

    let correct = 0;
    missingCells.forEach((key, idx) => {
      if (fills[key] === correctAnswers[idx]) correct++;
    });
    const score = Math.round((correct / missingCells.length) * 100);
    let message = 'Lovely pattern work! Recognizing visual patterns keeps the mind sharp.';
    if (score === 100) message = 'Perfect pattern! You completed the weave without a single mistake.';
    else if (score >= 60) message = 'Well done! You spotted most of the pattern correctly.';

    const errorCount = Math.max(0, missingCells.length - correct);

    onComplete({
      score,
      maxScore: 100,
      accuracy: score,
      errorCount,
      correct,
      total: missingCells.length,
      message,
      subtext: `Filled ${correct} of ${missingCells.length} cells correctly.`
    });
  };

  const handleReset = () => {
    setFills({});
    setRevealed(false);
    setSelectedOption(null);
  };

  const cols = grid[0]?.length || 1;

  return (
    <div className={`flex flex-col items-center space-y-5 w-full max-w-xl mx-auto ${className}`}>
      {title && (
        <p className="text-lg font-extrabold text-slate-800 text-center">{title}</p>
      )}

      {/* Instructions */}
      {!revealed && (
        <div className="w-full bg-teal-50 border-2 border-teal-200 rounded-xl px-4 py-2 text-sm text-teal-800 font-semibold text-center">
          {selectedOption
            ? `Selected: "${selectedOption}" — now tap a missing cell (?) to fill it`
            : 'First tap a pattern piece below, then tap a missing cell (?) above'}
        </div>
      )}

      {/* Grid */}
      <div
        className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-3 border-teal-400 shadow-md"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isMissing = cell.isMissing;
            const filled = fills[key];
            const isRevealCorrect = revealed && isMissing && fills[key] === correctAnswers[missingCells.indexOf(key)];
            const isRevealWrong = revealed && isMissing && fills[key] !== correctAnswers[missingCells.indexOf(key)];

            let cellClass = 'flex items-center justify-center aspect-square text-3xl sm:text-4xl font-bold border border-teal-200 transition-all duration-200 select-none';
            if (isMissing && !filled) {
              cellClass += ' bg-slate-200 text-slate-500 cursor-pointer hover:bg-teal-100 text-2xl';
            } else if (isRevealCorrect) {
              cellClass += ' bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400';
            } else if (isRevealWrong) {
              cellClass += ' bg-red-100 text-red-700 ring-2 ring-red-400';
            } else if (filled) {
              cellClass += ' bg-teal-100 text-teal-800 cursor-pointer hover:bg-teal-200';
            } else {
              cellClass += ' bg-teal-50';
            }

            return (
              <button
                key={key}
                type="button"
                className={cellClass}
                onClick={() => isMissing && !revealed && handleMissingCellTap(key)}
                aria-label={isMissing ? (filled || '?') : cell.content}
                disabled={revealed || (!isMissing)}
              >
                {isMissing && !filled ? (
                  <span className="text-slate-400 text-2xl font-black">?</span>
                ) : (
                  <span>{filled || cell.content}</span>
                )}
                {revealed && isMissing && (
                  <span className="absolute text-xs">{isRevealCorrect ? '✓' : `→${correctAnswers[missingCells.indexOf(key)]}`}</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Options */}
      {!revealed && (
        <div className="w-full">
          <p className="text-sm font-bold text-slate-600 mb-2 text-center">Choose a piece:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {options.map((opt) => (
              <div key={opt} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={`min-h-[56px] min-w-[56px] rounded-2xl border-3 text-3xl font-bold shadow-md transition-all cursor-pointer active:scale-95 ${
                  selectedOption === opt
                    ? 'bg-teal-600 border-teal-800 text-white scale-110 shadow-xl ring-4 ring-teal-300'
                    : 'bg-white border-teal-400 hover:bg-teal-100 text-teal-900 hover:scale-105'
                }`}
                aria-label={opt}
              >
                {opt}
              </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 w-full">
        {!revealed && (
          <button
            type="button"
            onClick={handleReveal}
            disabled={!allFilled}
            className={`flex-1 min-h-[56px] rounded-2xl text-xl font-bold shadow-lg transition-all active:scale-95 ${
              allFilled
                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Check Pattern ✓
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="min-h-[56px] px-5 rounded-2xl bg-teal-100 hover:bg-teal-200 border-2 border-teal-300 text-teal-900 text-base font-semibold transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      {revealed && (
        <div className="text-center text-lg font-bold text-teal-800 animate-pulse py-2">
          🎨 Calculating your score…
        </div>
      )}
    </div>
  );
}
