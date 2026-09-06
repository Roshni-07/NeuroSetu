import React, { useState } from 'react';
import HighlightRecall from '../shared/HighlightRecall.jsx';

const RIVER_SHELLS = [
  { id: 'shell_1', label: 'Cowrie', icon: '🐚' },
  { id: 'shell_2', label: 'Tea', icon: '🍵' },
  { id: 'shell_3', label: 'Plant', icon: '🪴' },
  { id: 'shell_4', label: 'Flower', icon: '🌹' },
  { id: 'shell_5', label: 'Cow', icon: '🐄' }
];

export default function ShellMemoryTrail({ onComplete, language = 'en' }) {
  const [round, setRound] = useState(1); // 3 rounds total
  const [targetId, setTargetId] = useState('shell_2');
  const [roundResults, setRoundResults] = useState([]); // array of booleans
  const [gameVersion, setGameVersion] = useState(0);

  const startNextRound = (isCorrect) => {
    const updatedResults = [...roundResults, isCorrect];
    setRoundResults(updatedResults);

    if (round >= 3) {
      // Completed all 3 rounds
      const correctRounds = updatedResults.filter(Boolean).length;
      const accuracy = Math.round((correctRounds / 3) * 100);
      const score = Math.max(35, correctRounds * 33 + (accuracy === 100 ? 1 : 0));

      let message = 'Great visual tracking! Tracking items keeps attention sharp.';
      if (correctRounds === 3) {
        message = 'Sensational! You followed the golden pearl perfectly in every round.';
      } else if (correctRounds >= 1) {
        message = 'Well done! You tracked the pearl with great focus.';
      }

      onComplete({
        score,
        maxScore: 100,
        accuracy,
        message,
        subtext: `Found the pearl in ${correctRounds} of 3 rounds.`
      });
    } else {
      // Next round with randomized target
      const randomIdx = Math.floor(Math.random() * RIVER_SHELLS.length);
      setTargetId(RIVER_SHELLS[randomIdx].id);
      setRound((r) => r + 1);
      setGameVersion((v) => v + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
        items={RIVER_SHELLS}
        targetId={targetId}
        shuffleCount={round === 1 ? 2 : round === 2 ? 3 : 4}
        onComplete={(selectedId, isCorrect) => {
          startNextRound(isCorrect);
        }}
      />
    </div>
  );
}
