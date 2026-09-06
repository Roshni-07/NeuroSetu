import React, { useMemo, useState } from 'react';
import { CULINARY_SEQUENCING_TASKS, getSequencingTaskByOccupation } from '../../data/reminiscenceContent.js';
import SpeakButton from '../../components2/SpeakButton.jsx';

export default function SequencingGame({ patientProfile = null, onComplete = null, onExit = null }) {
  const task = useMemo(
    () =>
      patientProfile?.formerOccupation
        ? getSequencingTaskByOccupation(patientProfile.formerOccupation)
        : CULINARY_SEQUENCING_TASKS[0],
    [patientProfile?.formerOccupation]
  );
  const language = patientProfile?.language || 'as';
  const isEnglish = language === 'en';
  const isHindi = language === 'hi';
  const [selected, setSelected] = useState([]);
  const [hint, setHint] = useState('');
  const complete = selected.length === task.steps.length;

  const text = (step) => (isEnglish || isHindi ? step.textEn : step.textAs);
  const prompt = isEnglish ? task.promptEn : isHindi ? (task.promptHi || task.promptEn) : task.promptAs;
  const title = isEnglish ? 'Daily Routine Sequencing' : isHindi ? 'दैनिक क्रम खेल' : 'দৈনন্দিন অভ্যাস ক্ৰম';

  const choose = (step) => {
    const expected = selected.length + 1;
    if (step.order === expected) {
      const next = [...selected, step];
      setSelected(next);
      setHint('');
      if (next.length === task.steps.length && onComplete) {
        onComplete({ score: 100, maxScore: 100, accuracy: 100 });
      }
    } else {
      setHint(isEnglish ? 'Think about what should happen first.' : isHindi ? 'सोचिए कि पहले कौन सा काम किया जाता है।' : task.gentlePrompt);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{title}</span>
        {onExit && (
          <button type="button" onClick={onExit} className="text-sm text-slate-500 hover:text-slate-800">
            {isEnglish ? 'Exit' : isHindi ? 'बाहर जाएं' : 'বন্ধ কৰক'}
          </button>
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-semibold text-teal-700">{task.title}</p>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{prompt}</h2>
          <SpeakButton text={prompt} language={language} label="Read question aloud" />
        </div>
      </div>

      {hint && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
          💡 {hint}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
        <p className="text-xs font-semibold text-slate-500 mb-2">
          {isEnglish ? 'Your ordered steps' : isHindi ? 'आपके द्वारा सजाया गया क्रम' : 'আপুনি সজোৱা ক্ৰম'}: {selected.length} / {task.steps.length}
        </p>
        {selected.map((step, index) => (
          <div key={step.id} className="p-3 mb-2 rounded-xl bg-white border border-emerald-200 shadow-xs">
            <b>{index + 1}.</b> {step.icon} {text(step)}
          </div>
        ))}
      </div>

      {!complete && (
        <div className="grid gap-3">
          {task.steps
            .filter((step) => !selected.includes(step))
            .map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => choose(step)}
                className="min-h-[58px] rounded-2xl border-2 border-slate-200 bg-white text-left px-4 font-semibold hover:bg-teal-50 transition active:scale-95"
              >
                {step.icon} {text(step)}
              </button>
            ))}
        </div>
      )}

      {complete && (
        <div className="text-center p-5 rounded-2xl bg-emerald-50 text-emerald-800 font-bold">
          <h2 className="text-2xl">{isEnglish ? 'Sequence Completed!' : isHindi ? 'क्रम पूरा हुआ!' : 'চাহ প্ৰস্তুত হ’ল!'}</h2>
          <p>১০০% শুদ্ধ (100% Correct)</p>
        </div>
      )}
    </div>
  );
}
