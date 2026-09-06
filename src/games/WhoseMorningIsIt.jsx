import React, { useState } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import DragDropZone from '../shared/DragDropZone.jsx';
import { sounds } from '../utils/soundEffects.js';

const MORNING_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: '🌧️', soundFn: 'playRainDrizzle' },
  { id: 'birds', label: 'Birds', icon: '🐦', soundFn: 'playBirdsong' },
  { id: 'kettle', label: 'Kettle', icon: '🫖', soundFn: 'playKettleWhistle' },
  { id: 'flute', label: 'Bamboo flute', icon: '🎶', soundFn: 'playFluteNote' }
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function WhoseMorningIsIt({ onComplete, language = 'en' }) {
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [playbackOrder, setPlaybackOrder] = useState(() => shuffle(MORNING_SOUNDS));
  const [assignments, setAssignments] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const instructions = `Listen to four village morning sounds in sequence. When playback finishes, drag or tap each picture into the four boxes in the order you heard it.`;

  const playSequence = () => {
    setStarted(true);
    setAssignments({});
    setSubmitted(false);
    setResult(null);
    playbackOrder.forEach((sound, index) => {
      setTimeout(() => {
        setPlayingIndex(index);
        if (sounds[sound.soundFn]) sounds[sound.soundFn]();
      }, index * 1300);
    });
    setTimeout(() => setPlayingIndex(-1), playbackOrder.length * 1300);
  };

  const handleAssign = (soundId, zoneId) => {
    setAssignments(previous => {
      const next = { ...previous };
      Object.keys(next).forEach(key => {
        if (next[key] === zoneId || next[key] === soundId) delete next[key];
      });
      if (zoneId) next[soundId] = zoneId;
      return next;
    });
  };

  const handleSubmit = () => {
    const correct = playbackOrder.reduce((total, sound, index) => (
      assignments[sound.id] === `order-${index}` ? total + 1 : total
    ), 0);
    const score = Math.round((correct / playbackOrder.length) * 100);
    const res = {
      score,
      maxScore: 100,
      message: score === 100
        ? 'Perfect listening! You remembered every sound in order.'
        : 'Good listening practice! Sound sequences become easier with practice.',
      subtext: `Placed ${correct} of ${playbackOrder.length} sounds in the correct position.`
    };
    setSubmitted(true);
    setResult(res);
    if (onComplete) onComplete(res);
  };

  const handleRetry = () => {
    setResult(null);
    setStarted(false);
    setPlayingIndex(-1);
    setAssignments({});
    setSubmitted(false);
    setPlaybackOrder(shuffle(MORNING_SOUNDS));
  };

  const items = MORNING_SOUNDS.map(sound => ({ id: sound.id, label: sound.label, icon: sound.icon }));
  const zones = playbackOrder.map((sound, index) => ({
    id: `order-${index}`,
    title: `Place ${index + 1}`,
    subtitle: index === 0 ? 'First sound' : index === playbackOrder.length - 1 ? 'Last sound' : 'In the sequence',
    icon: '🔊'
  }));
  const placedCount = Object.keys(assignments).length;

  return (
    <GameWrapper
      title="Whose Morning Is It?"
      emoji="🌅"
      category="Memory"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
    >
      <div className="flex flex-col space-y-5 w-full">
        {!started && (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold text-slate-800">Ready to listen to a village morning?</p>
            <button type="button" onClick={playSequence} className="min-h-[60px] px-8 rounded-2xl bg-teal-700 text-white text-xl font-bold shadow-lg hover:bg-teal-800">
              ▶ Play Morning Sounds
            </button>
          </div>
        )}

        {started && (
          <>
            <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 text-center">
              {playingIndex >= 0
                ? <p className="text-lg font-bold text-teal-900">Sound {playingIndex + 1} of {playbackOrder.length}: {playbackOrder[playingIndex].icon} {playbackOrder[playingIndex].label}</p>
                : <p className="text-lg font-bold text-teal-900">Now arrange the sounds in the order you heard them.</p>}
            </div>
            <DragDropZone
              items={items}
              zones={zones}
              assignments={assignments}
              onAssign={handleAssign}
              language={language}
              disabled={submitted || playingIndex >= 0}
              unassignedTitle="Sounds to place (drag or tap):"
            />
            <button type="button" onClick={playSequence} disabled={playingIndex >= 0 || submitted} className="min-h-[52px] rounded-2xl bg-teal-100 border-2 border-teal-300 text-teal-900 text-lg font-bold disabled:opacity-50">
              🔁 Play Sequence Again
            </button>
            <button type="button" onClick={handleSubmit} disabled={placedCount !== MORNING_SOUNDS.length || submitted} className={`min-h-[60px] rounded-2xl text-xl font-bold shadow-lg ${placedCount === MORNING_SOUNDS.length && !submitted ? 'bg-teal-700 text-white hover:bg-teal-800' : 'bg-slate-200 text-slate-400'}`}>
              {placedCount === MORNING_SOUNDS.length ? 'Check Order ✓' : `Place ${MORNING_SOUNDS.length - placedCount} more sound(s)`}
            </button>
          </>
        )}
      </div>
    </GameWrapper>
  );
}
