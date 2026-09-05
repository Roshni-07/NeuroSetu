import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import {
  MEMORY_RECALL_TASKS,
  getCulturalContentByState,
  interpolatePersonalPrompt,
  getTaskPrompt,
  getOptionLabel
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
  const currentLang = patientProfile?.language || 'as';
  const isEn = currentLang === 'en';
  const isHi = currentLang === 'hi';
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
          let noticeMsg = '';
          if (isHi) {
            noticeMsg = isUp
              ? `🎉 स्तर वृद्धि! स्तर ${state.currentTier} खुला`
              : `🤝 सरल सहायता सक्रिय (स्तर ${state.currentTier})`;
          } else if (isEn) {
            noticeMsg = isUp
              ? `🎉 Level Up! Promoted to Tier ${state.currentTier}`
              : `🤝 Gentle Assistance Active (Tier ${state.currentTier})`;
          } else {
            noticeMsg = isUp
              ? `🎉 পৰ্যায় বৃদ্ধি! পৰ্যায় ${state.currentTier} মুকলি হ’ল`
              : `🤝 সহজ সহায় সংক্ৰিয় (পৰ্যায় ${state.currentTier})`;
          }
          setTierNotice({
            message: noticeMsg,
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
  }, [profileId, initialTier, patientProfile?.homeState, currentLang]);

  if (!engineState) {
    const loadingText = isHi ? 'खेल शुरू हो रहा है... (Loading Game...)' : (isEn ? 'Loading Game...' : 'খেল আৰম্ভ হৈছে... (Loading Game...)');
    return <div className="p-6 text-center text-patient-hint">{loadingText}</div>;
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

  // Language authenticity: Primary prompt matches selected language
  const primaryPrompt = getTaskPrompt(currentTask, currentLang, patientProfile);
  const secondaryPrompt = isEn
    ? (hasPersonalInfo && currentTask?.personalPromptAs ? interpolatePersonalPrompt(currentTask.personalPromptAs, patientProfile) : (currentTask?.promptAs || ''))
    : (hasPersonalInfo && currentTask?.personalPromptEn ? interpolatePersonalPrompt(currentTask.personalPromptEn, patientProfile) : (currentTask?.promptEn || ''));

  const handleSpeakPrompt = () => {
    if (primaryPrompt) {
      synthesizeSpeech(primaryPrompt, currentLang);
    }
  };

  // Completion Screen
  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-lg text-center max-w-lg mx-auto animate-fade-in space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-700 text-3xl rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 shadow-soft">
          🏆
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEn ? 'Well Done!' : 'বৰ ধুনীয়া! (Well Done!)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {isEn
              ? 'You completed all memory questions beautifully. Your recall is remarkable.'
              : 'আপুনি সকলো প্ৰশ্নৰ উত্তৰ সুন্দৰভাৱে দিলে। আপোনাৰ স্মৃতিশক্তি প্ৰশংসনীয়।'}
          </p>
        </div>

        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
            {isEn ? 'Total Score' : 'অৰ্জিত নম্বৰ (Score)'}
          </span>
          <p className="text-3xl font-extrabold text-teal-800 mt-1">{score} {isEn ? 'Points' : 'পইণ্ট'}</p>
          <p className="text-xs text-slate-500 mt-1">
            Difficulty Tier Reached: {currentTier} ({currentTier === 1 ? 'Guided' : currentTier === 2 ? 'Standard' : 'Challenge'})
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {onExit && (
            <button
              onClick={onExit}
              className="min-h-touch px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 active:bg-teal-800 transition shadow-soft text-sm"
            >
              {isEn ? 'Return Home →' : 'মুখ্য পৃষ্ঠালৈ যাওক (Return Home)'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar: Progress, Visible Tier Indicator, Score, Help & Exit */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200/60">
            {isEn ? `Question ${currentTaskIndex + 1} / ${totalTasks}` : `প্ৰশ্ন ${currentTaskIndex + 1} / ${totalTasks}`}
          </span>

          {/* Visible Tier Progression Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600">
            <span className="text-teal-800 font-semibold">পৰ্যায় {currentTier}:</span>
            <span className={currentTier === 1 ? 'text-teal-700 font-bold' : 'text-slate-400'}>সহজ</span>
            <span>•</span>
            <span className={currentTier === 2 ? 'text-teal-700 font-bold' : 'text-slate-400'}>মানক</span>
            <span>•</span>
            <span className={currentTier === 3 ? 'text-teal-700 font-bold' : 'text-slate-400'}>চ্যালেঞ্জ</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-teal-800 border border-slate-200 font-semibold rounded-lg transition"
          >
            (?) {isEn ? 'Help' : 'সহায়'}
          </button>
          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            {isEn ? `Score: ${score}` : `নম্বৰ: ${score}`}
          </span>
          {onExit && (
            <button
              onClick={onExit}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-50 transition"
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
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 animate-bounce ${
            tierNotice.type === 'up'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          <span>{tierNotice.message}</span>
        </div>
      )}

      {/* Cultural Stimulus Card */}
      {currentTask && (
        <div className="text-center space-y-4">
          <div className="w-28 h-28 mx-auto bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center text-5xl shadow-soft">
            <span role="img" aria-label={currentTask.title}>{currentTask.icon}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
              {currentTask.title}
            </span>
            <div className="flex items-center justify-center gap-2.5 mt-1.5">
              <h2 className="text-xl sm:text-2xl text-slate-900 font-bold leading-snug max-w-lg">
                {primaryPrompt}
              </h2>
              <button
                type="button"
                onClick={handleSpeakPrompt}
                aria-label="Listen to question"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-teal-800 flex items-center justify-center border border-slate-200 text-base shadow-soft shrink-0 transition"
              >
                🔊
              </button>
            </div>
            {secondaryPrompt && (
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-medium flex items-center gap-3 animate-fade-in"
        >
          <span className="text-2xl text-amber-600">💡</span>
          <div>
            <p className="font-semibold text-slate-900">{gentleHintMessage}</p>
            <p className="text-slate-500 mt-0.5">
              {isEn ? 'Take your time, choose gently.' : 'একো চিন্তা নকৰিব, সঠিক উত্তৰটো বাচি লওক।'}
            </p>
          </div>
        </div>
      )}

      {/* Success Affirmation Banner */}
      {state === GAME_STATES.SUCCESS_REWARD && (
        <div
          data-testid="success-banner"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 animate-scale-up"
        >
          <span className="text-xl">🌟</span>
          <span>
            {isHi
              ? 'शानदार! आपका उत्तर सही है। (+अंक जुड़े)'
              : (isEn ? 'Splendid! Your answer is correct. (+Points added)' : 'বৰ ধুনীয়া! আপোনাৰ উত্তৰ সঠিক হৈছে। (+নম্বৰ যোগ হ’ল)')}
          </span>
        </div>
      )}

      {/* Input Section: Touch Cards Options Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            {isHi ? 'उत्तर कार्ड को छुएं:' : (isEn ? 'Touch your answer card:' : 'উত্তৰটো স্পৰ্শ কৰক (Touch your answer):')}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentTask.options.map((option) => {
              const isEliminated = eliminatedOptions.includes(option.id);
              const label = getOptionLabel(option, currentLang);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isEliminated || state === GAME_STATES.SUCCESS_REWARD}
                  onClick={() => handleOptionClick(option.id)}
                  className={`min-h-touch p-4 rounded-2xl border font-semibold text-sm sm:text-base flex flex-col items-center justify-center gap-2 transition-all shadow-soft active:scale-95 ${
                    isEliminated
                      ? 'opacity-30 border-dashed border-slate-200 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-200/80 hover:border-teal-600 hover:bg-teal-50/20 bg-white text-slate-900'
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
      <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
        <span className="text-xs text-slate-500 mb-2">
          {isHi ? 'या माइक दबाकर बोलकर उत्तर दें:' : (isEn ? 'Or speak your answer aloud:' : 'নাইবা মাত মাতি কওক:')}
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
