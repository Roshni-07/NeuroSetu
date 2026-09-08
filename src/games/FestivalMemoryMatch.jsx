import React, { useState, useEffect, useMemo } from 'react';
import FlipCard from '../shared/FlipCard.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

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
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  onLevelChange = null
}) {
  const currentLevel = useMemo(() => {
    if (level && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    const legacyTier = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'critical' ? 1 : patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : null);
    if (legacyTier) {
      const t = Number(legacyTier);
      if (t === 1) return 1;
      if (t === 3) return 10;
      return 5;
    }
    return 5;
  }, [level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const params = useMemo(() => {
    return getDifficultyParams('festival-memory-match', currentLevel);
  }, [currentLevel]);

  const targetPairsCount = params.itemCount;
  const resetDelayMs = params.previewTimeMs;

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
      const currentTurnCount = turns + 1;
      setTurns(currentTurnCount);

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
            const accuracy = Math.min(100, Math.round((targetPairsCount / Math.max(targetPairsCount, currentTurnCount)) * 100));
            const score = Math.max(50, 100 - (currentTurnCount - targetPairsCount) * 10);
            onComplete({
              score,
              maxScore: 100,
              accuracy,
              level: currentLevel,
              message: 'Well done! You remembered and matched all festival treasures.',
              subtext: `Completed in ${currentTurnCount} turns.`
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
      <div className="flex items-center justify-between mb-4">
        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        ) : <div />}
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Level {currentLevel}/10
        </span>
      </div>
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
