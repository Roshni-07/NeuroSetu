import React, { useState, useEffect, useRef } from 'react';
import { synthesizeSpeech, stopAllSpeech } from '../services/bhashiniService.js';

export default function SpeakButton({ text = '', language = 'en', label = 'Read aloud', className = '', onClick = null }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isInitiatorRef = useRef(false);

  useEffect(() => {
    const handleSpeechStarted = (e) => {
      // If another component or button triggered speech, reset this button's active speaking state
      if (!isInitiatorRef.current) {
        setIsSpeaking(false);
      }
    };

    const handleSpeechStopped = () => {
      isInitiatorRef.current = false;
      setIsSpeaking(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('neurosetu:speech-started', handleSpeechStarted);
      window.addEventListener('neurosetu:speech-stopped', handleSpeechStopped);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('neurosetu:speech-started', handleSpeechStarted);
        window.removeEventListener('neurosetu:speech-stopped', handleSpeechStopped);
      }
    };
  }, []);

  const handleSpeak = async (event) => {
    if (onClick) onClick(event);
    if (!text) return;

    // If currently speaking, toggle off immediately
    if (isSpeaking) {
      isInitiatorRef.current = false;
      setIsSpeaking(false);
      stopAllSpeech();
      return;
    }

    isInitiatorRef.current = true;
    setIsSpeaking(true);
    try {
      await synthesizeSpeech(text, language);
    } finally {
      isInitiatorRef.current = false;
      setIsSpeaking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={!text}
      aria-label={isSpeaking ? 'Stop audio' : label}
      title={isSpeaking ? 'Stop audio' : label}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-base text-slate-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60 ${
        isSpeaking ? 'border-teal-400 bg-teal-50 text-teal-700 ring-2 ring-teal-300 ring-offset-1' : ''
      } ${className}`}
    >
      <span aria-hidden="true">{isSpeaking ? '⏹️' : '🔊'}</span>
    </button>
  );
}

