import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import { MEMORY_RECALL_TASKS } from '../../data/reminiscenceContent.js';
import VoiceInputHandler from '../voice/VoiceInputHandler.jsx';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function MemoryRecallGame({
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
      gameType: 'memory_recall',
      initialTier,
      tasks: MEMORY_RECALL_TASKS,
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
      // Check detected keyword or raw transcript
      const spoken = result.detectedKeyword || result.transcript;
      engineRef.current.submitAnswer(spoken);
    }
  };

  const handleSpeakPrompt = () => {
    if (currentTask?.promptAs) {
      synthesizeSpeech(currentTask.promptAs, 'as');
    }
  };

  // Completion Screen
  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-patient-border shadow-lg text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-patient-success text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
          🏆
        </div>
        <h2 className="text-patient-hero text-patient-primary">বৰ ধুনীয়া! (Well Done!)</h2>
        <p className="text-patient-body text-patient-secondary mt-2">
          আপুনি সকলো প্ৰশ্নৰ উত্তৰ সুন্দৰভাৱে দিলে। আপোনাৰ স্মৃতিশক্তি প্ৰশংসনীয়।
        </p>

        <div className="my-6 p-4 bg-patient-canvas border border-patient-border rounded-2xl">
          <span className="text-xs text-patient-hint uppercase font-bold tracking-wider">অৰ্জিত নম্বৰ (Score)</span>
          <p className="text-4xl font-extrabold text-patient-accent mt-1">{score} পইণ্ট</p>
          <p className="text-xs text-patient-secondary mt-1">Difficulty Tier Reached: {currentTier}</p>
        </div>

        <div className="flex gap-3 justify-center">
          {onExit && (
            <button
              onClick={onExit}
              className="min-h-touch px-6 py-3 bg-patient-accent text-white font-bold rounded-xl hover:bg-patient-accent-hover transition shadow-sm text-base"
            >
              মুখ্য পৃষ্ঠালৈ যাওক (Return Home)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-sm max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar: Progress & Difficulty Tier */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-teal-100 text-patient-accent rounded-lg">
            প্ৰশ্ন {currentTaskIndex + 1} / {totalTasks}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-patient-hint rounded">
            পৰ্যায় (Tier) {currentTier}
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
                {currentTask.promptAs}
              </h2>
              <button
                type="button"
                onClick={handleSpeakPrompt}
                aria-label="Listen to question in Assamese"
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

      {/* Errorless Feedback Banner (Gentle guidance, never red buzzer) */}
      {state === GAME_STATES.GENTLE_HINT && gentleHintMessage && (
        <div
          data-testid="gentle-hint-banner"
          className="p-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-patient-hint text-sm font-medium flex items-center gap-3 animate-fade-in"
        >
          <span className="text-2xl text-patient-accent">💡</span>
          <div>
            <p className="font-semibold text-patient-primary">{gentleHintMessage}</p>
            <p className="text-xs text-patient-secondary mt-0.5">
              একো চিন্তা নকৰিব, সঠিক উত্তৰটো বাচি লওক। (Take your time, choose gently.)
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
          <span>বৰ ধুনীয়া! আপোনাৰ উত্তৰ সঠিক হৈছে। (+নম্বৰ যোগ হ’ল)</span>
        </div>
      )}

      {/* Input Section: Touch Cards Options Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-patient-secondary uppercase tracking-wider block text-center">
            উত্তৰটো স্পৰ্শ কৰক (Touch your answer)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentTask.options.map((option) => {
              const isEliminated = eliminatedOptions.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isEliminated || state === GAME_STATES.EVALUATING || state === GAME_STATES.SUCCESS_REWARD}
                  onClick={() => handleOptionClick(option.id)}
                  className={`min-h-touch p-4 rounded-2xl border-2 font-bold text-lg flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${
                    isEliminated
                      ? 'opacity-30 border-gray-200 bg-gray-100 line-through cursor-not-allowed'
                      : 'border-patient-border bg-patient-canvas hover:border-patient-accent hover:bg-teal-50/50 active:scale-95 text-patient-primary'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-patient-body">{option.labelAs}</span>
                  <span className="text-xs text-patient-hint font-normal">{option.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Integrated Voice Input Handler (Speak to answer in Assamese) */}
      <div className="pt-2 border-t border-gray-100">
        <VoiceInputHandler
          language="as"
          label="নাইবা মুখৰে কওক (Or Speak your answer)"
          disabled={state === GAME_STATES.EVALUATING || state === GAME_STATES.SUCCESS_REWARD}
          onTranscriptReceived={handleVoiceTranscript}
        />
      </div>
    </div>
  );
}
