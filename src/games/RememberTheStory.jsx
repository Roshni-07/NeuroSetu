import React, { useState } from 'react';
import GameWrapper from '../components2/GameWrapper.jsx';
import StoryQuiz from '../shared/StoryQuiz.jsx';

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
        options: ["Tea leaves", "Fresh mustard oil", "Burning wood", "Sweet pitha"],
        correctIndex: 1,
        explanation: "The story says 'the smell of fresh mustard oil drifted from the kitchen'."
      },
      {
        question: "What cloth was Rupali wearing?",
        options: ["Gamosa", "Mekhela chador", "Dokhona", "Riha"],
        correctIndex: 1,
        explanation: "She wore a mekhela chador — red and white silk with golden patterns."
      },
      {
        question: "Who helped Rupali put a flower in her hair?",
        options: ["Her sister", "Her daughter", "Her granddaughter Priya", "A neighbour"],
        correctIndex: 2,
        explanation: "Her granddaughter Priya helped tie her hair with a white orchid."
      },
      {
        question: "What was served at the village feast?",
        options: ["Rice, fish and tea", "Rice, pithas and curd", "Bread, dal and vegetables", "Payasam and banana"],
        correctIndex: 1,
        explanation: "The village shared a feast of rice, pithas, and curd."
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
        options: ["One kilometre", "Two kilometres", "Three kilometres", "Five kilometres"],
        correctIndex: 2,
        explanation: "She walked three kilometres through the mist every morning."
      },
      {
        question: "What was unusual about the leaf she found?",
        options: ["It was very large and red", "It had silver edges", "It was shaped like a flower", "It glowed in the dark"],
        correctIndex: 1,
        explanation: "The leaf was dark with silver edges — the manager said it was rare."
      },
      {
        question: "What was Moina given as a reward?",
        options: ["Money and flowers", "Extra rice and a silk gamosa", "A new basket", "A gold necklace"],
        correctIndex: 1,
        explanation: "She received an extra measure of rice and a silk gamosa."
      }
    ]
  }
];

export default function RememberTheStory({ onComplete, language = 'en' }) {
  const [storyIndex, setStoryIndex] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [result, setResult] = useState(null);

  const current = STORIES[storyIndex];

  const instructions = `You will read a short story about life in North-East India.

Take your time — read every paragraph carefully. You can move through the pages at your own pace.

After reading, you will answer a few questions about what happened in the story. There is no hurry!`;

  const handleComplete = (res) => {
    setResult(res);
    if (onComplete) onComplete(res);
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
    >
      {/* Story selector */}
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

      <StoryQuiz
        key={gameKey}
        story={current.story}
        questions={current.questions}
        onComplete={handleComplete}
        language={language}
        readAloud={true}
      />
    </GameWrapper>
  );
}
