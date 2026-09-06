import React from 'react';
import { synthesizeSpeech } from '../../services/bhashiniService.js';

export default function GameTutorialOverlay({ gameType = 'memory_recall', language = 'as', isOpen = false, onStart = () => {}, onSkip = () => {} }) {
  if (!isOpen) return null;
  const isEnglish = language === 'en';
  const title = isEnglish ? 'Game Instructions' : 'সাংস্কৃতিক স্মৃতি খেলৰ নিৰ্দেশনা';
  const instruction = isEnglish ? 'Look carefully at the picture and read the question.' : 'ছবিখন চাওক আৰু প্ৰশ্নটো পঢ়ক';
  const guide = `${title}. ${instruction}`;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-5 text-center">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-base text-slate-700">{instruction}</p>
        <div className="flex gap-3 justify-center">
          <button type="button" aria-label={isEnglish ? 'Listen to instructions' : 'নিৰ্দেশনা শুনক'} onClick={() => synthesizeSpeech(guide, language)} className="min-h-[48px] px-4 rounded-xl border-2 border-teal-300 bg-teal-50 font-semibold">🔊</button>
          <button type="button" onClick={onSkip} className="min-h-[48px] px-4 rounded-xl border-2 border-slate-200">{isEnglish ? 'Skip' : 'এৰি যাওক'}</button>
          <button type="button" aria-label={isEnglish ? 'Start game' : 'খেল আৰম্ভ কৰক'} onClick={onStart} className="min-h-[48px] px-5 rounded-xl bg-teal-700 text-white font-bold">{isEnglish ? 'Start Game' : 'খেল আৰম্ভ কৰক'}</button>
        </div>
      </div>
    </div>
  );
}
