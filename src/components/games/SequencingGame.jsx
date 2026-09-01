import React, { useState, useEffect } from 'react';
import { CULINARY_SEQUENCING_TASKS } from '../../data/reminiscenceContent.js';
import { recordBiomarkerEvent } from '../../services/telemetryService.js';
import { saveGameSession } from '../../db/indexedDb.js';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function SequencingGame({
  profileId = 'default_patient',
  initialTier = 2,
  onComplete = null,
  onExit = null
}) {
  const task = CULINARY_SEQUENCING_TASKS[0]; // Assam tea routine
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [availableSteps, setAvailableSteps] = useState([]);
  const [gentleHint, setGentleHint] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    // Shuffle steps initially so patient can order them
    const shuffled = [...task.steps].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setSelectedSteps([]);
    setGentleHint('');
    setIsCompleted(false);
    setStartTime(Date.now());
  }, []);

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
          taskType: 'daily_tea_sequencing',
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
      // Incorrect step sequence
      const errors = consecutiveErrors + 1;
      setConsecutiveErrors(errors);

      setGentleHint(`আহক আমি আকৌ ভাবোঁ: ${task.hint}`);

      await recordBiomarkerEvent({
        profileId,
        taskType: 'daily_tea_sequencing',
        latencyMs,
        errorCount: errors,
        ddaAdjustment: errors >= 2 ? 'decreased' : 'none'
      });
    }
  };

  const handleResetSequence = () => {
    const shuffled = [...task.steps].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setSelectedSteps([]);
    setGentleHint('');
  };

  const handleSpeakPrompt = () => {
    synthesizeSpeech(task.promptAs, 'as');
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-patient-border shadow-lg text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-patient-success text-4xl rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300">
          ☕
        </div>
        <h2 className="text-patient-hero text-patient-primary">চাহ প্ৰস্তুত হ’ল! (Tea Prepared!)</h2>
        <p className="text-patient-body text-patient-secondary mt-2">
          আপুনি চাহ বনোৱাৰ সঠিক ক্ৰমটো সফলভাৱে সজাই উলিয়ালে।
        </p>

        <div className="my-6 p-4 bg-patient-canvas border border-patient-border rounded-2xl">
          <span className="text-xs text-patient-hint uppercase font-bold tracking-wider">প্ৰাপ্ত নম্বৰ</span>
          <p className="text-4xl font-extrabold text-patient-accent mt-1">১০০ পইণ্ট</p>
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
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <span className="text-xs font-bold px-2.5 py-1 bg-orange-100 text-orange-900 rounded-lg">
          দৈনন্দিন অভ্যাস ক্ৰম (Daily Routine Sequencing)
        </span>
        {onExit && (
          <button
            onClick={onExit}
            className="text-xs font-medium text-patient-hint hover:text-patient-primary px-2 py-1"
          >
            বন্ধ কৰক (Exit)
          </button>
        )}
      </div>

      {/* Task Heading */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-patient-accent uppercase tracking-wider block">
          {task.title}
        </span>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-patient-prompt text-patient-primary font-bold">
            {task.promptAs}
          </h2>
          <button
            type="button"
            onClick={handleSpeakPrompt}
            aria-label="Listen in Assamese"
            className="w-10 h-10 rounded-full bg-teal-50 hover:bg-teal-100 text-patient-accent flex items-center justify-center border border-teal-300 text-lg shadow-sm"
          >
            🔊
          </button>
        </div>
        <p className="text-xs text-patient-hint">{task.promptEn}</p>
      </div>

      {/* Gentle Hint */}
      {gentleHint && (
        <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-2xl text-patient-hint text-sm font-medium flex items-center gap-3">
          <span className="text-2xl text-patient-accent">💡</span>
          <div>
            <p className="font-semibold text-patient-primary">{gentleHint}</p>
            <p className="text-xs text-patient-secondary mt-0.5">
              আহক আমি ক্ৰমটো আকৌ মনত পেলাওঁ।
            </p>
          </div>
        </div>
      )}

      {/* Current Sequence Slot (Ordered items) */}
      <div className="p-4 bg-patient-canvas border-2 border-dashed border-patient-border rounded-2xl space-y-2">
        <span className="text-xs font-bold text-patient-hint uppercase tracking-wider block">
          আপুনি সজোৱা ক্ৰম (Your Ordered Steps): {selectedSteps.length} / {task.steps.length}
        </span>
        {selectedSteps.length === 0 ? (
          <p className="text-sm text-patient-secondary italic py-3 text-center">
            তলৰ পৰা প্ৰথমটো কাম স্পৰ্শ কৰক (Tap the first step from below)
          </p>
        ) : (
          <div className="space-y-2">
            {selectedSteps.map((step, idx) => (
              <div
                key={step.id}
                className="p-3 bg-white border-2 border-green-300 text-patient-primary rounded-xl flex items-center gap-3 shadow-xs"
              >
                <span className="w-8 h-8 rounded-full bg-green-100 text-patient-success font-bold flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                <span className="text-2xl">{step.icon}</span>
                <span className="text-base font-semibold">{step.textAs}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Steps (Shuffled items to choose next) */}
      {availableSteps.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-patient-secondary uppercase tracking-wider block text-center">
            পৰৱৰ্তী কামটো বাচক (Tap the next step):
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {availableSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStep(step)}
                className="min-h-touch p-4 bg-white hover:bg-teal-50/60 border-2 border-patient-border hover:border-patient-accent rounded-2xl text-left transition-all shadow-sm flex items-center gap-3 active:scale-98"
              >
                <span className="text-3xl">{step.icon}</span>
                <div>
                  <p className="text-base text-patient-primary font-bold">{step.textAs}</p>
                  <p className="text-xs text-patient-hint">{step.textEn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      {selectedSteps.length > 0 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResetSequence}
            className="text-xs font-semibold text-patient-hint hover:text-patient-primary py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            🔄 পুনৰ আৰম্ভ কৰক (Reset Steps)
          </button>
        </div>
      )}
    </div>
  );
}
