import React, { useState } from 'react';
import TapSelectGrid from '../shared/TapSelectGrid.jsx';
import { sounds } from '../utils/soundEffects.js';

const EMOTION_ROUNDS = [
  {
    emotion: 'Joyful & Happy',
    emotionAs: 'আনন্দ আৰু হাঁহি',
    emoji: '😊',
    color: 'from-teal-400 to-yellow-500',
    correctId: 'bihu_reunion',
    situations: [
      {
        id: 'bihu_reunion',
        label: 'Festival Family Reunion',
        subtext: 'Daughter arrives home for Bihu bearing fresh homemade sweets.',
        icon: '🏡'
      },
      {
        id: 'storm_clouds',
        label: 'Heavy Monsoon Storm Approaching',
        subtext: 'Dark rain clouds gathering over the unharvested tea garden.',
        icon: '⛈️'
      },
      {
        id: 'lost_specs',
        label: 'Misplaced Reading Glasses',
        subtext: 'Searching through every drawer trying to find spectacles.',
        icon: '👓'
      },
      {
        id: 'evening_silence',
        label: 'Quiet River Breeze',
        subtext: 'Sitting motionless on the veranda as evening settles.',
        icon: '🌅'
      }
    ]
  },
  {
    emotion: 'Calm & Peaceful',
    emotionAs: 'শান্ত আৰু প্ৰশান্ত মন',
    emoji: '😌',
    color: 'from-teal-400 to-emerald-600',
    correctId: 'temple_prayer',
    situations: [
      {
        id: 'temple_prayer',
        label: 'Morning Namghar Chanting',
        subtext: 'Gentle prayer bells and fragrant incense at dawn.',
        icon: '🪔'
      },
      {
        id: 'wild_alert',
        label: 'Rustling in the Bamboo Grove',
        subtext: 'Sudden unexpected loud crack of dry bamboo branches.',
        icon: '🎋'
      },
      {
        id: 'market_rush',
        label: 'Crowded Weekly Haat',
        subtext: 'Bustling bazaar stalls with vendors shouting prices.',
        icon: '📢'
      },
      {
        id: 'spilled_milk',
        label: 'Spilled Boiling Tea',
        subtext: 'The kettle boiled over onto the stove top.',
        icon: '🫖'
      }
    ]
  },
  {
    emotion: 'Loving Concern',
    emotionAs: 'স্নেহ আৰু যত্নশীল চিন্তা',
    emoji: '😟',
    color: 'from-orange-400 to-teal-600',
    correctId: 'child_fever',
    situations: [
      {
        id: 'child_fever',
        label: 'Grandchild Caught in Rain',
        subtext: 'Little one got soaked in monsoon rain and is sneezing.',
        icon: '🌧️'
      },
      {
        id: 'harvest_dance',
        label: 'Village Harvest Dance',
        subtext: 'Singing and beating the dhol drum with neighbours.',
        icon: '🥁'
      },
      {
        id: 'weaver_award',
        label: 'Admiring Finished Muga Silk',
        subtext: 'Holding up an exquisite golden handloom cloth just off the loom.',
        icon: '🧣'
      },
      {
        id: 'afternoon_nap',
        label: 'Warm Afternoon Nap',
        subtext: 'Resting comfortably on the wicker lounge chair.',
        icon: '🛋️'
      }
    ]
  }
];

export default function WhoseEmotion({ onComplete, onExit, language = 'en' }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [roundScores, setRoundScores] = useState([]);

  const currentRound = EMOTION_ROUNDS[roundIdx];

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selectedId) return;

    const isCorrect = selectedId === currentRound.correctId;
    if (isCorrect) {
      sounds.playSuccessChime();
    } else {
      sounds.playEncouragingSoft();
    }

    const updated = [...roundScores, isCorrect];
    setRoundScores(updated);

    if (roundIdx >= EMOTION_ROUNDS.length - 1) {
      // Finished all rounds
      const correctCount = updated.filter(Boolean).length;
      const accuracy = Math.round((correctCount / EMOTION_ROUNDS.length) * 100);
      const score = Math.max(35, correctCount * 33 + (accuracy === 100 ? 1 : 0));

      let message = 'Heartwarming empathy! Emotional awareness keeps community bonds strong.';
      if (correctCount === 3) {
        message = 'Deep empathy! You understood every person’s feelings and situations perfectly.';
      } else if (correctCount >= 1) {
        message = 'Well done! You connected feelings with life situations warmly.';
      }

      onComplete({
        score,
        maxScore: 100,
        accuracy,
        message,
        subtext: `Matched ${correctCount} of ${EMOTION_ROUNDS.length} emotional situations.`
      });
    } else {
      // Proceed to next round
      setRoundIdx((i) => i + 1);
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {onExit && (
        <div className="flex items-center justify-between">
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
      {/* Round Header & Emotion Portrait */}
      <div className="p-6 rounded-3xl bg-teal-50 border-3 border-teal-300 shadow-sm text-center space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-teal-900">
          <span>Question {roundIdx + 1} of {EMOTION_ROUNDS.length}</span>
          <span className="bg-teal-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Emotional Awareness
          </span>
        </div>

        {/* Emotion Display Card */}
        <div className="flex flex-col items-center justify-center">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentRound.color} flex items-center justify-center text-6xl shadow-md transform hover:scale-105 transition-transform`}>
            {currentRound.emoji}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            {currentRound.emotion}
          </h3>
          <p className="text-base text-teal-800 font-semibold">
            {currentRound.emotionAs}
          </p>
        </div>

        <p className="text-lg text-slate-700 font-medium">
          Which village situation best matches this emotion?
        </p>
      </div>

      {/* Situations Grid */}
          <TapSelectGrid
            language={language}
        items={currentRound.situations}
        selectedIds={selectedId ? [selectedId] : []}
        onToggle={handleSelect}
        maxSelect={1}
        columns={1}
      />

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!selectedId}
          onClick={handleConfirm}
          className={`px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all flex items-center space-x-3 ${
            selectedId
              ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{roundIdx < EMOTION_ROUNDS.length - 1 ? 'Next Emotion' : 'Finish'}</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
