import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import StoryQuiz from '../shared/StoryQuiz.jsx';
import { getDifficultyParams } from '../engine/difficultyScaling.js';
import { getLevel } from '../engine/ddaEngine.js';

/**
 * Game 11 — Remember the Story (Memory)
 * Uses StoryQuiz. Short NER-themed story followed by comprehension questions.
 */

const STORIES = [
  {
    id: 'grandma_bihu',
    story: {
      title: "Grandma's Bihu Morning",
      icon: '🌅',
      paragraphs: [
        "Old Rupali woke before sunrise on the day of Rongali Bihu. She could hear the birds singing outside her bamboo window. The smell of fresh mustard oil drifted from the kitchen.",
        "She wore her mekhela chador — a beautiful red and white silk cloth with golden patterns woven by her own hands many years ago. Around her neck she placed a gold necklace called a junbiri.",
        "Her granddaughter Priya helped tie her hair with a white orchid. Together they walked to the village clearing where young people were already dancing the bihu dance with their hands moving like wings.",
        "Rupali clapped and hummed the old bihu song she had learned from her own grandmother. By midday, the village shared a feast of rice, pithas, and curd. It was a day full of warmth and colour."
      ]
    },
    questions: [
      {
        question: "What did Rupali smell from the kitchen when she woke up?",
        options: [
          { label: "Tea leaves", icon: "🍃" },
          { label: "Fresh mustard oil", icon: "🫒" },
          { label: "Burning wood", icon: "🪵" },
          { label: "Sweet pitha", icon: "🥟" }
        ],
        correctIndex: 1,
        explanation: "The story says 'the smell of fresh mustard oil drifted from the kitchen'."
      },
      {
        question: "What cloth was Rupali wearing?",
        options: [
          { label: "Gamosa", icon: "🧣" },
          { label: "Mekhela chador", icon: "👘" },
          { label: "Dokhona", icon: "👗" },
          { label: "Riha", icon: "🥻" }
        ],
        correctIndex: 1,
        explanation: "She wore a mekhela chador — red and white silk with golden patterns."
      },
      {
        question: "Who helped Rupali put a flower in her hair?",
        options: [
          { label: "Her sister", icon: "👧" },
          { label: "Her daughter", icon: "👩" },
          { label: "Her granddaughter Priya", icon: "👧" },
          { label: "A neighbour", icon: "🏡" }
        ],
        correctIndex: 2,
        explanation: "Her granddaughter Priya helped tie her hair with a white orchid."
      },
      {
        question: "What was served at the village feast?",
        options: [
          { label: "Rice, fish and tea", icon: "🐟" },
          { label: "Rice, pithas and curd", icon: "🥟" },
          { label: "Bread, dal and vegetables", icon: "🍲" },
          { label: "Payasam and banana", icon: "🍌" }
        ],
        correctIndex: 1,
        explanation: "The village shared a feast of rice, pithas, and curd."
      },
      {
        question: "What dance were the young people performing in the clearing?",
        options: [
          { label: "Jhumur dance", icon: "💃" },
          { label: "Bihu dance with hands like wings", icon: "🪽" },
          { label: "Bagurumba dance", icon: "🦋" },
          { label: "Sattriya dance", icon: "🎭" }
        ],
        correctIndex: 1,
        explanation: "Young people were dancing the bihu dance with their hands moving like wings."
      }
    ]
  },
  {
    id: 'tea_picker',
    story: {
      title: 'The Tea Picker of Jorhat',
      icon: '🍵',
      paragraphs: [
        "Moina was the best tea picker in the Jorhat garden. Every morning she walked three kilometres through the mist to reach the tea bushes by six o'clock.",
        "She wore a wide bamboo hat to keep the sun away. Her basket could hold twelve kilograms of fresh tea leaves when full. She always sang softly while she worked.",
        "One morning she found a very unusual dark leaf with silver edges. The garden manager said it was a rare leaf that would make the finest first-flush tea of the season.",
        "At the end of the day, Moina's basket was the heaviest of all the pickers. She was given an extra measure of rice and a silk gamosa as a reward for her careful work."
      ]
    },
    questions: [
      {
        question: "How far did Moina walk each morning?",
        options: [
          { label: "One kilometre", icon: "🚶" },
          { label: "Two kilometres", icon: "🚶" },
          { label: "Three kilometres", icon: "🚶" },
          { label: "Five kilometres", icon: "🚶" }
        ],
        correctIndex: 2,
        explanation: "She walked three kilometres through the mist every morning."
      },
      {
        question: "What was unusual about the leaf she found?",
        options: [
          { label: "It was very large and red", icon: "🍂" },
          { label: "It had silver edges", icon: "✨" },
          { label: "It was shaped like a flower", icon: "🌸" },
          { label: "It glowed in the dark", icon: "💡" }
        ],
        correctIndex: 1,
        explanation: "The leaf was dark with silver edges — the manager said it was rare."
      },
      {
        question: "What was Moina given as a reward?",
        options: [
          { label: "Money and flowers", icon: "💐" },
          { label: "Extra rice and a silk gamosa", icon: "🌾" },
          { label: "A new basket", icon: "🧺" },
          { label: "A gold necklace", icon: "📿" }
        ],
        correctIndex: 1,
        explanation: "She received an extra measure of rice and a silk gamosa."
      },
      {
        question: "How much weight could Moina's tea basket hold when full?",
        options: [
          { label: "Five kilograms", icon: "⚖️" },
          { label: "Eight kilograms", icon: "⚖️" },
          { label: "Twelve kilograms", icon: "⚖️" },
          { label: "Twenty kilograms", icon: "⚖️" }
        ],
        correctIndex: 2,
        explanation: "Her basket could hold twelve kilograms of fresh tea leaves when full."
      },
      {
        question: "By what time did Moina reach the tea bushes in the morning?",
        options: [
          { label: "Five o'clock", icon: "⏰" },
          { label: "Six o'clock", icon: "⏰" },
          { label: "Seven o'clock", icon: "⏰" },
          { label: "Eight o'clock", icon: "⏰" }
        ],
        correctIndex: 1,
        explanation: "She walked through the mist to reach the tea bushes by six o'clock."
      }
    ]
  }
];

export default function RememberTheStory({
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
  const isExplicitLevel = level !== null && level !== undefined;
  const hasConfig = isExplicitLevel || masteryScore !== null || tier !== null || startingTier !== null || initialTier !== null || patientProfile !== null;

  // Standardized fallback resolver: level prop -> masteryScore -> patientProfile -> legacy status -> 5
  const currentLevel = useMemo(() => {
    if (isExplicitLevel && Number(level) >= 1 && Number(level) <= 10) return Math.round(Number(level));
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
  }, [isExplicitLevel, level, masteryScore, patientProfile, tier, startingTier, initialTier]);

  useEffect(() => {
    if (onLevelChange) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const difficultyParams = useMemo(() => {
    return getDifficultyParams('remember-the-story', currentLevel);
  }, [currentLevel]);

  // Scaled question count: 2 (L1) to 5 (L10). Defaults to 4 when unconfigured.
  const activeQuestionCount = useMemo(() => {
    if (!hasConfig) return 4;
    return Math.max(2, Math.min(5, difficultyParams.itemCount || 3));
  }, [hasConfig, difficultyParams.itemCount]);

  // Scaled choices per question: 2 choices (L1, 1 distractor) to 4 choices (L10, 3 distractors). Defaults to 4 when unconfigured.
  const activeDistractorCount = useMemo(() => {
    if (!hasConfig) return 3; // 4 choices total
    return Math.max(1, Math.min(3, difficultyParams.distractorCount || 2));
  }, [hasConfig, difficultyParams.distractorCount]);

  const [storyIndex, setStoryIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);

  // Auto-seed story based on level
  useEffect(() => {
    if (hasConfig) {
      setStoryIndex((currentLevel - 1) % STORIES.length);
      setResult(null);
      setGameKey(k => k + 1);
    }
  }, [hasConfig, currentLevel]);

  const current = STORIES[storyIndex] || STORIES[0];

  // Sliced questions with scaled option counts while preserving the correct option
  const preparedQuestions = useMemo(() => {
    const rawQuestions = current.questions.slice(0, activeQuestionCount);
    return rawQuestions.map((q) => {
      const correctOption = q.options[q.correctIndex];
      const distractorOptions = q.options.filter((_, idx) => idx !== q.correctIndex);
      const selectedDistractors = distractorOptions.slice(0, activeDistractorCount);

      // Deterministically place correct answer
      const combinedOptions = (q.correctIndex % 2 === 0)
        ? [correctOption, ...selectedDistractors]
        : [...selectedDistractors.slice(0, 1), correctOption, ...selectedDistractors.slice(1)];

      const newCorrectIndex = combinedOptions.findIndex(opt => opt.label === correctOption.label);

      return {
        ...q,
        options: combinedOptions,
        correctIndex: newCorrectIndex
      };
    });
  }, [current, activeQuestionCount, activeDistractorCount]);

  const instructions = `You will read a short story about life in North-East India.

Take your time — read every paragraph carefully. You can move through the pages at your own pace.

After reading, you will answer comprehension questions about what happened in the story. There is no hurry!`;

  const startTime = useRef(Date.now());

  const handleComplete = (res) => {
    const accuracy = res?.accuracy !== undefined ? res.accuracy : (res?.score !== undefined ? res.score : 100);
    const responseTimeMs = Math.max(100, Date.now() - startTime.current);
    const errorCount = Math.max(0, Math.round(activeQuestionCount * (1 - accuracy / 100)));
    const derivedTier = currentLevel <= 3 ? 1 : currentLevel <= 7 ? 2 : 3;

    const fullRes = {
      gameId: 'remember-the-story',
      ...res,
      accuracy,
      errorCount,
      responseTimeMs,
      latencyMs: responseTimeMs,
      level: currentLevel,
      tier: derivedTier,
      difficultyTier: derivedTier,
      sessionLevel: currentLevel,
      difficultyParams
    };
    setResult(fullRes);
    if (onComplete) onComplete(fullRes);
  };

  const handleRetry = () => {
    setResult(null);
    setGameKey(k => k + 1);
  };

  return (
    <GameWrapper
      title="Remember the Story"
      emoji="📖"
      category="Memory"
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

      {/* Adaptive Level Badge */}
      <div className="flex items-center justify-between px-4 py-2 mb-4 bg-teal-50 border border-teal-200 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-700 text-white">
            Level {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            {activeQuestionCount} Questions • {activeDistractorCount + 1} Choices / Question
          </span>
        </div>
        <span className="text-xs font-bold text-teal-800">
          {currentLevel <= 3 ? 'Gentle Warmup' : currentLevel <= 7 ? 'Target Challenge' : 'Focused Mastery'}
        </span>
      </div>

      {/* Manual story selector preserved when unconfigured */}
      {!hasConfig && (
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {STORIES.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setStoryIndex(i); setResult(null); setGameKey(k => k + 1); }}
              className={`min-h-[44px] px-4 rounded-xl text-sm font-bold border-2 transition-colors ${
                i === storyIndex
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50'
              }`}
            >
              {s.story.icon} {s.story.title}
            </button>
          ))}
        </div>
      )}

      <StoryQuiz
        key={gameKey}
        story={current.story}
        questions={preparedQuestions}
        onComplete={handleComplete}
        language={language}
        readAloud={true}
      />
    </GameWrapper>
  );
}
