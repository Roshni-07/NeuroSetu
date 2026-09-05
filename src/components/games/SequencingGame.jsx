import React, { useState, useEffect } from 'react';
import {
  CULINARY_SEQUENCING_TASKS,
  getSequencingTaskByOccupation,
  getTaskPrompt
} from '../../data/reminiscenceContent.js';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import { saveGameSession } from '../../db/indexedDb.js';
import GameTutorialOverlay from './GameTutorialOverlay.jsx';
import VoiceInputHandler from '../voice/VoiceInputHandler.jsx';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function SequencingGame({
  profileId = 'default_patient',
  patientProfile = null,
  initialTier = 2,
  onComplete = null,
  onExit = null
}) {
  const currentLang = patientProfile?.language || 'as';
  const isEn = currentLang === 'en';
  const isHi = currentLang === 'hi';

  // Dynamically map task to patient's stated occupation or fallback to tea routine
  const task = patientProfile?.formerOccupation
    ? getSequencingTaskByOccupation(patientProfile.formerOccupation)
    : CULINARY_SEQUENCING_TASKS[0];

  const [selectedSteps, setSelectedSteps] = useState([]);
  const [availableSteps, setAvailableSteps] = useState([]);
  const [gentleHint, setGentleHint] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem('neurosetu_tutorial_sequencing_seen');
    } catch (e) {
      return false;
    }
  });

  const getStepText = (s) => {
    if (!s) return '';
    if (isHi) return s.textHi || s.textEn || s.textAs || '';
    if (isEn) return s.textEn || s.textAs || '';
    return s.textAs || s.textEn || '';
  };

  useEffect(() => {
    // Shuffle steps initially so patient can order them
    const shuffled = [...task.steps].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setSelectedSteps([]);
    setGentleHint('');
    setIsCompleted(false);
    setStartTime(Date.now());
  }, [task.id]);

  const handleSelectStep = async (step) => {
    const expectedOrder = selectedSteps.length + 1;
    const latencyMs = Math.max(200, Date.now() - (startTime || Date.now()));

    if (step.order === expectedOrder) {
      // Correct step placed
      const newSelected = [...selectedSteps, step];
      setSelectedSteps(newSelected);
      setAvailableSteps(prev => prev.filter(s => s.id !== step.id));
      setGentleHint('');
      setConsecutiveErrors(0);

      // Check if all steps completed
      if (newSelected.length === task.steps.length) {
        setIsCompleted(true);
        const totalDuration = Math.round((Date.now() - (startTime || Date.now())) / 1000);

        // Record telemetry and session
        await recordBiomarkerEvent({
          profileId,
          taskType: task.id,
          latencyMs,
          errorCount: consecutiveErrors,
          ddaAdjustment: 'maintained'
        });

        await saveGameSession({
          profileId,
          gameType: 'sequencing',
          difficultyTier: initialTier,
          score: 100,
          durationSeconds: totalDuration,
          completedAt: new Date().toISOString()
        });

        if (onComplete) onComplete();
      }
    } else {
      // Incorrect order tapped
      const newErrors = consecutiveErrors + 1;
      setConsecutiveErrors(newErrors);

      // Gentle guidance prompt
      const targetStep = task.steps.find(s => s.order === expectedOrder);
      const hintText = getStepText(targetStep) || (isHi ? task.gentlePromptHi : (isEn ? 'Think carefully about what comes next.' : task.gentlePrompt));

      setGentleHint(hintText);
    }
  };

  const primaryPrompt = getTaskPrompt(task, currentLang, patientProfile);
  const secondaryPrompt = isEn ? (task.promptAs || '') : (task.promptEn || '');

  const handleSpeakPrompt = () => {
    if (primaryPrompt) {
      synthesizeSpeech(primaryPrompt, currentLang);
    }
  };

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-lg text-center max-w-lg mx-auto animate-fade-in space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-700 text-3xl rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 shadow-soft">
          ☕
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isEn ? 'Sequence Completed!' : 'চাহ প্ৰস্তুত হ’ল! (Well Done!)'}
          </h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {isEn
              ? 'You arranged all the steps in perfect chronological order.'
              : 'আপুনি সকলো কামৰ ক্ৰম শুদ্ধকৈ সজালে। আপোনাৰ চিন্তাশক্তি অতি নিখুঁত।'}
          </p>
        </div>

        <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
            {isEn ? 'Result' : 'ফলাফল'}
          </span>
          <p className="text-2xl font-extrabold text-teal-800 mt-1">১০০% শুদ্ধ (100% Correct)</p>
          <p className="text-xs text-slate-500 mt-1">Routine: {task.title}</p>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            className="min-h-touch px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 active:bg-teal-800 transition shadow-soft text-sm"
          >
            {isEn ? 'Return Home →' : 'মুখ্য পৃষ্ঠালৈ যাওক (Return Home)'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft max-w-2xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/60">
          {isEn ? 'Daily Routine Sequencing' : 'দৈনন্দিন অভ্যাস ক্ৰম (Daily Routine Sequencing)'}
        </span>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="text-xs px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-amber-900 border border-slate-200 font-semibold rounded-lg transition"
          >
            (?) {isEn ? 'Help' : 'সহায়'}
          </button>
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

      {/* Task Heading */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider block">
          {task.title}
        </span>
        <div className="flex items-center justify-center gap-2.5">
          <h2 className="text-xl sm:text-2xl text-slate-900 font-bold leading-snug max-w-lg">
            {primaryPrompt}
          </h2>
          <button
            type="button"
            onClick={handleSpeakPrompt}
            aria-label="Listen"
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-teal-800 flex items-center justify-center border border-slate-200 text-base shadow-soft shrink-0 transition"
          >
            🔊
          </button>
        </div>
        {secondaryPrompt && <p className="text-xs text-slate-500 mt-0.5">{secondaryPrompt}</p>}
      </div>

      {/* Gentle Hint */}
      {gentleHint && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-medium flex items-center gap-3">
          <span className="text-2xl text-amber-600">💡</span>
          <div>
            <p className="font-semibold text-slate-900">{gentleHint}</p>
            <p className="text-slate-500 mt-0.5">
              {isEn ? 'Let us recall the next chronological step.' : 'আহক আমি ক্ৰমটো আকৌ মনত পেলাওঁ।'}
            </p>
          </div>
        </div>
      )}

      {/* Current Sequence Slot (Ordered items) */}
      <div className="p-4 bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {isHi
            ? `आपके व्यवस्थित चरण: ${selectedSteps.length} / ${task.steps.length}`
            : (isEn
              ? `Your Ordered Steps: ${selectedSteps.length} / ${task.steps.length}`
              : `আপুনি সজোৱা ক্ৰম (Your Ordered Steps): ${selectedSteps.length} / ${task.steps.length}`)}
        </span>
        {selectedSteps.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-3 text-center">
            {isHi ? 'नीचे से पहला चरण चुनें' : (isEn ? 'Tap the first step from below' : 'তলৰ পৰা প্ৰথমটো কাম স্পৰ্শ কৰক (Tap the first step from below)')}
          </p>
        ) : (
          <div className="space-y-2">
            {selectedSteps.map((step, idx) => (
              <div
                key={step.id}
                className="p-3 bg-white border border-emerald-200 text-slate-900 rounded-xl flex items-center gap-3 shadow-soft"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                  {idx + 1}
                </span>
                <span className="text-xl">{step.icon}</span>
                <span className="text-sm font-semibold">{getStepText(step)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Steps (Shuffled items to choose next) */}
      {availableSteps.length > 0 && (
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
            {isHi ? 'अगला चरण चुनें:' : (isEn ? 'Tap the next step:' : 'পৰৱৰ্তী কামটো বাচক (Tap the next step):')}
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {availableSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStep(step)}
                className="min-h-touch p-3.5 bg-white hover:bg-amber-50/30 active:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 text-slate-900 rounded-xl font-medium text-sm sm:text-base flex items-center gap-3 transition-all active:scale-95 text-left shadow-soft"
              >
                <span className="text-2xl">{step.icon}</span>
                <span>{getStepText(step)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Input Section */}
      {availableSteps.length > 0 && (
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-2">
            {isHi ? 'या माइक दबाकर अगले चरण का नाम बोलें:' : (isEn ? 'Or speak the next step / item name aloud:' : 'নাইবা পৰৱৰ্তী কামটোৰ নাম মাত মাতি কওক:')}
          </span>
          <VoiceInputHandler
            language={patientProfile?.language || 'as'}
            onTranscript={(res) => {
              if (res?.transcript) {
                const query = res.transcript.toLowerCase();
                const matchedStep = availableSteps.find(s => {
                  const enMatch = s.textEn && query.includes(s.textEn.toLowerCase());
                  const asMatch = s.textAs && query.includes(s.textAs);
                  const hiMatch = s.textHi && query.includes(s.textHi);
                  return Boolean(enMatch || asMatch || hiMatch);
                });
                if (matchedStep) {
                  handleSelectStep(matchedStep);
                } else if (availableSteps.length > 0) {
                  // If number or step is spoken, match by index
                  if (query.includes('1') || query.includes('one') || query.includes('এক') || query.includes('প্রথম')) {
                    handleSelectStep(availableSteps[0]);
                  }
                }
              }
            }}
          />
        </div>
      )}

      {/* Tutorial Overlay Modal */}
      <GameTutorialOverlay
        gameType="sequencing"
        language={patientProfile?.language || 'as'}
        isOpen={showTutorial}
        onStart={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_sequencing_seen', 'true');
          } catch (e) {}
        }}
        onSkip={() => {
          setShowTutorial(false);
          try {
            localStorage.setItem('neurosetu_tutorial_sequencing_seen', 'true');
          } catch (e) {}
        }}
      />
    </div>
  );
}
