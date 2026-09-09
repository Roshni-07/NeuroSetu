import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MapRoute from '../shared/MapRoute.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 12 — A Day in My Village (Reasoning / Executive Function)
 * Uses MapRoute to show a route through the village, then asks player to choose
 * the sensible cultural activity for each stop along the day's journey.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Route stops scale from 2 (Level 1) to 5 (Level 10)
 * - Decision choices scale from 2 options (Level 1) to 4 options (Level 10)
 * - Map animation pacing scales from 1200ms down to 550ms / node
 * - Guarantees 10 distinct difficulty parameter states
 */

const VILLAGE_NODES = [
  { id: 'home', label: 'Home', icon: '🏠', x: 50, y: 75 },
  { id: 'well', label: 'Water Well', icon: '🪣', x: 22, y: 55 },
  { id: 'market', label: 'Market', icon: '🛒', x: 78, y: 55 },
  { id: 'temple', label: 'Temple', icon: '🛕', x: 50, y: 25 },
  { id: 'field', label: 'Rice Field', icon: '🌾', x: 22, y: 28 },
  { id: 'neighbour', label: "Neighbour's", icon: '👩‍🦳', x: 78, y: 28 },
];

const VILLAGE_CONNECTIONS = [
  ['home', 'well'],
  ['home', 'market'],
  ['home', 'temple'],
  ['well', 'field'],
  ['market', 'neighbour'],
  ['temple', 'field'],
  ['temple', 'neighbour'],
  ['field', 'neighbour'],
];

// Curated 5-stop village journeys with 1 correct + 3 plausible distractors per stop
const PUZZLES = [
  {
    title: 'A Village Morning',
    description: 'Follow the morning route, then choose the sensible village activity at each stop.',
    stops: [
      {
        nodeId: 'home',
        time: 'Early morning',
        prompt: 'What happens at home first?',
        correctOption: '🍚 Eat warm morning breakfast',
        distractors: [
          '🌙 Sleep for the night',
          '🛒 Open the evening market',
          '🛏️ Take a long afternoon nap'
        ]
      },
      {
        nodeId: 'well',
        time: 'Morning',
        prompt: 'What is useful to do at the water well?',
        correctOption: '🪣 Fetch water for tea and cooking',
        distractors: [
          '🛏️ Lie down for sleep',
          '🎶 Play loud festival drums',
          '🕯️ Light the evening oil lamp'
        ]
      },
      {
        nodeId: 'field',
        time: 'Mid-morning',
        prompt: 'What belongs in the rice field?',
        correctOption: '🌱 Tend the fresh green paddy',
        distractors: [
          '🛒 Buy brass cooking pots',
          '🛁 Bathe a baby calf indoors',
          '🌙 Lock the house for bed'
        ]
      },
      {
        nodeId: 'market',
        time: 'Midday',
        prompt: 'What do you do at the market?',
        correctOption: '🛒 Buy vegetables and spices',
        distractors: [
          '🛁 Sleep under a heavy quilt',
          '🌱 Sow rice seeds on the gravel road',
          '🪣 Draw well water inside the shop'
        ]
      },
      {
        nodeId: 'temple',
        time: 'Late afternoon',
        prompt: 'What is a thoughtful temple activity?',
        correctOption: '🛕 Offer a peaceful prayer',
        distractors: [
          '🍳 Fry fish in boiling oil',
          '🪣 Wash heavy muddy blankets',
          '🛒 Open a vegetable stall'
        ]
      }
    ]
  },
  {
    title: 'An Afternoon Visit',
    description: 'Follow the afternoon journey and match each stop with its rightful village task.',
    stops: [
      {
        nodeId: 'field',
        time: 'Early morning',
        prompt: 'What is done first in the rice field?',
        correctOption: '🌱 Check the tender morning seedlings',
        distractors: [
          '🛒 Shop for evening sweets',
          '🛏️ Go to bed for the night',
          '🪔 Light the bedtime lamp'
        ]
      },
      {
        nodeId: 'neighbour',
        time: 'Late morning',
        prompt: 'Why visit your neighbour?',
        correctOption: '👩‍🦳 Return borrowed weaving cloth',
        distractors: [
          '🪣 Dig a deep water well in their parlor',
          '🍚 Cook a huge wedding banquet alone',
          '🌙 Lock their door for sleep'
        ]
      },
      {
        nodeId: 'market',
        time: 'Afternoon',
        prompt: 'What can you collect at the market?',
        correctOption: '🥬 Fresh vegetables for dinner',
        distractors: [
          '🛕 Morning temple chanting flowers',
          '🌙 A thick woolen quilt for sleep',
          '🌾 Plow the market floor'
        ]
      },
      {
        nodeId: 'temple',
        time: 'Dusk',
        prompt: 'What evening reverence is offered at the temple?',
        correctOption: '🛕 Ring the prayer bell at dusk',
        distractors: [
          '🌱 Plant rice seedlings in the dark',
          '🛒 Bargain for morning vegetables',
          '🪣 Wash muddy clothes in the shrine'
        ]
      },
      {
        nodeId: 'home',
        time: 'Night',
        prompt: 'What is a comforting evening activity at home?',
        correctOption: '🏠 Rest and share tea with family',
        distractors: [
          '🌱 Harvest crops in pitch dark',
          '🛒 Set up a marketplace stall',
          '🪣 Draw well water at midnight'
        ]
      }
    ]
  }
];

export default function DayInMyVillage({
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
  const isExplicitLevel = level !== null && level !== undefined;
  const hasConfig = isExplicitLevel || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
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
  }, [isExplicitLevel, level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('day-in-my-village', currentLevel);
  }, [currentLevel]);

  // Number of route stops: 2 stops at L1 up to 5 stops at L10 (defaults to 4 if unconfigured)
  const activeStopCount = useMemo(() => {
    if (!hasConfig) return 4;
    return Math.max(2, Math.min(5, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Distractors per stop: 1 at L1 up to 3 at L10 (giving 2 to 4 options per stop)
  const distractorCount = useMemo(() => {
    if (!hasConfig) return 2; // 3 options total
    return Math.max(1, Math.min(3, difficultyParams.distractorCount || 2));
  }, [hasConfig, difficultyParams.distractorCount]);

  const optionCount = 1 + distractorCount;

  // Animation pace per node: 1200ms (L1) down to 550ms (L10)
  const showDuration = useMemo(() => {
    if (!hasConfig) return 750;
    return Math.max(550, Math.round(1200 - ((currentLevel - 1) / 9) * 650));
  }, [hasConfig, currentLevel]);

  const startTime = useRef(Date.now());
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const [routeShown, setRouteShown] = useState(false);
  const [stopIndex, setStopIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Auto-seed puzzle based on level for session variety
  useEffect(() => {
    if (hasConfig) {
      setPuzzleIndex((currentLevel - 1) % PUZZLES.length);
    }
  }, [hasConfig, currentLevel]);

  const puzzle = PUZZLES[puzzleIndex] || PUZZLES[0];

  // Active stops sliced from puzzle definition
  const activeStops = useMemo(() => {
    return puzzle.stops.slice(0, activeStopCount);
  }, [puzzle, activeStopCount]);

  const activeRoute = useMemo(() => {
    return activeStops.map(s => s.nodeId);
  }, [activeStops]);

  // Active stop and its options (with correct choice guaranteed)
  const currentStop = activeStops[stopIndex] || activeStops[0];
  const currentOptions = useMemo(() => {
    if (!currentStop) return [];
    const correct = currentStop.correctOption;
    const distractors = currentStop.distractors.slice(0, distractorCount);
    const combined = [correct, ...distractors];
    // Deterministic shuffle
    return combined.sort((a, b) => (a.length + stopIndex + currentLevel) % 2 === 0 ? 1 : -1);
  }, [currentStop, distractorCount, stopIndex, currentLevel]);

  const instructions = `Watch the character travel through the village. At each stop, choose the activity that makes sense for that time of day.`;

  const handleRouteDone = () => setRouteShown(true);

  const handleActivity = (chosenOption) => {
    const isCorrect = chosenOption === currentStop.correctOption;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrect);
    if (isCorrect) sounds.playMatchChime();
    else sounds.playEncouragingSoft();

    if (stopIndex === activeStops.length - 1) {
      const score = Math.round((nextCorrect / activeStops.length) * 100);
      const responseTimeMs = Math.max(100, Date.now() - startTime.current);
      const errorCount = Math.max(0, activeStops.length - nextCorrect);
      const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

      const message = score >= 100
        ? 'Perfect planning! You organized your village day beautifully.'
        : score >= 60
        ? 'Good planning! You got most of the order right.'
        : 'Good effort! Matching activities to places and times takes practice.';
      const res = {
        gameId: 'day-in-my-village',
        score,
        maxScore: 100,
        accuracy: score,
        errorCount,
        responseTimeMs,
        latencyMs: responseTimeMs,
        message,
        subtext: `Matched ${nextCorrect} of ${activeStops.length} village activities correctly.`,
        level: currentLevel,
        tier: derivedTier,
        difficultyTier: derivedTier,
        sessionLevel: currentLevel,
        difficultyParams
      };
      setResult(res);
      if (onComplete) onComplete(res);
      return;
    }
    setStopIndex(index => index + 1);
  };

  const handleRetry = () => {
    setResult(null);
    setRouteShown(false);
    setStopIndex(0);
    setCorrectCount(0);
    startTime.current = Date.now();
    setGameKey(k => k + 1);
  };

  return (
    <GameWrapper
      title="A Day in My Village"
      emoji="🌾"
      category="Reasoning"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
      onBack={onExit}
    >
      {onExit && (
        <div className="flex items-center justify-between mb-4">
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

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {activeStops.length} Stops • {optionCount} Options / Stop • {(showDuration / 1000).toFixed(2)}s pace
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Manual puzzle selector preserved when unconfigured */}
      {!hasConfig && (
        <div className="flex justify-center gap-2 mb-4">
          {PUZZLES.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setPuzzleIndex(i); handleRetry(); }}
              className={`min-h-[44px] px-4 rounded-xl text-sm font-bold border-2 transition-colors ${
                i === puzzleIndex
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Puzzle description */}
      <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl px-4 py-4 mb-4">
        <p className="text-lg font-bold text-teal-900 mb-1">{puzzle.title}</p>
        <p className="text-base text-teal-800 whitespace-pre-line leading-relaxed">{puzzle.description}</p>
      </div>

      {/* Route, then one activity decision at a time */}
      <MapRoute
        key={gameKey}
        nodes={VILLAGE_NODES}
        connections={VILLAGE_CONNECTIONS}
        mode="show"
        highlightSequence={activeRoute}
        onShowDone={handleRouteDone}
        language={language}
        showDuration={showDuration}
        mapTitle="Your Village"
      />

      {routeShown && !result && currentStop && (
        <div className="mt-4 space-y-3">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm font-bold uppercase text-teal-600">{currentStop.time}</p>
            <p className="text-lg font-extrabold text-teal-900">{currentStop.prompt}</p>
            <p className="text-sm text-teal-700">Stop {stopIndex + 1} of {activeStops.length}</p>
          </div>
          <div className="grid gap-3">
            {currentOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleActivity(option)}
                className="min-h-[60px] rounded-2xl border-2 border-slate-300 bg-white px-4 text-left text-lg font-bold text-slate-800 hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
