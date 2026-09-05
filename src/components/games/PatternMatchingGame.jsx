import React, { useState, useEffect, useRef } from 'react';
import { CognitiveGameEngine, GAME_STATES } from '../../engine/gameEngine.js';
import {
  TEXTILE_PATTERN_TASKS,
  getCulturalContentByState,
  getTaskPrompt,
  getOptionLabel
} from '../../data/reminiscenceContent.js';
import GameTutorialOverlay from './GameTutorialOverlay.jsx';
import VoiceInputHandler from '../voice/VoiceInputHandler.jsx';
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
  const currentLang = patientProfile?.language || 'as';
  const isEn = currentLang === 'en';
  const isHi = currentLang === 'hi';
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
    const loadingText = isHi ? 'वस्त्र पैटर्न खेल शुरू हो रहा है...' : (isEn ? 'Loading Pattern Game...' : 'বস্ত্ৰ চানেকি খেল আৰম্ভ হৈছে...');
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

  const primaryPrompt = getTaskPrompt(currentTask, currentLang, patientProfile);
  const secondaryPrompt = isEn ? (currentTask?.promptAs || '') : (currentTask?.promptEn || '');

  const handleSpeakPrompt = () => {
    if (primaryPrompt) {
      synthesizeSpeech(primaryPrompt, currentLang);
    }
  };

  if (state === GAME_STATES.SESSION_COMPLETE) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-lg text-center max-w-lg mx-auto animate-fade-in space-y-6">
        <div className="w-16 h-16 bg-amber-50 text-amber-800 text-3xl rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80 shadow-soft">
          🧵
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEn ? 'Patterns Matched!' : 'চানেকি মিলিল! (Patterns Matched!)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {isEn
              ? 'You have successfully identified the traditional North East handloom patterns.'
              : 'আপুনি উত্তৰ-পূৰ্বাঞ্চলৰ পৰম্পৰাগত বস্ত্ৰৰ চানেকিবোৰ নিৰ্ভুলভাৱে চিনাক্ত কৰিলে।'}
          </p>
        </div>

        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
            {isEn ? 'Total Score' : 'অৰ্জিত নম্বৰ'}
          </span>
          <p className="text-3xl font-extrabold text-amber-800 mt-1">{score} {isEn ? 'Points' : 'পইণ্ট'}</p>
          <p className="text-xs text-slate-500 mt-1">Tier Reached: {currentTier}</p>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="min-h-touch px-6 py-3 bg-amber-700 text-white font-semibold rounded-xl hover:bg-amber-800 active:bg-amber-900 transition shadow-soft text-sm"
          >
            {isEn ? 'Return Home →' : 'মুখ্য পৃষ্ঠালৈ যাওক'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar: Progress, Visible Tier Indicator, Score, Help & Exit */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/60">
            {isEn ? `Pattern ${currentTaskIndex + 1} / ${totalTasks}` : `চানেকি ${currentTaskIndex + 1} / ${totalTasks}`}
          </span>

          {/* Visible Tier Progression Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600">
            <span className="text-amber-800 font-semibold">পৰ্যায় {currentTier}:</span>
            <span className={currentTier === 1 ? 'text-amber-800 font-bold' : 'text-slate-400'}>সহজ</span>
            <span>•</span>
            <span className={currentTier === 2 ? 'text-amber-800 font-bold' : 'text-slate-400'}>মানক</span>
            <span>•</span>
            <span className={currentTier === 3 ? 'text-amber-800 font-bold' : 'text-slate-400'}>চ্যালেঞ্জ</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-amber-900 border border-slate-200 font-semibold rounded-lg transition"
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
              {isEn ? 'Exit' : 'বন্ধ কৰক'}
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

      {/* Cultural Textile Swatch Display */}
      {currentTask && (
        <div className="text-center space-y-4">
          <div
            className="w-48 h-28 mx-auto rounded-2xl border-2 border-slate-200 shadow-soft flex items-center justify-center relative overflow-hidden transition-transform hover:scale-102"
            style={{ backgroundColor: currentTask.patternColor || '#D4AF37' }}
          >
            <span className="text-slate-900 text-xs font-bold px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full shadow-soft border border-slate-200/60">
              {currentTask.motifName}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
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
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-amber-900 flex items-center justify-center border border-slate-200 text-base shadow-soft shrink-0 transition"
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
              {isEn ? 'Observe the weave colors carefully.' : 'ৰং আৰু সুতাৰ বয়নলৈ মন কৰক।'}
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
              ? 'बधाई! सही वस्त्र का चुनाव।'
              : (isEn ? 'Correct textile match!' : 'নিখুঁত মিল! আপোনাৰ বাছনি শুদ্ধ হৈছে।')}
          </span>
        </div>
      )}

      {/* Textile Option Cards Grid */}
      {currentTask && (
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            {isHi ? 'मिलते-जुलते वस्त्र को चुनें:' : (isEn ? 'Select the matching handloom:' : 'মিলা বস্ত্ৰবিধ স্পৰ্শ কৰক:')}
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
                      : 'border-slate-200/80 hover:border-amber-600 hover:bg-amber-50/20 bg-white text-slate-900'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow-soft"
                    style={{ backgroundColor: option.colorHex || '#D4AF37' }}
                  />
                  <span>{label}</span>
                  <span className="text-xs text-slate-500 font-normal">{option.region}</span>
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
          language={patientProfile?.language || 'as'}
          onTranscript={(res) => {
            if (engineRef.current && res?.transcript) {
              const spoken = res.detectedKeyword || res.transcript;
              engineRef.current.submitAnswer(spoken);
            }
          }}
          expectedKeywords={currentTask?.acceptedAliases || []}
        />
      </div>

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
