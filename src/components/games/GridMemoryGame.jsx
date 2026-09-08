import React, { useEffect, useState } from 'react';
import { getCulturalContentByState, getTaskPrompt } from '../../data/reminiscenceContent.js';
import { synthesizeSpeech } from '../../services/bhashiniService.js';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import SpeakButton from '../../components2/SpeakButton.jsx';

/**
 * GridMemoryGame.jsx - Cultural Reminiscence Memory Grid Game
 * 
 * Modernized replacement for legacy MemoryRecallGame.
 */
export default function GridMemoryGame({
  profileId = 'default_patient',
  patientProfile = null,
  initialTier = 1,
  onComplete = null,
  onExit = null
}) {
  const task = getCulturalContentByState(patientProfile?.homeState).memoryTasks[0];
  const language = patientProfile?.language || 'as';
  const isEnglish = language === 'en';
  const isHindi = language === 'hi';
  const [selected, setSelected] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const prompt = getTaskPrompt(task, language, patientProfile);
  const englishPrompt = getTaskPrompt(task, 'en', patientProfile);
  const questionTitle = isEnglish ? 'Bihu Instrument' : task.title;
  const getLabel = (option) =>
    isEnglish ? option.labelEn : isHindi ? option.labelHi || option.labelEn : option.labelAs;

  useEffect(() => {
    setSelected(null);
    setEliminated([]);
    setShowSuccess(false);
  }, [patientProfile?.language, patientProfile?.villageTown]);

  const handleSelect = (option) => {
    if (selected || eliminated.includes(option.id)) return;
    if (option.id === task.correctAnswer) {
      setSelected(option.id);
      setShowSuccess(true);
      recordBiomarkerEvent({
        profileId,
        taskType: task.id,
        latencyMs: 0,
        errorCount: eliminated.length,
        ddaAdjustment: 'maintained'
      });
      if (onComplete) onComplete({ score: 100, maxScore: 100, accuracy: 100 });
    } else {
      setEliminated((previous) => [...previous, option.id]);
    }
  };

  const handleSpeak = () => synthesizeSpeech(prompt, language);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="text-sm text-slate-500 hover:text-slate-800 min-h-[48px] px-3 cursor-pointer"
          >
            {isEnglish ? 'Exit' : 'বন্ধ কৰক'}
          </button>
        )}
        <span />
      </div>
      <div className="text-center space-y-2">
        <span className="text-4xl">{task.icon}</span>
        <p className="text-xs font-semibold text-teal-700">
          পৰ্যায় {initialTier}: {initialTier === 2 ? 'মানক' : 'সহজ'}
        </p>
        <button
          type="button"
          aria-label="(?) সহায়"
          onClick={handleSpeak}
          className="text-xs text-teal-700 hover:text-teal-900 underline font-semibold transition cursor-pointer min-h-[48px] px-2 inline-flex items-center"
        >
          (?) সহায়
        </button>
        <p className="text-xs font-semibold uppercase text-teal-700">{questionTitle}</p>
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">{prompt}</h2>
          <SpeakButton text={prompt} language={language} label="Read question aloud" />
          {!isEnglish && <p className="text-sm text-slate-500">{englishPrompt}</p>}
          <button
            type="button"
            aria-label="Listen to question"
            onClick={handleSpeak}
            className="w-10 h-10 rounded-full border border-slate-200 min-h-[40px] flex items-center justify-center"
          >
            🔊
          </button>
        </div>
      </div>
      {showSuccess && (
        <div
          data-testid="success-banner"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-semibold"
        >
          🌟 {isEnglish ? 'Correct answer!' : 'নিখুঁত মিল! আপোনাৰ বাছনি শুদ্ধ হৈছে।'}
        </div>
      )}
      {!showSuccess && eliminated.length > 0 && (
        <div
          data-testid="gentle-hint-banner"
          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700"
        >
          💡 {isEnglish ? 'Let us try another instrument.' : task.gentlePrompt}
        </div>
      )}
      <div className="grid gap-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={selected === option.id || eliminated.includes(option.id) || showSuccess}
            onClick={() => handleSelect(option)}
            className="min-h-[60px] rounded-2xl border-2 border-slate-200 bg-white text-lg font-semibold hover:bg-teal-50 disabled:opacity-40 transition cursor-pointer"
          >
            <span className="mr-2">{option.icon}</span>
            {getLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
