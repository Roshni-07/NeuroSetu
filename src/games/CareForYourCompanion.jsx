import React, { useState, useEffect } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import { sounds } from '../utils/soundEffects.js';

/**
 * Game 13 — Care for Your Companion (Reasoning/Executive Function)
 * Player looks after a virtual pet/plant (a tea plant or a chicken) across
 * a simulated day. At each time step, they choose one action from a set.
 * "Right" actions are logical — wrong choices lead to gentle feedback.
 */

const COMPANIONS = [
  {
    id: 'tea_plant',
    name: 'Chaa Bon (Tea Plant)',
    icon: '🌱',
    description: 'A young tea plant in your garden.',
    steps: [
      {
        time: 'Morning',
        icon: '🌅',
        situation: 'Your tea plant looks thirsty — its leaves are drooping slightly.',
        options: [
          { label: 'Water it gently 💧', correct: true, feedback: 'Perfect! The plant perks up with gentle watering.' },
          { label: 'Add lots of fertilizer', correct: false, feedback: 'Too much fertilizer on a thirsty plant can burn the roots. Water first.' },
          { label: 'Pull off the drooping leaves', correct: false, feedback: 'The leaves will recover with water — removing them wastes the plant\'s energy.' },
          { label: 'Leave it for the evening', correct: false, feedback: 'Wilting leaves need water now, not later — plants can struggle in the heat.' }
        ]
      },
      {
        time: 'Late Morning',
        icon: '☀️',
        situation: 'Strong sunlight is directly hitting your small tea plant.',
        options: [
          { label: 'Put a shade cloth over it 🌿', correct: true, feedback: 'Young tea plants need some shade in harsh sunlight — well done!' },
          { label: 'Move it next to a cement wall', correct: false, feedback: 'Cement walls hold heat — this would make it even hotter for the plant.' },
          { label: 'Pour cold water on the leaves', correct: false, feedback: 'Cold water on sun-heated leaves can cause shock. Light shading is better.' },
          { label: 'Cut all the leaves off', correct: false, feedback: 'Leaves are needed for the plant to survive — cutting them all off would harm it.' }
        ]
      },
      {
        time: 'Afternoon',
        icon: '🌤️',
        situation: 'You notice some small yellow bugs on a few leaves.',
        options: [
            { label: 'Apply safe plant medicine 🧴', correct: true, feedback: 'The right plant medicine protects the leaves and helps the plant recover.' },
            { label: 'Remove the bugs carefully by hand 🖐️', correct: false, feedback: 'Careful removal can help, but this outbreak needs the correct plant medicine.' },
          { label: 'Pour kerosene on the plant', correct: false, feedback: 'Kerosene would damage the plant severely — never use it.' },
          { label: 'Ignore them — they will go away', correct: false, feedback: 'Pest infestations grow quickly — early action is always better.' },
          { label: 'Uproot the whole plant', correct: false, feedback: 'A few bugs on some leaves doesn\'t mean the plant needs to be uprooted.' }
        ]
      },
      {
        time: 'Evening',
        icon: '🌙',
        situation: 'The temperature is dropping. Your tea plant is still outside.',
        options: [
          { label: 'Cover it with a light cloth for the night 🌿', correct: true, feedback: 'Young plants benefit from cover on cool nights — a perfect gardener\'s choice!' },
          { label: 'Water it heavily to keep it warm', correct: false, feedback: 'Over-watering at night creates waterlogged roots — not good for cold weather.' },
          { label: 'Move it inside under a bright electric light', correct: false, feedback: 'Sudden changes and artificial light at night disrupt the plant\'s natural rhythm.' },
          { label: 'Leave it as it is', correct: false, feedback: 'A light frost protection cloth would have helped — young plants need extra care.' }
        ]
      }
    ]
  },
  {
    id: 'chicken',
    name: 'Murgi (Village Hen)',
    icon: '🐔',
    description: 'A village hen that lays an egg each morning.',
    steps: [
      {
        time: 'Dawn',
        icon: '🌅',
        situation: 'Your hen hasn\'t eaten yet and is pacing near the gate.',
        options: [
          { label: 'Scatter grain and rice bran 🌾', correct: true, feedback: 'Morning grain feeding keeps the hen healthy and happy!' },
          { label: 'Give her only water', correct: false, feedback: 'Water alone isn\'t enough — hens need grain in the morning to lay well.' },
          { label: 'Let her find her own food', correct: false, feedback: 'Foraging helps but a hungry, pacing hen needs supplementary feeding.' },
          { label: 'Give her cooked spicy food', correct: false, feedback: 'Spicy human food is not suitable for hens — grain and greens work best.' }
        ]
      },
      {
        time: 'Morning',
        icon: '🥚',
        situation: 'You find an egg in the corner of the pen but the ground is wet.',
        options: [
          { label: 'Pick it up carefully and place on dry straw 🌾', correct: true, feedback: 'Eggs need dry, clean storage — great care!' },
          { label: 'Leave it where it is', correct: false, feedback: 'Eggs on wet ground can crack or get contaminated by bacteria.' },
          { label: 'Wash it with soap immediately', correct: false, feedback: 'Washing removes the egg\'s natural protective coating — just dry it gently.' },
          { label: 'Put it back under the hen', correct: false, feedback: 'If you don\'t want it to hatch, move it to dry storage instead.' }
        ]
      },
      {
        time: 'Afternoon',
        icon: '☀️',
        situation: 'The hen pen is very hot and the hen is panting.',
        options: [
          { label: 'Provide cool fresh water and open shade 🪣', correct: true, feedback: 'Hens regulate heat by panting — cool water and shade are essential in hot weather.' },
          { label: 'Lock her in a small box to rest', correct: false, feedback: 'Confining a hot hen makes heat stress worse — she needs cool air and water.' },
          { label: 'Spray cold water directly on her', correct: false, feedback: 'Sudden cold on a stressed hen can cause shock — cool the environment instead.' },
          { label: 'Give her more grain to eat', correct: false, feedback: 'Digesting food generates more body heat — cool water is the priority now.' }
        ]
      },
      {
        time: 'Evening',
        icon: '🌙',
        situation: 'It is time to close the hen for the night. You see the door latch is loose.',
        options: [
          { label: 'Fix the latch before closing the pen 🔧', correct: true, feedback: 'A secure latch keeps predators out — safety first!' },
          { label: 'Leave the door slightly open for air', correct: false, feedback: 'Predators can enter an open pen at night — always secure the latch.' },
          { label: 'Tie it with a cloth temporarily', correct: false, feedback: 'A cloth tie is better than nothing but fixing the latch is the right choice.' },
          { label: 'Leave it — predators won\'t come tonight', correct: false, feedback: 'Predators don\'t warn you before they come — always secure your animals at night.' }
        ]
      }
    ]
  }
];

export default function CareForYourCompanion({ onComplete }) {
  const [companionIndex, setCompanionIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [happiness, setHappiness] = useState(50);

  const companion = COMPANIONS[companionIndex];
  const step = companion.steps[stepIndex];
  const totalSteps = companion.steps.length;
  const needs = companion.id === 'tea_plant'
    ? ['thirsty', 'needs shade', 'needs medicine', 'needs warmth']
    : ['hungry', 'needs a dry nest', 'needs cool water', 'needs a secure home'];

  const instructions = `You will look after your village companion through the day.

At each part of the day, read the situation carefully and choose the BEST action to take. Think about what is safe and sensible!

There is no rush — take your time before choosing.`;

  const handleSelect = (optIdx) => {
    if (selected !== null) return;
    const opt = step.options[optIdx];
    setSelected(optIdx);
    setShowFeedback(true);
    setHappiness(value => Math.max(0, Math.min(100, value + (opt.correct ? 15 : -10))));
    if (opt.correct) {
      sounds.playMatchChime();
    } else {
      sounds.playEncouragingSoft();
    }
    setAnswers(prev => [...prev, { stepIndex, selected: optIdx, correct: opt.correct }]);
  };

  const handleNext = () => {
    const nextStep = stepIndex + 1;
    if (nextStep >= totalSteps) {
      const correct = answers.filter(a => a.correct).length + (step.options[selected]?.correct ? 0 : 0);
      const allAnswers = [...answers, { stepIndex, selected, correct: step.options[selected]?.correct }];
      const correctCount = allAnswers.filter(a => a.correct).length;
      const score = Math.round((correctCount / totalSteps) * 100);
      const message = score >= 80
        ? `You are a wonderful caretaker! ${companion.name} is thriving under your care.`
        : score >= 50
          ? `Good caring instincts! You kept ${companion.name} safe and comfortable.`
          : `Kind effort! Caring for living things takes practice — you showed real heart.`;
      const res = {
        score: Math.max(30, score),
        maxScore: 100,
        message,
        subtext: `Made ${correctCount} of ${totalSteps} best decisions through the day.`
      };
      setResult(res);
      if (onComplete) onComplete(res);
    } else {
      setStepIndex(nextStep);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setStepIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setAnswers([]);
    setHappiness(50);
    setGameKey(k => k + 1);
  };

  const progressPct = Math.round(((stepIndex) / totalSteps) * 100);

  return (
    <GameWrapper
      title="Care for Your Companion"
      emoji={companion.icon}
      category="Reasoning"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
    >
      {/* Companion selector */}
      <div className="flex justify-center gap-2 mb-4">
        {COMPANIONS.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCompanionIndex(i); handleRetry(); }}
            className={`min-h-[44px] px-4 rounded-xl text-base font-bold border-2 transition-colors ${i === companionIndex
                ? 'bg-emerald-700 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
              }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-4 py-3 mb-4">
        <div className="flex items-center justify-between text-sm font-bold text-emerald-900">
          <span>{companion.icon} Happiness</span>
          <span>{happiness}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-emerald-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${happiness}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold text-emerald-800">Current need: {needs[stepIndex]}</p>
      </div>

      {/* Time of day banner */}
      <div className="flex items-center gap-3 bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 mb-4">
        <span className="text-4xl">{step.icon}</span>
        <div>
          <p className="text-sm font-bold uppercase text-teal-600">{step.time}</p>
          <p className="text-base font-bold text-teal-900">Step {stepIndex + 1} of {totalSteps}</p>
        </div>
        <div className="ml-auto text-4xl">{companion.icon}</div>
      </div>

      {/* Situation */}
      <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-4 mb-4">
        <p className="text-lg font-bold text-teal-900 leading-snug">{step.situation}</p>
      </div>

      {/* Options */}
      <div className="grid gap-3" key={gameKey + '-' + stepIndex}>
        {step.options.map((opt, i) => {
          let cls = 'min-h-[64px] w-full rounded-2xl border-3 px-5 py-3 text-left text-lg font-semibold transition-all cursor-pointer';
          if (selected === null) {
            cls += ' bg-white border-slate-300 hover:border-teal-400 hover:bg-teal-50 text-slate-800';
          } else if (i === selected && opt.correct) {
            cls += ' bg-emerald-100 border-emerald-500 text-emerald-900';
          } else if (i === selected && !opt.correct) {
            cls += ' bg-orange-100 border-orange-400 text-orange-900';
          } else if (opt.correct) {
            cls += ' bg-emerald-50 border-emerald-300 text-emerald-700';
          } else {
            cls += ' bg-slate-50 border-slate-200 text-slate-400 opacity-70';
          }
          return (
            <button key={i} type="button" className={cls} onClick={() => handleSelect(i)} disabled={selected !== null}>
              {opt.label}
              {selected !== null && opt.correct && <span className="ml-2 text-emerald-600">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`mt-4 rounded-2xl px-4 py-3 border-2 ${step.options[selected]?.correct
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-teal-50 border-teal-300 text-teal-800'
          }`}>
          <p className="text-base font-bold">
            {step.options[selected]?.correct ? '🌟 ' : '💛 '}
            {step.options[selected]?.feedback}
          </p>
        </div>
      )}

      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 w-full min-h-[56px] rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          {stepIndex < totalSteps - 1 ? 'Next Situation →' : 'See Results →'}
        </button>
      )}
    </GameWrapper>
  );
}
