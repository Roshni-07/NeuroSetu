import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import { TEXTILE_PATTERN_TASKS } from '../../data/reminiscenceContent.js';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function PatternMatchingGame({
  profileId = 'default_patient',
  initialTier = 2,
  promptDurationMs = 15,
  rewardDurationMs = 50,
  onComplete = null,
  onExit = null
}) {
  const [engineState, setEngineState] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const engine = new CognitiveGameEngine({
      profileId,
      gameType: 'pattern_matching',
      initialTier,
      tasks: TEXTILE_PATTERN_TASKS,
      promptDurationMs,
      rewardDurationMs,
      onStateChange: (state) => setEngineState({ ...state })
    });

    engineRef.current = engine;
    engine.startSession();

    return () => {
      if (engineRef.current) engineRef.current.cleanup();
    };
  }, [profileId, initialTier]);

  if (!engineState) {
    return <div className="p-6 text-center text-patient-hint">বস্ত্ৰ চানেকি খেল আৰম্ভ হৈছে...</div>;
  }

  const {
    state,
    currentTier,
    currentTask,
    currentTaskIndex,
    totalTasks,
    score,
    gentleHintMessage,
    eliminatedOptions
  } = engineState;

  const handleOptionClick = (optionId) => {
    if (engineRef.current) {
      engineRef.current.submitAnswer(optionId);
    }
  };

  const handleSpeakPrompt = () => {
    if (currentTask?.promptAs) {
      synthesizeSpeech(currentTask.promptAs, 'as');
    }
  };

  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-patient-border shadow-lg text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-patient-success text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
          🧵
        </div>
        <h2 className="text-patient-hero text-patient-primary">চানেকি মিলিল! (Patterns Matched!)</h2>
        <p className="text-patient-body text-patient-secondary mt-2">
          আপুনি উত্তৰ-পূৰ্বাঞ্চলৰ পৰম্পৰাগত বস্ত্ৰৰ চানেকিবোৰ নিৰ্ভুলভাৱে চিনাক্ত কৰিলে।
        </p>

        <div className="my-6 p-4 bg-patient-canvas border border-patient-border rounded-2xl">
          <span className="text-xs text-patient-hint uppercase font-bold tracking-wider">অৰ্জিত নম্বৰ (Score)</span>
          <p className="text-4xl font-extrabold text-patient-accent mt-1">{score} পইণ্ট</p>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="min-h-touch px-6 py-3 bg-patient-accent text-white font-bold rounded-xl hover:bg-patient-accent-hover transition shadow-sm text-base"
          >
            মুখ্য পৃষ্ঠালৈ যাওক (Return Home)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-sm max-w-2xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
            চানেকি {currentTaskIndex + 1} / {totalTasks}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-patient-hint rounded">
            পৰ্যায় {currentTier}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-patient-primary">নম্বৰ: {score}</span>
          {onExit && (
            <button
              onClick={onExit}
              className="text-xs font-medium text-patient-hint hover:text-patient-primary px-2 py-1"
            >
              বন্ধ কৰক (Exit)
            </button>
          )}
        </div>
      </div>

      {/* Target Pattern Swatch Display */}
      {currentTask && (
        <div className="text-center space-y-4">
          {/* Visual Swatch */}
          <div
            className="w-48 h-32 mx-auto rounded-2xl border-4 border-white shadow-md flex items-center justify-center transition-transform hover:scale-105"
            style={{
              backgroundColor: currentTask.patternColor || '#D4AF37',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 20px)'
            }}
          >
            <span className="px-3 py-1 bg-black/40 text-white rounded-full text-xs font-bold backdrop-blur-xs">
              {currentTask.motifName}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-patient-accent uppercase tracking-wider">
              {currentTask.title}
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <h2 className="text-patient-prompt text-patient-primary font-bold">
                {currentTask.promptAs}
              </h2>
              <button
                type="button"
                onClick={handleSpeakPrompt}
                aria-label="Listen to prompt"
                className="w-10 h-10 rounded-full bg-teal-50 hover:bg-teal-100 text-patient-accent flex items-center justify-center border border-teal-300 text-lg shadow-sm"
              >
                🔊
              </button>
            </div>
            <p className="text-xs text-patient-hint mt-0.5">
              {currentTask.promptEn}
            </p>
          </div>
        </div>
      )}

      {/* Gentle Hint Feedback */}
      {state === GAME_STATES.GENTLE_HINT && gentleHintMessage && (
        <div
          data-testid="gentle-hint-banner"
          className="p-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-patient-hint text-sm font-medium flex items-center gap-3"
        >
          <span className="text-2xl text-patient-accent">💡</span>
          <div>
            <p className="font-semibold text-patient-primary">{gentleHintMessage}</p>
            <p className="text-xs text-patient-secondary mt-0.5">
              কোনো চিন্তা নাই, ৰং আৰু বুটাবোৰ ভালদৰে মিলাই লওক।
            </p>
          </div>
        </div>
      )}

      {/* Success Affirmation */}
      {state === GAME_STATES.SUCCESS_REWARD && (
        <div
          data-testid="success-banner"
          className="p-4 bg-green-50 border-2 border-green-300 rounded-2xl text-patient-success text-sm font-bold flex items-center justify-center gap-2"
        >
          <span className="text-2xl">✨</span>
          <span>চানেকি মিলিল! আপোনাৰ নিৰ্বাচন সঠিক হৈছে।</span>
        </div>
      )}

      {/* Textile Option Cards Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-patient-secondary uppercase tracking-wider block text-center">
            সঠিক বস্ত্ৰবিধ বাচক (Choose matching textile)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentTask.options.map((opt) => {
              const isEliminated = eliminatedOptions.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isEliminated || state === GAME_STATES.EVALUATING || state === GAME_STATES.SUCCESS_REWARD}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`min-h-touch p-4 rounded-2xl border-2 font-bold text-left transition-all shadow-sm flex items-center justify-between ${
                    isEliminated
                      ? 'opacity-30 border-gray-200 bg-gray-100 line-through cursor-not-allowed'
                      : 'border-patient-border bg-patient-canvas hover:border-patient-accent hover:bg-teal-50/50 active:scale-95 text-patient-primary'
                  }`}
                >
                  <div>
                    <p className="text-base text-patient-primary font-bold">{opt.labelAs}</p>
                    <span className="text-xs text-patient-hint font-normal">{opt.region}</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
                    style={{ backgroundColor: opt.colorHex }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
