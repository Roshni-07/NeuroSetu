import React, { useState } from 'react';
import { TEXTILE_PATTERN_TASKS } from '../../data/reminiscenceContent.js';
import SpeakButton from '../..//components2/SpeakButton.jsx';

const task = TEXTILE_PATTERN_TASKS[0];

export default function PatternMatchingGame({ patientProfile = null, onComplete = null }) {
  const language = patientProfile?.language || 'as';
  const isEnglish = language === 'en';
  const [selected, setSelected] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const getLabel = option => isEnglish ? option.labelEn : option.labelAs;
  const prompt = isEnglish ? task.promptEn : task.promptAs;

  const handleSelect = option => {
    if (selected || eliminated.includes(option.id)) return;
    if (option.id === task.correctAnswer) {
      setSelected(option.id);
      if (onComplete) onComplete({ score: 100, maxScore: 100, accuracy: 100 });
    } else {
      setEliminated(previous => [...previous, option.id]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft max-w-2xl mx-auto space-y-5">
      <div className="text-center space-y-3">
        <div className="w-48 h-28 mx-auto rounded-2xl border-2 border-slate-200 shadow-soft flex items-center justify-center" style={{ backgroundColor: task.patternColor }}>
          <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-bold">{task.title}</span>
        </div>
        <div className="flex items-center justify-center gap-2"><p className="text-lg font-bold text-slate-900">{prompt}</p><SpeakButton text={prompt} language={language} label="Read question aloud" /></div>
      </div>
      {selected && <div data-testid="success-banner" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-semibold">🌟 {isEnglish ? 'Correct textile match!' : 'নিখুঁত মিল! আপোনাৰ বাছনি শুদ্ধ হৈছে।'}</div>}
      {!selected && eliminated.length > 0 && <div data-testid="gentle-hint-banner" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">💡 {isEnglish ? 'Look carefully at the weave colour.' : task.gentlePrompt}</div>}
      <div className="grid gap-3 sm:grid-cols-3">
        {task.options.map(option => (
          <button key={option.id} type="button" disabled={selected === option.id || eliminated.includes(option.id) || Boolean(selected)} onClick={() => handleSelect(option)} className="min-h-[100px] rounded-2xl border-2 border-slate-200 bg-white font-semibold hover:bg-teal-50 disabled:opacity-40">
            <span className="block w-10 h-10 mx-auto mb-2 rounded-full border-2 border-white shadow" style={{ backgroundColor: option.colorHex }} />
            {getLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
