import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import {
  TEXTILE_PATTERN_TASKS,
  getCulturalContentByState
} from '../../data/reminiscenceContent.js';
import GameTutorialOverlay from './GameTutorialOverlay.jsx';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function PatternMatchingGame({
  profileId = 'default_patient',
  patientProfile = null,
  initialTier = 2,
  promptDurationMs = 15,
  rewardDurationMs = 50,
  onComplete = null,
  onExit = null
}) {
  const isEn = patientProfile?.language === 'en';
  const [engineState, setEngineState] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem('neurosetu_tutorial_pattern_matching_seen');
    } catch (e) {
      return false;
    }
  });

  const [tierNotice, setTierNotice] = useState(null);
  const prevTierRef = useRef(initialTier);
  const engineRef = useRef(null);

  useEffect(() => {
    const tasksToUse = patientProfile?.homeState
      ? getCulturalContentByState(patientProfile.homeState).textileTasks
      : TEXTILE_PATTERN_TASKS;

    const engine = new CognitiveGameEngine({
      profileId,
      gameType: 'pattern_matching',
      initialTier,
      tasks: tasksToUse,
      promptDurationMs,
      rewardDurationMs,
      onStateChange: (state) => {
        setEngineState({ ...state });
        if (state.currentTier && state.currentTier !== prevTierRef.current) {
          const isUp = state.currentTier > prevTierRef.current;
          setTierNotice({
            message: isUp
              ? (isEn ? `🎉 Level Up! Promoted to Tier ${state.currentTier}` : `🎉 পৰ্যায় বৃদ্ধি! পৰ্যায় ${state.currentTier} মুকলি হ’ল`)
              : (isEn ? `🤝 Gentle Assistance Active (Tier ${state.currentTier})` : `🤝 সহজ সহায় সংক্ৰিয় (পৰ্যায় ${state.currentTier})`),
            type: isUp ? 'up' : 'down'
          });
          prevTierRef.current = state.currentTier;
          setTimeout(() => setTierNotice(null), 3500);
        }
      }
    });

    engineRef.current = engine;
    engine.startSession();

    return () => {
      if (engineRef.current) engineRef.current.cleanup();
    };
  }, [profileId, initialTier, patientProfile?.homeState]);

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

  const primaryPrompt = isEn ? currentTask?.promptEn : currentTask?.promptAs;
  const secondaryPrompt = isEn ? currentTask?.promptAs : currentTask?.promptEn;

  const handleSpeakPrompt = () => {
    if (primaryPrompt) {
      synthesizeSpeech(primaryPrompt, isEn ? 'en' : 'as');
    }
  };

  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-patient-border shadow-lg text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-patient-success text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
          🧵
        </div>
        <h2 className="text-patient-hero text-patient-primary">
          {isEn ? 'Patterns Matched!' : 'চানেকি মিলিল! (Patterns Matched!)'}
        </h2>
        <p className="text-patient-body text-patient-secondary mt-2">
          {isEn
            ? 'You have successfully identified the traditional North East handloom patterns.'
            : 'আপুনি উত্তৰ-পূৰ্বাঞ্চলৰ পৰম্পৰাগত বস্ত্ৰৰ চানেকিবোৰ নিৰ্ভুলভাৱে চিনাক্ত কৰিলে।'}
        </p>

        <div className="my-6 p-4 bg-patient-canvas border border-patient-border rounded-2xl">
          <span className="text-xs text-patient-hint uppercase font-bold tracking-wider">
            {isEn ? 'Total Score' : 'অৰ্জিত নম্বৰ'}
          </span>
          <p className="text-4xl font-extrabold text-patient-terracotta mt-1">{score} {isEn ? 'Points' : 'পইণ্ট'}</p>
          <p className="text-xs text-patient-secondary mt-1">Tier Reached: {currentTier}</p>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="min-h-touch px-6 py-3 bg-patient-terracotta text-white font-bold rounded-xl hover:bg-patient-terracotta-hover transition shadow-sm text-base"
          >
            {isEn ? 'Return Home →' : 'মুখ্য পৃষ্ঠালৈ যাওক'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-sm max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar: Progress, Visible Tier Indicator, Score, Help & Exit */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-patient-terracotta rounded-lg">
            {isEn ? `Pattern ${currentTaskIndex + 1} / ${totalTasks}` : `চানেকি ${currentTaskIndex + 1} / ${totalTasks}`}
          </span>

          {/* Visible Tier Progression Indicator */}
          <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[11px] font-bold text-gray-600">
            <span className="text-patient-terracotta">পৰ্যায় {currentTier}:</span>
            <span className={currentTier === 1 ? 'text-amber-800 font-extrabold' : 'text-gray-400'}>সহজ</span>
            <span>•</span>
            <span className={currentTier === 2 ? 'text-amber-800 font-extrabold' : 'text-gray-400'}>মানক</span>
            <span>•</span>
            <span className={currentTier === 3 ? 'text-amber-800 font-extrabold' : 'text-gray-400'}>চ্যালেঞ্জ</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-xs px-2 py-1 bg-amber-50 hover:bg-amber-100 text-patient-terracotta border border-amber-200 font-bold rounded-lg transition"
          >
            (?) {isEn ? 'Help' : 'সহায়'}
          </button>
          <span className="text-xs font-bold text-patient-primary">
            {isEn ? `Score: ${score}` : `নম্বৰ: ${score}`}
          </span>
          {onExit && (
            <button
              onClick={onExit}
              className="text-xs font-medium text-patient-hint hover:text-patient-primary px-2 py-1"
            >
              {isEn ? 'Exit' : 'বন্ধ কৰক'}
            </button>
          )}
        </div>
      </div>

      {/* DDA Dynamic Tier Level Up / Support Banner */}
      {tierNotice && (
        <div
          role="status"
          className={`p-3 rounded-2xl border-2 text-sm font-bold flex items-center justify-center gap-2 animate-bounce ${
            tierNotice.type === 'up'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}
        >
          <span>{tierNotice.message}</span>
        </div>
      )}

      {/* Cultural Textile Swatch Display */}
      {currentTask && (
        <div className="text-center space-y-4">
          <div
            className="w-48 h-32 mx-auto rounded-3xl border-4 border-amber-300 shadow-md flex items-center justify-center relative overflow-hidden transition-transform hover:scale-105"
            style={{ backgroundColor: currentTask.patternColor || '#D4AF37' }}
          >
            <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
            <span className="text-white text-xs font-bold px-3 py-1 bg-black/40 backdrop-blur-xs rounded-full">
              {currentTask.motifName}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-patient-terracotta uppercase tracking-wider">
              {currentTask.title}
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <h2 className="text-patient-prompt text-patient-primary font-bold">
                {primaryPrompt}
              </h2>
              <button
                type="button"
                onClick={handleSpeakPrompt}
                aria-label="Listen to question"
                className="w-10 h-10 rounded-full bg-amber-50 hover:bg-amber-100 text-patient-terracotta flex items-center justify-center border border-amber-300 text-lg shadow-sm"
              >
                🔊
              </button>
            </div>
            {secondaryPrompt && (
              <p className="text-xs text-patient-hint mt-0.5">
                {secondaryPrompt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Errorless Feedback Banner */}
      {state === GAME_STATES.GENTLE_HINT && gentleHintMessage && (
        <div
          data-testid="gentle-hint-banner"
          className="p-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-patient-hint text-sm font-medium flex items-center gap-3 animate-fade-in"
        >
          <span className="text-2xl text-patient-terracotta">💡</span>
          <div>
            <p className="font-semibold text-patient-primary">{gentleHintMessage}</p>
            <p className="text-xs text-patient-secondary mt-0.5">
              {isEn ? 'Observe the weave colors carefully.' : 'ৰং আৰু সুতাৰ বয়নলৈ মন কৰক।'}
            </p>
          </div>
        </div>
      )}

      {/* Success Affirmation Banner */}
      {state === GAME_STATES.SUCCESS_REWARD && (
        <div
          data-testid="success-banner"
          className="p-4 bg-green-50 border-2 border-green-300 rounded-2xl text-patient-success text-sm font-bold flex items-center justify-center gap-2 animate-scale-up"
        >
          <span className="text-2xl">🌟</span>
          <span>{isEn ? 'Correct textile match!' : 'নিখুঁত মিল! আপোনাৰ বাছনি শুদ্ধ হৈছে।'}</span>
        </div>
      )}

      {/* Textile Option Cards Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-patient-secondary uppercase tracking-wider block text-center">
            {isEn ? 'Select the matching handloom:' : 'মিলা বস্ত্ৰবিধ স্পৰ্শ কৰক:'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentTask.options.map((option) => {
              const isEliminated = eliminatedOptions.includes(option.id);
              const label = isEn ? (option.labelEn || option.labelAs) : option.labelAs;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isEliminated || state === GAME_STATES.SUCCESS_REWARD}
                  onClick={() => handleOptionClick(option.id)}
                  className={`min-h-touch p-4 rounded-2xl border-2 font-bold text-base flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                    isEliminated
                      ? 'opacity-30 border-dashed border-gray-300 bg-gray-50 cursor-not-allowed'
                      : 'border-patient-border hover:border-patient-terracotta bg-white text-patient-primary'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: option.colorHex || '#D4AF37' }}
                  />
                  <span>{label}</span>
                  <span className="text-xs text-patient-hint font-normal">{option.region}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tutorial Overlay Modal */}
      <GameTutorialOverlay
        gameType="pattern_matching"
        language={patientProfile?.language || 'as'}
        isOpen={showTutorial}
        onStart={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_pattern_matching_seen', 'true');
          } catch (e) {}
        }}
        onSkip={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_pattern_matching_seen', 'true');
          } catch (e) {}
        }}
      />
    </div>
  );
}
