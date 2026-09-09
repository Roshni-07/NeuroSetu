import React, { useState, useMemo, useEffect } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import DragDropZone from '../shared/DragDropZone.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

// Expanded sound bank (6 authentic village morning auditory cues)
const ALL_MORNING_SOUNDS = [
  { id: 'rain', label: 'Rain', icon: '🌧️', soundFn: 'playRainDrizzle' },
  { id: 'birds', label: 'Birds', icon: '🐦', soundFn: 'playBirdsong' },
  { id: 'kettle', label: 'Kettle', icon: '🫖', soundFn: 'playKettleWhistle' },
  { id: 'flute', label: 'Bamboo flute', icon: '🎶', soundFn: 'playFluteNote' },
  { id: 'bell', label: 'Prayer Bell', icon: '🔔', soundFn: 'playTempleBell' },
  { id: 'dhol', label: 'Morning Dhol', icon: '🥁', soundFn: 'playDholBeat' }
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function WhoseMorningIsIt({
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
    return getDifficultyParams('whose-morning-is-it', currentLevel);
  }, [currentLevel]);

  // Number of sequential sounds: 2 sounds at L1 up to 6 sounds at L10. Defaults to 4 when unconfigured.
  const activeSoundCount = useMemo(() => {
    if (!hasConfig) return 4;
    return Math.max(2, Math.min(6, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Playback interval: 3600ms (L1) down to 2400ms (L10) with strictly preserved 2400ms gerontological floor
  const playbackIntervalMs = useMemo(() => {
    if (!hasConfig) return 2400;
    return Math.max(2400, difficultyParams.previewTimeMs || 2400);
  }, [hasConfig, difficultyParams.previewTimeMs]);

  // Active pool of sounds sliced for this level
  const activeSoundPool = useMemo(() => {
    return ALL_MORNING_SOUNDS.slice(0, activeSoundCount);
  }, [activeSoundCount]);

  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [playbackOrder, setPlaybackOrder] = useState(() => shuffle(activeSoundPool));
  const [assignments, setAssignments] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Re-seed sequence on level change
  useEffect(() => {
    setStarted(false);
    setPlayingIndex(-1);
    setAssignments({});
    setSubmitted(false);
    setResult(null);
    setPlaybackOrder(shuffle(activeSoundPool));
  }, [activeSoundPool]);

  const instructions = `Listen to ${activeSoundCount} village morning sounds in sequence. When playback finishes, drag or tap each picture into the ${activeSoundCount} boxes in the order you heard it.`;

  const playSequence = () => {
    setStarted(true);
    setAssignments({});
    setSubmitted(false);
    setResult(null);
    playbackOrder.forEach((sound, index) => {
      setTimeout(() => {
        setPlayingIndex(index);
        if (sounds[sound.soundFn]) sounds[sound.soundFn]();
      }, index * playbackIntervalMs);
    });
    setTimeout(() => setPlayingIndex(-1), playbackOrder.length * playbackIntervalMs);
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
      accuracy: score,
      message: score === 100
        ? 'Perfect listening! You remembered every sound in order.'
        : 'Good listening practice! Sound sequences become easier with practice.',
      subtext: `Placed ${correct} of ${playbackOrder.length} sounds in the correct position.`,
      level: currentLevel,
      difficultyParams
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
    setPlaybackOrder(shuffle(activeSoundPool));
  };

  const items = activeSoundPool.map(sound => ({ id: sound.id, label: sound.label, icon: sound.icon }));
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

        {/* Adaptive Level Badge */}
        <div className="flex items-center justify-between px-4 py-2 bg-teal-50 border border-teal-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
              Level {currentLevel}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {activeSoundCount} Sounds Sequence • {(playbackIntervalMs / 1000).toFixed(1)}s Pace
            </span>
          </div>
          <span className="text-xs font-bold text-teal-800">
            {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
          </span>
        </div>

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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {activeSoundPool.map((sound) => (
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
            <button type="button" onClick={handleSubmit} disabled={placedCount !== activeSoundPool.length || submitted} className={`min-h-[60px] rounded-2xl text-xl font-bold shadow-lg ${placedCount === activeSoundPool.length && !submitted ? 'bg-teal-700 text-white hover:bg-teal-800 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              {placedCount === activeSoundPool.length ? 'Check Order ✓' : `Place ${activeSoundPool.length - placedCount} more sound(s)`}
            </button>
          </>
        )}
      </div>
    </GameWrapper>
  );
}
