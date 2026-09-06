import React, { useState } from 'react';
import { synthesizeSpeech } from '../services/bhashiniService.js';

export default function SpeakButton({ text = '', language = 'en', label = 'Read aloud', className = '', onClick = null }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (event) => {
    if (onClick) onClick(event);
    if (!text || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await synthesizeSpeech(text, language);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!text || isSpeaking}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-base text-slate-700 transition hover:bg-teal-50 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      <span aria-hidden="true">{isSpeaking ? '⏳' : '🔊'}</span>
    </button>
  );
}
