import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import { sounds } from '../utils/soundEffects.js';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 13 — Care for Your Companion (Reasoning/Executive Function)
 * Player looks after a virtual pet/plant (a tea plant or a chicken) across a simulated day.
 * 
 * Migrated to 10-Level Shared Difficulty Scaling Engine:
 * - Active steps scale from 2 (Level 1) to 5 (Level 10)
 * - Decision options scale from 2 options (1 distractor) to 5 options (4 distractors)
 * - Pacing & health feedback adapt smoothly
 * - Preserves scoring and telemetry contracts
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
        need: 'gentle moisture',
        situation: 'Your tea plant looks thirsty — its leaves are drooping slightly in the morning air.',
        options: [
          { label: 'Water it gently 💧', correct: true, feedback: 'Perfect! The plant perks up with gentle watering.' },
          { label: 'Leave it for the evening', correct: false, feedback: 'Wilting leaves need water now, not later.' },
          { label: 'Add lots of fertilizer', correct: false, feedback: 'Too much fertilizer on a thirsty plant can burn the roots.' },
          { label: 'Pull off the drooping leaves', correct: false, feedback: 'The leaves will recover with water — removing them wastes plant energy.' },
          { label: 'Pour icy water over roots', correct: false, feedback: 'Icy water shocks delicate young roots.' }
        ]
      },
      {
        time: 'Late Morning',
        icon: '☀️',
        need: 'sunlight protection',
        situation: 'Strong direct sunlight is hitting your small tea plant.',
        options: [
          { label: 'Put a shade cloth over it 🌿', correct: true, feedback: 'Young tea plants need shade in harsh sunlight — well done!' },
          { label: 'Move it next to a cement wall', correct: false, feedback: 'Cement walls hold heat — this would make it even hotter for the plant.' },
          { label: 'Pour cold water on the leaves', correct: false, feedback: 'Cold water on sun-heated leaves can cause shock.' },
          { label: 'Cut all the leaves off', correct: false, feedback: 'Leaves are needed for the plant to survive.' },
          { label: 'Enclose it in plastic wrap', correct: false, feedback: 'Plastic wrap creates an oven effect.' }
        ]
      },
      {
        time: 'Afternoon',
        icon: '🌤️',
        need: 'pest protection',
        situation: 'You notice some small yellow bugs on a few leaves.',
        options: [
          { label: 'Apply safe plant medicine 🧴', correct: true, feedback: 'The right plant medicine protects the leaves and helps the plant recover.' },
          { label: 'Remove the bugs carefully by hand 🖐️', correct: false, feedback: 'Careful removal can help, but this outbreak needs the correct plant medicine.' },
          { label: 'Pour kerosene on the plant', correct: false, feedback: 'Kerosene damages tea leaves severely — never use it.' },
          { label: 'Ignore them — they will go away', correct: false, feedback: 'Pest infestations grow quickly — early action is always better.' },
          { label: 'Uproot the whole plant', correct: false, feedback: 'Uprooting is unnecessary for a surface pest issue.' }
        ]
      },
      {
        time: 'Evening',
        icon: '🌙',
        need: 'nighttime warmth',
        situation: 'The temperature is dropping. Your tea plant is still outside.',
        options: [
          { label: 'Cover it with a light cloth for the night 🌿', correct: true, feedback: 'Young plants benefit from cover on cool nights — a perfect gardener\'s choice!' },
          { label: 'Water it heavily to keep it warm', correct: false, feedback: 'Over-watering at night creates chilling waterlogged roots.' },
          { label: 'Move it inside under a bright electric light', correct: false, feedback: 'Artificial glare at night disrupts natural rhythms.' },
          { label: 'Leave it as it is', correct: false, feedback: 'Valley chills can stunt tender saplings.' },
          { label: 'Place hot burning coals near it', correct: false, feedback: 'Coals pose fire hazard and dry out the air.' }
        ]
      },
      {
        time: 'Night Rest',
        icon: '✨',
        need: 'soil aeration',
        situation: 'The night settles in and you check the surrounding soil drainage for tomorrow.',
        options: [
          { label: 'Loosen topsoil gently around drainage holes 🪴', correct: true, feedback: 'Good soil drainage ensures healthy roots by sunrise!' },
          { label: 'Tramp down the dirt firmly', correct: false, feedback: 'Compacting soil suffocates roots.' },
          { label: 'Pour muddy slurry on top', correct: false, feedback: 'Slurry blocks oxygen from root systems.' },
          { label: 'Dig deeply and slice surface roots', correct: false, feedback: 'Cutting root systems harms nutrient uptake.' },
          { label: 'Flood the pot with detergent', correct: false, feedback: 'Detergent harms beneficial soil microbes.' }
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
        need: 'wholesome feed',
        situation: 'Your hen hasn\'t eaten yet and is pacing restlessly near the coop gate.',
        options: [
          { label: 'Scatter grain and rice bran 🌾', correct: true, feedback: 'Morning grain feeding keeps the hen nourished and laying well.' },
          { label: 'Give her only plain water', correct: false, feedback: 'Water alone is not enough for morning energy.' },
          { label: 'Give her leftover spicy curry', correct: false, feedback: 'Spicy human food is harmful to poultry.' },
          { label: 'Let her forage empty gravel', correct: false, feedback: 'Supplementary grain is required for healthy eggs.' },
          { label: 'Feed dry raw beans', correct: false, feedback: 'Raw beans contain hemagglutinin toxic to poultry.' }
        ]
      },
      {
        time: 'Morning',
        icon: '🥚',
        need: 'dry nest care',
        situation: 'You find a fresh egg in the corner of the pen, but the ground is damp from rain.',
        options: [
          { label: 'Pick it up and place on fresh dry straw 🌾', correct: true, feedback: 'Clean, dry straw protects eggs from moisture and contamination.' },
          { label: 'Leave it in the muddy corner', correct: false, feedback: 'Moisture fosters bacterial contamination.' },
          { label: 'Scrub it vigorously with soap', correct: false, feedback: 'Washing removes the natural protective bloom.' },
          { label: 'Crack it into her feed immediately', correct: false, feedback: 'Feeding raw eggs encourages egg-eating habits.' },
          { label: 'Bury it in wet soil', correct: false, feedback: 'Burying spoils the egg completely.' }
        ]
      },
      {
        time: 'Afternoon',
        icon: '☀️',
        need: 'cooling shade',
        situation: 'The courtyard is baking under afternoon sun and the hen is panting with wings out.',
        options: [
          { label: 'Provide cool fresh water and open shaded shelter 🪣', correct: true, feedback: 'Cool water and ventilation quickly relieve poultry heat stress.' },
          { label: 'Lock her in a tight wooden crate', correct: false, feedback: 'Enclosed spaces trap body heat dangerously.' },
          { label: 'Douse her with icy cold water', correct: false, feedback: 'Sudden cold shock can cause cardiovascular collapse.' },
          { label: 'Force-feed dry maize', correct: false, feedback: 'Digestion generates internal heat — hydration comes first.' },
          { label: 'Chase her into the open field', correct: false, feedback: 'Exertion in midday sun worsens heat exhaustion.' }
        ]
      },
      {
        time: 'Dusk',
        icon: '🌇',
        need: 'clean coop inspection',
        situation: 'Dusk is settling and wet droppings have accumulated around the roosting perch.',
        options: [
          { label: 'Rake out wet soiled bedding and add fresh dry shavings 🧹', correct: true, feedback: 'Clean bedding prevents respiratory illness and foot sores.' },
          { label: 'Spray chemical disinfectant while hen is inside', correct: false, feedback: 'Fumes harm delicate avian airways.' },
          { label: 'Cover the dampness with wet banana leaves', correct: false, feedback: 'Wet leaves trap moisture and mildew.' },
          { label: 'Ignore the roost area', correct: false, feedback: 'Ammonia fumes build up rapidly overnight.' },
          { label: 'Burn trash inside the pen', correct: false, feedback: 'Smoke inhalation is fatal to birds.' }
        ]
      },
      {
        time: 'Night',
        icon: '🌙',
        need: 'secure coop latch',
        situation: 'Night has fallen and the pen door latch is loose and rattling in the breeze.',
        options: [
          { label: 'Fasten the secure latch and check the wire mesh 🔧', correct: true, feedback: 'A secure latch keeps civets and village predators out!' },
          { label: 'Leave the door propped open', correct: false, feedback: 'Open coops invite nocturnal predators.' },
          { label: 'Tie it loosely with flimsy yarn', correct: false, feedback: 'Yarn snaps easily under predator force.' },
          { label: 'Assume predators won\'t come', correct: false, feedback: 'Night predators look for easy entry points.' },
          { label: 'Turn on loud blaring music', correct: false, feedback: 'Noise stresses the hen throughout the night.' }
        ]
      }
    ]
  }
];

export function getCompanionStatus(companionId, health) {
  if (health >= 75) {
    return {
      icon: companionId === 'tea_plant' ? '🌿' : '🐔',
      status: companionId === 'tea_plant' ? 'Thriving & Lush' : 'Thriving & Content',
      tier: 'thriving',
      badgeCls: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      barColor: 'bg-emerald-500'
    };
  }
  if (health >= 45) {
    return {
      icon: companionId === 'tea_plant' ? '🌱' : '🐥',
      status: 'Doing Okay',
      tier: 'okay',
      badgeCls: 'bg-teal-100 text-teal-900 border-teal-300',
      barColor: 'bg-teal-500'
    };
  }
  return {
    icon: companionId === 'tea_plant' ? '🥀' : '🤒',
    status: 'Needs Gentle Care',
    tier: 'struggling',
    badgeCls: 'bg-amber-100 text-amber-900 border-amber-300',
    barColor: 'bg-amber-500'
  };
}

export default function CareForYourCompanion({
  onComplete,
  onExit,
  language = 'en',
  level = null,
  masteryScore = null,
  tier = null,
  startingTier = null,
  initialTier = null,
  patientProfile = null,
  onLevelChange = null
}) {
  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (level && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
    if (masteryScore !== null && masteryScore !== undefined) return getLevel(masteryScore);
    if (patientProfile?.masteryScore !== undefined) return getLevel(patientProfile.masteryScore);
    const legacyTier = tier || startingTier || initialTier || patientProfile?.starting_difficulty_tier || patientProfile?.startingTier || (patientProfile?.status === 'critical' ? 1 : patientProfile?.status === 'attention' ? 2 : patientProfile?.status === 'stable' ? 3 : null);
    if (legacyTier) {
      const t = Number(legacyTier);
      if (t === 1) return 1;
      if (t === 3) return 10;
      return 5;
    }
    return 5;
  }, [level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('care-for-your-companion', currentLevel);
  }, [currentLevel]);

  const hasConfig = level !== null || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Number of daily decision steps: 2 (Level 1) to 5 (Level 10). Defaults to 4 when unconfigured.
  const activeStepCount = hasConfig
    ? Math.max(2, Math.min(5, difficultyParams.itemCount || 3))
    : 4;

  // Number of options shown per step: 1 correct + distractorCount (2 options at L1, up to 5 options at L10)
  const optionCount = hasConfig
    ? Math.max(2, Math.min(5, 1 + (difficultyParams.distractorCount || 2)))
    : 5;

  const startTime = useRef(Date.now());
  const [companionIndex, setCompanionIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [companionHealth, setCompanionHealth] = useState(70);

  const companion = COMPANIONS[companionIndex];
  const activeSteps = useMemo(() => {
    return companion.steps.slice(0, activeStepCount);
  }, [companion, activeStepCount]);

  const step = activeSteps[stepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;
  const currentStatus = getCompanionStatus(companion.id, companionHealth);

  // Filtered options for the current step (always keeping the correct choice)
  const stepOptions = useMemo(() => {
    if (!step || !step.options) return [];
    if (!hasConfig) return step.options;
    const correctOpt = step.options.find(o => o.correct) || step.options[0];
    const distractorOpts = step.options.filter(o => !o.correct).slice(0, optionCount - 1);
    const combined = [correctOpt, ...distractorOpts];
    // Deterministic shuffle based on step index and level
    return combined.sort((a, b) => (a.label.length + currentLevel) % 3 - (b.label.length + currentLevel) % 3);
  }, [step, optionCount, currentLevel, hasConfig]);

  const instructions = `You will look after your village companion through the day.

At each part of the day, read the situation carefully and choose the BEST action to take. Think about what is safe and sensible!

There is no rush — take your time before choosing.`;

  const handleSelect = (optIdx) => {
    if (selected !== null) return;
    const opt = stepOptions[optIdx];
    setSelected(optIdx);
    setShowFeedback(true);
    setCompanionHealth(value => Math.max(0, Math.min(100, value + (opt.correct ? 15 : -25))));
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
      const correctCount = answers.filter(a => a.correct).length;
      const score = Math.round((correctCount / totalSteps) * 100);
      const responseTimeMs = Math.max(100, Date.now() - startTime.current);
      const errorCount = Math.max(0, totalSteps - correctCount);
      const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

      let healthSummary = '';
      if (companionHealth >= 75) {
        healthSummary = `${companion.name} is glowing with health (${companionHealth}% vitality) thanks to your mindful care!`;
      } else if (companionHealth >= 45) {
        healthSummary = `${companion.name} made it through the day in stable care (${companionHealth}% vitality).`;
      } else {
        healthSummary = `${companion.name} had a tough day (${companionHealth}% vitality), but with more practice tomorrow it will thrive.`;
      }

      const message = score >= 80
        ? `Wonderful caretaker! ${healthSummary}`
        : score >= 50
          ? `Good caring instincts! ${healthSummary}`
          : `Kind effort! ${healthSummary}`;

      const res = {
        gameId: 'care-for-companion',
        score: Math.max(30, score),
        maxScore: 100,
        accuracy: score,
        errorCount,
        responseTimeMs,
        latencyMs: responseTimeMs,
        companionHealth,
        message,
        subtext: `Made ${correctCount} of ${totalSteps} decisions through the day at Level ${currentLevel} • Final health: ${companionHealth}%.`,
        level: currentLevel,
        tier: derivedTier,
        difficultyTier: derivedTier,
        sessionLevel: currentLevel,
        difficultyParams
      };
      setResult(res);
      if (onComplete) onComplete(res);
      return;
    }

    setSelected(null);
    setShowFeedback(false);
    setStepIndex(nextStep);
  };

  const handleRetry = () => {
    setResult(null);
    setStepIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setAnswers([]);
    setCompanionHealth(70);
    startTime.current = Date.now();
    setGameKey(k => k + 1);
  };

  const progressPct = Math.round(((stepIndex) / totalSteps) * 100);

  return (
    <GameWrapper
      title="Care for Your Companion"
      emoji={currentStatus.icon}
      category="Reasoning"
      instructions={instructions}
      result={result}
      onRetry={handleRetry}
      onComplete={onComplete}
      onBack={onExit}
    >
      {onExit && (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[48px] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            aria-label="Exit to hub"
          >
            <span className="text-lg leading-none">←</span>
            <span>Exit to Hub</span>
          </button>
        </div>
      )}

      {/* Adaptive Level Header */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {totalSteps} Daily Steps • {optionCount} Options
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Care' : currentLevel <= 7 ? 'Mindful Routine' : 'Master Caretaker'}
        </span>
      </div>

      {/* Companion selector */}
      <div className="flex justify-center gap-2 mb-4">
        {COMPANIONS.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCompanionIndex(i); handleRetry(); }}
            className={`min-h-[44px] px-4 rounded-xl text-base font-bold border-2 transition-colors ${
              i === companionIndex
                ? 'bg-emerald-700 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            {i === companionIndex ? currentStatus.icon : c.icon} {c.name}
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

      {/* Health Status Banner */}
      <div className={`border-2 rounded-2xl px-4 py-3 mb-4 transition-all duration-300 ${currentStatus.badgeCls}`}>
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Companion condition">{currentStatus.icon}</span>
            <span>{companion.name} Health</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-current">
              {currentStatus.status}
            </span>
            <span className="text-base font-extrabold">{companionHealth}%</span>
          </div>
        </div>
        <div className="mt-2 h-3 rounded-full bg-black/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${currentStatus.barColor}`}
            style={{ width: `${companionHealth}%` }}
          />
        </div>
        {step && (
          <p className="mt-2 text-sm font-semibold opacity-90">
            Current need: <span className="underline decoration-current font-bold">{step.need}</span>
          </p>
        )}
      </div>

      {/* Time of day banner */}
      {step && (
        <div className="flex items-center gap-3 bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-3 mb-4">
          <span className="text-4xl">{step.icon}</span>
          <div>
            <p className="text-sm font-bold uppercase text-teal-600">{step.time}</p>
            <p className="text-base font-bold text-teal-900">Step {stepIndex + 1} of {totalSteps}</p>
          </div>
          <div className="ml-auto text-4xl" title={`${companion.name} (${currentStatus.status})`}>
            {currentStatus.icon}
          </div>
        </div>
      )}

      {/* Situation */}
      {step && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl px-4 py-4 mb-4">
          <p className="text-lg font-bold text-teal-900 leading-snug">{step.situation}</p>
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3" key={gameKey + '-' + stepIndex}>
        {stepOptions.map((opt, i) => {
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
      {showFeedback && stepOptions[selected] && (
        <div className={`mt-4 rounded-2xl px-4 py-3 border-2 ${
          stepOptions[selected]?.correct
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <p className="text-base font-bold">
            {stepOptions[selected]?.correct ? '🌟 ' : '💛 '}
            {stepOptions[selected]?.feedback}
          </p>
          <p className="text-sm mt-1 font-semibold flex items-center gap-2">
            <span>{currentStatus.icon}</span>
            <span>
              {stepOptions[selected]?.correct
                ? `${companion.name} gained health (+15%) and is ${currentStatus.status.toLowerCase()}!`
                : `${companion.name} lost health (-25%). It needs gentle care in the next step.`}
            </span>
          </p>
        </div>
      )}

      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 w-full min-h-[56px] rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xl font-bold shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          {stepIndex < totalSteps - 1 ? 'Next Situation →' : 'See Results →'}
        </button>
      )}
    </GameWrapper>
  );
}

