import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  transcribeAudio,
  startLiveSpeechRecognition,
  isWebSpeechSupported,
  matchOfflineKeywords
} from '../../services/bhashiniService.js';

export default function VoiceInputHandler({
  onTranscriptReceived = null,
  onTranscript = null,
  language = 'as',
  disabled = false,
  label = 'স্পীকাৰত কওক (Speak Now)',
  expectedKeywords = []
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Unified callback dispatcher
  const emitTranscript = useCallback((result) => {
    if (onTranscriptReceived) {
      onTranscriptReceived(result);
    }
    if (onTranscript) {
      onTranscript(result);
    }
  }, [onTranscriptReceived, onTranscript]);

  // Clean up recording and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleStopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    setIsRecording(false);
  }, []);

  const handleStartRecording = async () => {
    if (disabled || isProcessing || isRecording) return;
    setErrorMsg('');
    setLastTranscript('');
    setInterimText('');
    audioChunksRef.current = [];

    // Try Web Speech API first (Option 1: Native browser recognition)
    if (isWebSpeechSupported()) {
      setIsRecording(true);
      setRecordingSeconds(0);

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingSeconds(seconds);
        if (seconds >= 15) {
          handleStopRecording();
        }
      }, 1000);

      const recog = startLiveSpeechRecognition({
        language,
        onInterimResult: (text) => {
          setInterimText(text);
        },
        onFinalResult: (res) => {
          setLastTranscript(res.transcript);
          setInterimText('');
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          emitTranscript({
            success: true,
            transcript: res.transcript,
            detectedKeyword: res.detectedKeyword,
            confidence: res.confidence,
            provider: res.provider
          });
        },
        onError: (err) => {
          console.warn('[VoiceInputHandler] Web Speech error, falling back to MediaRecorder:', err);
          fallbackToMediaRecorder();
        },
        onEnd: () => {
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      });

      recognitionRef.current = recog;
      return;
    }

    // Otherwise use MediaRecorder stream
    await fallbackToMediaRecorder();
  };

  const fallbackToMediaRecorder = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      let seconds = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingSeconds(seconds);
        if (seconds >= 15) {
          handleStopRecording();
        }
      }, 1000);
    } catch (err) {
      console.warn('[VoiceInputHandler] Microphone access error:', err);
      setErrorMsg('Microphone access unavailable. You can also tap your answer directly.');
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const result = await transcribeAudio(audioBlob, language);
      if (result.success && result.transcript) {
        setLastTranscript(result.transcript);
        emitTranscript(result);
      } else {
        setErrorMsg("Could not catch that clearly. Let's try once more.");
      }
    } catch (err) {
      setErrorMsg("Voice recognition temporarily unavailable. Tap to answer.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-patient-border shadow-sm w-full max-w-sm">
      {/* Visual Microphone Button */}
      <button
        type="button"
        disabled={disabled || isProcessing}
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        aria-label={isRecording ? 'Stop Recording' : 'Start Voice Input'}
        className={`relative min-h-[64px] min-w-[64px] w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
          isRecording
            ? 'bg-patient-terracotta text-white scale-105 animate-pulse ring-4 ring-orange-200'
            : isProcessing
            ? 'bg-gray-200 text-gray-500 cursor-wait'
            : 'bg-patient-accent hover:bg-patient-accent-hover text-white active:scale-95'
        }`}
      >
        <span className="text-3xl" role="img" aria-hidden="true">
          {isRecording ? '⏹' : isProcessing ? '⏳' : '🎙'}
        </span>
      </button>

      {/* Status Label & Timer */}
      <div className="mt-3 text-center">
        <p className="text-patient-prompt text-patient-primary font-bold">
          {isRecording
            ? `Listening... ${15 - recordingSeconds}s remaining`
            : isProcessing
            ? 'Processing voice...'
            : label}
        </p>
        <p className="text-xs text-patient-secondary mt-0.5">
          {isRecording
            ? (language === 'as' ? 'Speak clearly in Assamese (কওক)' : 'Speak clearly into microphone')
            : 'Tap microphone to speak or stop'}
        </p>
      </div>

      {/* Live Interim Transcript Stream */}
      {isRecording && interimText && (
        <div className="mt-2 py-1 px-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 italic animate-pulse">
          🗣 "{interimText}..."
        </div>
      )}

      {/* Gentle feedback message or transcript readout */}
      {lastTranscript && !isRecording && (
        <div className="mt-3 py-1.5 px-4 bg-green-50 border border-green-200 rounded-xl text-patient-success text-sm font-semibold flex items-center gap-2">
          <span>✓ Heard:</span>
          <span className="text-base text-patient-primary">"{lastTranscript}"</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 py-1.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-patient-hint text-xs font-medium">
          ℹ {errorMsg}
        </div>
      )}
    </div>
  );
}
