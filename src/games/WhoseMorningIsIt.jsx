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

const PLAYBACK_INTERVAL_MS = 2400;

export default function WhoseMorningIsIt({ onComplete, onExit, language = 'en' }) {
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
      }, index * PLAYBACK_INTERVAL_MS);
    });
    setTimeout(() => setPlayingIndex(-1), playbackOrder.length * PLAYBACK_INTERVAL_MS);
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
      onBack={onExit}
    >
      <div className="flex flex-col space-y-5 w-full">
        {onExit && (
          <div className="flex items-center justify-between mb-2">
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

        {!started && (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold text-slate-800">Ready to listen to a village morning?</p>
            <button type="button" onClick={playSequence} className="min-h-[60px] px-8 rounded-2xl bg-teal-700 text-white text-xl font-bold shadow-lg hover:bg-teal-800 cursor-pointer">
              ▶ Play Morning Sounds
            </button>
          </div>
        )}

        {started && (
          <>
            <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 text-center">
              {playingIndex >= 0
                ? <p className="text-lg font-bold text-teal-900">Playing Sound {playingIndex + 1} of {playbackOrder.length}: {playbackOrder[playingIndex].icon} {playbackOrder[playingIndex].label}</p>
                : <p className="text-lg font-bold text-teal-900">Now arrange the sounds in the order you heard them.</p>}
            </div>

            {/* Visual Numbered Sound Strip with Active Highlight & Pulse */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800 text-center">
                {playingIndex >= 0 ? `▶ Playing Sound ${playingIndex + 1} of ${playbackOrder.length} Now 🔊` : 'Sequence Order Reference:'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {playbackOrder.map((sound, idx) => {
                  const isPlaying = playingIndex === idx;
                  return (
                    <div
                      key={sound.id}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        isPlaying
                          ? 'bg-teal-100 border-teal-600 ring-4 ring-teal-400 shadow-md scale-105 animate-pulse text-teal-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 border ${
                        isPlaying ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        Sound {idx + 1}
                      </span>
                      <div className="text-3xl my-1">{sound.icon}</div>
                      <div className="text-sm font-semibold truncate">{sound.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Replay Individual Sound Buttons during answer selection */}
            {playingIndex < 0 && !submitted && (
              <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    👂 Tap any sound to listen again before placing:
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Hear before deciding</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MORNING_SOUNDS.map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => {
                        if (sounds[sound.soundFn]) sounds[sound.soundFn]();
                      }}
                      className="flex items-center justify-center gap-2 p-3 min-h-[48px] bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-400 rounded-xl text-slate-800 font-bold text-sm shadow-xs transition active:scale-95 cursor-pointer"
                      aria-label={`Listen to ${sound.label}`}
                    >
                      <span className="text-xl">{sound.icon}</span>
                      <span>{sound.label}</span>
                      <span className="text-xs text-teal-700">🔊</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DragDropZone
              items={items}
              zones={zones}
              assignments={assignments}
              onAssign={handleAssign}
              language={language}
              disabled={submitted || playingIndex >= 0}
              unassignedTitle="Sounds to place (drag or tap):"
            />
            <button type="button" onClick={playSequence} disabled={playingIndex >= 0 || submitted} className="min-h-[52px] rounded-2xl bg-teal-100 border-2 border-teal-300 text-teal-900 text-lg font-bold disabled:opacity-50 cursor-pointer">
              🔁 Play Full Sequence Again
            </button>
            <button type="button" onClick={handleSubmit} disabled={placedCount !== MORNING_SOUNDS.length || submitted} className={`min-h-[60px] rounded-2xl text-xl font-bold shadow-lg ${placedCount === MORNING_SOUNDS.length && !submitted ? 'bg-teal-700 text-white hover:bg-teal-800 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {placedCount === MORNING_SOUNDS.length ? 'Check Order ✓' : `Place ${MORNING_SOUNDS.length - placedCount} more sound(s)`}
            </button>
          </>
        )}
      </div>
    </GameWrapper>
  );
}
