import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import {
  MEMORY_RECALL_TASKS,
  getCulturalContentByState,
  interpolatePersonalPrompt
} from '../../data/reminiscenceContent.js';
import VoiceInputHandler from '../voice/VoiceInputHandler.jsx';
import GameTutorialOverlay from './GameTutorialOverlay.jsx';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function MemoryRecallGame({
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
      return !localStorage.getItem('neurosetu_tutorial_memory_recall_seen');
    } catch (e) {
      return false;
    }
  });

  const [tierNotice, setTierNotice] = useState(null);
  const prevTierRef = useRef(initialTier);
  const engineRef = useRef(null);

  useEffect(() => {
    const tasksToUse = patientProfile?.homeState
      ? getCulturalContentByState(patientProfile.homeState).memoryTasks
      : MEMORY_RECALL_TASKS;

    const engine = new CognitiveGameEngine({
      profileId,
      gameType: 'memory_recall',
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
    return <div className="p-6 text-center text-patient-hint">খেল আৰম্ভ হৈছে... (Loading Game...)</div>;
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

  const handleVoiceTranscript = (result) => {
    if (engineRef.current && result?.transcript) {
      const spoken = result.detectedKeyword || result.transcript;
      engineRef.current.submitAnswer(spoken);
    }
  };

  const hasPersonalInfo = Boolean(
    patientProfile &&
    patientProfile.familyMembers?.[0]?.name &&
    patientProfile.villageTown
  );

  const renderedPromptAs = (hasPersonalInfo && currentTask?.personalPromptAs)
    ? interpolatePersonalPrompt(currentTask.personalPromptAs, patientProfile)
    : (currentTask?.promptAs || '');

  const renderedPromptEn = (hasPersonalInfo && currentTask?.personalPromptEn)
    ? interpolatePersonalPrompt(currentTask.personalPromptEn, patientProfile)
    : (currentTask?.promptEn || '');

  // Language authenticity: Primary prompt matches selected language
  const primaryPrompt = isEn ? renderedPromptEn : renderedPromptAs;
  const secondaryPrompt = isEn ? renderedPromptAs : renderedPromptEn;

  const handleSpeakPrompt = () => {
    synthesizeSpeech(primaryPrompt, isEn ? 'en' : 'as');
  };

  // Completion Screen
  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-patient-border shadow-lg text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-patient-success text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
          🏆
        </div>
        <h2 className="text-patient-hero text-patient-primary">
          {isEn ? 'Well Done!' : 'বৰ ধুনীয়া! (Well Done!)'}
        </h2>
        <p className="text-patient-body text-patient-secondary mt-2">
          {isEn
            ? 'You completed all memory questions beautifully. Your recall is remarkable.'
            : 'আপুনি সকলো প্ৰশ্নৰ উত্তৰ সুন্দৰভাৱে দিলে। আপোনাৰ স্মৃতিশক্তি প্ৰশংসনীয়।'}
        </p>

        <div className="my-6 p-4 bg-patient-canvas border border-patient-border rounded-2xl">
          <span className="text-xs text-patient-hint uppercase font-bold tracking-wider">
            {isEn ? 'Total Score' : 'অৰ্জিত নম্বৰ (Score)'}
          </span>
          <p className="text-4xl font-extrabold text-patient-accent mt-1">{score} {isEn ? 'Points' : 'পইণ্ট'}</p>
          <p className="text-xs text-patient-secondary mt-1">
            Difficulty Tier Reached: {currentTier} ({currentTier === 1 ? 'Guided' : currentTier === 2 ? 'Standard' : 'Challenge'})
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {onExit && (
            <button
              onClick={onExit}
              className="min-h-touch px-6 py-3 bg-patient-accent text-white font-bold rounded-xl hover:bg-patient-accent-hover transition shadow-sm text-base"
            >
              {isEn ? 'Return Home →' : 'মুখ্য পৃষ্ঠালৈ যাওক (Return Home)'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-sm max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar: Progress, Visible Tier Indicator, Score, Help & Exit */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-teal-100 text-patient-accent rounded-lg">
            {isEn ? `Question ${currentTaskIndex + 1} / ${totalTasks}` : `প্ৰশ্ন ${currentTaskIndex + 1} / ${totalTasks}`}
          </span>

          {/* Visible Tier Progression Indicator */}
          <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg text-[11px] font-bold text-gray-600">
            <span className="text-patient-accent">পৰ্যায় {currentTier}:</span>
            <span className={currentTier === 1 ? 'text-teal-700 font-extrabold' : 'text-gray-400'}>সহজ</span>
            <span>•</span>
            <span className={currentTier === 2 ? 'text-teal-700 font-extrabold' : 'text-gray-400'}>মানক</span>
            <span>•</span>
            <span className={currentTier === 3 ? 'text-teal-700 font-extrabold' : 'text-gray-400'}>চ্যালেঞ্জ</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-xs px-2 py-1 bg-teal-50 hover:bg-teal-100 text-patient-accent border border-teal-200 font-bold rounded-lg transition"
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
              {isEn ? 'Exit' : 'বন্ধ কৰক (Exit)'}
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

      {/* Cultural Stimulus Card */}
      {currentTask && (
        <div className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto bg-patient-canvas border-2 border-teal-200 rounded-3xl flex items-center justify-center text-6xl shadow-inner">
            <span role="img" aria-label={currentTask.title}>{currentTask.icon}</span>
          </div>

          <div>
            <span className="text-xs font-bold text-patient-accent uppercase tracking-wider">
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
                className="w-10 h-10 rounded-full bg-teal-50 hover:bg-teal-100 text-patient-accent flex items-center justify-center border border-teal-300 text-lg shadow-sm"
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
          <span className="text-2xl text-patient-accent">💡</span>
          <div>
            <p className="font-semibold text-patient-primary">{gentleHintMessage}</p>
            <p className="text-xs text-patient-secondary mt-0.5">
              {isEn ? 'Take your time, choose gently.' : 'একো চিন্তা নকৰিব, সঠিক উত্তৰটো বাচি লওক।'}
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
          <span>{isEn ? 'Splendid! Your answer is correct. (+Points added)' : 'বৰ ধুনীয়া! আপোনাৰ উত্তৰ সঠিক হৈছে। (+নম্বৰ যোগ হ’ল)'}</span>
        </div>
      )}

      {/* Input Section: Touch Cards Options Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-patient-secondary uppercase tracking-wider block text-center">
            {isEn ? 'Touch your answer card:' : 'উত্তৰটো স্পৰ্শ কৰক (Touch your answer):'}
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
                      : 'border-patient-border hover:border-patient-accent bg-white text-patient-primary'
                  }`}
                >
                  <span className="text-3xl" role="img" aria-label={label}>{option.icon || '🎶'}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Input Section */}
      <div className="pt-4 border-t border-gray-100 flex flex-col items-center">
        <span className="text-xs text-patient-hint mb-2">
          {isEn ? 'Or speak your answer aloud:' : 'নাইবা মাত মাতি কওক:'}
        </span>
        <VoiceInputHandler
          onTranscript={handleVoiceTranscript}
          expectedKeywords={currentTask?.acceptedAliases || []}
        />
      </div>

      {/* Tutorial Overlay Modal */}
      <GameTutorialOverlay
        gameType="memory_recall"
        language={patientProfile?.language || 'as'}
        isOpen={showTutorial}
        onStart={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_memory_recall_seen', 'true');
          } catch (e) {}
        }}
        onSkip={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_memory_recall_seen', 'true');
          } catch (e) {}
        }}
      />
    </div>
  );
}
