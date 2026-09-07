import React, { useState, useEffect } from 'react';
import FlipCard from '../shared/FlipCard.jsx';
import { sounds } from '../utils/soundEffects.js';
import { resolvePatientStartingTier } from '../engine/dailyAssignmentEngine.js';

const FESTIVAL_PAIRS = [
  { id: 'dhol', label: 'Bihu Dhol', icon: '🥁' },
  { id: 'pepa', label: 'Pepa Horn', icon: '📯' },
  { id: 'japi', label: 'Japi Hat', icon: '👒' },
  { id: 'xorai', label: 'Golden Xorai', icon: '🏆' },
  { id: 'pitha', label: 'Tila Pitha', icon: '🥟' },
  { id: 'gogona', label: 'Gogona Harp', icon: '🎋' }
];

export default function FestivalMemoryMatch({
  onComplete,
  onExit,
  language = 'en',
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null
}) {
  const effectiveTier = (tier || startingTier || initialTier)
    ? Number(tier || startingTier || initialTier)
    : patientProfile
    ? resolvePatientStartingTier(patientProfile)
    : 2;

  const targetPairsCount = effectiveTier === 1 ? 2 : effectiveTier === 3 ? 6 : 4;
  const resetDelayMs = effectiveTier === 1 ? 1500 : effectiveTier === 3 ? 800 : 1100;

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [turns, setTurns] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  // Initialize pairs based on tier (Tier 1: 2 pairs / 4 cards, Tier 2: 4 pairs / 8 cards, Tier 3: 6 pairs / 12 cards)
  useEffect(() => {
    const selectedPairs = FESTIVAL_PAIRS.slice(0, targetPairsCount);
    const deck = [];
    selectedPairs.forEach((item) => {
      deck.push({ uniqueKey: `${item.id}_a`, pairId: item.id, label: item.label, icon: item.icon });
      deck.push({ uniqueKey: `${item.id}_b`, pairId: item.id, label: item.label, icon: item.icon });
    });
    // Shuffle deck
    deck.sort(() => 0.5 - Math.random());
    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setTurns(0);
  }, [targetPairsCount]);

  const handleCardClick = (index) => {
    if (isBusy || flippedIndices.includes(index)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      setTurns((t) => t + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        sounds.playMatchChime();
        const nextMatched = [...matchedIds, firstCard.pairId];
        setMatchedIds(nextMatched);
        setFlippedIndices([]);
        setIsBusy(false);

        // Check if all pairs matched
        if (nextMatched.length === targetPairsCount) {
          setTimeout(() => {
            const accuracy = Math.min(100, Math.round((targetPairsCount / Math.max(targetPairsCount, turns + 1)) * 100));
            const score = Math.max(50, 100 - (turns - targetPairsCount) * 10);
            onComplete({
              score,
              maxScore: 100,
              accuracy,
              message: 'Well done! You remembered and matched all festival treasures.',
              subtext: `Completed in ${turns + 1} turns.`
            });
          }, 800);
        }
      } else {
        // Not matched: gentle reset
        setTimeout(() => {
          sounds.playEncouragingSoft();
          setFlippedIndices([]);
          setIsBusy(false);
        }, resetDelayMs);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between">
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
      {/* Game Header Bar */}
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Find the Matching Festival Pairs:
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Pairs matched: {matchedIds.length} of {targetPairsCount} • Turns taken: {turns}
          </p>
        </div>
        <span className="text-3xl">🪘</span>
      </div>

      {/* Cards Grid */}
      <div className={`grid gap-4 justify-items-center ${
        targetPairsCount === 2
          ? 'grid-cols-2 max-w-sm mx-auto'
          : targetPairsCount === 6
          ? 'grid-cols-3 sm:grid-cols-4'
          : 'grid-cols-2 sm:grid-cols-4'
      }`}>
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedIds.includes(card.pairId);

          return (
            <FlipCard
              key={card.uniqueKey}
              id={idx}
              isFlipped={isFlipped}
              isMatched={isMatched}
              disabled={isBusy}
              icon={card.icon}
              label={card.label}
              onClick={() => handleCardClick(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}
