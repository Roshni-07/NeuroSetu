import React, { useState } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import MapRoute from '../shared/MapRoute.jsx';
import { sounds } from '../utils/soundEffects.js';

/**
 * Game 12 — A Day in My Village (Reasoning/Executive Function)
 * Uses MapRoute to show a short route, then asks for the activity that belongs
 * at each time-of-day stop.
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

// Each route stop has one sensible activity for its time of day.
const PUZZLES = [
  {
    title: 'A Village Morning',
    description: 'Follow the route, then choose the activity that belongs at each stop.',
    route: ['home', 'well', 'market', 'temple'],
    stops: [
      { nodeId: 'home', time: 'Early morning', prompt: 'What happens at home first?', options: ['🍚 Eat breakfast', '🌙 Sleep for the night', '🛒 Buy vegetables'], correct: 0 },
      { nodeId: 'well', time: 'Morning', prompt: 'What is useful at the well?', options: ['🪣 Fetch water', '🛏️ Take a nap', '🎶 Play music'], correct: 0 },
      { nodeId: 'market', time: 'Midday', prompt: 'What do you do at the market?', options: ['🛒 Buy vegetables', '🛁 Bathe a baby', '🌱 Plant rice'], correct: 0 },
      { nodeId: 'temple', time: 'Late afternoon', prompt: 'What is a thoughtful temple activity?', options: ['🛕 Offer a prayer', '🍳 Cook breakfast', '🪣 Draw water'], correct: 0 }
    ]
  },
  {
    title: 'An Afternoon Visit',
    description: 'Watch a second route and match each stop with the sensible activity.',
    route: ['field', 'neighbour', 'market', 'home'],
    stops: [
      { nodeId: 'field', time: 'Morning', prompt: 'What belongs in the rice field?', options: ['🌱 Check the seedlings', '🛒 Buy spices', '🛏️ Go to bed'], correct: 0 },
      { nodeId: 'neighbour', time: 'Afternoon', prompt: 'Why visit your neighbour?', options: ['👩‍🦳 Return borrowed cloth', '🪣 Fetch water', '🍚 Eat breakfast'], correct: 0 },
      { nodeId: 'market', time: 'Afternoon', prompt: 'What can you collect here?', options: ['🥬 Fresh vegetables', '🛕 Morning prayers', '🌙 A blanket for sleep'], correct: 0 },
      { nodeId: 'home', time: 'Evening', prompt: 'What is a good evening activity?', options: ['🏠 Rest at home', '🌱 Harvest rice at dawn', '🛒 Open the market'], correct: 0 }
    ]
  }
];

export default function DayInMyVillage({ onComplete, language = 'en' }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);
  const [routeShown, setRouteShown] = useState(false);
  const [stopIndex, setStopIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const puzzle = PUZZLES[puzzleIndex];

  const instructions = `Watch the character travel through the village. At each stop, choose the activity that makes sense for that time of day.`;

  const handleRouteDone = () => setRouteShown(true);

  const handleActivity = (optionIndex) => {
    const stop = puzzle.stops[stopIndex];
    const isCorrect = optionIndex === stop.correct;
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nextCorrect);
    if (isCorrect) sounds.playMatchChime();
    else sounds.playEncouragingSoft();

    if (stopIndex === puzzle.stops.length - 1) {
      const score = Math.round((nextCorrect / puzzle.stops.length) * 100);
      const message = score >= 100
      ? 'Perfect planning! You organized your village day beautifully.'
      : score >= 60
      ? 'Good planning! You got most of the order right.'
      : 'Good effort! Matching activities to places and times takes practice.';
      const res = {
        score,
      maxScore: 100,
      message,
        subtext: `Matched ${nextCorrect} of ${puzzle.stops.length} village activities correctly.`
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
    >
      {/* Puzzle selector */}
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

      {/* Puzzle description */}
      <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl px-4 py-4 mb-4">
        <p className="text-lg font-bold text-teal-900 mb-2">{puzzle.title}</p>
        <p className="text-base text-teal-800 whitespace-pre-line leading-relaxed">{puzzle.description}</p>
      </div>

      {/* Route, then one activity decision at a time */}
      <MapRoute
        key={gameKey}
        nodes={VILLAGE_NODES}
        connections={VILLAGE_CONNECTIONS}
        mode="show"
        highlightSequence={puzzle.route}
        onShowDone={handleRouteDone}
        language={language}
        showDuration={750}
        mapTitle="Your Village"
      />

      {routeShown && !result && (
        <div className="mt-4 space-y-3">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 text-center">
            <p className="text-sm font-bold uppercase text-teal-600">{puzzle.stops[stopIndex].time}</p>
            <p className="text-lg font-extrabold text-teal-900">{puzzle.stops[stopIndex].prompt}</p>
            <p className="text-sm text-teal-700">Stop {stopIndex + 1} of {puzzle.stops.length}</p>
          </div>
          <div className="grid gap-3">
            {puzzle.stops[stopIndex].options.map((option, index) => (
              <button key={option} type="button" onClick={() => handleActivity(index)} className="min-h-[60px] rounded-2xl border-2 border-slate-300 bg-white px-4 text-left text-lg font-bold text-slate-800 hover:border-teal-500 hover:bg-teal-50">
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
