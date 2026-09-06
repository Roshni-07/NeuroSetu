import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/soundEffects.js';
import SpeakButton from '../components2/SpeakButton.jsx';
import { synthesizeSpeech, stopAllSpeech } from '../services/bhashiniService.js';

/**
 * StoryQuiz — Shows a short narrated story, then presents comprehension questions.
 *
 * Props:
 *   story: { title, paragraphs: [string], icon }
 *   questions: [{ question, options: [string], correctIndex, explanation }]
 *   onComplete: ({ score, maxScore, message, subtext }) => void
 *   readAloud: boolean (uses SpeechSynthesis if available)
 */
export default function StoryQuiz({
  story = { title: '', paragraphs: [], icon: '📖' },
  questions = [],
  onComplete,
  readAloud = false,
  language = 'en',
  className = ''
}) {
  const [phase, setPhase] = useState('reading'); // 'reading' | 'questions' | 'done'
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [readingPage, setReadingPage] = useState(0);

  const paragraphsPerPage = 2;
  const totalPages = Math.ceil(story.paragraphs.length / paragraphsPerPage);
  const currentParas = story.paragraphs.slice(
    readingPage * paragraphsPerPage,
    (readingPage + 1) * paragraphsPerPage
  );

  const speakText = (text) => {
    if (!readAloud) return;
    synthesizeSpeech(text, language);
  };

  useEffect(() => {
    if (phase === 'reading' && readAloud) {
      speakText(currentParas.join(' '));
    }
    return () => {
      stopAllSpeech();
    };
  }, [readingPage, phase]);

  const handleNextPage = () => {
    if (readingPage < totalPages - 1) {
      setReadingPage(p => p + 1);
    } else {
      setPhase('questions');
    }
  };

  const handleSelectAnswer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    setShowFeedback(true);
    const isCorrect = optIdx === questions[qIndex].correctIndex;
    if (isCorrect) {
      sounds.playMatchChime();
    } else {
      sounds.playEncouragingSoft();
    }
    setAnswers(prev => [...prev, { qIndex, selected: optIdx, isCorrect }]);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    const nextQ = qIndex + 1;
    if (nextQ >= questions.length) {
      setPhase('done');
    } else {
      setQIndex(nextQ);
    }
  };

  // Trigger onComplete
  useEffect(() => {
    if (phase !== 'done' || !onComplete) return;
    const correct = answers.filter(a => a.isCorrect).length;
    const total = questions.length;
    const score = Math.round((correct / total) * 100);
    let message = 'Lovely reading! You remembered the story well.';
    if (score >= 80) message = 'Excellent comprehension! You followed every detail of the story.';
    else if (score >= 50) message = 'Good effort! You caught most of the important moments.';

    onComplete({
      score,
      maxScore: 100,
      message,
      subtext: `You answered ${correct} of ${total} questions correctly.`
    });
  }, [phase]);

  const currentQ = questions[qIndex];

  return (
    <div className={`flex flex-col space-y-5 w-full max-w-xl mx-auto ${className}`}>

      {/* READING PHASE */}
      {phase === 'reading' && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3 bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3">
            <span className="text-4xl">{story.icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase text-teal-600 tracking-wide">Story</p>
              <p className="text-xl font-extrabold text-teal-900">{story.title}</p>
            </div>
            <SpeakButton text={`${story.title}. ${currentParas.join(' ')}`} language={language} label="Read story aloud" />
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-5 space-y-4 min-h-[180px] shadow-sm">
            {currentParas.map((para, i) => (
              <p key={i} className="text-lg text-slate-800 leading-relaxed font-medium">{para}</p>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 font-medium">Page {readingPage + 1} of {totalPages}</span>
            <button
              type="button"
              onClick={handleNextPage}
              className="min-h-[52px] px-8 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              {readingPage < totalPages - 1 ? 'Next →' : 'Answer Questions →'}
            </button>
          </div>

          {readAloud && (
            <button
              type="button"
              onClick={() => speakText(currentParas.join(' '))}
              className="min-h-[48px] rounded-xl bg-teal-100 hover:bg-teal-200 border-2 border-teal-300 text-teal-900 text-base font-semibold transition-colors"
            >
              🔊 Read Aloud
            </button>
          )}
        </div>
      )}

      {/* QUESTIONS PHASE */}
      {phase === 'questions' && currentQ && (
        <div className="flex flex-col space-y-4">
          <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3">
            <p className="text-sm font-bold uppercase text-teal-600 tracking-wide">
              Question {qIndex + 1} of {questions.length}
            </p>
            <div className="flex items-start gap-2 mt-1">
              <p className="text-xl font-extrabold text-teal-900 leading-snug flex-1">{currentQ.question}</p>
              <SpeakButton text={currentQ.question} language={language} label="Read question aloud" />
            </div>
          </div>

          <div className="grid gap-3">
            {currentQ.options.map((opt, i) => {
              let cls = 'min-h-[60px] w-full rounded-2xl border-3 px-4 py-3 text-left text-lg font-semibold transition-all cursor-pointer';
              if (selected === null) {
                cls += ' bg-white border-slate-300 hover:border-teal-400 hover:bg-teal-50 text-slate-800 active:scale-98';
              } else if (i === questions[qIndex].correctIndex) {
                cls += ' bg-emerald-100 border-emerald-500 text-emerald-900';
              } else if (i === selected) {
                cls += ' bg-orange-100 border-orange-400 text-orange-900';
              } else {
                cls += ' bg-slate-50 border-slate-200 text-slate-500 opacity-70';
              }
              return (
                <div key={i} className="flex gap-2 items-stretch">
                  <button type="button" className={`${cls} flex-1`} onClick={() => handleSelectAnswer(i)}>
                    <span className="mr-2 font-bold text-base opacity-60">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                  {selected !== null && i === questions[qIndex].correctIndex && (
                    <span className="ml-2 text-emerald-600">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`rounded-2xl px-4 py-3 border-2 ${
              answers[answers.length - 1]?.isCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-teal-50 border-teal-300 text-teal-800'
            }`}>
              <p className="text-base font-bold">
                {answers[answers.length - 1]?.isCorrect ? '🌟 Correct!' : '💛 Not quite —'}
                {' '}{currentQ.explanation}
              </p>
            </div>
          )}

          {selected !== null && (
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[56px] rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              {qIndex < questions.length - 1 ? 'Next Question →' : 'See Results →'}
            </button>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center py-8 text-2xl font-bold text-teal-800 animate-pulse">
          📖 Calculating your results…
        </div>
      )}
    </div>
  );
}
