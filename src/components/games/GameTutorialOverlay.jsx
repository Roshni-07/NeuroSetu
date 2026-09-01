import React from 'react';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export const TUTORIAL_CONTENT = {
  memory_recall: {
    icon: '🥁',
    titleAs: 'সাংস্কৃতিক স্মৃতি খেলৰ নিৰ্দেশনা',
    titleEn: 'Memory Recall Instructions',
    stepsAs: [
      '১. ছবিখন চাওক আৰু প্ৰশ্নটো পঢ়ক বা 🔊 বুটামত টিপি শুনক।',
      '২. সঠিক উত্তৰৰ কাৰ্ডখন স্পৰ্শ কৰক নাইবা মাইক্ৰ’ফন 🎙️ টিপি মাত মাতি উত্তৰ দিয়ক।'
    ],
    stepsEn: [
      '1. Look at the image and read the question, or tap 🔊 to listen.',
      '2. Tap the matching card or tap the microphone 🎙️ to answer by voice.'
    ],
    audioGuideAs: 'ছবিখন চাই প্ৰশ্নটো শুনক। তাৰ পিছত সঠিক কাৰ্ডখন চুই দিয়ক নাইবা মাত মাতি কওক।',
    audioGuideEn: 'Look at the picture and listen to the clue. Then tap the matching card or speak your answer.'
  },

  pattern_matching: {
    icon: '🧵',
    titleAs: 'বস্ত্ৰ চানেকি খেলৰ নিৰ্দেশনা',
    titleEn: 'Textile Pattern Instructions',
    stepsAs: [
      '১. ওপৰৰ ৰঙীন পৰম্পৰাগত বস্ত্ৰৰ চানেকিটো মন দি চাওক।',
      '২. তলৰ বিকল্পসমূহৰ পৰা শুদ্ধ আঞ্চলিক কাপোৰখন বাচি লওক।'
    ],
    stepsEn: [
      '1. Carefully observe the traditional textile weave swatch above.',
      '2. Select the matching regional handloom from the options below.'
    ],
    audioGuideAs: 'কাপোৰৰ ৰং আৰু বুটাটো চাওক। তাৰ পিছত সঠিক নামটো বাচি লওক।',
    audioGuideEn: 'Observe the colors and motifs of the fabric. Then choose the matching weave name.'
  },

  sequencing: {
    icon: '☕',
    titleAs: 'দৈনন্দিন কৰ্ম ক্ৰম খেলৰ নিৰ্দেশনা',
    titleEn: 'Daily Routine Sequencing Instructions',
    stepsAs: [
      '১. ওপৰৰ প্ৰশ্ন আৰু কৰ্মৰ ঢাপসমূহ লক্ষ্য কৰক।',
      '২. প্ৰথমৰ পৰা শেষলৈ শুদ্ধ ক্ৰমত এটা এটাকৈ ঢাপ স্পৰ্শ কৰক।'
    ],
    stepsEn: [
      '1. Read the routine activity and observe the action steps.',
      '2. Tap the steps in order from first to last to complete the sequence.'
    ],
    audioGuideAs: 'কামটো কৰিবলৈ প্ৰথমে কি কৰা হয় আৰু তাৰ পিছত কি কৰা হয়, এটা এটাকৈ ক্ৰমত বাচক।',
    audioGuideEn: 'Tap what happens first, then what follows next, in chronological order.'
  }
};

export default function GameTutorialOverlay({
  gameType = 'memory_recall',
  language = 'as',
  isOpen = true,
  onStart = null,
  onSkip = null
}) {
  if (!isOpen) return null;

  const content = TUTORIAL_CONTENT[gameType] || TUTORIAL_CONTENT.memory_recall;
  const isEn = language === 'en';

  const title = isEn ? content.titleEn : content.titleAs;
  const steps = isEn ? content.stepsEn : content.stepsAs;
  const audioText = isEn ? content.audioGuideEn : content.audioGuideAs;

  const handleListenGuide = () => {
    synthesizeSpeech(audioText, isEn ? 'en' : 'as');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-patient-border shadow-2xl space-y-6 text-center">
        {/* Visual Icon */}
        <div className="w-20 h-20 mx-auto bg-teal-50 border-2 border-teal-200 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
          <span role="img" aria-label="Game Tutorial">{content.icon}</span>
        </div>

        {/* Heading */}
        <div>
          <span className="text-xs font-bold text-patient-accent uppercase tracking-wider">
            {isEn ? 'How to Play' : 'খেলৰ নিয়ম'}
          </span>
          <h2 id="tutorial-heading" className="text-xl font-extrabold text-patient-primary mt-1">
            {title}
          </h2>
        </div>

        {/* Step Guide Cards */}
        <div className="space-y-3 text-left">
          {steps.map((stepText, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-patient-canvas border border-teal-100 rounded-2xl flex items-start gap-3"
            >
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm font-semibold text-patient-primary leading-snug">
                {stepText}
              </p>
            </div>
          ))}
        </div>

        {/* Audio Guide Button */}
        <button
          type="button"
          onClick={handleListenGuide}
          className="w-full min-h-touch py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-patient-accent font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition"
        >
          <span>🔊</span>
          <span>{isEn ? 'Listen to Instructions' : 'নিৰ্দেশনা শুনক'}</span>
        </button>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-touch py-3 bg-patient-accent hover:bg-patient-accent-hover text-white font-bold rounded-2xl text-base shadow-sm transition active:scale-95"
          >
            {isEn ? 'Start Game →' : 'খেল আৰম্ভ কৰক →'}
          </button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-patient-hint hover:text-patient-primary py-1 font-semibold"
            >
              {isEn ? 'Skip and start directly' : 'পোনপটীয়া খেললৈ যাওক (Skip)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
