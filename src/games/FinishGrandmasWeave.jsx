import React, { useState } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import PatternGrid from '../shared/PatternGrid.jsx';

/**
 * Game 14 — Finish Grandma's Weave (Visual Reasoning)
 * Uses PatternGrid. Player completes a traditional NER textile pattern by filling
 * in missing cells from a selection of colour/motif options.
 */

// NER textile motifs represented as emoji/symbols
const WEAVE_PUZZLES = [
  {
    title: "Muga Silk Border",
    description: "Complete the golden muga silk weaving pattern below.",
    grid: [
      [
        { content: '🟡' }, { content: '🟤' }, { content: '🟡' }, { content: '🟤' }
      ],
      [
        { content: '🟤' }, { content: '🟡', isMissing: true }, { content: '🟤' }, { content: '🟡', isMissing: true }
      ],
      [
        { content: '🟡' }, { content: '🟤' }, { content: '🟡' }, { content: '🟤' }
      ],
      [
        { content: '🟤', isMissing: true }, { content: '🟡' }, { content: '🟤', isMissing: true }, { content: '🟡' }
      ]
    ],
    options: ['🟡', '🟤', '🟠', '🟢', '🔵'],
    correctAnswers: ['🟡', '🟡', '🟤', '🟤'],
    explanation: 'The pattern alternates gold (🟡) and brown (🟤) in a checkerboard — like traditional muga weaving.'
  },
  {
    title: "Mekhela Motif Row",
    description: "Fill in the missing flowers in this mekhela chador flower row.",
    grid: [
      [
        { content: '🌸' }, { content: '🌿' }, { content: '🌸' }, { content: '🌿' }, { content: '🌸' }
      ],
      [
        { content: '🌿' }, { content: '🌸', isMissing: true }, { content: '🌿' }, { content: '🌸', isMissing: true }, { content: '🌿' }
      ],
      [
        { content: '🌸' }, { content: '🌿' }, { content: '🌸' }, { content: '🌿' }, { content: '🌸' }
      ]
    ],
    options: ['🌸', '🌿', '🌼', '🌺', '💐'],
    correctAnswers: ['🌸', '🌸'],
    explanation: 'The flowers (🌸) and leaves (🌿) alternate — the missing cells sit where flowers should be.'
  },
  {
    title: "Eri Silk Border",
    description: "Complete this traditional Eri silk diamond pattern.",
    grid: [
      [
        { content: '⬜' }, { content: '🔴' }, { content: '⬜' }, { content: '🔴' }, { content: '⬜' }
      ],
      [
        { content: '🔴' }, { content: '⬜' }, { content: '🔴', isMissing: true }, { content: '⬜' }, { content: '🔴' }
      ],
      [
        { content: '⬜' }, { content: '🔴', isMissing: true }, { content: '⬜' }, { content: '🔴', isMissing: true }, { content: '⬜' }
      ],
      [
        { content: '🔴' }, { content: '⬜' }, { content: '🔴' }, { content: '⬜' }, { content: '🔴' }
      ]
    ],
    options: ['🔴', '⬜', '🟠', '🟡', '⚫'],
    correctAnswers: ['🔴', '🔴', '🔴'],
    explanation: 'Red (🔴) sits at every alternate cell in a classic Eri diamond weave pattern.'
  },
  {
    title: "Naga Shawl Stripe",
    description: "Fill in the missing sections of this bold Naga warrior shawl stripe.",
    grid: [
      [
        { content: '🟥' }, { content: '🟥' }, { content: '⬛' }, { content: '🟥' }, { content: '🟥' }
      ],
      [
        { content: '⬛' }, { content: '⬛' }, { content: '🟥', isMissing: true }, { content: '⬛' }, { content: '⬛' }
      ],
      [
        { content: '🟥' }, { content: '🟥' }, { content: '⬛' }, { content: '🟥', isMissing: true }, { content: '🟥' }
      ],
      [
        { content: '⬛', isMissing: true }, { content: '⬛' }, { content: '🟥' }, { content: '⬛' }, { content: '⬛' }
      ]
    ],
    options: ['🟥', '⬛', '🟨', '🟦', '🟩'],
    correctAnswers: ['🟥', '🟥', '⬛'],
    explanation: 'Naga shawl stripes use bold red (🟥) and black (⬛) in a mirror pattern — complete the rows symmetrically.'
  }
];

export default function FinishGrandmasWeave({ onComplete, language = 'en' }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);

  const puzzle = WEAVE_PUZZLES[puzzleIndex];

  const instructions = `Grandma started weaving a beautiful traditional textile but left some cells incomplete.

Look at the pattern carefully — can you see how it repeats? Tap a colour piece at the bottom, then tap the empty (?) cells on the weaving to fill them in.

When all cells are filled, tap "Check Pattern" to see how you did!`;

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
      title="Finish Grandma's Weave"
      emoji="🧵"
      category="Visual Reasoning"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
    >
      {/* Puzzle selector */}
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
        grid={puzzle.grid}
        options={puzzle.options}
        correctAnswers={puzzle.correctAnswers}
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
