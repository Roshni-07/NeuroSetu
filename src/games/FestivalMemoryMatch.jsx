import React, { useState, useEffect } from 'react';
import FlipCard from '../shared/FlipCard.jsx';
import { sounds } from '../utils/soundEffects.js';

const FESTIVAL_PAIRS = [
  { id: 'dhol', label: 'Bihu Dhol', icon: '🥁' },
  { id: 'pepa', label: 'Pepa Horn', icon: '📯' },
  { id: 'japi', label: 'Japi Hat', icon: '👒' },
  { id: 'xorai', label: 'Golden Xorai', icon: '🏆' },
  { id: 'pitha', label: 'Tila Pitha', icon: '🥟' },
  { id: 'gogona', label: 'Gogona Harp', icon: '🎋' }
];

export default function FestivalMemoryMatch({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [turns, setTurns] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  // Initialize 4 pairs (8 cards)
  useEffect(() => {
    const selectedPairs = FESTIVAL_PAIRS.slice(0, 4);
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
  }, []);

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

        // Check if all pairs matched (4 pairs)
        if (nextMatched.length === 4) {
          setTimeout(() => {
            const accuracy = Math.min(100, Math.round((4 / Math.max(4, turns + 1)) * 100));
            const score = Math.max(50, 100 - (turns - 4) * 10);
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
        }, 1100);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Game Header Bar */}
      <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Find the Matching Festival Pairs:
          </h3>
          <p className="text-base text-slate-600 font-medium">
            Pairs matched: {matchedIds.length} of 4 • Turns taken: {turns}
          </p>
        </div>
        <span className="text-3xl">🪘</span>
      </div>

      {/* 4x2 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
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
