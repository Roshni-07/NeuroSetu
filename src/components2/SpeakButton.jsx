import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { synthesizeSpeech, stopAllSpeech } from '../services/bhashiniService.js';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function SpeakButton({ text = '', language = null, label = 'Read aloud', className = '', onClick = null }) {
  const { language: currentGlobalLang } = useI18n();
  const targetLanguage = language || currentGlobalLang;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isInitiatorRef = useRef(false);

  useEffect(() => {
    const handleSpeechStarted = (e) => {
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

    if (isSpeaking) {
      isInitiatorRef.current = false;
      setIsSpeaking(false);
      stopAllSpeech();
      return;
    }

    isInitiatorRef.current = true;
    setIsSpeaking(true);
    try {
      await synthesizeSpeech(text, targetLanguage);
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
      className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-btn border shadow-flat transition-transform active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
        isSpeaking ? 'ring-2' : ''
      } ${className}`}
      style={{
        backgroundColor: isSpeaking ? 'var(--color-muga)' : 'var(--surface-sunken)',
        borderColor: 'var(--border-hairline)',
        color: 'var(--ink-primary)'
      }}
    >
      {isSpeaking ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
    </button>
  );
}
